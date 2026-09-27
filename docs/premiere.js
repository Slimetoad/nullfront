(() => {
  'use strict';
  const section = document.querySelector('#premiere');
  const movie = document.querySelector('#launch-trailer');
  const cover = document.querySelector('#trailer-play');
  const state = document.querySelector('#film-state');
  const screen = document.querySelector('#cinema-screen');
  const source = document.querySelector('#trailer-source');
  if (!section || !movie || !cover || !state || !screen || !source) return;

  const trailers = {
    main: {
      title: 'Main trailer',
      source: 'assets/nullfront-main-trailer-30s.mp4',
      poster: 'assets/nullfront-main-trailer-poster.webp',
      captions: null,
      kind: 'OFFICIAL TRAILER / 30-SECOND PREMIERE',
      label: 'NULLFRONT main trailer — 30-second premiere',
      disclosure: 'Main trailer · Story cinematics and native battle footage from NULLFRONT: Frontier Wars.',
      description: 'Tony Studios presents NULLFRONT: Frontier Wars. Watch the 30-second main trailer, featuring the frontier, its three rival factions and native battle footage. The cinematic and gameplay trailers are also available above.'
    },
    cinematic: {
      title: 'Cinematic trailer',
      source: 'assets/cinematic-trailer.mp4',
      poster: 'assets/cinematic-poster.webp',
      captions: 'assets/cinematic-captions.vtt',
      kind: 'CINEMATIC / GENERATED STORY FOOTAGE',
      label: 'NULLFRONT cinematic trailer — generated story footage',
      disclosure: 'Cinematic trailer · Generated story footage from the NULLFRONT universe. This film does not show gameplay.',
      description: 'Tony Studios presents NULLFRONT: Frontier Wars. Explore the frontier and its rival civilizations through generated narrative cinematics. This is a story film, not a recording of the game. English captions are available in the player.'
    },
    gameplay: {
      title: 'Gameplay trailer',
      source: 'assets/gameplay-command-trailer.mp4',
      poster: 'assets/gameplay-command-poster.webp',
      captions: 'assets/gameplay-command-captions.vtt',
      kind: 'GAMEPLAY / ACTUAL GAME CAPTURES',
      label: 'NULLFRONT gameplay trailer — commands, combat and abilities captured in game',
      disclosure: 'Take command · Squad maneuvers, siege tactics and faction abilities captured in the native game. Includes one labeled Skyhawk 3D showcase.',
      description: 'Follow staged command sequences using the real game systems: flank with squads, deploy siege armor, call an Orbital Lance and combine Lumen abilities. Captured from the native 0.6.2 development build at the cinematic graphics preset. Weapon and ability sounds are synchronized from the game’s event recordings and mixed with its score. A brief Skyhawk model study is labeled separately. English captions are available in the player.'
    }
  };
  const choices = [...section.querySelectorAll('[data-trailer]')].filter(node => node.tagName === 'BUTTON');
  const duration = section.querySelector('[data-trailer-duration]');
  const rig = document.querySelector('#cinema-rig');
  let selected = 'main';
  let captionsPreferred = false;
  let pendingSeek = null;
  let playRequest = 0;
  let signal = null;
  const knownDurations = {main: 30};
  const format = n => `${String(Math.floor(n / 60)).padStart(2, '0')}:${String(Math.floor(n % 60)).padStart(2, '0')}`;
  const setText = (selector, text) => { const node = section.querySelector(selector); if (node) node.textContent = text; };
  const showDuration = seconds => {
    if (!duration) return;
    duration.textContent = Number.isFinite(seconds) ? format(seconds) : '—:—';
    duration.setAttribute('aria-label', Number.isFinite(seconds) ? `Trailer duration ${format(seconds)}` : 'Duration available when the trailer loads');
  };
  const setLink = (selector, href, label) => {
    const link = section.querySelector(selector);
    if (link) { link.href = href; link.setAttribute('aria-label', label); }
  };
  function updatePresentation() {
    const trailer = trailers[selected];
    choices.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.trailer === selected)));
    if (rig) rig.dataset.trailer = selected;
    movie.poster = trailer.poster;
    movie.setAttribute('aria-label', trailer.label);
    screen.style.setProperty('--trailer-poster', `url("${trailer.poster}")`);
    cover.setAttribute('aria-label', `Play the NULLFRONT ${trailer.title.toLowerCase()}`);
    setText('#trailer-kind', trailer.kind);
    setText('#trailer-cover-label', `WATCH THE ${trailer.title.toUpperCase()}`);
    setText('#trailer-disclosure', trailer.disclosure);
    setText('#trailer-description', trailer.description);
    setText('#trailer-fallback', `Watch the ${trailer.title.toLowerCase()}`);
    setText('#trailer-caption-download', `Download ${selected} captions (VTT) ↓`);
    setLink('#trailer-download', trailer.source, `Download the ${trailer.title.toLowerCase()}`);
    setLink('#trailer-fallback', trailer.source, `Watch the ${trailer.title.toLowerCase()}`);
    const captionLink = section.querySelector('#trailer-caption-download');
    if (captionLink) {
      captionLink.hidden = !trailer.captions;
      captionLink.style.display = trailer.captions ? '' : 'none';
      if (trailer.captions) setLink('#trailer-caption-download', trailer.captions, `Download ${selected} captions (VTT)`);
      else captionLink.removeAttribute('href');
    }
    showDuration(knownDurations[selected]);
  }
  function selectTrailer(key) {
    if (!trailers[key] || key === selected) return;
    ++playRequest; // Ignore a rejected play promise belonging to the previous source.
    movie.pause();
    if (movie.readyState > 0) movie.currentTime = 0;
    if (movie.textTracks.length) captionsPreferred = [...movie.textTracks].some(track => track.mode === 'showing');
    pendingSeek = null;
    selected = key;
    source.src = trailers[key].source;
    movie.querySelectorAll('track').forEach(track => track.remove());
    if (trailers[key].captions) {
      const track = document.createElement('track');
      track.kind = 'captions';
      track.srclang = 'en';
      track.label = 'English';
      track.src = trailers[key].captions;
      track.default = captionsPreferred;
      movie.append(track);
      if (captionsPreferred) track.track.mode = 'showing';
    }
    movie.controls = false;
    cover.hidden = false;
    updatePresentation();
    movie.load(); // Cancels the old download; preload=none keeps the new film idle until play.
    signal?.resume();
    state.textContent = `${trailers[key].title.toUpperCase()} · PRESS PLAY`;
  }
  choices.forEach(button => button.addEventListener('click', () => selectTrailer(button.dataset.trailer)));
  updatePresentation();
  movie.controls = false;
  const requestedTrailer = new URLSearchParams(window.location.search).get('trailer');
  if (requestedTrailer === 'gameplay' || requestedTrailer === 'cinematic') selectTrailer(requestedTrailer);
  const choiceGroup = section.querySelector('.trailer-choices');
  if (choiceGroup) choiceGroup.hidden = false;

  const pauseOthers = active => document.querySelectorAll('video,audio').forEach(media => {
    if (media !== active && !active.classList.contains('hero-film')) media.pause();
  });
  // One soundtrack at a time across the premiere, archive and original score.
  document.querySelectorAll('video,audio').forEach(media => media.addEventListener('play', () => pauseOthers(media)));
  function playAt(seconds) {
    if (seconds !== undefined) {
      if (movie.readyState > 0) movie.currentTime = Math.min(seconds, movie.duration || seconds);
      else pendingSeek = seconds;
    }
    const request = ++playRequest;
    state.textContent = 'CONNECTING TO THE FRONTIER…';
    movie.play().catch(() => {
      if (request !== playRequest) return;
      cover.hidden = false;
      signal?.resume();
      state.textContent = movie.error ? 'FILM UNAVAILABLE · TRY SAVE TRAILER' : 'PRESS PLAY TO CONTINUE';
    });
  }
  cover.addEventListener('click', () => playAt());
  document.querySelector('#trailer-replay')?.addEventListener('click', () => playAt(0));
  movie.addEventListener('loadedmetadata', () => {
    if (pendingSeek !== null) { movie.currentTime = Math.min(pendingSeek, movie.duration); pendingSeek = null; }
    if (Number.isFinite(movie.duration)) {
      knownDurations[selected] = movie.duration;
      showDuration(movie.duration);
    }
  });
  const playingState = () => { state.textContent = movie.muted || movie.volume === 0 ? 'NOW PLAYING · MUTED' : 'NOW PLAYING · SOUND ON'; };
  movie.addEventListener('play', () => { movie.controls = true; cover.hidden = true; signal?.pause(); playingState(); });
  movie.addEventListener('playing', playingState);
  movie.addEventListener('volumechange', () => { if (!movie.paused) playingState(); });
  movie.addEventListener('pause', () => {
    if (cover.hidden) state.textContent = movie.ended ? 'YOUR NEXT COMMAND STARTS HERE' : `PAUSED · ${format(movie.currentTime)}`;
    signal?.resume();
  });
  movie.addEventListener('ended', () => { state.textContent = 'YOUR NEXT COMMAND STARTS HERE'; signal?.resume(); });
  movie.addEventListener('error', () => {
    if (!movie.error) return;
    cover.hidden = false;
    signal?.resume();
    state.textContent = 'FILM UNAVAILABLE · TRY SAVE TRAILER';
  });

  const theater = document.querySelector('#cinema-dialog');
  const theaterClose = document.querySelector('#theater-close');
  const fullButton = document.querySelector('#trailer-fullscreen');
  const screenHome = document.createComment('premiere screen');
  screen.before(screenHome);
  function openTheater() {
    if (!theater || typeof theater.showModal !== 'function') { state.textContent = 'USE YOUR VIDEO PLAYER’S FULL-SCREEN CONTROL'; return; }
    const playing = !movie.paused;
    theater.append(screen);
    theater.showModal();
    document.body.classList.add('theater-open');
    theaterClose?.focus();
    if (playing) movie.play().catch(() => {});
  }
  theaterClose?.addEventListener('click', () => theater.close());
  theater?.addEventListener('close', () => {
    const playing = !movie.paused;
    screenHome.after(screen);
    document.body.classList.remove('theater-open');
    fullButton?.focus({preventScroll: true});
    if (playing) movie.play().catch(() => {});
  });
  fullButton?.addEventListener('click', async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else if (screen.requestFullscreen) await screen.requestFullscreen();
      else if (movie.webkitEnterFullscreen) movie.webkitEnterFullscreen();
      else openTheater();
    } catch { openTheater(); }
  });
  const signalHost = document.querySelector('#frontier-signal');
  const startSignal = () => {
    if (!signal && signalHost && window.NullfrontFX) {
      signal = window.NullfrontFX.mount(signalHost, {palette: section.dataset.palette});
      if (!movie.paused) signal.pause();
    }
  };
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => { if (entries.some(e => e.isIntersecting)) { startSignal(); observer.disconnect(); } }, {rootMargin: '100px'});
    observer.observe(section);
  } else startSignal();
  document.querySelectorAll('[data-signal-palette]').forEach(button => button.addEventListener('click', () => {
    section.dataset.palette = button.dataset.signalPalette;
    document.querySelectorAll('[data-signal-palette]').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
    startSignal();
    signal?.setPalette(button.dataset.signalPalette);
  }));
})();
