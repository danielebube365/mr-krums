(() => {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const reduced = matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  const y = $('#year'); if (y) y.textContent = new Date().getFullYear();

  /* ── nav ── */
  const nav = $('#nav'), burger = $('#burger');
  const onScroll = () => nav && nav.classList.toggle('is-stuck', scrollY > 8);
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (nav && burger) {
    const set = (open) => {
      nav.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    };
    burger.addEventListener('click', () => set(!nav.classList.contains('is-open')));
    $$('.drawer a', nav).forEach((a) => a.addEventListener('click', () => set(false)));
  }

  /* ── menu tabs ── */
  const tabs = $$('.tab'), panels = $$('.panel');
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const key = tab.dataset.tab;
      tabs.forEach((t) => {
        const on = t === tab;
        t.classList.toggle('is-active', on);
        t.setAttribute('aria-selected', String(on));
      });
      panels.forEach((p) => p.classList.toggle('is-active', p.dataset.panel === key));
    });
  });

  /* ── "What's your pick?" Regular / Loaded switch ── */
  const sw = $('.pick__switch');
  if (sw) {
    const picks = $$('.pk', sw), pkPanels = $$('.pk-panel');
    sw.dataset.on = 'regular';
    picks.forEach((p) => {
      p.addEventListener('click', () => {
        const key = p.dataset.pick;
        sw.dataset.on = key;
        picks.forEach((b) => {
          const on = b === p;
          b.classList.toggle('is-active', on);
          b.setAttribute('aria-selected', String(on));
        });
        pkPanels.forEach((panel) => panel.classList.toggle('is-active', panel.dataset.panel === key));
      });
    });
  }

  /* ── reveals: fades, pops, arrow draw-ins ── */
  const reveals = new Set($$('.fade, .veil, .pop'));
  const show = (el) => { el.classList.add('in'); reveals.delete(el); };

  if (reduced) {
    reveals.forEach(show);
  } else {
    const check = () => {
      const vh = innerHeight;
      reveals.forEach((el) => { if (el.getBoundingClientRect().top < vh * 0.9) show(el); });
    };
    requestAnimationFrame(check);
    addEventListener('scroll', check, { passive: true });
    addEventListener('resize', check);
    setTimeout(check, 350);
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((es) => es.forEach((e) => {
        if (e.isIntersecting) { show(e.target); io.unobserve(e.target); }
      }), { threshold: 0.12 });
      reveals.forEach((el) => io.observe(el));
    }
  }

  /* ── videos, tuned for slow networks ──
     posters render instantly; only the first clip preloads metadata;
     the second carries data-src and loads when scrolled near;
     videos play only while on screen. */
  const vids = $$('video');
  vids.forEach((v) => { v.muted = true; v.setAttribute('muted', ''); });
  const loadSrc = (v) => {
    if (v.dataset.src) { v.src = v.dataset.src; delete v.dataset.src; v.load(); }
  };

  if (reduced) {
    vids.forEach(loadSrc);
  } else {
    const manage = () => {
      const vh = innerHeight;
      vids.forEach((v) => {
        const r = v.getBoundingClientRect();
        if (r.top < vh + 600 && r.bottom > -600) loadSrc(v);
        const onScreen = r.top < vh + 100 && r.bottom > -100;
        if (onScreen) { if (v.paused) v.play().catch(() => {}); }
        else if (!v.paused) v.pause();
      });
    };
    addEventListener('scroll', manage, { passive: true });
    addEventListener('resize', manage);
    document.addEventListener('visibilitychange', () => { if (!document.hidden) manage(); });
    manage();
  }
})();
