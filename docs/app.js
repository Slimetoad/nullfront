(() => {
  'use strict';

  function init() {
    const body = document.body;
    if (!body) return;

    const mobileQuery = window.matchMedia('(max-width: 900px)');
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    let motionEnabled = !reducedMotionQuery.matches;
    let motionWasChosen = false;
    let refreshStars = () => {};

    function watchMedia(query, listener) {
      if (typeof query.addEventListener === 'function') query.addEventListener('change', listener);
      else if (typeof query.addListener === 'function') query.addListener(listener);
    }

    function setMotion(enabled) {
      motionEnabled = Boolean(enabled);
      body.dataset.motion = motionEnabled ? 'on' : 'off';
      const button = document.getElementById('motion-toggle');
      if (button) {
        button.setAttribute('aria-pressed', String(motionEnabled));
        const label = button.querySelector('[data-motion-label]');
        if (label) {
          label.textContent = motionEnabled ? 'ON' : 'OFF';
          label.setAttribute('aria-hidden', 'true');
        }
      }
      if (!motionEnabled) {
        document.querySelectorAll('.reveal').forEach((element) => element.classList.add('is-visible'));
      }
      refreshStars();
    }

    const motionButton = document.getElementById('motion-toggle');
    if (motionButton) {
      motionButton.addEventListener('click', () => {
        motionWasChosen = true;
        setMotion(!motionEnabled);
      });
    }
    watchMedia(reducedMotionQuery, () => {
      if (!motionWasChosen) setMotion(!reducedMotionQuery.matches);
    });
    setMotion(motionEnabled);

    // Roving focus and automatic activation follow the standard ARIA tabs pattern.
    const factionTabs = document.getElementById('faction-tabs');
    const factionPanel = document.getElementById('faction-panel');
    const factionStage = document.getElementById('faction-stage');
    const factions = {
      concord: {
        name: 'The Concord',
        tagline: 'Steel. Discipline. Firepower.',
        description: 'Human orbital industry goes to war. Riggers weld your expanding base while siege armor holds the frontline. Deploy Hammers for long-range fire and call down devastating Orbital Lances.',
        hero: 'Commander Ada Voss',
        traits: ['Siege armor', 'Orbital fire', 'On-site construction'],
        index: '01'
      },
      bloom: {
        name: 'The Bloom',
        tagline: 'Grow. Adapt. Overwhelm.',
        description: 'Grow a living empire across the battlefield. Pulse Trees spread mycelium that sustains your structures and helps your creatures regenerate and move faster. Raveners hatch in pairs to swell the swarm.',
        hero: 'Veyla, Mother of Thorns',
        traits: ['Living mycelium', 'Regeneration', 'Massed swarms'],
        index: '02'
      },
      lumen: {
        name: 'The Lumen',
        tagline: 'Precision. Power. Light.',
        description: 'Command the hard-light ancients. Weavers start constructs and move on as they build themselves. Regenerating shields and psionic abilities reward careful positioning and decisive strikes.',
        hero: 'Aurelion, the First Light',
        traits: ['Regenerating shields', 'Self-building constructs', 'Psionic abilities'],
        index: '03'
      }
    };

    if (factionTabs && factionPanel) {
      const tabs = Array.from(factionTabs.querySelectorAll('[role="tab"][data-faction]'))
        .filter((tab) => factions[tab.dataset.faction] && !tab.disabled && tab.getAttribute('aria-disabled') !== 'true');

      function selectFaction(tab, moveFocus = false) {
        const faction = factions[tab.dataset.faction];
        if (!faction) return;
        tabs.forEach((item) => {
          const selected = item === tab;
          if (!item.id) item.id = `faction-tab-${item.dataset.faction}`;
          item.setAttribute('aria-selected', String(selected));
          item.setAttribute('aria-controls', factionPanel.id);
          item.tabIndex = selected ? 0 : -1;
        });
        factionPanel.setAttribute('aria-labelledby', tab.id);
        if (!factionPanel.hasAttribute('tabindex')) factionPanel.tabIndex = 0;
        ['name', 'tagline', 'description', 'hero', 'index'].forEach((field) => {
          const node = factionPanel.querySelector(`[data-faction-${field}]`);
          if (node) node.textContent = faction[field];
        });
        const traits = factionPanel.querySelector('[data-faction-traits]');
        if (traits) {
          const fragment = document.createDocumentFragment();
          faction.traits.forEach((text) => {
            const span = document.createElement('span');
            span.textContent = text;
            fragment.appendChild(span);
          });
          traits.replaceChildren(fragment);
        }
        if (factionStage) factionStage.dataset.faction = tab.dataset.faction;
        if (moveFocus) tab.focus({ preventScroll: true });
      }

      tabs.forEach((tab, index) => {
        tab.addEventListener('click', (event) => {
          event.preventDefault();
          selectFaction(tab);
        });
        tab.addEventListener('keydown', (event) => {
          let next = index;
          const direction = getComputedStyle(factionTabs).direction === 'rtl' ? -1 : 1;
          if (event.key === 'ArrowRight') next += direction;
          else if (event.key === 'ArrowLeft') next -= direction;
          else if (event.key === 'Home') next = 0;
          else if (event.key === 'End') next = tabs.length - 1;
          else return;
          event.preventDefault();
          selectFaction(tabs[(next + tabs.length) % tabs.length], true);
        });
      });
      const initial = tabs.find((tab) => tab.getAttribute('aria-selected') === 'true') || tabs[0];
      if (initial) selectFaction(initial);
    }

    // Keep the original image links functional when native dialogs are unavailable.
    const dialog = document.getElementById('media-dialog');
    const mediaImage = document.getElementById('media-image');
    const mediaCaption = document.getElementById('media-caption');
    const mediaClose = document.getElementById('media-close');
    if (dialog && mediaImage && mediaCaption && mediaClose && typeof dialog.showModal === 'function') {
      let mediaTrigger = null;
      if (!dialog.hasAttribute('aria-label') && !dialog.hasAttribute('aria-labelledby')) {
        dialog.setAttribute('aria-label', 'NULLFRONT media viewer');
      }
      if (!dialog.hasAttribute('aria-describedby')) dialog.setAttribute('aria-describedby', mediaCaption.id);

      document.querySelectorAll('[data-lightbox]').forEach((trigger) => {
        trigger.addEventListener('click', (event) => {
          if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
          const source = trigger.dataset.image;
          if (!source) return;
          mediaImage.src = source;
          mediaImage.alt = trigger.dataset.caption || 'NULLFRONT game image';
          mediaCaption.textContent = trigger.dataset.caption || '';
          if (!dialog.open) {
            mediaTrigger = trigger;
            try { dialog.showModal(); }
            catch (_) { return; }
          }
          event.preventDefault();
          mediaClose.focus({ preventScroll: true });
        });
      });
      mediaClose.addEventListener('click', () => dialog.close());
      let backdropPress = false;
      function isBackdrop(event) {
        if (event.target !== dialog) return false;
        const bounds = dialog.getBoundingClientRect();
        return event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom;
      }
      dialog.addEventListener('pointerdown', (event) => { backdropPress = isBackdrop(event); });
      dialog.addEventListener('click', (event) => {
        if (backdropPress && isBackdrop(event)) dialog.close();
        backdropPress = false;
      });
      dialog.addEventListener('close', () => {
        if (mediaTrigger && mediaTrigger.isConnected) mediaTrigger.focus({ preventScroll: true });
        mediaTrigger = null;
      });
    }

    const menuToggle = document.getElementById('menu-toggle');
    const siteNav = document.getElementById('site-nav');
    if (menuToggle && siteNav) {
      function setMenu(open, restoreFocus = false) {
        const expanded = Boolean(open && mobileQuery.matches);
        body.dataset.menu = expanded ? 'open' : 'closed';
        menuToggle.setAttribute('aria-expanded', String(expanded));
        menuToggle.setAttribute('aria-controls', siteNav.id);
        siteNav.inert = mobileQuery.matches && !expanded;
        if (mobileQuery.matches && !expanded) siteNav.setAttribute('aria-hidden', 'true');
        else siteNav.removeAttribute('aria-hidden');
        if (restoreFocus) menuToggle.focus({ preventScroll: true });
      }
      menuToggle.addEventListener('click', () => setMenu(body.dataset.menu !== 'open'));
      siteNav.addEventListener('click', (event) => {
        if (event.target instanceof Element && event.target.closest('a[href]')) setMenu(false);
      });
      document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && body.dataset.menu === 'open' && !(dialog && dialog.open)) {
          event.preventDefault();
          setMenu(false, true);
        }
      });
      watchMedia(mobileQuery, () => setMenu(false));
      setMenu(false);
    }

    const reveals = Array.from(document.querySelectorAll('.reveal'));
    if (motionEnabled && 'IntersectionObserver' in window) {
      const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        });
      }, { threshold: 0.08, rootMargin: '0px 0px -20px 0px' });
      reveals.forEach((element) => revealObserver.observe(element));
    } else {
      reveals.forEach((element) => element.classList.add('is-visible'));
    }

    const canvas = document.getElementById('starfield');
    const hero = document.getElementById('hero');
    if (!canvas || !hero || typeof canvas.getContext !== 'function') return;
    const context = canvas.getContext('2d');
    if (!context) return;
    canvas.setAttribute('aria-hidden', 'true');

    let width = 0;
    let height = 0;
    let frame = 0;
    let previousTime = 0;
    let heroVisible = false;
    let stars = [];

    function populateStars() {
      const count = mobileQuery.matches ? 24 : 50;
      stars = Array.from({ length: count }, (_, index) => ({
        x: Math.random(),
        y: Math.random(),
        radius: 0.4 + Math.random() * 0.8,
        alpha: 0.12 + Math.random() * 0.25,
        speed: 1.5 + Math.random() * 4,
        color: index % 9 === 0 ? '#d8b477' : '#a4d1e2'
      }));
    }

    function paint(delta = 0) {
      context.clearRect(0, 0, width, height);
      stars.forEach((star) => {
        star.x = (star.x + delta * star.speed * 0.12 / Math.max(1, width)) % 1;
        star.y = (star.y - delta * star.speed / Math.max(1, height) + 1) % 1;
        context.globalAlpha = star.alpha;
        context.fillStyle = star.color;
        context.beginPath();
        context.arc(star.x * width, star.y * height, star.radius, 0, Math.PI * 2);
        context.fill();
      });
      context.globalAlpha = 1;
    }

    function shouldAnimate() {
      return motionEnabled && heroVisible && !document.hidden && width > 0 && height > 0;
    }

    function tick(time) {
      frame = 0;
      if (!shouldAnimate()) { previousTime = 0; return; }
      const delta = previousTime ? Math.min((time - previousTime) / 1000, 0.05) : 0;
      previousTime = time;
      paint(delta);
      frame = requestAnimationFrame(tick);
    }

    refreshStars = () => {
      if (shouldAnimate()) {
        if (!frame) frame = requestAnimationFrame(tick);
      } else {
        if (frame) cancelAnimationFrame(frame);
        frame = 0;
        previousTime = 0;
      }
    };

    function updateVisibility() {
      const bounds = hero.getBoundingClientRect();
      heroVisible = bounds.bottom > 0 && bounds.top < window.innerHeight && bounds.right > 0 && bounds.left < window.innerWidth;
      refreshStars();
    }

    function resizeCanvas() {
      const bounds = canvas.getBoundingClientRect();
      width = Math.max(0, bounds.width);
      height = Math.max(0, bounds.height);
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      paint();
      updateVisibility();
    }

    populateStars();
    resizeCanvas();
    if ('IntersectionObserver' in window) {
      const heroObserver = new IntersectionObserver((entries) => {
        heroVisible = entries.some((entry) => entry.isIntersecting && entry.intersectionRatio > 0);
        refreshStars();
      }, { threshold: 0 });
      heroObserver.observe(hero);
    } else {
      window.addEventListener('scroll', updateVisibility, { passive: true });
    }
    if ('ResizeObserver' in window) new ResizeObserver(resizeCanvas).observe(hero);
    window.addEventListener('resize', resizeCanvas, { passive: true });
    document.addEventListener('visibilitychange', refreshStars);
    window.addEventListener('pagehide', () => {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      previousTime = 0;
    });
    window.addEventListener('pageshow', updateVisibility);
    watchMedia(mobileQuery, () => { populateStars(); resizeCanvas(); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
