/* CS-26 · cs-particles.js
   Classe CSParticles §4.4 : canvas 2D maison, zéro librairie.
   Garde-fous : DPR plafonné à 2, pause hors viewport et onglet caché,
   frame statique si reduced-motion / motion off, densité réduite
   sur petits écrans et machines modestes. */
(function () {
  'use strict';

  var html = document.documentElement;
  var motionOff = html.getAttribute('data-motion') === 'off' ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var motionSoft = html.getAttribute('data-motion') === 'soft';
  var machineModeste = (navigator.deviceMemory && navigator.deviceMemory < 4) ||
    (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4);

  function tokenCouleur(nom) {
    return getComputedStyle(html).getPropertyValue(nom).trim() || '#FFB454';
  }

  function CSParticles(canvas, options) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.preset = (options && options.preset) || 'hero';
    this.souris = { x: -9999, y: -9999 };
    this.actif = false;
    this.rafId = null;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.init();
  }

  CSParticles.prototype.init = function () {
    var self = this;
    this.mesurer();
    this.peupler();

    var debounce = null;
    if ('ResizeObserver' in window) {
      new ResizeObserver(function () {
        clearTimeout(debounce);
        debounce = setTimeout(function () { self.mesurer(); self.peupler(); self.frameStatique(); }, 200);
      }).observe(this.canvas.parentElement);
    }

    if (motionOff) { this.frameStatique(); return; }

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          self.actif = e.isIntersecting && !document.hidden;
          if (self.actif) self.demarrer(); else self.arreter();
        });
      }).observe(this.canvas);
    } else {
      this.actif = true;
      this.demarrer();
    }

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) self.arreter();
      else if (self.actif) self.demarrer();
    });

    if (this.preset === 'hero' && this.canvas.dataset.souris !== 'false' &&
        window.matchMedia('(pointer: fine)').matches) {
      this.canvas.parentElement.addEventListener('pointermove', function (ev) {
        var r = self.canvas.getBoundingClientRect();
        self.souris.x = ev.clientX - r.left;
        self.souris.y = ev.clientY - r.top;
      });
      this.canvas.parentElement.addEventListener('pointerleave', function () {
        self.souris.x = -9999; self.souris.y = -9999;
      });
    }
  };

  CSParticles.prototype.mesurer = function () {
    var r = this.canvas.parentElement.getBoundingClientRect();
    this.w = Math.max(r.width, 1);
    this.h = Math.max(r.height, 1);
    this.canvas.width = this.w * this.dpr;
    this.canvas.height = this.h * this.dpr;
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
  };

  CSParticles.prototype.peupler = function () {
    var surface = this.w * this.h;
    var count = Math.min(Math.max(Math.round(surface / 22000), 16), 70);
    if (this.preset === 'footer') count = Math.min(count, 36);
    if (window.innerWidth < 640) count = Math.round(count * 0.45);
    if (machineModeste || motionSoft) count = Math.round(count * 0.5);
    this.liens = this.preset === 'hero' && !machineModeste;
    this.couleur = tokenCouleur(this.preset === 'hero' ? '--c-accent' : '--c-accent-2');
    this.couleurLien = tokenCouleur('--c-line');
    this.points = [];
    for (var i = 0; i < count; i++) {
      var vitesse = this.preset === 'hero' ? 6 + Math.random() * 12 : 4 + Math.random() * 6;
      var angle = Math.random() * Math.PI * 2;
      this.points.push({
        x: Math.random() * this.w,
        y: Math.random() * this.h,
        vx: Math.cos(angle) * vitesse,
        vy: this.preset === 'footer' ? -vitesse * (0.6 + Math.random() * 0.4) : Math.sin(angle) * vitesse,
        r: this.preset === 'hero' ? 1 + Math.random() * 1.6 : 1 + Math.random(),
        o: this.preset === 'hero' ? 0.35 + Math.random() * 0.5 : 0.3 + Math.random() * 0.3
      });
    }
  };

  CSParticles.prototype.frameStatique = function () {
    var garder = Math.round(this.points.length * 0.4);
    var extrait = this.points.slice(0, garder);
    this.dessiner(extrait, false);
  };

  CSParticles.prototype.demarrer = function () {
    if (this.rafId) return;
    var self = this;
    var t0 = performance.now();
    function boucle(t) {
      var dt = Math.min((t - t0) / 1000, 0.05);
      t0 = t;
      self.avancer(dt);
      self.dessiner(self.points, self.liens);
      self.rafId = requestAnimationFrame(boucle);
    }
    this.rafId = requestAnimationFrame(boucle);
  };

  CSParticles.prototype.arreter = function () {
    if (this.rafId) { cancelAnimationFrame(this.rafId); this.rafId = null; }
  };

  CSParticles.prototype.avancer = function (dt) {
    for (var i = 0; i < this.points.length; i++) {
      var p = this.points[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      /* Répulsion douce de la souris (hero, pointer fine) */
      var dx = p.x - this.souris.x;
      var dy = p.y - this.souris.y;
      var d2 = dx * dx + dy * dy;
      if (d2 < 14400 && d2 > 0.01) {
        var d = Math.sqrt(d2);
        var force = (120 - d) / 120 * 26 * dt;
        p.x += (dx / d) * force;
        p.y += (dy / d) * force;
      }
      /* Wrap aux bords */
      if (p.x < -4) p.x = this.w + 4; else if (p.x > this.w + 4) p.x = -4;
      if (p.y < -4) p.y = this.h + 4; else if (p.y > this.h + 4) p.y = -4;
    }
  };

  CSParticles.prototype.dessiner = function (points, liens) {
    var ctx = this.ctx;
    ctx.clearRect(0, 0, this.w, this.h);
    if (liens) {
      ctx.lineWidth = 1;
      for (var i = 0; i < points.length; i++) {
        for (var j = i + 1; j < points.length; j++) {
          var dx = points[i].x - points[j].x;
          var dy = points[i].y - points[j].y;
          var d2 = dx * dx + dy * dy;
          if (d2 < 12100) {
            ctx.globalAlpha = (1 - Math.sqrt(d2) / 110) * 0.5;
            ctx.strokeStyle = this.couleurLien;
            ctx.beginPath();
            ctx.moveTo(points[i].x, points[i].y);
            ctx.lineTo(points[j].x, points[j].y);
            ctx.stroke();
          }
        }
      }
    }
    for (var k = 0; k < points.length; k++) {
      var p = points[k];
      ctx.globalAlpha = p.o;
      ctx.fillStyle = this.couleur;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  };

  window.CSParticles = CSParticles;

  document.querySelectorAll('[data-particles]').forEach(function (canvas) {
    if (!canvas.dataset.csInit) {
      canvas.dataset.csInit = '1';
      new CSParticles(canvas, { preset: canvas.dataset.particles || 'hero' });
    }
  });
})();
