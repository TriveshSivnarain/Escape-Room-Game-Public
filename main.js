import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Add Ambient Light (soft global light for all objects)
const ambientLight = new THREE.AmbientLight(0x404040, 2);
scene.add(ambientLight);

// Add Directional Light (like sunlight)
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 10, 5);
scene.add(directionalLight);

// Load the 3D character model
let character;
const loader = new GLTFLoader();
loader.load('/public/SuitsCharacter.gltf', function (gltf) {
    character = gltf.scene;
    scene.add(character);
    character.position.set(0, 0, 0); // Start position at the center
    character.scale.set(1, 1, 1);    // Adjust character scale
}, undefined, function (error) {
    console.error('An error occurred while loading the character model:', error);
});

// Load environment models from /public/glTF and adjust scaling/position
loader.load('/public/glTF/DeadTree_1.gltf', function (gltf) {
    const tree = gltf.scene;
    tree.position.set(-2, 0, -5); // Position tree farther back
    tree.scale.set(2, 2, 2);      // Scale the tree to be larger
    scene.add(tree);
}, undefined, function (error) {
    console.error('An error occurred while loading the tree model:', error);
});

loader.load('/public/glTF/Rock_Medium_1.gltf', function (gltf) {
    const rock = gltf.scene;
    rock.position.set(3, 0, -3);  // Position rock to the side
    rock.scale.set(1.5, 1.5, 1.5); // Scale the rock to a reasonable size
    scene.add(rock);
}, undefined, function (error) {
    console.error('An error occurred while loading the rock model:', error);
});

// Keyboard controls
const keysPressed = {};
document.addEventListener('keydown', (event) => {
    keysPressed[event.key.toLowerCase()] = true;
});
document.addEventListener('keyup', (event) => {
    keysPressed[event.key.toLowerCase()] = false;
});

// Function to move the character based on keyboard input
function moveCharacter() {
    if (character) {
        const speed = 0.05;

        // Move forward (W)
        if (keysPressed['w']) {
            character.position.z += speed;
        }

        // Move backward (S)
        if (keysPressed['s']) {
            character.position.z -= speed;
        }

        // Move left (A)
        if (keysPressed['a']) {
            character.position.x += speed;
        }

        // Move right (D)
        if (keysPressed['d']) {
            character.position.x -= speed;
        }
    }
}

// Function to update the camera position to follow the character
function updateCamera() {
    if (character) {
        // Set the camera behind and slightly above the character for 3rd person view
        const offset = new THREE.Vector3(0, 3, -7); // Offset from the character (3 units above, 7 units behind)
        const cameraPosition = character.position.clone().add(offset); // Camera position based on character position
        camera.position.copy(cameraPosition); // Update the camera position
        camera.lookAt(character.position);    // Make the camera look at the character
    }
}

// Create a simple floor for the room
const floorGeometry = new THREE.BoxGeometry(20, 0.1, 20);
const floorMaterial = new THREE.MeshBasicMaterial({ color: 0xaaaaaa });
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.position.set(0, -1, 0); // Position the floor
scene.add(floor);

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    // Update camera and character movement
    moveCharacter();
    updateCamera();

    renderer.render(scene, camera);
}
animate();
