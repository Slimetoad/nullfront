(() => {
  'use strict';
  const section = document.querySelector('#premiere');
  const movie = document.querySelector('#launch-trailer');
  const cover = document.querySelector('#trailer-play');
  const state = document.querySelector('#film-state');
  const screen = document.querySelector('#cinema-screen');
  const chapters = [...document.querySelectorAll('[data-trailer-time]')];
  movie.controls = false;
  let pendingSeek = null;
  let signal = null;
  const pauseOthers = active => document.querySelectorAll('video,audio').forEach(media => { if (media !== active) media.pause(); });
  // One soundtrack at a time across the premiere, archive and original score.
  document.querySelectorAll('video,audio').forEach(media => media.addEventListener('play', () => pauseOthers(media)));
  const format = n => `${String(Math.floor(n / 60)).padStart(2,'0')}:${String(Math.floor(n % 60)).padStart(2,'0')}`;
  function playAt(seconds) {
    if (seconds !== undefined) {
      if (movie.readyState > 0) movie.currentTime = Math.min(seconds, movie.duration || seconds);
      else pendingSeek = seconds;
    }
    state.textContent = 'CONNECTING TO THE FRONTIER…';
    movie.play().catch(() => { cover.hidden = false; signal?.resume(); state.textContent = 'PRESS PLAY TO CONTINUE'; });
  }
  cover.addEventListener('click', () => playAt());
  document.querySelector('#trailer-replay').addEventListener('click', () => playAt(0));
  chapters.forEach(button => button.addEventListener('click', () => playAt(Number(button.dataset.trailerTime))));
  movie.addEventListener('loadedmetadata', () => {
    if (pendingSeek !== null) { movie.currentTime = Math.min(pendingSeek, movie.duration); pendingSeek = null; }
    if (Number.isFinite(movie.duration)) document.querySelector('[data-trailer-duration]').textContent = format(movie.duration);
  });
  movie.addEventListener('play', () => { movie.controls = true; cover.hidden = true; signal?.pause(); state.textContent = 'NOW PLAYING · SOUND ON'; });
  movie.addEventListener('playing', () => { state.textContent = movie.muted ? 'NOW PLAYING · MUTED' : 'NOW PLAYING · SOUND ON'; });
  movie.addEventListener('volumechange', () => { if (!movie.paused) state.textContent = movie.muted || movie.volume === 0 ? 'NOW PLAYING · MUTED' : 'NOW PLAYING · SOUND ON'; });
  movie.addEventListener('pause', () => { state.textContent = movie.ended ? 'YOUR NEXT COMMAND STARTS HERE' : `PAUSED · ${format(movie.currentTime)}`; signal?.resume(); });
  movie.addEventListener('ended', () => { state.textContent = 'YOUR NEXT COMMAND STARTS HERE'; signal?.resume(); });
  movie.addEventListener('error', () => { cover.hidden = false; signal?.resume(); state.textContent = 'FILM UNAVAILABLE · TRY SAVE TRAILER'; });
  movie.addEventListener('timeupdate', () => {
    const current = chapters.reduce((last, button) => movie.currentTime >= Number(button.dataset.trailerTime) ? button : last, chapters[0]);
    chapters.forEach(button => button.setAttribute('aria-pressed', String(button === current)));
  });
  const theater = document.querySelector('#cinema-dialog');
  const theaterClose = document.querySelector('#theater-close');
  const fullButton = document.querySelector('#trailer-fullscreen');
  const screenHome = document.createComment('premiere screen');
  screen.before(screenHome);
  function openTheater() {
    if (typeof theater.showModal !== 'function') {state.textContent = 'USE YOUR VIDEO PLAYER’S FULL-SCREEN CONTROL';return;}
    const playing = !movie.paused;
    theater.append(screen);theater.showModal();document.body.classList.add('theater-open');theaterClose.focus();
    if (playing) movie.play().catch(()=>{});
  }
  theaterClose.addEventListener('click',()=>theater.close());
  theater.addEventListener('close',()=>{
    const playing=!movie.paused;screenHome.after(screen);document.body.classList.remove('theater-open');fullButton.focus({preventScroll:true});
    if(playing)movie.play().catch(()=>{});
  });
  fullButton.addEventListener('click', async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else if (screen.requestFullscreen) await screen.requestFullscreen();
      else if (movie.webkitEnterFullscreen) movie.webkitEnterFullscreen();
      else openTheater();
    } catch { openTheater(); }
  });
  const signalHost = document.querySelector('#frontier-signal');
  const startSignal = () => {
    if (!signal && window.NullfrontFX) {
      signal = window.NullfrontFX.mount(signalHost, {palette: section.dataset.palette});
      if (!movie.paused) signal.pause();
    }
  };
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => { if (entries.some(e => e.isIntersecting)) { startSignal(); observer.disconnect(); } }, {rootMargin:'100px'});
    observer.observe(section);
  }
  document.querySelectorAll('[data-signal-palette]').forEach(button => button.addEventListener('click', () => {
    section.dataset.palette = button.dataset.signalPalette;
    document.querySelectorAll('[data-signal-palette]').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
    startSignal(); signal?.setPalette(button.dataset.signalPalette);
  }));
  const loadButton = document.querySelector('#hangar-load');
  loadButton.addEventListener('click', async () => {
    loadButton.disabled = true;
    document.querySelector('#hangar-status').textContent = 'Opening the hangar…';
    try {
      const { mountHangar } = await import('./hangar.js');
      const session = await mountHangar(document.querySelector('#hangar-viewport'));
      if (!session) return;
      document.querySelector('#hangar-controls').hidden = false;
      document.querySelector('[data-view=hero]').focus({preventScroll:true});
    } catch {
      loadButton.disabled = false;
      loadButton.textContent = 'Try the 3D hangar again';
      document.querySelector('#hangar-status').textContent = '3D could not load. The native gallery remains available.';
    }
  });
})();
