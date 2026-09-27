(() => {
  'use strict';
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const body = document.body;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const mobile = matchMedia('(max-width: 900px)');
  let motionChosen = false;
  function setMotion(on) {
    body.dataset.motion = on ? 'on' : 'off';
    $('#motion-toggle').setAttribute('aria-pressed', String(on));
    $('[data-motion-label]').textContent = on ? 'ON' : 'OFF';
    if (!on) $$('.reveal.pending').forEach(el => el.classList.remove('pending'));
  }
  setMotion(false);
  $('#motion-toggle').addEventListener('click', () => { motionChosen = true; setMotion(body.dataset.motion !== 'on'); });
  reduced.addEventListener('change', () => { if (!motionChosen) setMotion(!reduced.matches); });
  const hero = $('#hero');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.target === hero) hero.classList.toggle('hero-visible', entry.isIntersecting && !document.hidden);
        else if (entry.isIntersecting) { entry.target.classList.remove('pending'); observer.unobserve(entry.target); }
      });
    }, { threshold: .04 });
    observer.observe(hero);
    $$('.reveal').forEach(el => { if (!reduced.matches) el.classList.add('pending'); observer.observe(el); });
    document.addEventListener('visibilitychange', () => {
      hero.classList.toggle('hero-visible', !document.hidden && hero.getBoundingClientRect().bottom > 0);
    });
  }
  let scrollQueued = false;
  function updateProgress() {
    const total = document.documentElement.scrollHeight - innerHeight;
    $('.reading-progress').style.width = `${total > 0 ? Math.min(100, scrollY / total * 100) : 0}%`;
    scrollQueued = false;
  }
  addEventListener('scroll', () => { if (!scrollQueued) { scrollQueued = true; requestAnimationFrame(updateProgress); } }, { passive: true });
  addEventListener('resize', updateProgress);
  updateProgress();

  const menu = $('#site-nav'), menuButton = $('#menu-toggle');
  function setMenu(open, restore = false) {
    open = open && mobile.matches;
    body.dataset.menu = open ? 'open' : 'closed';
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    menu.inert = mobile.matches && !open;
    if (mobile.matches && !open) menu.setAttribute('aria-hidden', 'true'); else menu.removeAttribute('aria-hidden');
    if (restore) menuButton.focus();
  }
  menuButton.addEventListener('click', () => setMenu(body.dataset.menu !== 'open'));
  $$('a', menu).forEach(a => a.addEventListener('click', () => setMenu(false)));
  mobile.addEventListener('change', () => setMenu(false));
  setMenu(false);

  function tabs(container, activate) {
    const buttons = $$('[role=tab]', container);
    const select = (button, focus = false) => {
      buttons.forEach(item => { item.setAttribute('aria-selected', String(item === button)); item.tabIndex = item === button ? 0 : -1; });
      activate(button);
      if (focus) button.focus({ preventScroll: true });
    };
    buttons.forEach((button, index) => {
      button.addEventListener('click', () => select(button));
      button.addEventListener('keydown', event => {
        let next;
        if (event.key === 'ArrowRight') next = (index + 1) % buttons.length;
        if (event.key === 'ArrowLeft') next = (index + buttons.length - 1) % buttons.length;
        if (event.key === 'Home') next = 0;
        if (event.key === 'End') next = buttons.length - 1;
        if (next !== undefined) { event.preventDefault(); select(buttons[next], true); }
      });
    });
  }
  const factions = {
    concord: { name: 'THE CONCORD', index: '01', tagline: 'Steel. Discipline. Firepower.', description: 'Human orbital industry goes to war. Riggers weld your expanding base while siege armor holds the frontline. Deploy Hammers for long-range fire and call down devastating Orbital Lances.', hero: 'Commander Ada Voss', traits: ['Siege armor', 'Orbital fire', 'On-site construction'], units: [['Hammer','Siege armor'],['Warden','Heavy mech'],['Skyhawk','Gunship']] },
    bloom: { name: 'THE BLOOM', index: '02', tagline: 'Grow. Adapt. Overwhelm.', description: 'Grow a living empire across the battlefield. Pulse Trees spread mycelium that sustains your structures and helps creatures regenerate and move faster. Raveners hatch in pairs to swell the swarm.', hero: 'Veyla, Mother of Thorns', traits: ['Living mycelium', 'Regeneration', 'Massed swarms'], units: [['Behemoth','Heavy creature'],['Spitter','Ranged creature'],['Wraithmoth','Flying creature']] },
    lumen: { name: 'THE LUMEN', index: '03', tagline: 'Precision. Power. Light.', description: 'Command the hard-light ancients. Weavers start constructs and move on as they build themselves. Regenerating shields and psionic abilities reward careful positioning and decisive strikes.', hero: 'Aurelion, the First Light', traits: ['Regenerating shields', 'Self-building constructs', 'Psionic abilities'], units: [['Luminar','Charged beam'],['Lancet','Heavy construct'],['Halcyon','Aircraft']] }
  };
  tabs($('#faction-tabs'), button => {
    const data = factions[button.dataset.faction];
    const panel = $('#faction-panel');
    panel.setAttribute('aria-labelledby', button.id);
    $('#faction-stage').dataset.faction = button.dataset.faction;
    ['name','index','tagline','description','hero'].forEach(key => $(`[data-faction-${key}]`).textContent = data[key]);
    $('[data-faction-traits]').replaceChildren(...data.traits.map(text => { const el = document.createElement('span'); el.textContent = text; return el; }));
    $('[data-faction-units]').replaceChildren(...data.units.map(([name, role]) => { const el = document.createElement('span'); el.textContent = name; const small = document.createElement('small'); small.textContent = role; el.append(small); return el; }));
  });
  const chapters = [
    { place: 'CHAPTER 01 / ASHFALL', title: 'THE LAST\nTRANSMISSION.', text: 'Voss has orders to destroy the signal. She chooses to answer it. Recover the silent relay—and survive whatever answers back.', objective: 'Recover the relay. Keep Voss alive.', alt: 'Campaign key art of a commander overlooking the silent Ashfall colony.' },
    { place: 'CHAPTER 02 / FROSTGLASS', title: 'A BRIDGE\nOF GLASS.', text: 'An evacuation column has one way home. Hold the crossing over the frozen chasm as the frontier closes in around your army.', objective: 'Hold the crossing. Bring the civilians home.', alt: 'Campaign key art of an armored column defending a bridge above a frozen chasm.' },
    { place: 'CHAPTER 03 / THE RESONATORS', title: 'THE ENEMY’S\nVOICE.', text: 'The signal is spreading through the enemy. Advance on the resonators, break their connection, and discover what the silence was hiding.', objective: 'Destroy the resonators. Break the signal.', alt: 'Campaign key art of Concord soldiers facing an enormous alien organism.' },
    { place: 'CHAPTER 04 / THE HEART', title: 'DAWN BEYOND\nTHE FRONT.', text: 'The Meridian waits at the end of the transmission. Seize the uplink, expose the Heart, and lead Voss through the final confrontation.', objective: 'Control the relay. Expose and destroy the Heart.', alt: 'Campaign key art of an army facing a luminous alien structure at dawn.' }
  ];
  tabs($('.chapter-tabs'), button => {
    const index = Number(button.dataset.chapter), data = chapters[index];
    $('#chapter-panel').setAttribute('aria-labelledby', button.id);
    $('#chapter-location').textContent = data.place;
    $('#chapter-title').textContent = data.title;
    $('#chapter-description').textContent = data.text;
    $('#chapter-objective').textContent = data.objective;
    $('#chapter-image').src = `assets/campaign-${index + 1}-web.webp`;
    $('#chapter-image').alt = data.alt;
  });

  const cards = $$('.media-grid [data-category]');
  $$('.media-filters button').forEach(button => button.addEventListener('click', () => {
    const filter = button.dataset.filter;
    $$('.media-filters button').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    cards.forEach(card => { card.hidden = filter !== 'all' && card.dataset.category !== filter; });
    $('.media-grid').classList.toggle('filtered', filter !== 'all');
    const count = cards.filter(card => !card.hidden).length;
    $('#media-count').textContent = `${count} media ${count === 1 ? 'item' : 'items'}`;
    updateProgress();
  }));
  const dialog = $('#media-dialog'), video = $('#media-video'), image = $('#media-image'), caption = $('#media-caption');
  const pictures = $$('.media-grid [data-lightbox]');
  const score = $('#score'), scoreButton = $('#score-play');
  let returnFocus = null, imageIndex = 0;
  const isPlainClick = event => event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;
  function showPicture(trigger) {
    video.pause(); video.hidden = true; image.hidden = false;
    image.src = trigger.dataset.image; image.alt = trigger.dataset.caption;
    caption.textContent = trigger.dataset.caption;
    imageIndex = Math.max(0, pictures.findIndex(item => item.dataset.image === trigger.dataset.image));
    $('.dialog-navigation').hidden = false;
    $('#media-position').textContent = `${imageIndex + 1} / ${pictures.length}`;
  }
  function openMedia(event, trigger, isVideo) {
    if (!isPlainClick(event) || typeof dialog.showModal !== 'function') return;
    event.preventDefault(); returnFocus = trigger;
    if (isVideo) {
      score.pause(); image.hidden = true; video.hidden = false; $('.dialog-navigation').hidden = true;
      caption.textContent = 'THE LAST TRANSMISSION · Original AI-generated story cinematic with sound. Created with MiniMax H3 Max via Fal.ai. Not gameplay footage.';
    } else showPicture(trigger);
    dialog.showModal(); body.classList.add('dialog-open'); $('#media-close').focus({ preventScroll: true });
    if (isVideo) video.play().catch(() => {});
  }
  $$('[data-lightbox]').forEach(trigger => trigger.addEventListener('click', event => openMedia(event, trigger, false)));
  $$('[data-video]').forEach(trigger => trigger.addEventListener('click', event => openMedia(event, trigger, true)));
  $('#media-close').addEventListener('click', () => dialog.close());
  function nextPicture(delta) { imageIndex = (imageIndex + delta + pictures.length) % pictures.length; showPicture(pictures[imageIndex]); }
  $('#media-prev').addEventListener('click', () => nextPicture(-1));
  $('#media-next').addEventListener('click', () => nextPicture(1));
  let backdropDown = false;
  function backdrop(event) { const r = dialog.getBoundingClientRect(); return event.target === dialog && (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom); }
  dialog.addEventListener('pointerdown', event => { backdropDown = backdrop(event); });
  dialog.addEventListener('click', event => { if (backdropDown && backdrop(event)) dialog.close(); backdropDown = false; });
  dialog.addEventListener('close', () => { video.pause(); body.classList.remove('dialog-open'); if (returnFocus?.isConnected) returnFocus.focus({ preventScroll: true }); });
  document.addEventListener('keydown', event => {
    if (dialog.open && !image.hidden && ['ArrowLeft','ArrowRight'].includes(event.key)) { event.preventDefault(); nextPicture(event.key === 'ArrowLeft' ? -1 : 1); }
    else if (event.key === 'Escape' && body.dataset.menu === 'open') setMenu(false, true);
  });

  const time = seconds => `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2,'0')}`;
  function audioState() {
    const playing = !score.paused && !score.ended;
    scoreButton.setAttribute('aria-pressed', String(playing));
    scoreButton.setAttribute('aria-label', playing ? 'Pause Onslaught' : 'Play Onslaught');
    $('span', scoreButton).textContent = playing ? 'Ⅱ' : '▶';
    $('.soundtrack').dataset.playing = String(playing);
    $('#audio-state').textContent = playing ? 'NOW PLAYING · ONSLAUGHT' : 'PRESS PLAY. ENTER THE FRONTIER.';
  }
  scoreButton.addEventListener('click', () => {
    if (score.paused) { video.pause(); score.play().catch(() => { $('#audio-state').textContent = 'AUDIO UNAVAILABLE. TRY AGAIN.'; }); }
    else score.pause();
  });
  ['play','pause','ended'].forEach(event => score.addEventListener(event, audioState));
  score.addEventListener('loadedmetadata', () => { if (Number.isFinite(score.duration)) { $('#audio-duration').textContent = time(score.duration); $('#audio-seek').max = score.duration; } });
  score.addEventListener('timeupdate', () => { $('#audio-elapsed').textContent = time(score.currentTime); $('#audio-seek').value = score.currentTime; $('#audio-seek').setAttribute('aria-valuetext', `${Math.floor(score.currentTime / 60)} minutes ${Math.floor(score.currentTime % 60)} seconds`); });
  $('#audio-seek').addEventListener('input', event => { if (Number.isFinite(score.duration)) score.currentTime = Number(event.target.value); });
})();
