// import * as THREE from 'three';
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
// import { LumaSplatsThree } from '@lumaai/luma-web';

import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.160.0/examples/jsm/controls/OrbitControls.js';
import { LumaSplatsThree } from 'https://unpkg.com/@lumaai/luma-web@0.2.2/dist/luma-web.module.js'; // jika tidak CORS error


// 🎯 Setup dasar
const canvas = document.getElementById('webgl-canvas');
const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio, 2);

const scene = new THREE.Scene();
// scene.background = new THREE.Color(0x000000); // hitam
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(2.20, 1.66, -0.90);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
const initialCameraPosition = camera.position.clone();
const initialControlsTarget = controls.target.clone();

// 🔌 Gaussian Splats dari Luma AI
const splats = new LumaSplatsThree({
  source: 'https://lumalabs.ai/capture/32b1ffdf-44cf-42bc-ba15-09f3b0a9a7e8',
  particleRevealEnabled: true
});
scene.add(splats);

// splats.semanticsMask = LumaSplatsSemantics.FOREGROUND;

// 🌍 State untuk zoom dan orbit
let orbitFrom = new THREE.Vector3(); // posisi awal orbit
let orbiting = false;
let orbitStartTime = 0;
const orbitDuration = 40000;
let idleTimeout = null;
const idleDelay = 5000; // 5 detik

let zooming = false;
let zoomStartTime = 0;
const zoomDuration = 1000;
const zoomFrom = new THREE.Vector3();
const zoomTo = new THREE.Vector3();

let orbitTarget = null;
let currentMode = 'home'; // 'home', 'apartments', 'amenities'
let clickOnCube = false;

const resetTargetFrom = new THREE.Vector3();
const resetTargetTo = initialControlsTarget.clone();

const zoomTargetFrom = new THREE.Vector3();
const zoomTargetTo = new THREE.Vector3();

let resettingCamera = false;
let resetStartTime = 0;
const resetDuration = 1000; // ms
const resetFrom = new THREE.Vector3();
const resetTo = initialCameraPosition.clone(); // posisi awal kamera

let cameraToNavbar = false;
let navbarStartTime = 0;
const navbarDuration = 1000;
const navbarFrom = new THREE.Vector3();
const navbarTo = new THREE.Vector3();
const navbarTargetFrom = new THREE.Vector3();
const navbarTargetTo = new THREE.Vector3();

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

// Button List POI
document.getElementById('listhome').addEventListener('click', () => {
  document.getElementById('homePOIButton').click();
});
document.getElementById('listhotel').addEventListener('click', () => {
  document.getElementById('hotelPOIButton').click();
});
document.getElementById('listshops').addEventListener('click', () => {
  document.getElementById('shopPOIButton').click();
})

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

function resetIdleTimer() {
  if (idleTimeout) clearTimeout(idleTimeout);
}

// Idle
function startOrbitAfterDelay(poi) {
  if (idleTimeout) clearTimeout(idleTimeout);

  idleTimeout = setTimeout(() => {
    orbiting = true;
    orbitStartTime = performance.now();
    orbitTarget = poi ?? controls.target.clone();
    orbitFrom.copy(camera.position);
  }, idleDelay);
}

// 🚀 Fungsi: Zoom lalu orbit
function startZoomAndOrbit(poi) {
  zooming = true;
  zoomStartTime = performance.now();
  orbitTarget = poi;

  // Kamera mulai dari posisi saat ini
  zoomFrom.copy(camera.position);
  zoomTargetFrom.copy(controls.target);

  const radius = 1.5;
  const initialAngle = 0;
  zoomTo.set(
    poi.position.x + radius * Math.cos(initialAngle),
    poi.position.y + 0.5,
    poi.position.z + radius * Math.sin(initialAngle)
  );

  // Target orbit juga smooth
  zoomTargetTo.copy(poi.position);

  document.querySelectorAll('.description-box').forEach(d => d.style.display = 'none');
  document.getElementById(poi.descriptionId).style.display = 'block';

  orbiting = false;
  startOrbitAfterDelay(poi);
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
cube.userData.status = 'sold';

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
cube1.userData.status = 'available';

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
cube2.userData.status = 'booked';

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
cube3.userData.status = 'available';

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

const cubes = [cube, cube1, cube2, cube3];
const hiddenStatuses = new Set(); // status yang ingin disembunyikan

// filter button
function filterCubesByStatus(status) {
  cubes.forEach(c => {
    const isMatch = c.userData.status !== status; // 🔄 dibalik: yang BUKAN status yang dipilih akan tampil
    c.visible = isMatch;
  });

  // Sembunyikan semua deskripsi juga
  document.querySelectorAll('.description-box').forEach(d => d.style.display = 'none');
}

document.getElementById('filterAvailable').addEventListener('click', (e) => {
  toggleFilter('available', e.target);
});

document.getElementById('filterSold').addEventListener('click', (e) => {
  toggleFilter('sold', e.target);
});

document.getElementById('filterBooked').addEventListener('click', (e) => {
  toggleFilter('booked', e.target);
});

function toggleFilter(status, button) {
  if (hiddenStatuses.has(status)) {
    hiddenStatuses.delete(status);
    button.classList.remove('opacity-50'); // Un-highlight (opsional)
  } else {
    hiddenStatuses.add(status);
    button.classList.add('opacity-50'); // Highlight tombol aktif (opsional)
  }

  applyFilter();
}

function applyFilter() {
  cubes.forEach(c => {
    c.visible = !hiddenStatuses.has(c.userData.status);
  });

  // Sembunyikan deskripsi juga
  document.querySelectorAll('.description-box').forEach(d => d.style.display = 'none');
}

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
const axesHelper = new THREE.AxesHelper( 5 );
scene.add( axesHelper );

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

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let hoveredCube = null;

// 🖱️ Hover event
canvas.addEventListener('mousemove', (event) => {
  const rect = canvas.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const visibleCubes = cubes.filter(c => c.visible);
const intersects = raycaster.intersectObjects(visibleCubes);

  if (currentMode !== 'apartments') {
    canvas.style.cursor = 'default';
    if (hoveredCube) {
      hoveredCube.material.color.copy(hoveredCube.userData.originalColor);
      hoveredCube = null;
    }
    return;
  }

   if (currentMode === 'home') {
    canvas.style.cursor = 'default';
    return;
  }

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

  // 🚀 Mulai animasi reset kamera
  resettingCamera = true;
  resetStartTime = performance.now();

  // ambil posisi terakhir kamera dan target saat ini
  resetFrom.copy(camera.position.clone());
  resetTo.copy(initialCameraPosition.clone());

  resetTargetFrom.copy(controls.target.clone());
  resetTargetTo.copy(initialControlsTarget.clone());

  setPOIVisibility(false);
  setCubesVisibility(false);
  zooming = false;
  orbiting = false;
  orbitTarget = null;

  document.getElementById('carouselModal').classList.add('hidden');
  document.querySelectorAll('.description-box').forEach(d => d.style.display = 'none');
  document.getElementById('filterbar').style.display = 'none';
  document.getElementById('listpoi').style.display = 'none';
});

// APARTMENTS: tampilkan hanya kubus
apartmentsButton.addEventListener('click', () => {
  currentMode = 'apartments';

  // 🚀 Mulai animasi kamera ke posisi apartemen
  cameraToNavbar = true;
  navbarStartTime = performance.now();

  navbarFrom.copy(camera.position.clone());
  navbarTargetFrom.copy(controls.target.clone());

  // 🎯 Tentukan posisi & target yang kamu mau
  navbarTo.set(1.75, 0.74, 0.11); // posisi kamera (ubah sesuai preferensi)
  navbarTargetTo.set(0.4, 0.3, -0.4); // titik yang dilihat (ubah sesuai fokus)

  zooming = false;
  orbiting = false;
  orbitTarget = null;

  setPOIVisibility(false);
  setCubesVisibility(true);

  document.getElementById('carouselModal').classList.add('hidden');
  document.querySelectorAll('.description-box').forEach(d => d.style.display = 'none');
  document.getElementById('filterbar').style.display = 'flex';
  document.getElementById('listpoi').style.display = 'none';
  // ✅ Reset semua filter: kosongkan hiddenStatuses
  hiddenStatuses.clear();
  document.querySelectorAll('#filterbar button').forEach(btn => btn.classList.remove('opacity-50'));
  applyFilter();
});


// AMENITIES: tampilkan hanya POI
amenitiesButton.addEventListener('click', () => {
  currentMode = 'amenities';
  // 🚀 Mulai animasi kamera ke posisi apartemen
  cameraToNavbar = true;
  navbarStartTime = performance.now();

  navbarFrom.copy(camera.position.clone());
  navbarTargetFrom.copy(controls.target.clone());

  // 🎯 Tentukan posisi & target yang kamu mau
  navbarTo.set(2.6, 2, -0.37); // posisi kamera (ubah sesuai preferensi)
  navbarTargetTo.set(0.26, 0, -0.25); // titik yang dilihat (ubah sesuai fokus)

  zooming = false;
  orbiting = false;
  orbitTarget = null;

  setPOIVisibility(true);
  setCubesVisibility(false);

  document.getElementById('carouselModal').classList.add('hidden');
  document.querySelectorAll('.description-box').forEach(d => d.style.display = 'none');
  document.getElementById('filterbar').style.display = 'none';
  document.getElementById('listpoi').style.display = 'flex';
});

// SET DEFAULT HOME
function setDefaultHomeState() {
  // Sembunyikan semua deskripsi
  document.querySelectorAll('.description-box').forEach(d => d.style.display = 'none');
  document.getElementById('filterbar').style.display = 'none';
  document.getElementById('listpoi').style.display = 'none';

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
  const visibleCubes = cubes.filter(c => c.visible);
const intersects = raycaster.intersectObjects(visibleCubes);

  resetIdleTimer();

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
  resetIdleTimer();
  startOrbitAfterDelay(); // tanpa argumen = orbit ke fokus kamera saat ini

}

document.querySelectorAll('.close-description').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    btn.closest('.description-box').style.display = 'none';
  });
});

// Modal Carousel
// Data gambar untuk galeri (bisa diganti sesuai POI)
const galleryMap = {
  home: ['/hotel.jpg', '/hotel1.jpg'],
  hotel: ['/hotel1.jpg', '/hotel.jpg', '/apart.jpg'],
  shop: ['/apart1.jpg', '/apart.jpg'],

  cube0: ['/apart1.jpg', '/apart.jpg'],
  cube1: ['/apart.jpg', '/apart1.jpg'],
  cube2: ['/apart.jpg', '/apart1.jpg'],
  cube3: ['/apart1.jpg', '/apart.jpg'],
};

const modal = document.getElementById('carouselModal');
const mainImage = document.getElementById('mainCarouselImage');
const thumbnailsContainer = document.getElementById('carouselThumbnails');
const closeBtn = document.getElementById('closeCarousel');

// Event: buka modal saat tombol "Gallery" diklik
document.querySelectorAll('.gallery').forEach(button => {
  button.addEventListener('click', (e) => {
    e.stopPropagation();

    const id = button.getAttribute('data-gallery-id');
    const images = galleryMap[id] || []; // fallback: []

    if (images.length === 0) {
      alert("Belum ada gambar galeri untuk POI ini.");
      return;
    }

    document.getElementById('carouselModal').classList.remove('hidden');
    updateCarouselImages(images);
  });
});

// Event: tutup modal
closeBtn.addEventListener('click', () => {
  modal.classList.add('hidden');
});

function updateCarouselImages(images) {
  const mainImage = document.getElementById('mainCarouselImage');
  const thumbnailsContainer = document.getElementById('carouselThumbnails');

  mainImage.src = images[0];
  thumbnailsContainer.innerHTML = '';

  images.forEach((img, idx) => {
    const thumb = document.createElement('img');
    thumb.src = img;
    thumb.className = `h-20 cursor-pointer rounded border-2 ${idx === 0 ? 'border-blue-500' : 'border-transparent'}`;

    thumb.addEventListener('click', () => {
      mainImage.src = img;

      // 🔄 Reset border semua thumbnail
      thumbnailsContainer.querySelectorAll('img').forEach(el => {
        el.classList.remove('border-blue-500');
        el.classList.add('border-transparent');
      });

      // ✅ Beri border biru ke yang diklik
      thumb.classList.remove('border-transparent');
      thumb.classList.add('border-blue-500');
    });

    thumbnailsContainer.appendChild(thumb);
  });

  lucide.createIcons();
}

// 🔁 Animasi utama
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
  updateCameraStats();

  POIs.forEach(p => p.update());

  const now = performance.now();

  // Reset camera smoothly ke posisi awal
  if (resettingCamera) {
  const linearT = Math.min(1, (now - resetStartTime) / resetDuration);
  const t = linearT * linearT * (3 - 2 * linearT); // easing: smoothstep

  camera.position.lerpVectors(resetFrom, resetTo, t);
  controls.target.lerpVectors(resetTargetFrom, resetTargetTo, t);
  controls.update();

  if (t >= 1) resettingCamera = false;
}

// 🔄 Animasi ke area apartemen
if (cameraToNavbar) {
  const now = performance.now();
  const linearT = Math.min(1, (now - navbarStartTime) / navbarDuration);
  const t = linearT * linearT * (3 - 2 * linearT); // smoothstep

  camera.position.lerpVectors(navbarFrom, navbarTo, t);
  controls.target.lerpVectors(navbarTargetFrom, navbarTargetTo, t);
  controls.update();

  if (t >= 1) {
    cameraToNavbar = false;
  }
}

  // Zooming logic
  if (zooming && orbitTarget) {
  const t = Math.min(1, (now - zoomStartTime) / zoomDuration);
  const eased = t * t * (3 - 2 * t); // smoothstep

  camera.position.lerpVectors(zoomFrom, zoomTo, eased);
  controls.target.lerpVectors(zoomTargetFrom, zoomTargetTo, eased);
  controls.update();

  if (t >= 1) {
    zooming = false;
    startOrbitAfterDelay(orbitTarget);
  }
}

  // Orbiting logic
  if (orbiting && orbitTarget) {
    const elapsed = now - orbitStartTime;
    const t = elapsed / orbitDuration;
    const angle = t * Math.PI * 2;

    const radius = 1.5;
    const targetPos = orbitTarget.position || orbitTarget;

    // posisi target orbit
    const nextOrbitPos = new THREE.Vector3(
    targetPos.x + radius * Math.cos(angle),
    targetPos.y + 0.5,
    targetPos.z + radius * Math.sin(angle)
  );

    // lerp dari posisi kamera saat orbit dimulai
    camera.position.lerp(nextOrbitPos, 0.01)
    controls.target.copy(targetPos);
    controls.update();

    if (t >= 1) orbitStartTime = now; // loop terus
  }
}
animate();

canvas.addEventListener('click', onCanvasClick);

// 📱 Resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  resetIdleTimer();
  startOrbitAfterDelay(); // tanpa argumen = orbit ke fokus kamera saat ini

});

// ❌ Klik di luar tombol → hentikan semua
window.addEventListener('click', (e) => {
  // Abaikan klik pada POI button atau deskripsi
  if (
    e.target.classList.contains('poi-html-button') ||
    e.target.closest('.description-box')||
    e.target.classList.contains('list-button')||
    e.target.closest('#carouselModal')
  ) return;

  // Jika barusan klik cube, jangan tutup deskripsi
  if (clickOnCube) {
    clickOnCube = false;
    return;
  }

  // Tutup semua deskripsi
  // document.querySelectorAll('.description-box').forEach(d => d.style.display = 'none');

  // Matikan zoom dan orbit
  zooming = false;
  orbiting = false;
  orbitTarget = null;

  // Reset idle timer dan mulai hitung ulang
  resetIdleTimer();
startOrbitAfterDelay(); // tanpa argumen = orbit ke fokus kamera saat ini
});

window.addEventListener('wheel', () => {
  orbiting = false;
  zooming = false;
  resettingCamera = false;
  resetIdleTimer();
  startOrbitAfterDelay(); // mulai ulang hitung idle 5 detik
});
