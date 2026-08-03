#!/usr/bin/env python3
"""
QA du thème Clickscreation — Signal.

Contrôles statiques qui attrapent les pannes réelles d'un thème Shopify :
snippet ou section appelé mais inexistant, schema JSON invalide, réglage
utilisé sans être déclaré, tag Liquid non fermé, template pointant vers une
section absente. Aucune dépendance externe.
"""
import json
import re
import sys
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent / "theme"
errors, warnings = [], []


def liquid_files():
    for sub in ("layout", "sections", "snippets"):
        yield from sorted((ROOT / sub).glob("*.liquid"))


def strip_schema(text):
    return re.sub(r"\{%-?\s*schema\s*-?%\}.*?\{%-?\s*endschema\s*-?%\}", "", text, flags=re.S)


def strip_comments(text):
    """Les blocs comment ne sont pas évalués par Liquid : les analyser
    produirait de faux positifs (tags cités en exemple dans la doc interne)."""
    return re.sub(r"\{%-?\s*comment\s*-?%\}.*?\{%-?\s*endcomment\s*-?%\}", "", text, flags=re.S)


# `settings.x` global uniquement — on exclut section.settings.x et block.settings.x
GLOBAL_SETTING = re.compile(r"(?<![.\w])settings\.([a-zA-Z0-9_]+)")


# --- 1. Schemas JSON valides -------------------------------------------------
URL_DEFAUT = re.compile(r'"type"\s*:\s*"url"[^}]*"default"')


def verifier_reglages_url(nom, schema_brut, erreurs):
    """Un réglage de type url ne peut pas porter de valeur par défaut.
    Shopify rejette le fichier sans message : l'ancienne version reste en
    place et rien ne signale l'échec. Le repli doit se faire en Liquid,
    avec le filtre default."""
    if URL_DEFAUT.search(schema_brut):
        erreurs.append(f"{nom} : un réglage \"url\" porte un \"default\" — "
                       f"Shopify rejettera le fichier en silence")


section_schemas = {}
for path in sorted((ROOT / "sections").glob("*.liquid")):
    text = path.read_text(encoding="utf-8")
    m = re.search(r"\{%-?\s*schema\s*-?%\}(.*?)\{%-?\s*endschema\s*-?%\}", text, re.S)
    if not m:
        errors.append(f"{path.name}: aucun bloc schema")
        continue
    try:
        section_schemas[path.stem] = json.loads(m.group(1))
    except json.JSONDecodeError as e:
        errors.append(f"{path.name}: schema JSON invalide — {e}")
    verifier_reglages_url(path.name, m.group(1), errors)

# Liquid interdit dans un schema
for path in sorted((ROOT / "sections").glob("*.liquid")):
    m = re.search(r"\{%-?\s*schema\s*-?%\}(.*?)\{%-?\s*endschema\s*-?%\}", path.read_text(encoding="utf-8"), re.S)
    if m and ("{{" in m.group(1) or "{%" in m.group(1)):
        errors.append(f"{path.name}: du Liquid est présent dans le schema")


# --- 2. Références snippets / sections ---------------------------------------
snippets = {p.stem for p in (ROOT / "snippets").glob("*.liquid")}
sections = {p.stem for p in (ROOT / "sections").glob("*.liquid")}

for path in liquid_files():
    body = strip_comments(strip_schema(path.read_text(encoding="utf-8")))
    for name in re.findall(r"\{%-?\s*render\s+'([^']+)'", body):
        if name not in snippets:
            errors.append(f"{path.name}: render '{name}' — snippet introuvable")
    for name in re.findall(r"\{%-?\s*section\s+'([^']+)'", body):
        if name not in sections:
            errors.append(f"{path.name}: section '{name}' — section introuvable")
    if re.search(r"\{%-?\s*include\s", body):
        errors.append(f"{path.name}: utilise 'include' (obsolète), remplacer par 'render'")
    if re.search(r"\|\s*img_url", body):
        errors.append(f"{path.name}: utilise 'img_url' (obsolète), remplacer par 'image_url'")


# --- 3. Templates JSON --------------------------------------------------------
for path in sorted((ROOT / "templates").glob("*.json")):
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as e:
        errors.append(f"templates/{path.name}: JSON invalide — {e}")
        continue

    declared = data.get("sections", {})
    for key, conf in declared.items():
        stype = conf.get("type")
        if stype not in sections:
            errors.append(f"templates/{path.name}: section '{stype}' introuvable")
            continue

        schema = section_schemas.get(stype, {})
        valid_types = {b["type"] for b in schema.get("blocks", [])}
        for bid, block in (conf.get("blocks") or {}).items():
            if valid_types and block.get("type") not in valid_types:
                errors.append(
                    f"templates/{path.name}: bloc '{bid}' de type '{block.get('type')}' "
                    f"non déclaré dans {stype}"
                )
        order = conf.get("block_order") or []
        blocks = conf.get("blocks") or {}
        for bid in order:
            if bid not in blocks:
                errors.append(f"templates/{path.name}: block_order cite '{bid}' qui n'existe pas")
        for bid in blocks:
            if order and bid not in order:
                warnings.append(f"templates/{path.name}: bloc '{bid}' absent de block_order (non rendu)")

    for key in data.get("order", []):
        if key not in declared:
            errors.append(f"templates/{path.name}: order cite '{key}' non déclaré")


# --- 4. Réglages de thème -----------------------------------------------------
schema_path = ROOT / "config" / "settings_schema.json"
declared_settings = set()
try:
    for group in json.loads(schema_path.read_text(encoding="utf-8")):
        for s in group.get("settings", []):
            if "id" in s:
                declared_settings.add(s["id"])
except json.JSONDecodeError as e:
    errors.append(f"config/settings_schema.json: JSON invalide — {e}")

used = defaultdict(set)
for path in liquid_files():
    body = strip_comments(strip_schema(path.read_text(encoding="utf-8")))
    for name in GLOBAL_SETTING.findall(body):
        used[name].add(path.name)

for name, where in sorted(used.items()):
    if name not in declared_settings:
        errors.append(f"settings.{name} utilisé dans {', '.join(sorted(where))} mais absent de settings_schema.json")


# --- 5. Réglages de section utilisés mais non déclarés -------------------------
for path in sorted((ROOT / "sections").glob("*.liquid")):
    stem = path.stem
    schema = section_schemas.get(stem)
    if not schema:
        continue
    body = strip_comments(strip_schema(path.read_text(encoding="utf-8")))

    declared = {s["id"] for s in schema.get("settings", []) if "id" in s}
    for name in set(re.findall(r"section\.settings\.([a-zA-Z0-9_]+)", body)):
        if name not in declared:
            errors.append(f"{path.name}: section.settings.{name} non déclaré dans le schema")

    block_ids = set()
    for b in schema.get("blocks", []):
        block_ids |= {s["id"] for s in b.get("settings", []) if "id" in s}
    for name in set(re.findall(r"block\.settings\.([a-zA-Z0-9_]+)", body)):
        if block_ids and name not in block_ids:
            errors.append(f"{path.name}: block.settings.{name} non déclaré dans le schema")


# --- 5 bis. Longueur des libellés de schema -----------------------------------
# Shopify plafonne name à 25 caractères (section, block et preset). Au-delà, le
# fichier est refusé — et l'erreur est silencieuse quand on écrit via une URL.
NAME_MAX = 25
for stem, schema in section_schemas.items():
    labels = [("section", schema.get("name", ""))]
    labels += [("block", b.get("name", "")) for b in schema.get("blocks", [])]
    labels += [("preset", p.get("name", "")) for p in schema.get("presets", [])]
    for kind, label in labels:
        if len(label) > NAME_MAX:
            errors.append(
                f"{stem}.liquid: nom de {kind} « {label} » = {len(label)} caractères "
                f"(maximum {NAME_MAX})"
            )


# --- 5 ter. Accolades dans une balise de sortie --------------------------------
# Le parseur Liquid de Shopify referme {{ ... }} à la première accolade
# rencontrée. Un gabarit du type {search_term_string} placé dans une chaîne
# à l'intérieur d'une balise de sortie casse le fichier — et l'erreur ne
# remonte pas lors d'un envoi par URL.
OUTPUT_TAG = re.compile(r"\{\{(.*?)\}\}", re.S)
for path in liquid_files():
    body = strip_comments(strip_schema(path.read_text(encoding="utf-8")))
    for frag in OUTPUT_TAG.findall(body):
        if "{" in frag or "}" in frag:
            errors.append(
                f"{path.name}: accolade dans une balise de sortie "
                f"— {{{{{frag.strip()[:60]}}}}}"
            )


# --- 6. Équilibre des tags Liquid ---------------------------------------------
PAIRS = ["if", "unless", "for", "case", "form", "paginate", "capture", "tablerow"]
for path in liquid_files():
    body = strip_comments(strip_schema(path.read_text(encoding="utf-8")))
    tags = re.findall(r"\{%-?\s*(\w+)", body)
    for tag in PAIRS:
        opens = tags.count(tag)
        closes = tags.count("end" + tag)
        if opens != closes:
            errors.append(f"{path.name}: '{tag}' ouvert {opens} fois, fermé {closes} fois")


# --- 7. Cohérence des fichiers attendus ---------------------------------------
for required in ("layout/theme.liquid", "config/settings_schema.json", "templates/index.json"):
    if not (ROOT / required).exists():
        errors.append(f"fichier obligatoire manquant : {required}")

for asset in ("signal.css", "signal.js", "cc-jost.woff2", "cc-jbmono.woff2"):
    if not (ROOT / "assets" / asset).exists():
        errors.append(f"asset manquant : {asset}")


# --- Rapport ------------------------------------------------------------------
print(f"Sections : {len(sections)}   Snippets : {len(snippets)}   "
      f"Templates : {len(list((ROOT / 'templates').glob('*.json')))}")
print("-" * 68)

for w in warnings:
    print(f"  avertissement  {w}")
for e in errors:
    print(f"  ERREUR         {e}")

if not errors:
    print("Aucune erreur bloquante." if not warnings else "Aucune erreur bloquante (avertissements ci-dessus).")
print("-" * 68)
sys.exit(1 if errors else 0)
