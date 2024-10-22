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
let raycaster = new THREE.Raycaster();
//cameraBound.position.set(0,0,0);
const renderer = new THREE.WebGLRenderer();
const controls = new PointerLockControls(camera, renderer.domElement)
controls.addEventListener('lock', () => (menuPanel.style.display = 'none'))
controls.addEventListener('unlock', () => (menuPanel.style.display = 'block'))
// -- Set Camera Initial position --
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
let mixerChest; 
// --- Create flashlight ---
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



//const pointLight = new THREE.PointLight(0x00ff00, 1, 100,4);
//pointLight.position.set( 0, 0, 0 );
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
// --- Load Wall Texture ---
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

// --- Create Walls ---
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

// --- Create Roof ---
let roof = new THREE.Mesh( wallgeometry, roofmaterial );
roof.rotateX(Math.PI/2);
roof.translateZ(-1.5);
roof.castShadow = true; //default is false
bedroom.add( roof );

// --- Create Bed Object ---
let bedBB = new THREE.Box3();
let bedgeometry =  new THREE.BoxGeometry(2.4,0.45,1.6);
let bedmaterial =  new THREE.MeshStandardMaterial({color:0x660000});
let bed = new THREE.Mesh( bedgeometry, bedmaterial );
bed.translateY(-0.7);
bed.translateX(1);
//bedObj.add(bed);
bed.geometry.computeBoundingBox();
bedBB.copy(bed.geometry.boundingBox).applyMatrix4(bed.matrixWorld);
//bed.scale.set(1.5, 1.5, 1.5);
bedroom.add( bed );

/*let strongboxgeometry =  new THREE.BoxGeometry(0.5,0.4,0.6);
let strongboxmaterial =  new THREE.MeshStandardMaterial({color:0x6e4a30});
let strongbox = new THREE.Mesh( strongboxgeometry, strongboxmaterial );
strongbox.translateX(-0.4);
strongbox.translateY(-0.8);
bedroom.add( strongbox );*/

// --- Create Chest Object ---
let chestClips;
let strongboxBB = new THREE.Box3()
let strongbox = new THREE.Object3D();
let strongboxgeometry;
loader.load('/public/chest/scene.gltf', function (gltf) {
    strongboxgeometry = gltf.scene;
    
    strongboxgeometry.scale.set(1,1,1);
    strongboxgeometry.rotateY(Math.PI/2)
    strongboxBB.expandByObject(strongboxgeometry)
    
    let strongBoxX = strongboxBB.max.x - strongboxBB.min.x;
    let strongBoxY = strongboxBB.max.y - strongboxBB.min.y;
    let strongBoxZ = strongboxBB.max.z - strongboxBB.min.z;
    strongboxgeometry.scale.set(0.5/strongBoxX,0.3/strongBoxY,0.5/strongBoxZ);
    //strongboxgeometry.geometry.setAttribute('uv2', new THREE.Float32BufferAttribute(strongboxgeometry.geometry.attributes.uv.array,2));
    //let tempText = strongBoxX + "," + strongBoxY + "," + strongBoxZ;
    //updateInfoPanel(tempText)
    strongbox.add(strongboxgeometry);
    mixerChest = new THREE.AnimationMixer( gltf );
    chestClips = strongboxgeometry.animations;
    //let clip = THREE.AnimationClip.findByName( chestClips, "openChest" );
    
    let action = mixerChest.clipAction( gltf.animations[0] );
    mixerChest.setTime(0)
    mixerChest.timeScale = 0;
    //action.clampWhenFinished = true;
    action.play();
    strongbox.translateX(-0.4);
    strongbox.translateY(-1.1);
    strongbox.rotateY(Math.PI);
    strongbox.scale.set(2,2,2);
    
    bedroom.add(strongbox);
    
}, undefined, function (error) {
    console.error('An error occurred while loading the character model:', error);
});


// --- Create Book Object ---
let bookLight = new THREE.PointLight(0xfcffa8, 0.3, 0.3,10);
bookLight.position.set( 0, 0.2, 0.2 );
let bookObj = new THREE.Object3D();
//let tempDot = new THREE.Mesh(new THREE.SphereGeometry(0.05,32, 16),new THREE.MeshBasicMaterial({color:0xffffff,emissive:0xffffff,emissiveIntensity:1}));
let book;
//let ariesMat = new THREE.MeshStandardMaterial({color: 0x000000,emissive:ariesRuneColor,emissiveIntensity:1,transparent:true,opacity:1});
loader.load('/public/book/scene.gltf', function (gltf) {
    book = gltf.scene;
    book.scale.set(0.02,0.02,0.02)
    bookObj.add(bookLight)
    bookObj.add(book)
    bookObj.rotateY(Math.PI/2)
    bookObj.rotateX(-Math.PI/2)
    bookObj.position.set(0.1,0.32,0)
    bookObj.scale.set(0.3,0.3,0.3)
    bookObj.visible = false
    //bookObj.opacity = 0
    strongbox.add(bookObj);
}, undefined, function (error) {
    console.error('An error occurred while loading the character model:', error);
});

// --- Create Aries Box Rune ---
let ariesRuneColor = 0x690000;
let ariesLight = new THREE.PointLight(ariesRuneColor, 0.3, 0.2,10);
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
    runeAriesSymbol.scale.set(0.001, 0.001, 0.001);
    runeAriesSymbol.translateY(-0.2);
    runeAriesSymbol.translateZ(0.1);
    //runeAries.add(tempDot);
    runeAries.add(runeAriesSymbol);
    runeAries.add(ariesLight);
    //scene.add(runeAries);
    runeAries.scale.set(0.1,0.1,0.1);
    runeAries.position.set(0.11, 0.17, 0);
    runeAries.rotateX(Math.PI/2);
    runeAries.rotateZ(Math.PI/2);
    strongbox.add(runeAries);
}, undefined, function (error) {
    console.error('An error occurred while loading the character model:', error);
});

// --- Create Aries Wall Rune ---
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

// --- Create Libra Box Rune ---
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
    runeLibraSymbol.translateY(-0.17);
    runeLibraSymbol.translateX(0);
    runeLibraSymbol.scale.set(0.002, 0.002, 0.002);
    //runeLibra.add(tempDot);
    runeLibra.add(runeLibraSymbol);
    runeLibra.add(libraLight);
    runeLibra.scale.set(0.1,0.1,0.1);
    runeLibra.position.set(0.11, 0.17, 0.12);
    runeLibra.rotateX(Math.PI/2);
    runeLibra.rotateZ(Math.PI/2);
    //scene.add(runeLibra);
    strongbox.add(runeLibra);
}, undefined, function (error) {
    console.error('An error occurred while loading the character model:', error);
});

// --- Create Libra Wall Rune ---
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


//x = 1.6 to -0.05
let prevPosition = camera.position;
// --- Create Capricorn Box Rune ---
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
    runeCapricornSymbol.scale.set(0.0002, 0.0002, 0.0002);
    runeCapricornSymbol.translateY(0);
    runeCapricornSymbol.translateZ(0);
    //runeCapricornSymbol.translateX
    //runeCapricorn.add(tempDot);
    runeCapricorn.add(runeCapricornSymbol);
    runeCapricorn.add(capricornLight);
    //scene.add(runeCapricorn);
    runeCapricorn.scale.set(0.2,0.2,0.2);
    runeCapricorn.rotateY(Math.PI)
    runeCapricorn.position.set(0.11, 0.17, -0.12);
    //runeCapricorn.rotateX(Math.PI/2);
    runeCapricorn.rotateY(-Math.PI/2);
    strongbox.add(runeCapricorn);
}, undefined, function (error) {
    console.error('An error occurred while loading the character model:', error);
});

// --- Create Capricorn Wall Rune ---
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

// --- Keyboard controls ---
const keysPressed = {};
document.addEventListener('keydown', (event) => {
    keysPressed[event.key.toLowerCase()] = true;
});
document.addEventListener('keyup', (event) => {
    keysPressed[event.key.toLowerCase()] = false;
    // -- Flashlight control --
    if (event.key.toLowerCase() == 'f'){
        if (flashlight.intensity != 0){
            flashlight.intensity = 0;
        }
        else{
            flashlight.intensity = 4;
        }
    }
});

// --- Book Light flicker ---
function bookLightLoop(){
    let elapsed = clock.getElapsedTime();
    let bookLightInt = 0.3*Math.cos(0.5*elapsed);
    if (bookLightInt < 0.1){
        bookLightInt = 0.1;
    }
    //let ariesRuneOp = 1*Math.cos(0.8*elapsed);
    bookLight.intensity = bookLightInt;
    //capricornMat.emissiveIntensity = capricornRuneEm;
    //capricornMat.opacity = capricornRuneEm;
}

// --- Aries Box Rune Debug flicker ---
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

// --- Capricorn Box Rune Debug flicker ---
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



// --- Libra Box Rune Debug flicker ---
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


// --- Libra Wall Rune Update as lights come near it ---
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
    if ((front && flashlight.intensity > 0) ||(libraSpirit.position.distanceTo(libraWallMarker.position) <= 0.6 && libraSpiritLight.intensity >= 0.04)) { 
        angle  = pos.angleTo( lookDirection );
        libraWallRuneInt = libraWallRuneInt + 0.004;
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

// --- When Libra Wall Rune is found, Libra rune on box lights up ---
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

// --- Capricorn Wall Rune Update as lights come near it ---
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
    if (front && flashlight.intensity > 0||(capricornSpirit.position.distanceTo(capricornWallMarker.position) <= 0.6 && capricornSpiritLight.intensity >= 0.04)) { 
        angle  = pos.angleTo( lookDirection );
        capricornWallRuneInt = capricornWallRuneInt + 0.004;
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
// --- When Capricorn Wall Rune is found, Capricorn rune on box lights up ---
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

// --- Aries Wall Rune Update as lights come near it ---
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
        ariesWallRuneInt = ariesWallRuneInt + 0.004;
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
// --- When Aries Wall Rune is found, Aries rune on box lights up ---
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

// --- Check collision of camera/player with objects and walls in room ---
function checkCollision(){
    let cameraX = camera.position.x;
    let cameraZ = camera.position.z;
    if (cameraX >= 1.6){
        camera.position.x = 1.6;
    }
    if (cameraX <= -1.6){
        camera.position.x = -1.6;    
    }
    if (cameraZ >= 1.6){
        camera.position.z = 1.6;
    }
    if (cameraZ <= -1.6){
        camera.position.z = -1.6;    
    }
    if (cameraZ <= 0.9 && cameraZ >= -0.9 && cameraX >= -0.1 && cameraX <= 1.7){
        if (Math.abs(cameraZ-0.9) < Math.abs(cameraZ+0.9)){
            camera.position.z = 0.9; 
        }
        else{
            camera.position.z = -0.9;   
        }
        
    }
    if (cameraZ <= 0.4 && cameraZ >= -0.4 && cameraX >= -0.6 && cameraX <= -0.1){
        if (Math.abs(cameraZ-0.4) < Math.abs(cameraZ+0.4)){
            camera.position.z = 0.4; 
        }
        else{
            camera.position.z = -0.4;   
        }
    }
    if (cameraX >= -0.25 && ((cameraZ >= 0.3 && cameraZ <= 0.8)||(cameraZ >= -0.8 && cameraZ <= -0.3))){
        camera.position.x = -0.25
    }
    if (cameraX >= -0.7 && ((cameraZ >= -0.2 && cameraZ <= 0.2))){
        camera.position.x = -0.7
    }
}

// --- Info Panel for Debugging ---
function updateInfoPanel(text){
    document.getElementById("infoPanel").innerText = text;
}
// --- Teal Sprite Setup ---
let libraWallMarker = new THREE.Object3D();
//let libraWallMarkerSprite = new THREE.Mesh(new THREE.SphereGeometry(0.01,32, 16),new THREE.MeshBasicMaterial({color:ariesRuneColor,emissive:ariesRuneColor,emissiveIntensity:0.5}));
//libraWallMarker.add(libraWallMarkerSprite);
libraWallMarker.position.set(0,0,1.75)
scene.add(libraWallMarker);
let libraSpirit = new THREE.Object3D();
let libraSpiritSprite = new THREE.Mesh(new THREE.SphereGeometry(0.01,32, 16),new THREE.MeshBasicMaterial({color:libraRuneColor,emissive:libraRuneColor,emissiveIntensity:0.5,transparent:true,opacity:0.7}));
let libraSpiritLight = new THREE.PointLight(libraRuneColor, 0.1, 0.5,2);
libraSpirit.add(libraSpiritSprite);
libraSpirit.add(libraSpiritLight);
scene.add(libraSpirit)

// --- Teal sprite moving around ---
function updateLibraSpirt(){
    let elapsedTime = clock.getElapsedTime()
    let libraSpiritXSpeed = 0.05*Math.cos(0.4*elapsedTime)+0.05;
    let libraSpiritZSpeed = 0.05*Math.cos(0.4*elapsedTime+0.8)+0.05;
    let libraSpiritYSpeed = 0.05*Math.cos(0.4*elapsedTime-1.3)+0.05;
    let libraSpiritX = 1.6*Math.cos(libraSpiritXSpeed*elapsedTime + 0.5);
    let libraSpiritZ = 1.6*Math.cos(libraSpiritZSpeed*elapsedTime -0.9) ;
    let libraSpiritY = 0.3*Math.sin(libraSpiritYSpeed*elapsedTime +1) ;
    let libraSpiritEm = 0.5*Math.cos(0.4*elapsedTime+0.5);
    let libraSpiritLightEm = 0.1*Math.cos(0.4*elapsedTime+0.5);
    let libraSpiritOp = 0.7*Math.cos(0.4*elapsedTime+0.5);
    if (libraSpiritOp < 0){
        libraSpiritOp = 0
    }
    if (libraSpiritEm < 0){
        libraSpiritEm = 0
    }
    if (libraSpiritLightEm < 0){
        libraSpiritLightEm = 0
    }
    libraSpiritSprite.material.emissiveIntensity = libraSpiritEm;
    libraSpiritSprite.material.opacity = libraSpiritOp;
    libraSpiritLight.intensity = libraSpiritLightEm;
    libraSpirit.position.set(libraSpiritX,libraSpiritY,libraSpiritZ);
    //let tempText = libraSpiritX + "," + libraSpiritY + "," + libraSpiritZ
    //updateInfoPanel(tempText)
}

// --- Purple Sprite setup ---
let capricornWallMarker = new THREE.Object3D();
let capricornWallMarkerSprite = new THREE.Mesh(new THREE.SphereGeometry(0.01,32, 16),new THREE.MeshBasicMaterial({color:ariesRuneColor,emissive:ariesRuneColor,emissiveIntensity:0.5}));
//capricornWallMarker.add(capricornWallMarkerSprite);
capricornWallMarker.position.set(-1.6,-0.9,1.6)
scene.add(capricornWallMarker);
let capricornSpirit = new THREE.Object3D();
let capricornSpiritSprite = new THREE.Mesh(new THREE.SphereGeometry(0.01,32, 16),new THREE.MeshBasicMaterial({color:capricornRuneColor,emissive:capricornRuneColor,emissiveIntensity:0.5,transparent:true,opacity:0.7}));
let capricornSpiritLight = new THREE.PointLight(capricornRuneColor, 0.1, 0.5,2);
capricornSpirit.add(capricornSpiritSprite);
capricornSpirit.add(capricornSpiritLight);
scene.add(capricornSpirit)

// --- Purple sprite moving around ---
function updateCapricornSpirt(){
    let elapsedTime = clock.getElapsedTime()
    let capricornSpiritXSpeed = 0.07*Math.cos(0.4*elapsedTime+0.2)+0.07;
    let capricornSpiritZSpeed = 0.07*Math.cos(0.4*elapsedTime+0.1)+0.07;
    let capricornSpiritYSpeed = 0.07*Math.cos(0.4*elapsedTime+0.6)+0.07;
    let capricornSpiritX = 1.6*Math.cos(capricornSpiritXSpeed*elapsedTime + 0.1);
    let capricornSpiritZ = 1.6*Math.cos(capricornSpiritZSpeed*elapsedTime -1.6) ;
    let capricornSpiritY = 0.95*Math.sin(capricornSpiritYSpeed*elapsedTime +0.2) ;
    let capricornSpiritEm = 0.5*Math.cos(0.6*elapsedTime+0.5);
    let capricornSpiritLightEm = 0.1*Math.cos(0.6*elapsedTime+0.5);
    let capricornSpiritOp = 0.7*Math.cos(0.6*elapsedTime+0.5);
    if (capricornSpiritOp < 0){
        capricornSpiritOp = 0
    }
    if (capricornSpiritEm < 0){
        capricornSpiritEm = 0
    }
    if (capricornSpiritLightEm < 0){
        capricornSpiritLightEm = 0
    }
    capricornSpiritSprite.material.emissiveIntensity = capricornSpiritEm;
    capricornSpiritSprite.material.opacity = capricornSpiritOp;
    capricornSpiritLight.intensity = capricornSpiritLightEm;
    capricornSpirit.position.set(capricornSpiritX,capricornSpiritY,capricornSpiritZ);
}
// --- Function to move the character based on keyboard input ---
let bookNotPicked = true
let chestClosed = true
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
        // -- Pointerlock controls --
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
       // -- Popup for interaction with book once revealed --
        if (camera.position.distanceTo(strongbox.position) <= 1.3 && ariesWallRuneFound && libraWallRuneFound && capricornWallRuneFound && bookNotPicked){
            document.getElementById("interactionPopUp").style.display="block";
        }
        else{
            document.getElementById("interactionPopUp").style.display="none"; 
        }
        // -- Interaction with book --
        if (keysPressed['e'] && !chestClosed) {
            bookNotPicked = false
            bookObj.visible = false
        }
    }
    //let tempText = camera.position.distanceTo(strongbox.position);
    //updateInfoPanel(tempText)
    checkCollision()
}







// --- Function to update the camera position to follow the character ---
function updateCamera() {
    let rayOrig = camera.position;
    var lookDirection = new THREE.Vector3(); 
    flashlight.getWorldDirection(lookDirection).normalize();
    let rayDir = lookDirection;
    rayDir.normalize();
    let testRay = new THREE.Ray(rayOrig,rayDir)
    //let intersects1 = raycaster.intersectObjects(bedroom.children);
    //let intersects2 = raycaster.intersectObjects(scene.children);
    let intersectsBed = testRay.intersectsBox(bedBB);
    //console.log(intersects1);
    //console.log(intersects2);
}

// Create a simple floor for the room
const floorGeometry = new THREE.BoxGeometry(20, 0.1, 20);
const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x1a130f });
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.position.set(0, -1, 0); // Position the floor
scene.add(floor);
clock.start();
// Animation loop
let notPlayed = true
function animate() {
    let deltaSeconds = clock.getDelta();
    //mixerChest.setTime( mixerChest.time + (deltaSeconds * mixerChest.timeScale) );
    requestAnimationFrame(animate);
    // --- Open the chest after all runes have been found ---
    if (ariesWallRuneFound && libraWallRuneFound && capricornWallRuneFound && chestClosed){
        bookObj.visible = true
        chestClosed = false
    }
    // Update camera and character movement
    moveCharacter();
    updateCamera();
    //runeAriesLightLoop();
    //runeLibraLightLoop();
    //runeCapricornLightLoop();
    bookLightLoop();
    updateLibraWallRune();
    libraBoxRuneUpdate();
    updateCapricornWallRune();
    capricornBoxRuneUpdate();
    updateAriesWallRune();
    ariesBoxRuneUpdate();
    updateLibraSpirt();
    updateCapricornSpirt();
    //let tempBox = libraSpirit.position.distanceTo(libraWallMarker.position);
    //updateInfoPanel(tempBox)
    renderer.render(scene, camera);
}
animate();
