import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { LumaSplatsThree } from '@lumaai/luma-web';

// 🎯 Setup dasar
const canvas = document.getElementById('webgl-canvas');
const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 0, 2);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

const homePOIButton = document.getElementById('homePOIButton');
const descriptionBox = document.getElementById('descriptionBox');

window.addEventListener('click', onClick, false);

function onClick(event) {
  // Normalisasi koordinat mouse ke -1..1
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  const intersects = raycaster.intersectObjects([textSprite]);
  if (intersects.length > 0) {
    // Tampilkan deskripsi
    document.getElementById("descriptionBox").style.display = 'block';
  }
}

// Saat tombol diklik → tampilkan deskripsi
homePOIButton.addEventListener('click', () => {
  descriptionBox.style.display = 'block';
});

// 🔌 Gaussian Splats dari Luma AI
const splats = new LumaSplatsThree({
  source: 'https://lumalabs.ai/capture/32b1ffdf-44cf-42bc-ba15-09f3b0a9a7e8',
  particleRevealEnabled: true
});
scene.add(splats);

// 🧱 POI dan Label 3D
const poiPosition = new THREE.Vector3(0, 0, 2);
const poi = new THREE.Mesh();
poi.position.copy(poiPosition);
scene.add(poi);

// 🧾 Fungsi membuat text sprite 2D
function createTextSprite(message) {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  canvas.width = 256;
  canvas.height = 128;

  context.fillStyle = 'white';
  context.font = '28px Arial';
  context.fillText(message, 10, 50);

  const texture = new THREE.CanvasTexture(canvas);
  const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(0.5, 0.25, 1);
  return sprite;
}

// 🏠 Tampilkan tulisan "HOME" di atas titik
const textSprite = createTextSprite("HOME");
scene.add(textSprite);

// 📦 POI lainnya
const POIS = {
  home: poiPosition,
  kitchen: new THREE.Vector3(0.5, 0.2, 1.5),
  lift: new THREE.Vector3(-0.5, 0.3, 1.8)
};

// 🎯 Fungsi pindah kamera ke POI
window.goToPOI = function (key) {
  const pos = POIS[key];
  if (!pos) return;
  camera.position.set(pos.x + 0.5, pos.y + 0.3, pos.z + 1);
  controls.target.copy(pos);
  controls.update();
};

// 📊 Statistik kamera
const statsBox = document.getElementById('statsBox');
function updateCameraStats() {
  const pos = camera.position;
  const rot = camera.rotation;
  statsBox.innerText = `Camera Position:
  x: ${pos.x.toFixed(2)}
  y: ${pos.y.toFixed(2)}
  z: ${pos.z.toFixed(2)}

Camera Rotation:
  x: ${rot.x.toFixed(2)}
  y: ${rot.y.toFixed(2)}
  z: ${rot.z.toFixed(2)}`;
}

function updateButtonPosition() {
  const vector = poiPosition.clone().project(camera);
  const x = (vector.x + 1) / 2 * window.innerWidth;
  const y = -(vector.y - 1) / 2 * window.innerHeight;
  homePOIButton.style.left = `${x}px`;
  homePOIButton.style.top = `${y}px`;
}

// 🔁 Render Loop
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
  updateCameraStats();
  updateButtonPosition();
}
animate();

// 🔁 Resize handler
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

window.addEventListener('click', (e) => {
  if (!descriptionBox.contains(e.target) && e.target !== homePOIButton) {
    descriptionBox.style.display = 'none';
  }
});