import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { TrackballControls } from 'three/addons/controls/TrackballControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
import { bumpMap, emissive, normalMap } from 'three/webgpu';
//import {TextureLoader} from 'three/examples/jsm/loaders/TextureLoader.js'
var clock = new THREE.Clock();
clock.autoStart - true;
let charRotAngle = 0;
// Scene setup
let meshes = []
const scene = new THREE.Scene();
scene.background = new THREE.Color( 0x000000 );
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

//cameraBound.position.set(0,0,0);
const renderer = new THREE.WebGLRenderer();
const controls = new PointerLockControls(camera, renderer.domElement)
controls.addEventListener('lock', () => (menuPanel.style.display = 'none'))
controls.addEventListener('unlock', () => (menuPanel.style.display = 'block'))
camera.position.set(-1.2281441960864121,-1.0824674490095276e-16,1.3014979497159611);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const listener = new THREE.AudioListener();
camera.add( listener );


/*document.addEventListener('mousemove', function(e){
    let scale = -0.01;
    charRotAngle = charRotAngle + (e.movementX * scale)
    orbit.rotateY( e.movementX * scale );
    orbit.rotateX( e.movementY * scale ); 
    orbit.rotation.z = 0; //this is important to keep the camera level..
})*/
let flashlight = new THREE.SpotLight(0xffffff,4,40,Math.PI/10,1,3);
let flashlightBBGeo = new THREE.ConeGeometry( 40*Math.sin(Math.PI/10),40, 10, 1 );
let flashlightBB = new THREE.Mesh( flashlightBBGeo, new THREE.MeshStandardMaterial({color:0x0000ff,transparent:true,opacity:1,emissive:0x0000ff,emissiveIntensity:1}));
camera.add(flashlight);
//camera.add(flashlightBB);
flashlight.position.set(0,0,1);
flashlightBB.position.set(0,-20,0);
flashlightBB.rotateZ(Math.PI/2);
flashlight.target = camera;
scene.add(flashlight.target);
// Add Ambient Light (soft global light for all objects)
const pointLight = new THREE.PointLight(0x00ff00, 1, 100,4);
pointLight.position.set( 0, 0, 0 );
// Add Ambient Light (soft global light for all objects)
const ambientLight = new THREE.AmbientLight(0x101010);
//pointLight.position.set( 0, 0, 0 );
scene.add(ambientLight);
controls.unlock()
// Add Directional Light (like sunlight)
//const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
//directionalLight.position.set(5, 10, 5);
//scene.add(directionalLight);

// Load the 3D character model
let character;
const loader = new GLTFLoader();
loader.load('/public/SuitsCharacter.gltf', function (gltf) {
    character = gltf.scene;
    scene.add(character);
    character.position.set(0, 0, 0); // Start position at the center
    character.scale.set(1, 1, 1);    // Adjust character scale
    character.rotation.set(new THREE.Vector3( Math.PI,0, 0 ))
}, undefined, function (error) {
    console.error('An error occurred while loading the character model:', error);
});

/*let orbit = new THREE.Object3D();
orbit.rotation.order = "YXZ";
orbit.position.set(0,0,0);
scene.add(orbit);
orbit.add( camera );*/

// Load environment models from /public/glTF and adjust scaling/position
const bedroomGroup = new THREE.Group();
const bedroom = new THREE.Object3D();

bedroomGroup.add(bedroom);
scene.add(bedroomGroup);
let textureLoader = new THREE.TextureLoader();
let walltexture = textureLoader.load(
    'public/bedroomWalls/oldwood_DIFF.png',
    );
let walltexturenormals = textureLoader.load(
    'public/bedroomWalls/oldwood_NRML.png',
    );
let walltexturespecular = textureLoader.load(
        'public/bedroomWalls/oldwood_SPEC.png',
    );
let walltexturebump = textureLoader.load(
        'public/bedroomWalls/oldwood_DISP.png',
    );
let walltextureocc = textureLoader.load(
        'public/bedroomWalls/oldwood_OCC.png',
    );
let wallgeometry = new THREE.BoxGeometry(4, 4, 0.5);
let wallmaterial = new THREE.MeshStandardMaterial( { map: walltexture, normalMap: walltexturenormals,specularMap:walltexturespecular,bumpMap:walltexturebump,aoMap:walltextureocc } );
let roofmaterial = new THREE.MeshStandardMaterial( { color: 0x33271d  } );
let wallA = new THREE.Mesh( wallgeometry, wallmaterial );
wallA.geometry.computeBoundingBox();
let wallABB = new THREE.Box3();
wallABB.copy( wallA.geometry.boundingBox ).applyMatrix4( wallA.matrixWorld );
//wallABB.setFromObject(wallA);
wallA.translateZ(2);
wallA.castShadow = true; //default is false
bedroom.add( wallA );

let wallB = new THREE.Mesh( wallgeometry, wallmaterial );
wallB.translateZ(-2);
wallB.castShadow = true; //default is false
bedroom.add( wallB );

let wallC = new THREE.Mesh( wallgeometry, wallmaterial );
wallC.rotateY(Math.PI/2);
wallC.translateZ(-2);
wallC.castShadow = true; //default is false
bedroom.add( wallC );

let wallD = new THREE.Mesh( wallgeometry, wallmaterial );
wallD.rotateY(Math.PI/2);
wallD.translateZ(2);
wallD.castShadow = true; //default is false
bedroom.add( wallD );

let roof = new THREE.Mesh( wallgeometry, roofmaterial );
roof.rotateX(Math.PI/2);
roof.translateZ(-1.5);
roof.castShadow = true; //default is false
bedroom.add( roof );

let bedgeometry =  new THREE.BoxGeometry(2.4,0.45,1.6);
let bedmaterial =  new THREE.MeshStandardMaterial({color:0x660000});
let bed = new THREE.Mesh( bedgeometry, bedmaterial );
bed.translateY(-0.7);
bed.translateX(1);
//bed.scale.set(1.5, 1.5, 1.5);
bedroom.add( bed );

let strongboxgeometry =  new THREE.BoxGeometry(0.5,0.4,0.6);
let strongboxmaterial =  new THREE.MeshStandardMaterial({color:0x6e4a30});
let strongbox = new THREE.Mesh( strongboxgeometry, strongboxmaterial );
strongbox.translateX(-0.4);
strongbox.translateY(-0.8);
bedroom.add( strongbox );

let ariesRuneColor = 0x690000;
let ariesLight = new THREE.PointLight(ariesRuneColor, 0.3, 0.06,10);
ariesLight.position.set( 0, 0, 0 );
let runeAries = new THREE.Object3D();
//let tempDot = new THREE.Mesh(new THREE.SphereGeometry(0.05,32, 16),new THREE.MeshBasicMaterial({color:0xffffff,emissive:0xffffff,emissiveIntensity:1}));
let runeAriesSymbol;
let ariesMat = new THREE.MeshStandardMaterial({color: 0x000000,emissive:ariesRuneColor,emissiveIntensity:1,transparent:true,opacity:1});
loader.load('/public/symbols/aries/scene.gltf', function (gltf) {
    runeAriesSymbol = gltf.scene;
    
    runeAriesSymbol.traverse((o) => {
        if (o.isMesh) o.material = ariesMat;
      });
    runeAriesSymbol.scale.set(0.0005, 0.0005, 0.0005);
    runeAriesSymbol.translateY(-0.2);
    runeAriesSymbol.translateZ(0.1);
    //runeAries.add(tempDot);
    runeAries.add(runeAriesSymbol);
    runeAries.add(ariesLight);
    //scene.add(runeAries);
    runeAries.scale.set(0.2,0.2,0.2);
    runeAries.position.set(-0.27, 0, 0);
    runeAries.rotateX(Math.PI/2);
    runeAries.rotateZ(Math.PI/2);
    strongbox.add(runeAries);
}, undefined, function (error) {
    console.error('An error occurred while loading the character model:', error);
});

let ariesWallRune = new THREE.Object3D();
let ariesWallRuneSymbol;
let ariesWallMat = new THREE.MeshStandardMaterial({color: 0x000000,emissive:ariesRuneColor,emissiveIntensity:0,transparent:true,opacity:0});
loader.load('/public/symbols/aries/scene.gltf', function (gltf) {
    ariesWallRuneSymbol = gltf.scene;
    
    ariesWallRuneSymbol.traverse((o) => {
        if (o.isMesh) o.material = ariesWallMat;
      });
    ariesWallRuneSymbol.scale.set(0.001, 0.001, 0.001);
    ariesWallRuneSymbol.rotateX(Math.PI/2);
    ariesWallRuneSymbol.rotateZ(Math.PI/2);
    ariesWallRuneSymbol.translateY(-0.2)
    //ariesWallRune.add(tempDot);
    ariesWallRune.add(ariesWallRuneSymbol);

    ariesWallRune.scale.set(0.5,0.5,0.5);
    ariesWallRune.rotateY(3*Math.PI/2);
    //ariesWallRune.rotateX(-Math.PI/17);
    ariesWallRune.position.set(1.2,-0.85,0.79);
    scene.add(ariesWallRune);
}, undefined, function (error) {
    console.error('An error occurred while loading the character model:', error);
});

let libraRuneColor = 0x00917c;
let libraLight = new THREE.PointLight(libraRuneColor, 0.3, 0.06,10);
libraLight.position.set( 0, 0, 0 );
let runeLibra = new THREE.Object3D();
let tempDot = new THREE.Mesh(new THREE.SphereGeometry(0.05,32, 16),new THREE.MeshBasicMaterial({color:0xffffff,emissive:0xffffff,emissiveIntensity:1}));
let runeLibraSymbol;
let libraMat = new THREE.MeshStandardMaterial({color: 0x000000,emissive:libraRuneColor,emissiveIntensity:1,transparent:true,opacity:1});
loader.load('/public/symbols/libra/scene.gltf', function (gltf) {
    runeLibraSymbol = gltf.scene;
    
    runeLibraSymbol.traverse((o) => {
        if (o.isMesh) o.material = libraMat;
      });
    runeLibraSymbol.scale.set(0.004, 0.004, 0.004);
    runeLibraSymbol.translateY(-0.55);
    runeLibraSymbol.translateZ(0);
    //runeLibra.add(tempDot);
    runeLibra.add(runeLibraSymbol);
    runeLibra.add(libraLight);
    runeLibra.scale.set(0.1,0.1,0.1);
    runeLibra.position.set(-0.27, 0, -0.2);
    runeLibra.rotateX(Math.PI/2);
    runeLibra.rotateZ(Math.PI/2);
    //scene.add(runeLibra);
    strongbox.add(runeLibra);
}, undefined, function (error) {
    console.error('An error occurred while loading the character model:', error);
});

let libraWallRune = new THREE.Object3D();
let libraWallRuneSymbol;
let libraWallMat = new THREE.MeshStandardMaterial({color: 0x000000,emissive:libraRuneColor,emissiveIntensity:0,transparent:true,opacity:0});
loader.load('/public/symbols/libra/scene.gltf', function (gltf) {
    libraWallRuneSymbol = gltf.scene;
    
    libraWallRuneSymbol.traverse((o) => {
        if (o.isMesh) o.material = libraWallMat;
      });
    libraWallRuneSymbol.scale.set(0.004, 0.004, 0.004);
    libraWallRuneSymbol.translateX(0.35);
    libraWallRuneSymbol.rotateX(Math.PI/2);
    libraWallRuneSymbol.rotateZ(Math.PI/2);
    //libraWallRune.add(tempDot);
    libraWallRune.add(libraWallRuneSymbol);
    libraWallRune.scale.set(0.5,0.5,0.5);
    libraWallRune.rotateY(Math.PI/2);
    libraWallRune.rotateX(Math.PI/16);
    libraWallRune.position.set(0,0,-0.23);
    wallA.add(libraWallRune);
}, undefined, function (error) {
    console.error('An error occurred while loading the character model:', error);
});

function checkCollision(){
    
}

let prevPosition = camera.position;
let capricornRuneColor = 0x660099;
let capricornLight = new THREE.PointLight(capricornRuneColor, 0.3, 0.06,10);
capricornLight.position.set( 0, 0, 0 );
let runeCapricorn = new THREE.Object3D();
//let tempDot = new THREE.Mesh(new THREE.SphereGeometry(0.05,32, 16),new THREE.MeshBasicMaterial({color:0xffffff,emissive:0xffffff,emissiveIntensity:1}));
let runeCapricornSymbol;
let capricornMat = new THREE.MeshStandardMaterial({color: 0x000000,emissive:capricornRuneColor,emissiveIntensity:1,transparent:true,opacity:1});
loader.load('/public/symbols/capricorn/scene.gltf', function (gltf) {
    runeCapricornSymbol = gltf.scene;
    
    runeCapricornSymbol.traverse((o) => {
        if (o.isMesh) o.material = capricornMat;
      });
    runeCapricornSymbol.scale.set(0.0004, 0.0004, 0.0004);
    runeCapricornSymbol.translateY(0);
    runeCapricornSymbol.translateZ(-0.1);
    //runeCapricorn.add(tempDot);
    runeCapricorn.add(runeCapricornSymbol);
    runeCapricorn.add(capricornLight);
    //scene.add(runeCapricorn);
    runeCapricorn.scale.set(0.2,0.2,0.2);
    runeCapricorn.position.set(-0.27, 0, 0.2);
    //runeCapricorn.rotateX(Math.PI/2);
    runeCapricorn.rotateY(-Math.PI/2);
    strongbox.add(runeCapricorn);
}, undefined, function (error) {
    console.error('An error occurred while loading the character model:', error);
});

let capricornWallRune = new THREE.Object3D();
let capricornWallRuneSymbol;
let capricornWallMat = new THREE.MeshStandardMaterial({color: 0x000000,emissive:capricornRuneColor,emissiveIntensity:0,transparent:true,opacity:0});
loader.load('/public/symbols/capricorn/scene.gltf', function (gltf) {
    capricornWallRuneSymbol = gltf.scene;
    
    capricornWallRuneSymbol.traverse((o) => {
        if (o.isMesh) o.material = capricornWallMat;
      });
    capricornWallRuneSymbol.scale.set(0.004, 0.004, 0.004);
    capricornWallRuneSymbol.translateX(0.35);
    capricornWallRuneSymbol.rotateX(Math.PI/2);
    capricornWallRuneSymbol.rotateZ(Math.PI/2);
    //capricornWallRune.add(tempDot);
    capricornWallRune.add(capricornWallRuneSymbol);
    
    capricornWallRune.scale.set(0.08,0.08,0.08);
    capricornWallRune.rotateZ(Math.PI);
    capricornWallRune.rotateY(-Math.PI/5 * 6);
    capricornWallRune.position.set(-1.6,-0.95,1.5);
    scene.add(capricornWallRune);
    //wallA.add(capricornWallRune);
}, undefined, function (error) {
    console.error('An error occurred while loading the character model:', error);
});

// Keyboard controls
const keysPressed = {};
document.addEventListener('keydown', (event) => {
    keysPressed[event.key.toLowerCase()] = true;
});
document.addEventListener('keyup', (event) => {
    keysPressed[event.key.toLowerCase()] = false;
    if (event.key.toLowerCase() == 'f'){
        if (flashlight.intensity != 0){
            flashlight.intensity = 0;
        }
        else{
            flashlight.intensity = 4;
        }
    }
});

let randomIntervalAries = Math.floor(Math.random() * 100);
function runeAriesLightLoop(){
    let elapsed = clock.getElapsedTime();
    
    let ariesRuneEm = 1*Math.cos(0.8*elapsed+randomIntervalAries);
    if (ariesRuneEm <0){
        ariesRuneEm = 0;
    }
    let ariesLightInt = 0.3*Math.cos(0.8*elapsed+randomIntervalAries);
    if (ariesLightInt < 0){
        ariesLightInt = 0;
    }
    //let ariesRuneOp = 1*Math.cos(0.8*elapsed);
    ariesLight.intensity = ariesLightInt;
    ariesMat.emissiveIntensity = ariesRuneEm;
    ariesMat.opacity = ariesRuneEm;
}

let randomIntervalCapricorn = Math.floor(Math.random() * 100);
function runeCapricornLightLoop(){
    let elapsed = clock.getElapsedTime();
    let capricornRuneEm = 1*Math.cos(0.8*elapsed+randomIntervalCapricorn);
    if (capricornRuneEm <0){
        capricornRuneEm = 0;
    }
    let capricornLightInt = 0.3*Math.cos(0.8*elapsed+randomIntervalCapricorn);
    if (capricornLightInt < 0){
        capricornLightInt = 0;
    }
    //let ariesRuneOp = 1*Math.cos(0.8*elapsed);
    capricornLight.intensity = capricornLightInt;
    capricornMat.emissiveIntensity = capricornRuneEm;
    capricornMat.opacity = capricornRuneEm;
}

let randomIntervalLibra = Math.floor(Math.random() * 100);
function runeLibraLightLoop(){
    let elapsed = clock.getElapsedTime();
    let randomInterval = Math.floor(Math.random() * 20);
    let libraRuneEm = 1*Math.cos(0.8*elapsed+randomIntervalLibra);
    if (libraRuneEm <0){
        libraRuneEm = 0;
    }
    let libraLightInt = 0.3*Math.cos(0.8*elapsed+randomIntervalLibra);
    if (libraLightInt < 0){
        libraLightInt = 0;
    }
    //let ariesRuneOp = 1*Math.cos(0.8*elapsed);
    libraLight.intensity = libraLightInt;
    libraMat.emissiveIntensity = libraRuneEm;
    libraMat.opacity = libraRuneEm;
}



let libraWallRuneInt = 0;
let libraWallRuneFound = false;
function updateLibraWallRune(){
    var targetPosition = new THREE.Vector3();
    targetPosition = targetPosition.setFromMatrixPosition( libraWallRune.matrixWorld );

    var lookDirection = new THREE.Vector3(); 
    flashlight.getWorldDirection(lookDirection).normalize();
    var cameraPos = new THREE.Vector3().setFromMatrixPosition( flashlight.matrixWorld );
    var pos = cameraPos.sub( targetPosition );
    let angle = pos.angleTo( lookDirection );
    let front = angle < Math.abs(0.1);
    if (front && flashlight.intensity > 0) { 
        angle  = pos.angleTo( lookDirection );
        libraWallRuneInt = libraWallRuneInt + 0.002;
        front = true
    }
    else{
        front = false
        libraWallRuneInt = libraWallRuneInt - 0.001;
    }
    if (libraWallRuneInt < 0){
        libraWallRuneInt = 0;
    }
    if (libraWallRuneFound){
        libraWallMat.emissiveIntensity = 1
        libraWallMat.opacity = 1;
    }
    else{
        libraWallMat.emissiveIntensity = libraWallRuneInt   
        libraWallMat.opacity = libraWallRuneInt;
    }
    if (libraWallRuneInt >= 1 && !libraWallRuneFound){
        libraWallRuneFound = true;
        let runeActivationSound = new THREE.Audio( listener );

        // load a sound and set it as the Audio object's buffer
        const audioLoader = new THREE.AudioLoader();
        audioLoader.load( 'public/sounds/runeactivation/runeActivation.wav', function( buffer ) {
	        runeActivationSound.setBuffer( buffer );
	        runeActivationSound.setLoop( false );
	        runeActivationSound.setVolume( 0.5 );
	        runeActivationSound.play();
        });
    }

    
    //console.log(angle+"\n")
    //console.log(lookDirection+"\n")
    //console.log(cameraRuneVec)
    
}

function libraBoxRuneUpdate(){
    if (libraWallRuneFound){
        libraLight.intensity = 0.3;
        libraMat.emissiveIntensity = 1;
        libraMat.opacity = 1;    
    }
    else{
        libraLight.intensity = 0;
        libraMat.emissiveIntensity = 0;
        libraMat.opacity = 0;    
    }
}

let capricornWallRuneInt = 0;
let capricornWallRuneFound = false;
function updateCapricornWallRune(){
    var targetPosition = new THREE.Vector3();
    targetPosition = targetPosition.setFromMatrixPosition( capricornWallRune.matrixWorld );

    var lookDirection = new THREE.Vector3(); 
    flashlight.getWorldDirection(lookDirection).normalize();
    var cameraPos = new THREE.Vector3().setFromMatrixPosition( flashlight.matrixWorld );
    var pos = cameraPos.sub( targetPosition );
    let angle = pos.angleTo( lookDirection );
    let front = angle < Math.abs(0.1);
    if (front && flashlight.intensity > 0) { 
        angle  = pos.angleTo( lookDirection );
        capricornWallRuneInt = capricornWallRuneInt + 0.002;
        front = true
    }
    else{
        front = false
        capricornWallRuneInt = capricornWallRuneInt - 0.001;
    }
    if (capricornWallRuneInt < 0){
        capricornWallRuneInt = 0;
    }
    if (capricornWallRuneFound){
        capricornWallMat.emissiveIntensity = 1
        capricornWallMat.opacity = 1;
    }
    else{
        capricornWallMat.emissiveIntensity = capricornWallRuneInt   
        capricornWallMat.opacity = capricornWallRuneInt;
    }
    if (capricornWallRuneInt >= 1 && !capricornWallRuneFound){
        capricornWallRuneFound = true;

        let runeActivationSound = new THREE.Audio( listener );

        // load a sound and set it as the Audio object's buffer
        const audioLoader = new THREE.AudioLoader();
        audioLoader.load( 'public/sounds/runeactivation/runeActivation.wav', function( buffer ) {
	        runeActivationSound.setBuffer( buffer );
	        runeActivationSound.setLoop( false );
	        runeActivationSound.setVolume( 0.5 );
	        runeActivationSound.play();
        });
    }

    
    //console.log(angle+"\n")
    //console.log(lookDirection+"\n")
    //console.log(cameraRuneVec)
}

function capricornBoxRuneUpdate(){
    if (capricornWallRuneFound){
        capricornLight.intensity = 0.3;
        capricornMat.emissiveIntensity = 1;
        capricornMat.opacity = 1;    
    }
    else{
        capricornLight.intensity = 0;
        capricornMat.emissiveIntensity = 0;
        capricornMat.opacity = 0;    
    }
}

let ariesWallRuneInt = 0;
let ariesWallRuneFound = false;
function updateAriesWallRune(){
    var targetPosition = new THREE.Vector3();
    targetPosition = targetPosition.setFromMatrixPosition( ariesWallRune.matrixWorld );

    var lookDirection = new THREE.Vector3(); 
    flashlight.getWorldDirection(lookDirection).normalize();
    var cameraPos = new THREE.Vector3().setFromMatrixPosition( flashlight.matrixWorld );
    var pos = cameraPos.sub( targetPosition );
    let angle = pos.angleTo( lookDirection );
    let front = angle < Math.abs(0.1);
    if (front && flashlight.intensity > 0) { 
        angle  = pos.angleTo( lookDirection );
        ariesWallRuneInt = ariesWallRuneInt + 0.002;
        front = true
    }
    else{
        front = false
        ariesWallRuneInt = ariesWallRuneInt - 0.001;
    }
    if (ariesWallRuneInt < 0){
        ariesWallRuneInt = 0;
    }
    if (ariesWallRuneFound){
        ariesWallMat.emissiveIntensity = 1
        ariesWallMat.opacity = 1;
    }
    else{
        ariesWallMat.emissiveIntensity = ariesWallRuneInt   
        ariesWallMat.opacity = ariesWallRuneInt;
    }
    if (ariesWallRuneInt >= 1 && !ariesWallRuneFound){
        ariesWallRuneFound = true;

        let runeActivationSound = new THREE.Audio( listener );

        // load a sound and set it as the Audio object's buffer
        const audioLoader = new THREE.AudioLoader();
        audioLoader.load( 'public/sounds/runeactivation/runeActivation.wav', function( buffer ) {
	        runeActivationSound.setBuffer( buffer );
	        runeActivationSound.setLoop( false );
	        runeActivationSound.setVolume( 0.5 );
	        runeActivationSound.play();
        });
    }

    
    //console.log(angle+"\n")
    //console.log(lookDirection+"\n")
    //console.log(cameraRuneVec)
}

function ariesBoxRuneUpdate(){
    if (ariesWallRuneFound){
        ariesLight.intensity = 0.3;
        ariesMat.emissiveIntensity = 1;
        ariesMat.opacity = 1;    
    }
    else{
        ariesLight.intensity = 0;
        ariesMat.emissiveIntensity = 0;
        ariesMat.opacity = 0;    
    }
}

function updateInfoPanel(text){
    document.getElementById("infoPanel").innerText = text;
}
// Function to move the character based on keyboard input
function moveCharacter() {
    prevPosition = camera.position;
    if (character) {
        const speed = 0.05;

        // Move forward (W)
        if (keysPressed['w']) {
            
            controls.moveForward(speed);
        }

        // Move backward (S)
        if (keysPressed['s']) {
            controls.moveForward(-speed);  
        }

        // Move left (A)
        if (keysPressed['a']) {
            controls.moveRight(-speed);   
        }

        // Move right (D)
        if (keysPressed['d']) {
            controls.moveRight(speed);
        }
        if (keysPressed['p']) {
            controls.unlock();
        }
        if (keysPressed['o']) {
            controls.lock();
        }
        /*if (keysPressed['f']) {
            if (flashlight.intensity != 0){
                flashlight.intensity = 0;
            }
            else{
                flashlight.intensity = 4;
            }
        }*/
    }
    if (checkCollision()){
        camera.postion = prevPosition;
    }
}


// Function to update the camera position to follow the character
function updateCamera() {
    

}

// Create a simple floor for the room
const floorGeometry = new THREE.BoxGeometry(20, 0.1, 20);
const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x1a130f });
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.position.set(0, -1, 0); // Position the floor
scene.add(floor);
clock.start();
// Animation loop
function animate() {
    requestAnimationFrame(animate);

    // Update camera and character movement
    moveCharacter();
    updateCamera();
    //runeAriesLightLoop();
    //runeLibraLightLoop();
    //runeCapricornLightLoop();
    updateLibraWallRune();
    libraBoxRuneUpdate();
    updateCapricornWallRune();
    capricornBoxRuneUpdate();
    updateAriesWallRune();
    ariesBoxRuneUpdate();
    renderer.render(scene, camera);
}
animate();
