import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';

// Initialize scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById("roomCanvas") });
renderer.setSize(window.innerWidth, window.innerHeight);

// Load bed model
const bedLoader = new OBJLoader();
bedLoader.load(
    'Furniture/bed.obj',
    function (object) {
        // Scale the bed model to an appropriate size
        object.scale.set(3, 3, 3); // Adjust scale as needed
        
        // Set the bed model's position
        object.position.set(0, 0, 0); // Center the bed in the scene
        
        // Add the bed model to the scene
        scene.add(object);
    },
    function (xhr) {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    },
    function (error) {
        console.error('Error loading bed.obj:', error);
    }
);

// Set camera position
camera.position.set(0, 0, 10);
camera.lookAt(0, 0, 0);

// Render loop
function render() {
    requestAnimationFrame(render);
    renderer.render(scene, camera);
}
render();
