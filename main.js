import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { LumaSplatsThree } from '@lumaai/luma-web';
import { LumaSplatsSemantics } from "@lumaai/luma-web";


// 🎯 Setup dasar
const canvas = document.getElementById('webgl-canvas');
const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

const scene = new THREE.Scene();
// scene.background = new THREE.Color(0x000000); // hitam
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(2.20, 1.66, -0.90);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// 🔌 Gaussian Splats dari Luma AI
const splats = new LumaSplatsThree({
  source: 'https://lumalabs.ai/capture/32b1ffdf-44cf-42bc-ba15-09f3b0a9a7e8',
  particleRevealEnabled: true
});
scene.add(splats);

// splats.semanticsMask = LumaSplatsSemantics.FOREGROUND;

// 🌍 State untuk zoom dan orbit
let orbiting = false;
let orbitStartTime = 0;
// const orbitDuration = 50000;

let zooming = false;
let zoomStartTime = 0;
const zoomDuration = 1500;
const zoomFrom = new THREE.Vector3();
const zoomTo = new THREE.Vector3();

let orbitTarget = null;
let currentMode = 'home'; // 'home', 'apartments', 'amenities'
let clickOnCube = false;

// 📦 POI Data
const POIs = [
  {
    id: 'home',
    position: new THREE.Vector3(-0.32, 0, 0.50),
    buttonId: 'homePOIButton',
    descriptionId: 'homedescription'
  },
  {
    id: 'hotel',
    position: new THREE.Vector3(-0.20, 0, -0.90),
    buttonId: 'hotelPOIButton',
    descriptionId: 'hoteldescription'
  },
  {
    id: 'shop',
    position: new THREE.Vector3(0.58, 0, -0.32),
    buttonId: 'shopPOIButton',
    descriptionId: 'shopdescription'
  }
];

// 🧭 Setup POI tombol & posisi
POIs.forEach(poi => {
  const button = document.getElementById(poi.buttonId);

  button.addEventListener('click', (e) => {
    e.stopPropagation(); // Agar tidak menghentikan orbit
    startZoomAndOrbit(poi);
  });

  poi.update = function () {
    const vector = poi.position.clone().project(camera);
    const x = (vector.x + 1) / 2 * window.innerWidth;
    const y = -(vector.y - 1) / 2 * window.innerHeight;
    button.style.left = `${x}px`;
    button.style.top = `${y}px`;
  };
});

// 🚀 Fungsi: Zoom lalu orbit
function startZoomAndOrbit(poi) {
  zooming = true;
  zoomStartTime = performance.now();
  orbitTarget = poi;

  zoomFrom.copy(camera.position);

  const radius = 1.5;
  const initialAngle = 0; // bisa ubah untuk sudut awal lain jika mau
  zoomTo.set(
    poi.position.x + radius * Math.cos(initialAngle),
    poi.position.y + 0.5,
    poi.position.z + radius * Math.sin(initialAngle)
  );

  document.querySelectorAll('.description-box').forEach(d => d.style.display = 'none');
  document.getElementById(poi.descriptionId).style.display = 'block';

  orbiting = false; // orbit mulai setelah zoom selesai
}

// 🔺 Buat geometry, material, dan mesh
const cubeGeometry = new THREE.BoxGeometry(0.25, 0.35, 0.28); // Ukuran X, Y, Z
const cubeMaterial = new THREE.MeshBasicMaterial({
  color: 0xff0000,
  transparent: true,
  opacity: 0.5
});
const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
cube.position.set(0.26, 0, 0.08); // X, Y, Z
// contoh:
cube.rotation.set(0, Math.PI / 3.3, 0); // rotasi 45 derajat di sumbu Y
scene.add(cube);

// 🔺 Buat geometry, material, dan mesh
const cubeGeometry1 = new THREE.BoxGeometry(0.25, 0.35, 0.28); // Ukuran X, Y, Z
const cubeMaterial1 = new THREE.MeshBasicMaterial({
  color: 0x0000ff,
  transparent: true,
  opacity: 0.5
});
const cube1 = new THREE.Mesh(cubeGeometry1, cubeMaterial1);
cube1.position.set(0.33, 0, -0.19); // X, Y, Z
cube1.rotation.set(0, Math.PI / 3.3, 0); // rotasi 45 derajat di sumbu Y
scene.add(cube1);

// 🔺 Buat geometry, material, dan mesh
const cubeGeometry2 = new THREE.BoxGeometry(0.25, 0.35, 0.28); // Ukuran X, Y, Z
const cubeMaterial2 = new THREE.MeshBasicMaterial({
  color: 0xffff00,
  transparent: true,
  opacity: 0.5
});
const cube2 = new THREE.Mesh(cubeGeometry2, cubeMaterial2);
cube2.position.set(0.38, 0, -0.50); // X, Y, Z
cube2.rotation.set(0, Math.PI / 3.3, 0); // rotasi 45 derajat di sumbu Y
scene.add(cube2);

// 🔺 Buat geometry, material, dan mesh
const cubeGeometry3 = new THREE.BoxGeometry(0.25, 0.35, 0.28); // Ukuran X, Y, Z
const cubeMaterial3 = new THREE.MeshBasicMaterial({
  color: 0x0000ff,
  transparent: true,
  opacity: 0.5
});
const cube3 = new THREE.Mesh(cubeGeometry3, cubeMaterial3);
cube3.position.set(0.52, 0, -0.74); // X, Y, Z
cube3.rotation.set(0, Math.PI / 3.3, 0); // rotasi 45 derajat di sumbu Y
scene.add(cube3);

const cubePOIs = [
  {
    id: 'cube0',
    mesh: cube,
    position: cube.position,
    descriptionId: 'cubedescription'
  },
  {
    id: 'cube1',
    mesh: cube1,
    position: cube1.position,
    descriptionId: 'cubedescription1'
  },
  {
    id: 'cube2',
    mesh: cube2,
    position: cube2.position,
    descriptionId: 'cubedescription2'
  },
  {
    id: 'cube3',
    mesh: cube3,
    position: cube3.position,
    descriptionId: 'cubedescription3'
  }
];


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

// axis helper
// const axesHelper = new THREE.AxesHelper( 5 );
// scene.add( axesHelper );

// navbar active
const navbarButtons = document.querySelectorAll('#navbar button');
navbarButtons.forEach(button => {
  button.addEventListener('click', () => {
    // Reset semua tombol
    navbarButtons.forEach(btn => btn.classList.remove('active'));

    // Aktifkan tombol yang diklik
    button.classList.add('active');
  });
});

// 🧭 Tangkap tombol navigasi utama
const homeButton = document.querySelector('#navbar button:nth-child(1)');
const apartmentsButton = document.querySelector('#navbar button:nth-child(2)');
const amenitiesButton = document.querySelector('#navbar button:nth-child(3)');

// 🧩 Array kubus
const cubes = [cube, cube1, cube2, cube3];
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let hoveredCube = null;

// 🖱️ Hover event
canvas.addEventListener('mousemove', (event) => {
  const rect = canvas.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(cubes);

  if (intersects.length > 0) {
    const cube = intersects[0].object;

    if (hoveredCube !== cube) {
      if (hoveredCube) {
        hoveredCube.material.color.copy(hoveredCube.userData.originalColor || hoveredCube.material.color);
      }

      hoveredCube = cube;

      if (!cube.userData.originalColor) {
        cube.userData.originalColor = cube.material.color.clone();
      }

      cube.material.color.set(0x00bfff);
    }

    canvas.style.cursor = 'pointer'; // Bonus: ubah cursor
  } else {
    if (hoveredCube) {
      hoveredCube.material.color.copy(hoveredCube.userData.originalColor);
      hoveredCube = null;
    }

    canvas.style.cursor = 'default';
  }
});

// Fungsi: atur visibilitas POI (tombol & deskripsi)
function setPOIVisibility(visible) {
  POIs.forEach(poi => {
    const btn = document.getElementById(poi.buttonId);
    const desc = document.getElementById(poi.descriptionId);
    btn.style.display = visible ? 'block' : 'none';
    desc.style.display = 'none';
  });
}

// Fungsi: atur visibilitas kubus
function setCubesVisibility(visible) {
  cubes.forEach(cube => cube.visible = visible);
}

// HOME: hanya Luma AI render
homeButton.addEventListener('click', () => {
  currentMode = 'home';
  setPOIVisibility(false);
  setCubesVisibility(false);
  zooming = false;
  orbiting = false;
  orbitTarget = null;
  document.querySelectorAll('.description-box').forEach(d => d.style.display = 'none');
});

// APARTMENTS: tampilkan hanya kubus
apartmentsButton.addEventListener('click', () => {
  currentMode = 'apartments';
  setPOIVisibility(false);
  setCubesVisibility(true);
  zooming = false;
  orbiting = false;
  orbitTarget = null;
  document.querySelectorAll('.description-box').forEach(d => d.style.display = 'none');
});

// AMENITIES: tampilkan hanya POI
amenitiesButton.addEventListener('click', () => {
  currentMode = 'amenities';
  setPOIVisibility(true);
  setCubesVisibility(false);
  zooming = false;
  orbiting = false;
  orbitTarget = null;
  document.querySelectorAll('.description-box').forEach(d => d.style.display = 'none');
});

// SET DEFAULT HOME
function setDefaultHomeState() {
  // Sembunyikan semua deskripsi
  document.querySelectorAll('.description-box').forEach(d => d.style.display = 'none');

  // Sembunyikan semua POI button
  POIs.forEach(poi => {
    const button = document.getElementById(poi.buttonId);
    if (button) button.style.display = 'none';
  });

  // Sembunyikan semua kubus apartemen
  [cube, cube1, cube2, cube3].forEach(c => c.visible = false);

  // Reset status orbit/zoom
  orbiting = false;
  zooming = false;
  orbitTarget = null;
}

setDefaultHomeState(); // 🔧 panggil saat pertama kali

// cube click event
function onCanvasClick(event) {
  if (currentMode !== 'apartments') return;
  
  clickOnCube = true;
  orbiting = false;
  const rect = canvas.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(cubes);

  if (intersects.length > 0) {
    const clickedCube = intersects[0].object;

    // Temukan POI yang sesuai dari cubePOIs
    const cubePOI = cubePOIs.find(c => c.mesh === clickedCube);

    if (cubePOI) {
      // Zoom & orbit ke cube
      startZoomAndOrbit(cubePOI);

      // Tampilkan deskripsi yang sesuai
      document.querySelectorAll('.description-box').forEach(d => d.style.display = 'none');
      document.getElementById(cubePOI.descriptionId).style.display = 'block';

      // Highlight hijau sementara
      if (!clickedCube.userData.originalColor) {
        clickedCube.userData.originalColor = clickedCube.material.color.clone();
      }
      clickedCube.material.color.set(0x00ff00);
      setTimeout(() => {
        clickedCube.material.color.copy(clickedCube.userData.originalColor);
      }, 300);
    }
  }
}

// 🔁 Animasi utama
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
  updateCameraStats();

  POIs.forEach(p => p.update());

  const now = performance.now();

  // Zooming logic
  if (zooming && orbitTarget) {
    const t = Math.min(1, (now - zoomStartTime) / zoomDuration);
    camera.position.lerpVectors(zoomFrom, zoomTo, t);
    controls.target.copy(orbitTarget.position);
    controls.update();

    if (t >= 1) {
      zooming = false;
      orbiting = true;
      orbitStartTime = now;
    }
  }

  // Orbiting logic
  if (orbiting && orbitTarget) {
    const elapsed = now - orbitStartTime;
    const t = elapsed / orbitDuration;
    const angle = t * Math.PI * 2;

    const radius = 1.5;
    camera.position.x = orbitTarget.position.x + radius * Math.cos(angle);
    camera.position.z = orbitTarget.position.z + radius * Math.sin(angle);
    camera.position.y = orbitTarget.position.y + 0.5;

    controls.target.copy(orbitTarget.position);
    controls.update();

    if (t >= 1) orbiting = false;
  }
}
animate();
canvas.addEventListener('click', onCanvasClick);

// 📱 Resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// ❌ Klik di luar tombol → hentikan semua
window.addEventListener('click', (e) => {
  // Abaikan klik pada POI button atau deskripsi
  if (
    e.target.classList.contains('poi-html-button') ||
    e.target.closest('.description-box')
  ) return;

  // Jika barusan klik cube, jangan tutup deskripsi
  if (clickOnCube) {
    clickOnCube = false;
    return;
  }

  // Tutup semua deskripsi & orbit
  zooming = false;
  orbiting = false;
  orbitTarget = null;
});
