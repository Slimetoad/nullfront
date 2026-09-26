import * as THREE from './vendor/three.module.min.js';
import { GLTFLoader } from './vendor/GLTFLoader.js';
import { OrbitControls } from './vendor/OrbitControls.js';
import { RoomEnvironment } from './vendor/RoomEnvironment.js';

const instances = new WeakMap();
function disposeTree(root) {
  const materials=new Set(),textures=new Set(),geometries=new Set();
  root.traverse(object=>{if(object.geometry)geometries.add(object.geometry);if(object.material)(Array.isArray(object.material)?object.material:[object.material]).forEach(m=>materials.add(m));});
  materials.forEach(m=>{Object.values(m).forEach(v=>{if(v?.isTexture)textures.add(v);});m.dispose();});
  textures.forEach(t=>{t.dispose();t.source?.data?.close?.();});geometries.forEach(g=>g.dispose());
}

export async function mountHangar(host) {
  instances.get(host)?.();
  const startupCleanup=[];
  let initializedDispose=null;
  try {
  const abort = new AbortController();
  startupCleanup.push(()=>abort.abort());
  const on = (target, name, callback) => target.addEventListener(name, callback, {signal:abort.signal});
  const renderer = new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'low-power'});
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.setClearColor(0x060c13,0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.domElement.setAttribute('role','img');
  renderer.domElement.tabIndex=0;
  renderer.domElement.setAttribute('aria-label','Interactive 3D Concord Skyhawk gunship. Drag or use arrow keys to rotate; plus and minus zoom. Camera presets are below.');
  host.append(renderer.domElement);
  startupCleanup.push(()=>{renderer.dispose();renderer.domElement.remove();});
  const scene = new THREE.Scene();
  startupCleanup.push(()=>disposeTree(scene));
  const camera = new THREE.PerspectiveCamera(38,1,.05,80);
  camera.position.set(-5,3.2,5.8);
  const controls = new OrbitControls(camera,renderer.domElement);
  startupCleanup.push(()=>controls.dispose());
  controls.target.set(0,.62,0);
  controls.enableDamping = false;
  controls.enablePan = false;
  controls.minDistance = 4.5;
  controls.maxDistance = 12;
  controls.minPolarAngle = .08;
  controls.maxPolarAngle = Math.PI / 2 - .04;
  controls.autoRotate = false;
  controls.autoRotateSpeed = .7;
  controls.zoomSpeed = .6;
  controls.rotateSpeed = .55;
  controls.update();
  const pmrem = new THREE.PMREMGenerator(renderer);
  startupCleanup.push(()=>pmrem.dispose());
  const room = new RoomEnvironment();
  startupCleanup.push(()=>room.dispose());
  const environment = pmrem.fromScene(room,.04);
  startupCleanup.push(()=>environment.dispose());
  scene.environment = environment.texture;
  scene.environmentIntensity = .65;
  room.dispose(); pmrem.dispose();
  const key = new THREE.DirectionalLight(0xffddb4,4.5); key.position.set(-4,7,5); key.castShadow=true; key.shadow.mapSize.set(512,512); key.shadow.camera.left=-4; key.shadow.camera.right=4; key.shadow.camera.top=4; key.shadow.camera.bottom=-4; key.shadow.normalBias=.025; scene.add(key);
  const rim = new THREE.DirectionalLight(0x7cceff,3.2); rim.position.set(4,4,-4); scene.add(rim);
  const fill = new THREE.HemisphereLight(0xc2dceb,0x0b1018,1.7); scene.add(fill);
  const floor = new THREE.Mesh(new THREE.CylinderGeometry(2.8,2.86,.12,80),new THREE.MeshStandardMaterial({color:0x09141e,metalness:.25,roughness:.8}));
  floor.receiveShadow=true; floor.position.y=-.09; scene.add(floor);
  const ringMaterial = new THREE.MeshBasicMaterial({color:0x80c9ef,transparent:true,opacity:.6});
  [2.5,2.72].forEach(radius => {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(radius,.008,5,100),ringMaterial);
    ring.rotation.x = Math.PI/2; ring.position.y=-.018; scene.add(ring);
  });
  const outer = new THREE.PolarGridHelper(2.76,24,3,80,0x405469,0x233445);
  outer.position.y=-.015; scene.add(outer);
  let ready=false,disposed=false,visible=true,lost=false,frame=0,lastFrame=0,spinning=false;
  let cool=false;
  const motion = () => document.body.dataset.motion !== 'off' && !matchMedia('(prefers-reduced-motion: reduce)').matches;
  const maySpin = () => spinning && motion() && ![...document.querySelectorAll('video')].some(v=>!v.paused);
  function schedule() {
    if (!disposed && ready && visible && !document.hidden && !lost && !frame) frame=requestAnimationFrame(draw);
  }
  function draw(now) {
    frame=0;
    if(disposed || !ready || !visible || document.hidden || lost) return;
    if(now-lastFrame >= 32) {
      controls.autoRotate=maySpin();
      controls.update(Math.min((now-lastFrame)/1000,.05));
      renderer.render(scene,camera);
      lastFrame=now;
    } else if(!maySpin()) {
      frame=requestAnimationFrame(draw);return;
    }
    if(maySpin()) schedule();
  }
  function stop() {cancelAnimationFrame(frame);frame=0;}
  const resize = new ResizeObserver(() => {
    const width=host.clientWidth,height=host.clientHeight;
    renderer.setSize(width,height,false);
    camera.aspect=width/Math.max(1,height);camera.updateProjectionMatrix();schedule();
  });
  startupCleanup.push(()=>resize.disconnect());
  resize.observe(host);
  const visibility = new IntersectionObserver(entries => {visible=entries[0].isIntersecting;if(visible)schedule();else stop();},{threshold:.01});
  startupCleanup.push(()=>visibility.disconnect());
  visibility.observe(host);
  const motionObserver = new MutationObserver(()=>{stop();schedule();});
  startupCleanup.push(()=>motionObserver.disconnect());
  motionObserver.observe(document.body,{attributes:true,attributeFilter:['data-motion']});
  on(document,'visibilitychange',()=>{if(document.hidden)stop();else schedule();});
  document.querySelectorAll('video').forEach(video=>['play','pause','ended'].forEach(event=>on(video,event,()=>{stop();schedule();})));
  controls.addEventListener('change',schedule);
  const spinButton=document.querySelector('#hangar-spin');
  const lightButton=document.querySelector('#hangar-light');
  const viewButtons=[...document.querySelectorAll('[data-view]')];
  on(controls,'start',()=>{spinning=false;spinButton.setAttribute('aria-pressed','false');viewButtons.forEach(b=>b.setAttribute('aria-pressed','false'));});
  on(renderer.domElement,'keydown',event=>{
    if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','=','-'].includes(event.key))return;
    event.preventDefault();spinning=false;controls.autoRotate=false;spinButton.setAttribute('aria-pressed','false');
    const orbit=new THREE.Spherical().setFromVector3(camera.position.clone().sub(controls.target));
    if(event.key==='ArrowLeft')orbit.theta-=.15;if(event.key==='ArrowRight')orbit.theta+=.15;
    if(event.key==='ArrowUp')orbit.phi-=.12;if(event.key==='ArrowDown')orbit.phi+=.12;
    if(event.key==='+'||event.key==='=')orbit.radius*=.9;if(event.key==='-')orbit.radius*=1.1;
    orbit.phi=THREE.MathUtils.clamp(orbit.phi,controls.minPolarAngle,controls.maxPolarAngle);
    orbit.radius=THREE.MathUtils.clamp(orbit.radius,controls.minDistance,controls.maxDistance);
    camera.position.copy(controls.target).add(new THREE.Vector3().setFromSpherical(orbit));controls.update();
    viewButtons.forEach(b=>b.setAttribute('aria-pressed','false'));schedule();
  });
  const positions={hero:[-5,3.2,5.8],side:[0,2,7.5],top:[0,8,.1]};
  viewButtons.forEach(button=>on(button,'click',()=>{
    spinning=false;controls.autoRotate=false;spinButton.setAttribute('aria-pressed','false');
    camera.position.set(...positions[button.dataset.view]);controls.target.set(0,.62,0);controls.update();
    viewButtons.forEach(b=>b.setAttribute('aria-pressed',String(b===button)));schedule();
  }));
  on(spinButton,'click',()=>{
    if(!motion()){ document.querySelector('#hangar-help-live').textContent='Enable Motion at the top of the page to use automatic orbit. Camera controls remain available.';return; }
    spinning=!spinning;spinButton.setAttribute('aria-pressed',String(spinning));
    document.querySelector('#hangar-help-live').textContent=spinning?'Automatic orbit enabled.':'Automatic orbit paused.';
    schedule();
  });
  on(lightButton,'click',()=>{
    cool=!cool;lightButton.setAttribute('aria-pressed',String(cool));
    key.color.set(cool?0xa5dcff:0xffddb4);rim.color.set(cool?0xb1b6ff:0x7cceff);ringMaterial.color.set(cool?0xc5b7ff:0x80c9ef);schedule();
  });
  on(renderer.domElement,'webglcontextlost',event=>{
    event.preventDefault();lost=true;stop();host.dataset.state='lost';
    document.querySelector('#hangar-load').disabled=false;
    document.querySelector('#hangar-status').textContent='Graphics paused. Reopen the hangar to continue.';
  });
  on(renderer.domElement,'webglcontextrestored',()=>{lost=false;if(ready)host.dataset.state='ready';schedule();});
  function dispose() {
    if(disposed)return;disposed=true;stop();abort.abort();resize.disconnect();visibility.disconnect();motionObserver.disconnect();controls.dispose();
    disposeTree(scene);environment.dispose();renderer.dispose();renderer.domElement.remove();
    if(instances.get(host)===dispose)instances.delete(host);
  }
  initializedDispose=dispose;
  startupCleanup.length=0;
  instances.set(host,dispose);
  on(window,'pagehide',event=>{if(!event.persisted)dispose();else stop();});
  on(window,'pageshow',schedule);
  try {
    const gltf=await new GLTFLoader().loadAsync(new URL('./assets/showcase-unit.glb',import.meta.url).href,progress=>{
      if(progress.total)document.querySelector('#hangar-status').textContent=`Loading Skyhawk · ${Math.round(progress.loaded/progress.total*100)}%`;
    });
    if(disposed){disposeTree(gltf.scene);return null;}
    const model=gltf.scene;
    model.traverse(object=>{if(object.isMesh)object.castShadow=true;});
    const box=new THREE.Box3().setFromObject(model),size=box.getSize(new THREE.Vector3()),center=box.getCenter(new THREE.Vector3());
    const scale=4.2/Math.max(size.x,size.y,size.z);model.scale.setScalar(scale);
    model.position.set(-center.x*scale,-box.min.y*scale+.22,-center.z*scale);
    scene.add(model);
    await renderer.compileAsync(scene,camera);
    if(disposed)return null;
    ready=true;host.dataset.state='ready';document.querySelector('#hangar-status').textContent='Skyhawk ready.';
    renderer.setSize(host.clientWidth,host.clientHeight,false);camera.aspect=host.clientWidth/host.clientHeight;camera.updateProjectionMatrix();schedule();
    return {dispose};
  } catch(error) {if(disposed)return null;dispose();host.dataset.state='error';throw error;}
  } catch (error) {
    if(initializedDispose)initializedDispose();
    else startupCleanup.reverse().forEach(cleanup=>{try{cleanup();}catch{}});
    throw error;
  }
}
