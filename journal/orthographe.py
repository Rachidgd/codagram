"""Relève les mots du corpus que le dictionnaire français ne connaît pas.

Appel : orthographe.py <corpus.txt> <lexique.txt>
Le lexique porte les termes de métier que la rédaction emploie sciemment.
"""

import re
import sys

from spellchecker import SpellChecker


def main() -> int:
    corpus = open(sys.argv[1], encoding="utf-8").read()
    lexique = {
        mot.strip().lower()
        for mot in open(sys.argv[2], encoding="utf-8")
        if mot.strip()
    }

    verificateur = SpellChecker(language="fr")

    # Les élisions et les mots composés sont découpés avant la recherche :
    # « l'orifice » donne « orifice », « sous-jacentes » donne les deux moitiés,
    # et les fragments d'élision (l, d, qu, jusqu, aujourd) ne comptent pas.
    texte = corpus.lower().replace("’", "'")
    elisions = {
        "l", "d", "s", "n", "c", "j", "m", "t", "qu", "lorsqu", "puisqu",
        "jusqu", "aujourd", "quelqu", "presqu", "entr",
    }
    brut = re.split(r"[^a-zà-öø-ÿœæ'-]+", texte)
    mots = set()
    for bloc in brut:
        for part in re.split(r"['-]", bloc):
            if len(part) >= 3 and part not in elisions and part not in lexique:
                mots.add(part)

    inconnus = sorted(verificateur.unknown(mots))
    if inconnus:
        print(", ".join(inconnus))
    return 0


if __name__ == "__main__":
    sys.exit(main())
