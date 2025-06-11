import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';

export const POIs = [
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
