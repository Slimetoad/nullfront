/* NULLFRONT / Frontier Signal — dependency-free ambient WebGL.
 *
 * const fx = NullfrontFX.mount(emptyDecorativeHost, { palette: 'lumen' });
 * fx.setPalette('concord' | 'bloom' | 'lumen');
 * fx.setMotion(true | false | 'auto'); // body[data-motion] and OS reduce still win
 * fx.pause(); fx.resume(); fx.dispose(); fx.state();
 *
 * Host events: frontier:palette {palette}, frontier:motion {enabled}.
 * Observe body[data-motion] automatically. Pause while a trailer is playing.
 * Host must be an empty, sized, decorative layer; place video/controls above it.
 */
(() => {
  'use strict';

  const instances = new WeakMap();
  const palettes = Object.freeze({
    concord: { a: [1.0, 0.39, 0.13], b: [0.25, 0.57, 0.85], core: [1.0, 0.86, 0.60], css: ['255, 111, 49', '56, 119, 178'] },
    bloom: { a: [0.63, 0.27, 0.95], b: [0.40, 0.80, 0.35], core: [0.87, 1.0, 0.71], css: ['152, 75, 226', '94, 159, 71'] },
    lumen: { a: [0.12, 0.66, 0.95], b: [0.79, 0.53, 0.22], core: [0.77, 0.96, 1.0], css: ['36, 163, 225', '173, 125, 64'] }
  });

  const vertexSource = `
    attribute vec2 aPosition;
    varying vec2 vUV;
    void main() {
      vUV = aPosition * 0.5 + 0.5;
      gl_Position = vec4(aPosition, 0.0, 1.0);
    }
  `;

  const fragmentSource = `
    #ifdef GL_FRAGMENT_PRECISION_HIGH
      precision highp float;
    #else
      precision mediump float;
    #endif
    varying vec2 vUV;
    uniform vec2 uResolution;
    uniform vec2 uPointer;
    uniform float uTime;
    uniform vec3 uColorA;
    uniform vec3 uColorB;
    uniform vec3 uCore;

    float hash(vec2 p) {
      vec3 q = fract(vec3(p.xyx) * 0.1031);
      q += dot(q, q.yzx + 33.33);
      return fract((q.x + q.y) * q.z);
    }
    float noise(vec2 p) {
      vec2 i = floor(p), f = fract(p);
      f = f * f * (3.0 - 2.0 * f);
      return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
                 mix(hash(i + vec2(0.0, 1.0)), hash(i + 1.0), f.x), f.y);
    }
    mat2 rotate(float a) {
      float c = cos(a), s = sin(a);
      return mat2(c, -s, s, c);
    }
    float cloud(vec2 p) {
      float n = noise(p) * 0.57;
      p = mat2(1.72, -1.12, 1.12, 1.72) * p + 2.9;
      n += noise(p) * 0.28;
      p = mat2(1.72, -1.12, 1.12, 1.72) * p + 4.7;
      return n + noise(p) * 0.15;
    }
    float stars(vec2 p, float scale, float seed, float speed, float px) {
      vec2 q = p * scale + vec2(uTime * speed, seed);
      vec2 cell = floor(q);
      float h = hash(cell + seed);
      vec2 center = 0.23 + 0.54 * vec2(hash(cell + 5.1), hash(cell + 17.7));
      vec2 d = fract(q) - center;
      float radius = (0.010 + 0.013 * h) + px * scale * 0.35;
      float point = 1.0 - smoothstep(0.0, radius, length(d));
      float halo = exp(-length(d) * 38.0) * 0.22;
      float twinkle = 0.73 + 0.27 * sin(uTime * (0.32 + h * 0.25) + h * 47.0);
      return (point + halo) * smoothstep(0.88, 0.997, h) * twinkle;
    }
    float orbit(vec2 p, vec2 center, float angle, vec2 ellipse, float radius, float px) {
      vec2 q = rotate(angle) * (p - center);
      q /= ellipse;
      float distanceToLine = abs(length(q) - radius);
      float line = 1.0 - smoothstep(px * 0.7, px * 2.2, distanceToLine);
      float glow = exp(-distanceToLine * 58.0) * 0.11;
      float arc = smoothstep(-0.72, 0.48, q.x) * (0.52 + 0.48 * smoothstep(-0.1, 0.5, q.y));
      return (line * 0.48 + glow) * arc;
    }
    void main() {
      float aspect = uResolution.x / max(uResolution.y, 1.0);
      float px = 1.0 / max(uResolution.y, 1.0);
      vec2 p = (vUV - 0.5) * vec2(aspect, 1.0);
      vec2 parallax = uPointer * vec2(0.024, 0.016);
      vec2 world = p + parallax;
      vec3 color = vec3(0.013, 0.025, 0.044);

      // An extended fractured horizon, with dark interstellar dust through it.
      // Slow travel and only three octaves keep the field calm and inexpensive.
      vec2 r = rotate(-0.18) * (world - vec2(0.04, -0.055));
      float n = cloud(vec2(r.x * 2.4 + uTime * 0.009, r.y * 5.2 + 8.0));
      float warp = (n - 0.5) * 0.19;
      float ridge = r.y - warp - 0.034 * sin(r.x * 3.2 + uTime * 0.045);
      float broad = exp(-abs(ridge) * 7.0);
      float veil = broad * smoothstep(0.24, 0.88, n);
      float filament = exp(-abs(ridge + (n - 0.52) * 0.09) * 47.0);
      float dust = smoothstep(0.48, 0.71, n) * exp(-abs(ridge - 0.028) * 29.0);
      color += mix(uColorB, uColorA, smoothstep(-0.75, 0.70, r.x)) * veil * 0.36;
      color += uColorA * filament * (0.075 + n * 0.13);
      color *= 1.0 - dust * 0.63;
      color += uColorB * exp(-length(world - vec2(-0.68, -0.30)) * 2.5) * 0.028;

      // Sparse parallax star layers; no texture downloads or particle buffers.
      float farStars = stars(p + parallax * 0.22, 44.0, 4.0, 0.010, px);
      float nearStars = stars(p + parallax * 0.70, 21.0, 23.0, 0.023, px);
      color += vec3(0.65, 0.79, 0.94) * farStars * 0.58;
      color += mix(uCore, vec3(0.94), 0.35) * nearStars * 0.90;

      // A broken astrolabe around the signal, offset from the quiet video center.
      vec2 center = vec2(min(aspect * 0.33, 0.82), 0.035);
      vec2 orbitalP = world + uPointer * 0.004;
      float rings = orbit(orbitalP, center, 0.27, vec2(1.0, 0.42), 0.68, px);
      rings += orbit(orbitalP, center, -0.54, vec2(1.0, 0.51), 0.55, px) * 0.65;
      rings += orbit(orbitalP, center, 0.27, vec2(1.0, 0.42), 0.715, px) * 0.25;
      color += mix(uColorA, uCore, 0.5) * rings * 0.25;

      // Two tiny orbiting beacons — slow movement, never a flashing strobe.
      float phase = uTime * 0.070;
      vec2 beacon = center + rotate(-0.27) * (vec2(cos(phase), sin(phase)) * vec2(0.68, 0.286));
      float beaconD = length(world - beacon);
      color += uCore * (exp(-beaconD * 155.0) * 0.46 + exp(-beaconD * 33.0) * 0.055);
      vec2 second = center + rotate(0.54) * (vec2(cos(-phase + 2.4), sin(-phase + 2.4)) * vec2(0.55, 0.281));
      color += uColorB * exp(-length(world - second) * 180.0) * 0.34;

      // A quiet dark planet edge anchors the image instead of a floating blob.
      vec2 planetCenter = vec2(-aspect * 0.44, -0.90);
      float planetD = length(world - planetCenter);
      float planetMask = 1.0 - smoothstep(0.80, 0.805, planetD);
      color *= 1.0 - planetMask * 0.92;
      float atmosphere = exp(-abs(planetD - 0.804) * 78.0);
      color += uColorA * atmosphere * smoothstep(-0.84, -0.08, world.y) * 0.17;

      // Protect trailer edges/text: a restrained perimeter and no center flare.
      float edge = smoothstep(0.0, 0.18, vUV.y) * smoothstep(0.0, 0.18, 1.0 - vUV.y);
      float vignette = 1.0 - 0.36 * smoothstep(0.22, 0.75, length(vUV - 0.5));
      color *= mix(0.68, 1.0, edge) * vignette;
      color = 1.0 - exp(-color * 1.30);
      gl_FragColor = vec4(color, 1.0);
    }
  `;

  function mount(host, options = {}) {
    if (!(host instanceof Element)) throw new TypeError('Frontier Signal needs a host element.');
    if (instances.has(host)) return instances.get(host);

    const canvas = document.createElement('canvas');
    canvas.className = 'frontier-fx__canvas';
    canvas.setAttribute('aria-hidden', 'true');
    canvas.setAttribute('role', 'presentation');
    canvas.tabIndex = -1;
    host.classList.add('frontier-fx');
    host.append(canvas);
    const reduce = matchMedia('(prefers-reduced-motion: reduce)');
    const pointerTarget = options.pointerTarget instanceof Element ? options.pointerTarget : host.parentElement || host;
    const maxDpr = Math.min(1.5, Math.max(0.5, Number(options.maxDpr) || 1.35));
    const maxPixels = Math.min(1200000, Math.max(100000, Number(options.maxPixels) || 720000));
    const fps = Math.min(30, Math.max(12, Number(options.fps) || 30));
    const interval = 1000 / fps;
    let palette = Object.hasOwn(palettes, options.palette) ? options.palette : 'lumen';
    let motion = options.motion === false ? false : options.motion === true ? true : 'auto';
    let gl, program, buffer, uniforms;
    let disposed = false, lost = false, failed = false, manualPause = false, pageActive = true;
    let onScreen = false, sized = false, running = false, dirty = true;
    let raf = 0, time = 11.2, previous = 0, nextPaint = 0;
    let rect = { width: 0, height: 0, left: 0, top: 0 };
    let pointer = [0, 0], targetPointer = [0, 0];
    let colorA = [...palettes[palette].a], colorB = [...palettes[palette].b], core = [...palettes[palette].core];
    let resizeObserver, intersectionObserver, bodyObserver;
    const removers = [];

    function listen(target, event, callback, opts) {
      target.addEventListener(event, callback, opts);
      removers.push(() => target.removeEventListener(event, callback, opts));
    }
    function setState(value) {
      host.dataset.fxState = value;
      host.classList.toggle('frontier-fx--paused', value !== 'running');
      host.classList.toggle('frontier-fx--fallback', value === 'fallback' || value === 'lost');
      host.classList.toggle('frontier-fx--reduced', reduce.matches);
    }
    function cssPalette() {
      host.dataset.fxPalette = palette;
      host.style.setProperty('--frontier-primary', palettes[palette].css[0]);
      host.style.setProperty('--frontier-secondary', palettes[palette].css[1]);
    }
    function stop() {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      running = false;
      previous = nextPaint = 0;
    }
    function release() {
      if (gl && !gl.isContextLost()) {
        if (buffer) gl.deleteBuffer(buffer);
        if (program) gl.deleteProgram(program);
      }
      buffer = program = uniforms = null;
    }
    function shader(type, source) {
      const result = gl.createShader(type);
      if (!result) throw new Error('shader');
      gl.shaderSource(result, source);
      gl.compileShader(result);
      if (!gl.getShaderParameter(result, gl.COMPILE_STATUS)) {
        gl.deleteShader(result);
        throw new Error('shader');
      }
      return result;
    }
    function initialize() {
      let vs, fs;
      try {
        gl = canvas.getContext('webgl', { alpha: false, antialias: false, depth: false, stencil: false, powerPreference: 'low-power', preserveDrawingBuffer: false, failIfMajorPerformanceCaveat: true });
        if (!gl) throw new Error('context');
        vs = shader(gl.VERTEX_SHADER, vertexSource);
        fs = shader(gl.FRAGMENT_SHADER, fragmentSource);
        program = gl.createProgram();
        if (!program) throw new Error('program');
        gl.attachShader(program, vs); gl.attachShader(program, fs); gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error('link');
        buffer = gl.createBuffer();
        if (!buffer) throw new Error('buffer');
        gl.useProgram(program);
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
        const location = gl.getAttribLocation(program, 'aPosition');
        gl.enableVertexAttribArray(location);
        gl.vertexAttribPointer(location, 2, gl.FLOAT, false, 0, 0);
        uniforms = {};
        ['uResolution', 'uPointer', 'uTime', 'uColorA', 'uColorB', 'uCore'].forEach(name => { uniforms[name] = gl.getUniformLocation(program, name); });
        gl.disable(gl.DEPTH_TEST); gl.disable(gl.BLEND);
        failed = false; lost = false; dirty = true;
      } catch (_) {
        release(); failed = true;
        host.classList.remove('frontier-fx--ready');
      } finally {
        if (gl && vs) gl.deleteShader(vs);
        if (gl && fs) gl.deleteShader(fs);
      }
    }
    function motionEnabled() {
      return motion !== false && !reduce.matches && document.body?.dataset.motion !== 'off';
    }
    function visible() {
      return onScreen && sized && !document.hidden && pageActive && !disposed;
    }
    function draw(delta = 0) {
      if (!gl || !program || lost || failed || !sized) return;
      const blend = delta > 0 ? 1 - Math.exp(-delta * 2.8) : 1;
      const follow = delta > 0 ? 1 - Math.exp(-delta * 4.0) : 1;
      for (let i = 0; i < 3; i++) {
        colorA[i] += (palettes[palette].a[i] - colorA[i]) * blend;
        colorB[i] += (palettes[palette].b[i] - colorB[i]) * blend;
        core[i] += (palettes[palette].core[i] - core[i]) * blend;
      }
      pointer[0] += (targetPointer[0] - pointer[0]) * follow;
      pointer[1] += (targetPointer[1] - pointer[1]) * follow;
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.useProgram(program);
      gl.uniform2f(uniforms.uResolution, canvas.width, canvas.height);
      gl.uniform2f(uniforms.uPointer, pointer[0], pointer[1]);
      gl.uniform1f(uniforms.uTime, time);
      gl.uniform3fv(uniforms.uColorA, colorA);
      gl.uniform3fv(uniforms.uColorB, colorB);
      gl.uniform3fv(uniforms.uCore, core);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      host.classList.add('frontier-fx--ready');
      dirty = false;
    }
    function frame(now) {
      raf = 0;
      if (!running || disposed) return;
      if (!previous) previous = now;
      if (!nextPaint) nextPaint = now;
      if (now + 0.25 >= nextPaint) {
        const delta = Math.min(0.1, Math.max(0, (now - previous) / 1000));
        time += delta;
        previous = now;
        nextPaint += Math.max(1, Math.floor((now - nextPaint) / interval) + 1) * interval;
        draw(delta || 1 / fps);
      }
      raf = requestAnimationFrame(frame);
    }
    function sync() {
      if (disposed) return;
      if (failed || lost) { stop(); setState(lost ? 'lost' : 'fallback'); return; }
      const shouldRun = visible() && !manualPause && motionEnabled();
      if (shouldRun) {
        setState('running');
        if (!running) { running = true; previous = nextPaint = 0; raf = requestAnimationFrame(frame); }
      } else {
        stop();
        setState(visible() && !manualPause ? 'static' : 'paused');
        if (visible() && dirty) draw();
      }
    }
    function resize() {
      if (disposed) return;
      rect = host.getBoundingClientRect();
      sized = rect.width > 0 && rect.height > 0;
      if (sized) {
        const ratio = Math.min(window.devicePixelRatio || 1, maxDpr, Math.sqrt(maxPixels / (rect.width * rect.height)));
        const width = Math.max(1, Math.round(rect.width * ratio));
        const height = Math.max(1, Math.round(rect.height * ratio));
        if (canvas.width !== width || canvas.height !== height) {
          canvas.width = width; canvas.height = height; dirty = true;
        }
      }
      if (!intersectionObserver) onScreen = rect.bottom > 0 && rect.top < innerHeight && rect.right > 0 && rect.left < innerWidth;
      sync();
    }
    function setPalette(value) {
      if (disposed || !Object.hasOwn(palettes, value)) return false;
      palette = value; dirty = true; cssPalette(); sync();
      return true;
    }
    function setMotion(value) {
      if (disposed) return;
      motion = value === false ? false : value === true ? true : 'auto';
      if (!motionEnabled()) { targetPointer = [0, 0]; pointer = [0, 0]; dirty = true; }
      sync();
    }
    function visibility() { dirty = true; sync(); }
    function dispose() {
      if (disposed) return;
      disposed = true; stop();
      resizeObserver?.disconnect(); intersectionObserver?.disconnect(); bodyObserver?.disconnect();
      removers.forEach(remove => remove());
      release();
      gl?.getExtension('WEBGL_lose_context')?.loseContext();
      canvas.remove(); instances.delete(host);
      host.classList.remove('frontier-fx--ready', 'frontier-fx--fallback', 'frontier-fx--reduced');
      setState('disposed');
    }

    const api = Object.freeze({
      setPalette, setMotion, dispose,
      pause() { if (!disposed) { manualPause = true; sync(); } },
      resume() { if (!disposed) { manualPause = false; dirty = true; sync(); } },
      state() { return { state: host.dataset.fxState, palette, motion: motionEnabled(), running, width: canvas.width, height: canvas.height, disposed }; }
    });
    instances.set(host, api);
    cssPalette();
    listen(canvas, 'webglcontextlost', event => { event.preventDefault(); lost = true; stop(); host.classList.remove('frontier-fx--ready'); sync(); });
    listen(canvas, 'webglcontextrestored', () => { if (!disposed) { initialize(); resize(); } });
    listen(document, 'visibilitychange', visibility);
    listen(window, 'pagehide', () => { pageActive = false; sync(); });
    listen(window, 'pageshow', () => { pageActive = true; visibility(); });
    listen(window, 'resize', resize, { passive: true });
    listen(host, 'frontier:palette', event => setPalette(event.detail?.palette ?? event.detail));
    listen(host, 'frontier:motion', event => setMotion(event.detail?.enabled ?? event.detail));
    listen(pointerTarget, 'pointermove', event => {
      if (!running || event.pointerType === 'touch') return;
      const bounds = host.getBoundingClientRect();
      if (bounds.width <= 0 || bounds.height <= 0) return;
      targetPointer = [Math.max(-1, Math.min(1, (event.clientX - bounds.left) / bounds.width * 2 - 1)), Math.max(-1, Math.min(1, 1 - (event.clientY - bounds.top) / bounds.height * 2))];
    }, { passive: true });
    listen(pointerTarget, 'pointerleave', () => { targetPointer = [0, 0]; }, { passive: true });
    const reduceChanged = () => { pointer = targetPointer = [0, 0]; dirty = true; sync(); };
    if (reduce.addEventListener) listen(reduce, 'change', reduceChanged);
    else { reduce.addListener(reduceChanged); removers.push(() => reduce.removeListener(reduceChanged)); }
    if ('MutationObserver' in window && document.body) {
      bodyObserver = new MutationObserver(() => { dirty = true; sync(); });
      bodyObserver.observe(document.body, { attributes: true, attributeFilter: ['data-motion'] });
    }
    if ('ResizeObserver' in window) { resizeObserver = new ResizeObserver(resize); resizeObserver.observe(host); }
    if ('IntersectionObserver' in window) {
      intersectionObserver = new IntersectionObserver(entries => {
        onScreen = entries.some(entry => entry.target === host && entry.isIntersecting);
        dirty = true; sync();
      }, { threshold: 0.01 });
      intersectionObserver.observe(host);
    } else {
      listen(window, 'scroll', resize, { passive: true });
    }
    initialize(); resize();
    return api;
  }

  window.NullfrontFX = Object.freeze({ mount });
})();
