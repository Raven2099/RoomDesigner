import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { DragControls } from 'three/examples/jsm/controls/DragControls.js';

// Initialize scene, camera, and renderer
const scene = new THREE.Scene();
const light = new THREE.HemisphereLight(0xfdf3c6 , 0x080820, 3.6);
scene.add(light);

const aspectRatio = window.innerWidth / window.innerHeight;
const camera = new THREE.PerspectiveCamera(75, aspectRatio, 0.1, 1000);
camera.position.set(10, 10, 10);
camera.lookAt(scene.position);

const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById("roomCanvas") });
renderer.setSize(window.innerWidth, window.innerHeight);

// Gradient
// Define vertex shader
const vertexShader = `
    varying vec3 vWorldPosition;

    void main() {
        vWorldPosition = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;

// Define fragment shader with gradient
const fragmentShader = `
    uniform vec3 topColor;
    uniform vec3 bottomColor;
    varying vec3 vWorldPosition;

    void main() {
        vec3 viewDirection = normalize(vWorldPosition.xyz - cameraPosition);
        float gradient = max(0.0, dot(normalize(viewDirection), vec3(0.0, 1.0, 0.0)));
        gl_FragColor = vec4(mix(bottomColor, topColor, gradient), 1.0);
    }
`;

// Create a gradient material
const gradientMaterial = new THREE.ShaderMaterial({
    uniforms: {
        topColor: { value: new THREE.Color(0x1D2B64) }, // Top color of the gradient
        bottomColor: { value: new THREE.Color(0xF8CDDA) }, // Bottom color of the gradient
    },
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    side: THREE.BackSide, // Render the material on the back side to apply it as a background
});

// Create a cube geometry to serve as the background
const backgroundGeometry = new THREE.BoxGeometry(100, 100, 100);

// Create a mesh using the gradient material and cube geometry
const backgroundMesh = new THREE.Mesh(backgroundGeometry, gradientMaterial);

// Add the mesh to the scene
scene.add(backgroundMesh);

// Create and position walls and floor geometry
const roomWidth = 10; 
const roomHeight = 5;  
const roomDepth = 10; 
const wallThickness = 0.01; 

const wallGeometry = new THREE.BoxGeometry(roomWidth, roomHeight, wallThickness);
const wallMaterial = new THREE.MeshPhongMaterial({ color: 0xE7E9BB }); 
const wallMaterial2 = new THREE.MeshPhongMaterial({color : 0xE7E9BB} )
const wallMaterial3 = new THREE.MeshPhongMaterial({color : 0xE7E9BB} )
// Create walls
const backWall = new THREE.Mesh(wallGeometry, wallMaterial2);
backWall.position.set(0, roomHeight / 2, -roomDepth / 2);
scene.add(backWall);

const leftWall = new THREE.Mesh(wallGeometry, wallMaterial);
leftWall.position.set(-roomWidth / 2, roomHeight / 2, 0);
leftWall.rotation.y = Math.PI / 2;
scene.add(leftWall);

const frontWall = new THREE.Mesh(wallGeometry, wallMaterial3);
frontWall.position.set(0, roomHeight / 2, roomDepth / 2);
//scene.add(frontWall);

const rightWall = new THREE.Mesh(wallGeometry, wallMaterial);
rightWall.position.set(roomWidth / 2, roomHeight / 2, 0);
rightWall.rotation.y = Math.PI / 2;
//scene.add(rightWall);


// Create floor
const floorGeometry = new THREE.PlaneGeometry(roomWidth, roomDepth);
const floorMaterial = new THREE.MeshPhongMaterial({ color: 0x8B4513 }); // brown color
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2;
floor.position.set(0, 0, 0);
scene.add(floor);

//chair
function addObject(item){
    let objectPath = '';
    let scales = 0; 
    let rot = 0;
    let z = 0;
    let z1 = 0;
    let xco = 0;
    let yco = 0;
    let zco = 0;
    let clr = 0xFFFFFF
    switch (item){
        case 'chair':
            objectPath = 'Furniture/chair.obj'; 
            scales = 0.02; 
            rot = 30;
            const offsetY = 0
            clr = 0xFFF380;
            break; 
        case 'table':
            objectPath = 'Furniture/table.obj';
            scales = 0.3;
            clr = 0x715f4d;
            break;
        case 'table2':
            objectPath = 'Furniture/table2.obj';
            scales = 0.2;
            z = -33;
            yco = 30;
            break;
        case 'door':
            objectPath = 'Furniture/door.obj';
            scales = 1;
            clr = 0xC04000;
            break;
        case 'window':
            objectPath = 'Furniture/window.obj';
            scales = 0.5;
            clr = 0x87CEEB;
            break;
    }
    const objectLoader = new OBJLoader();
    objectLoader.load(
        objectPath,
        function(object){
            object.position.set(xco,yco, zco);
            object.scale.set(scales, scales, scales);
            object.rotation.set(rot,z,z1);
            const offsetX = 0; // Adjust X position as needed
            const offsetY = 0; // Adjust Y position to be slightly above the floor
            const offsetZ = 0; // Adjust Z position as needed
            object.position.set(offsetX, offsetY, offsetZ);
            scene.add(object);

            object.traverse(function (child) {
                if (child instanceof THREE.Mesh) {
                    child.material.side = THREE.DoubleSide;
                    child.material.transparent = true;// Here, you can set up materials as needed
                    // For example, you can assign a new material with a different color
                    child.material = new THREE.MeshPhongMaterial({ color: clr }); // Red color
                }
            });


            const controls = new DragControls([object], camera, renderer.domElement);
            controls.addEventListener('dragstart', function (event) {
            event.object.material.emissive.set(0xaaaaaa);
            
        });
        
            controls.addEventListener('dragend', function (event) {
                event.object.material.emissive.set(0x000000);
        });

        // Constrain the bed's movement to x and z
        
        controls.addEventListener('drag', function (event) {
            switch (item) {
                case 'chair':
                    event.object.position.z = offsetZ; // Restrict movement to X axis only
                    break;
                case 'table':
                    event.object.position.y = offsetY; // Restrict movement to Y axis only
                    break;
                case 'table2':
                    event.object.position.y = offsetY; // Restrict movement to Y axis only
                    break;
                case 'door':
                    event.object.position.y = offsetY;
                case 'window':
                    event.object.position.y = offsetY;
            }
        });

        },
        function (xhr) {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        },
        function (error) {
            console.error('Error loading object:', error);
        }
    );
}



// Load bed model
let bed;
const bedLoader = new OBJLoader();
bedLoader.load(
    'Furniture/bed.obj',
    function (object) {
        // Scale the bed model to an appropriate size
        const scale = 0.002; // Adjust scale as needed
        object.scale.set(scale, scale, scale);
        
        // Position the bed model next to the left wall
        const offsetX = 0; // Adjust X position as needed
        const offsetY = 0; // Adjust Y position to be slightly above the floor
        const offsetZ = 0; // Adjust Z position as needed
        object.position.set(offsetX, offsetY, offsetZ);
        bed = object;
        scene.add(bed);
        bed.rotation.set(0,26.1, 0);


        object.traverse(function (child) {
            if (child instanceof THREE.Mesh) {
                // Here, you can set up materials as needed
                
                child.material.side = THREE.DoubleSide;
                child.material.transparent = true;
            }
        });

        // Set up DragControls for the bed
        const controls = new DragControls([bed], camera, renderer.domElement);
        controls.addEventListener('dragstart', function (event) {
            event.object.material.emissive.set(0xaaaaaa);
            
        });
        
        controls.addEventListener('dragend', function (event) {
            event.object.material.emissive.set(0x000000);
        });

        // Constrain the bed's movement to x and z
        
        controls.addEventListener('drag', function (event) {
            event.object.position.y = offsetY;
        });

        

    },
    function (xhr) {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    },
    function (error) {
        console.error('Error loading bed.obj:', error);
    }    
);


let backleft = true;
let frontright = false

// Function to rotate camera by 90 degrees
function rotateleft() {
    const axis = new THREE.Vector3(0, 1, 0); // Rotate around the y-axis
    const angle = Math.PI / 2; // 90 degrees
    camera.position.applyAxisAngle(axis, angle);
    camera.lookAt(scene.position);
    scene.remove(backWall);
    //scene.remove(leftWall);
    scene.add(frontWall);
    //scene.add(rightWall);
}
// Event listener for button click
const rotateButtonleft = document.getElementById('rotateLeft');
rotateButtonleft.addEventListener('click', rotateleft);


function rotateright() {
    const axis = new THREE.Vector3(0, 1, 0); // Rotate around the y-axis
    const angle = -Math.PI / 2; // 90 degrees

    camera.position.applyAxisAngle(axis, angle);
    camera.lookAt(scene.position);

    scene.add(backWall);
    scene.add(leftWall);
    scene.remove(frontWall);
    scene.remove(rightWall);
}

// Event listener for button click
const rotateRight = document.getElementById('rotateRight');
rotateRight.addEventListener('click', rotateright);


let isTopView = false;
function topView() {
    if(!isTopView){

    // Set camera position directly above the scene
        camera.position.set(0, 20, 0); // Adjust the y-coordinate as needed

        // Set camera to look directly down at the scene center
        camera.rotation.set(-Math.PI / 2, 0, 0);
        isTopView = true;
        scene.add(frontWall);
        scene.add(rightWall);
    }
    else{
        camera.position.set(10, 10, 10);
        camera.lookAt(scene.position);
        isTopView = false;
        scene.remove(frontWall);
        scene.remove(rightWall);
    }
}

// Event listener for button click
const rotateTop = document.getElementById('top');
rotateTop.addEventListener('click', topView);

// To rotate an object
function rotateObject(){
    {
        bed.rotation.y  += Math.PI / 2;
    }
}
        const rotateButton = document.getElementById('rotate');
        rotateButton.addEventListener('click', rotateObject);
        
// Add objects
document.addEventListener('DOMContentLoaded', function () {
    const addChair = document.getElementById('addChair');
    addChair.addEventListener('click', function () {
        addObject('chair'); 
    });
    const addTable = document.getElementById('addTable');
    addTable.addEventListener('click', function () {
        addObject('table'); 
    });
    const addTable2 = document.getElementById('addTable2');
    addTable2.addEventListener('click', function () {
        addObject('table2'); 
    });
    const door = document.getElementById('addDoor');
    door.addEventListener('click', function () {
        addObject('door'); 
    });
    const window = document.getElementById('addWindow');
    window.addEventListener('click', function () {
        addObject('window'); 
    });
    
});

// Render loop
function render() {
    requestAnimationFrame(render);
    renderer.render(scene, camera);
}
render();
