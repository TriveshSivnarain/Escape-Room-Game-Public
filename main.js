import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';


const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);


const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(10, 10, 10);
scene.add(directionalLight);


let playerBox = new THREE.Box3();
let objectBoxes = [];


function checkCollisions() {
    playerBox.setFromCenterAndSize(controls.getObject().position, new THREE.Vector3(1, 2, 1)); 
  
    for (const objectBox of objectBoxes) {
      if (playerBox.intersectsBox(objectBox)) {
        console.log('Collision detected!');
        return true; 
      }
    }
    return false; 
  }
  

function createRoom() {
  const room = new THREE.Group();

  const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x808080 });
  const wallMaterial = new THREE.MeshStandardMaterial({ color: 0xa0a0a0 });

  
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), floorMaterial);
  floor.rotation.x = -Math.PI / 2; 
  floor.position.y = 0;
  room.add(floor);
  

  
  const backWall = new THREE.Mesh(new THREE.PlaneGeometry(10, 5), wallMaterial);
  backWall.position.set(0, 2.5, -5);
  room.add(backWall);
  objectBoxes.push(new THREE.Box3().setFromObject(backWall));

  
  const leftWall = new THREE.Mesh(new THREE.PlaneGeometry(10, 5), wallMaterial);
  leftWall.rotation.y = Math.PI / 2;
  leftWall.position.set(-5, 2.5, 0);
  room.add(leftWall);
  objectBoxes.push(new THREE.Box3().setFromObject(leftWall));

  
  const rightWall = new THREE.Mesh(new THREE.PlaneGeometry(10, 5), wallMaterial);
  rightWall.rotation.y = -Math.PI / 2;
  rightWall.position.set(5, 2.5, 0);
  room.add(rightWall);
  objectBoxes.push(new THREE.Box3().setFromObject(rightWall));
  

  return room;
}

const room = createRoom();
scene.add(room);



function createTable() {
  const tableGroup = new THREE.Group();

  const tableTop = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.1, 1), new THREE.MeshStandardMaterial({ color: 0x8B4513 }));
  const leg1 = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1), new THREE.MeshStandardMaterial({ color: 0x8B4513 }));
  const leg2 = leg1.clone();
  const leg3 = leg1.clone();
  const leg4 = leg1.clone();

  leg1.position.set(-0.65, -0.55, -0.45);
  leg2.position.set(0.65, -0.55, -0.45);
  leg3.position.set(-0.65, -0.55, 0.45);
  leg4.position.set(0.65, -0.55, 0.45);

  tableGroup.add(tableTop, leg1, leg2, leg3, leg4);
  tableGroup.position.set(0, 0.55, -2);

  return tableGroup;
}

const table = createTable();
scene.add(table);
objectBoxes.push(new THREE.Box3().setFromObject(table));


function createOpenLaptop() {
    const laptopGroup = new THREE.Group();

    
    const baseGeometry = new THREE.BoxGeometry(0.8, 0.05, 0.5); 
    const baseMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 }); 
    const laptopBase = new THREE.Mesh(baseGeometry, baseMaterial);
    laptopBase.position.set(0, 0, 0); 

    
    const screenGeometry = new THREE.BoxGeometry(0.8, 0.55, 0.02); 
    const screenMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 }); 
    const laptopScreen = new THREE.Mesh(screenGeometry, screenMaterial);

    
    laptopScreen.position.set(0, 0.25, -0.25); 

    
    laptopGroup.add(laptopBase);
    laptopGroup.add(laptopScreen);

    return laptopGroup;
}


function createTableWithLaptop() {
    const tableGroup = new THREE.Group();

    
    const tableTop = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.1, 1), new THREE.MeshStandardMaterial({ color: 0x8B4513 }));
    const leg1 = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1), new THREE.MeshStandardMaterial({ color: 0x8B4513 }));
    const leg2 = leg1.clone();
    const leg3 = leg1.clone();
    const leg4 = leg1.clone();

    leg1.position.set(-0.65, -0.55, -0.45);
    leg2.position.set(0.65, -0.55, -0.45);
    leg3.position.set(-0.65, -0.55, 0.45);
    leg4.position.set(0.65, -0.55, 0.45);

    tableGroup.add(tableTop, leg1, leg2, leg3, leg4);
    tableGroup.position.set(-2.5, 0.55, -3); 

    
    const laptop = createOpenLaptop();
    laptop.position.set(0, 0.1, 0); 
    tableGroup.add(laptop); 

    return tableGroup;
}


const table1WithLaptop = createTableWithLaptop();
scene.add(table1WithLaptop);
objectBoxes.push(new THREE.Box3().setFromObject(table1WithLaptop));






function createBook() {
  const bookGroup = new THREE.Group();

  const coverGeometry = new THREE.BoxGeometry(0.7, 0.1, 0.5);
  const coverMaterial = new THREE.MeshStandardMaterial({ color: 0x2E2B5F });
  const cover = new THREE.Mesh(coverGeometry, coverMaterial);

  const pagesGeometry = new THREE.BoxGeometry(0.65, 0.08, 0.45);
  const pagesMaterial = new THREE.MeshStandardMaterial({ color: 0xFFFFFF });
  const pages = new THREE.Mesh(pagesGeometry, pagesMaterial);

  cover.position.set(0, 0.05, 0);
  pages.position.set(0, 0, 0);

  bookGroup.add(cover);
  bookGroup.add(pages);

  bookGroup.position.set(0, 0.6, -2);

  return bookGroup;
}

const book = createBook();
scene.add(book);


function createLamp() {
  const lampGroup = new THREE.Group();

  
  const baseGeometry = new THREE.CylinderGeometry(0.2, 0.4, 0.1, 32);
  const baseMaterial = new THREE.MeshStandardMaterial({ color: 0x808080 });
  const base = new THREE.Mesh(baseGeometry, baseMaterial);

  
  const standGeometry = new THREE.CylinderGeometry(0.05, 0.05, 1, 32);
  const standMaterial = new THREE.MeshStandardMaterial({ color: 0x555555 });
  const stand = new THREE.Mesh(standGeometry, standMaterial);
  stand.position.set(0, 0.6, 0); 

  
  const shadeGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.5, 32);
  const shadeMaterial = new THREE.MeshStandardMaterial({ color: 0xffff00 });
  const shade = new THREE.Mesh(shadeGeometry, shadeMaterial);
  shade.position.set(0, 1.25, 0); 

  lampGroup.add(base);
  lampGroup.add(stand);
  lampGroup.add(shade);

  lampGroup.position.set(2, 0, -4); 
  return lampGroup;
}

const lamp = createLamp();
scene.add(lamp);
objectBoxes.push(new THREE.Box3().setFromObject(lamp));

function createChair() {
    const chairGroup = new THREE.Group();
  
    
    const seatGeometry = new THREE.BoxGeometry(1, 0.1, 1);
    const seatMaterial = new THREE.MeshStandardMaterial({ color: 0x0033cc });
    const seat = new THREE.Mesh(seatGeometry, seatMaterial);
  
    
    const backGeometry = new THREE.BoxGeometry(1, 1, 0.1);
    const backMaterial = new THREE.MeshStandardMaterial({ color: 0x0033cc });
    const back = new THREE.Mesh(backGeometry, backMaterial);
    back.position.set(0, 0.5, -0.45); 
  
    
    const legGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.9);
    const leg1 = new THREE.Mesh(legGeometry, new THREE.MeshStandardMaterial({ color: 0x654321 }));
    const leg2 = leg1.clone();
    const leg3 = leg1.clone();
    const leg4 = leg1.clone();
  
    leg1.position.set(-0.45, -0.45, -0.45);
    leg2.position.set(0.45, -0.45, -0.45);
    leg3.position.set(-0.45, -0.45, 0.45);
    leg4.position.set(0.45, -0.45, 0.45);
  
    chairGroup.add(seat, back, leg1, leg2, leg3, leg4);
  
    
    const noteGeometry = new THREE.PlaneGeometry(0.5, 0.3); 
    const noteMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff }); 
    const note = new THREE.Mesh(noteGeometry, noteMaterial);
  
    
    note.rotation.x = -Math.PI / 2; 
    note.position.set(0, 0.06, 0); 
  
    chairGroup.add(note); 
  
    chairGroup.position.set(3.5, 0.5, -3); 
  
    return chairGroup;
  }
  
  const chair = createChair();
  scene.add(chair);
  objectBoxes.push(new THREE.Box3().setFromObject(chair));
  


camera.position.set(0, 1.5, 5);


const controls = new PointerLockControls(camera, document.body);

document.addEventListener('keydown', (event) => {
    let moveX = 0, moveZ = 0;
    
    if (event.code === 'KeyW') {
      moveZ = 0.1;
    } else if (event.code === 'KeyS') {
      moveZ = -0.1;
    } else if (event.code === 'KeyA') {
      moveX = -0.1;
    } else if (event.code === 'KeyD') {
      moveX = 0.1;
    }
  
    
    const originalPosition = controls.getObject().position.clone();
  
    
    controls.moveForward(moveZ);
    controls.moveRight(moveX);
  
    
    if (checkCollisions()) {
      controls.getObject().position.copy(originalPosition); 
    }
  });
  


const interactionText = document.createElement('div');
interactionText.style.position = 'absolute';
interactionText.style.top = '10px';
interactionText.style.left = '10px';
interactionText.style.color = 'white';
interactionText.style.fontFamily = 'Arial, sans-serif';
interactionText.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
interactionText.style.padding = '10px';
interactionText.style.display = 'none';
document.body.appendChild(interactionText);


const messagePopup = document.createElement('div');
messagePopup.style.position = 'absolute';
messagePopup.style.bottom = '20px';
messagePopup.style.left = '50%';
messagePopup.style.transform = 'translateX(-50%)';
messagePopup.style.color = 'white';
messagePopup.style.fontFamily = 'Arial, sans-serif';
messagePopup.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
messagePopup.style.padding = '20px';
messagePopup.style.borderRadius = '10px';
messagePopup.style.display = 'none'; 
document.body.appendChild(messagePopup);

let gameOver = false; 


const timerText = document.createElement('div');
timerText.style.position = 'absolute';
timerText.style.top = '10px';
timerText.style.right = '10px'; 
timerText.style.color = 'yellow';
timerText.style.fontFamily = 'Arial, sans-serif';
timerText.style.fontSize = '24px';
timerText.style.paddingBottom = '10px'; 
document.body.appendChild(timerText);

let countdown = 300; 


const mistakeCounterText = document.createElement('div');
mistakeCounterText.style.position = 'absolute';
mistakeCounterText.style.top = '50px'; 
mistakeCounterText.style.right = '10px'; 
mistakeCounterText.style.color = 'red';
mistakeCounterText.style.fontFamily = 'Arial, sans-serif';
mistakeCounterText.style.fontSize = '24px';
mistakeCounterText.style.paddingTop = '10px'; 
mistakeCounterText.innerHTML = 'Lives: 3';  
document.body.appendChild(mistakeCounterText);

let mistakeCounter = 3; 


function restartGame() {
  if (!gameOver) {
    gameOver = true; 
    alert("Game Over! Restarting the game.");
    
    
    setTimeout(() => {
      window.location.reload();
    }, 0); 
  }
}


function updateMistakeCounter() {
  mistakeCounter--;
  mistakeCounterText.innerHTML = `Lives: ${mistakeCounter}`;
  if (mistakeCounter === 0 && !gameOver) {
    restartGame();
  }
}


function updateTimer() {
  countdown--;
  const minutes = Math.floor(countdown / 60);
  const seconds = countdown % 60;
  timerText.innerHTML = `Time: ${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  if (countdown <= 0 && !gameOver) {
    restartGame(); 
  }
}


setInterval(updateTimer, 1000); 






let isNearBook = false;
let isNearLaptop = false;
let isNearNote = false;
let hasInteracted = false;


const firstRiddleClue = `
The Sum of What Was Lost

This book holds the secret to the years of life lost by the family.
The father’s pursuit of eternal life led to their untimely deaths.

Here are the years they lived:

Father: 1820 - 1885 (65 years)
Mother: 1835 - 1870 (35 years)
Daughter: 1855 - 1880 (25 years)
`;

const secondRiddleClue = `
The laptop, as dark as the secrets it hides, rests before a truth in plain sight. The number behind it is your key. Count carefully.
`;

const thirdRiddleClue = `
I sat here every night watching Father’s madness take over. His experiments, his work… always in the blue glow of the lamp. 
The same color as the dress Mother used to wear when she begged him to stop. But he never listened. 
I know the chair’s color well, it is the same as my sorrow, the same as the light that filled this room...

`;


const firstRiddleQuestion = "Riddle 1: What's the sum of what was lost, the years of those who paid the cost?";
const secondRiddleQuestion = "Riddle 2: Behind the screen lies a number of significance, what is the number that stands unseen?";
const thirdRiddleQuestion = "Riddle 3: The chair holds the truth, bathed in sorrow. What is the color that ruled their tomorrow?";


function playWrongAnswerAudio() {
  const audio = new Audio('assets/undertaker.mp3');
  audio.play();
  setTimeout(() => {
    audio.pause(); 
  }, 3000);
}

let riddle1Solved = false;
let riddle2Solved = false;
let riddle3Solved = false;

function checkIfAllRiddlesSolved() {
  if (riddle1Solved && riddle2Solved && riddle3Solved) {
    alert("Congratulations! You've solved all the riddles and escaped successfully.");
    window.location.reload(); 
  }
}


function promptRiddle(riddleQuestion, correctAnswer, riddleNumber) {
  setTimeout(() => {
    const answer = prompt(riddleQuestion);
    if (answer.trim().toLowerCase() === correctAnswer.trim().toLowerCase()) {  
      alert("Correct! You've solved the riddle.");
      if (riddleNumber === 1) {
        riddle1Solved = true;
      } else if (riddleNumber === 2) {
        riddle2Solved = true;
      } else if (riddleNumber === 3) {
        riddle3Solved = true;
      }
      checkIfAllRiddlesSolved(); 
    } else {
      alert("Incorrect! Try again.");
      updateMistakeCounter(); 
      playWrongAnswerAudio(); 
    }
    hasInteracted = false; 
  }, 1000); 
}


document.addEventListener('keydown', (event) => {
  if (event.code === 'KeyE' && !hasInteracted) {
    if (isNearBook && !riddle1Solved) {  
      messagePopup.innerHTML = firstRiddleClue;
      messagePopup.style.display = 'block';

      setTimeout(() => {
        messagePopup.style.display = 'none';
        promptRiddle(firstRiddleQuestion, "125", 1); 
      }, 20000);

      hasInteracted = true;
    } else if (isNearLaptop && !riddle2Solved) {
      messagePopup.innerHTML = secondRiddleClue;
      messagePopup.style.display = 'block';

      setTimeout(() => {
        messagePopup.style.display = 'none';
        promptRiddle(secondRiddleQuestion, "13", 2); 
      }, 10000);

      hasInteracted = true;
    } else if (isNearNote && !riddle3Solved) {
      messagePopup.innerHTML = thirdRiddleClue;
      messagePopup.style.display = 'block';

      setTimeout(() => {
        messagePopup.style.display = 'none';
        promptRiddle(thirdRiddleQuestion, "blue", 3); 
      }, 25000);

      hasInteracted = true;
    }
  }
});



function checkProximity() {
    const playerPosition = controls.getObject().position;
  
    
    const distanceToBook = playerPosition.distanceTo(book.position);
    if (distanceToBook < 2) {
      interactionText.innerHTML = 'Press E to read the book';
      interactionText.style.display = 'block';
      isNearBook = true;
    } else {
      isNearBook = false;
    }
  
    
    const distanceToLaptop = playerPosition.distanceTo(table1WithLaptop.position);
    if (distanceToLaptop < 2) {
      interactionText.innerHTML = 'Press E to check the laptop';
      interactionText.style.display = 'block';
      isNearLaptop = true;
    } else {
      isNearLaptop = false;
    }
  
    
    const distanceToChair = playerPosition.distanceTo(chair.position);
    if (distanceToChair < 2) {
      interactionText.innerHTML = 'Press E to inspect the note';
      interactionText.style.display = 'block';
      isNearNote = true;
    } else {
      isNearNote = false;
    }
  
    
    if (!isNearBook && !isNearLaptop && !isNearNote) {
      interactionText.style.display = 'none';
      hasInteracted = false;
    }
  }
  
  
  document.addEventListener('keydown', (event) => {
    if (event.code === 'KeyE' && !hasInteracted) {
      if (isNearBook) {
        messagePopup.innerHTML = firstRiddleClue;
        messagePopup.style.display = 'block';
  
        
        setTimeout(() => {
          messagePopup.style.display = 'none';
          promptRiddle(firstRiddleQuestion, "125");
        }, 1000);
  
        hasInteracted = true;
      } else if (isNearLaptop) {
        messagePopup.innerHTML = secondRiddleClue;
        messagePopup.style.display = 'block';
  
        
        setTimeout(() => {
          messagePopup.style.display = 'none';
          promptRiddle(secondRiddleQuestion, "1");
        }, 1000);
  
        hasInteracted = true;
      } else if (isNearNote) {
        messagePopup.innerHTML = thirdRiddleClue;
        messagePopup.style.display = 'block';
  
        
        setTimeout(() => {
          messagePopup.style.display = 'none';
          promptRiddle(thirdRiddleQuestion, "blue");
        }, 1000);
  
        hasInteracted = true;
      }
    }
  });

  const fontLink = document.createElement('link');
  fontLink.href = "https://fonts.googleapis.com/css2?family=Creepster&display=swap";
  fontLink.rel = "stylesheet";
  document.head.appendChild(fontLink);
  
  // Ensure the font is loaded before creating the text
  document.fonts.ready.then(() => {
      // Create the text after the font is ready
      const bloodTextWithDrips = createBloodTextWithDrips();
      scene.add(bloodTextWithDrips);
  
      const bloodTextWithDripsSecond = createBloodTextWithDripsSecond();
      scene.add(bloodTextWithDripsSecond);
  });
  
  function createBloodTextWithDrips() {
      const canvas = document.createElement('canvas');
      canvas.width = 2048; 
      canvas.height = 1024; 
      const context = canvas.getContext('2d');
  
      context.fillStyle = 'rgba(0, 0, 0, 0)'; 
      context.fillRect(0, 0, canvas.width, canvas.height);
  
      context.fillStyle = '#8B0000'; 
      context.font = 'bold 300px "Creepster"'; 
      context.fillText('It Watches You...!', 50, 300); 
  
      createBloodDrips(context);
  
      const texture = new THREE.CanvasTexture(canvas);
      const bloodTextGeometry = new THREE.PlaneGeometry(4, 2); 
      const bloodTextMaterial = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
      const bloodTextMesh = new THREE.Mesh(bloodTextGeometry, bloodTextMaterial);
  
      bloodTextMesh.position.set(0, 2, -4.99); 
  
      return bloodTextMesh;
  }
  
  function createBloodTextWithDripsSecond() {
      const canvas = document.createElement('canvas');
      canvas.width = 1024; 
      canvas.height = 512; 
      const context = canvas.getContext('2d');
  
      context.fillStyle = 'rgba(0, 0, 0, 0)'; 
      context.fillRect(0, 0, canvas.width, canvas.height);
  
      context.fillStyle = '#8B0000'; 
      context.font = 'bold 100px "Creepster"'; 
      context.fillText('13', 50, 300); 
  
      createBloodDrips(context);
  
      const texture = new THREE.CanvasTexture(canvas);
      const bloodTextGeometry = new THREE.PlaneGeometry(4, 2); 
      const bloodTextMaterial = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
      const bloodTextMesh = new THREE.Mesh(bloodTextGeometry, bloodTextMaterial);
  
      bloodTextMesh.position.set(-1.1, 2, -4.99); 
  
      return bloodTextMesh;
  }
  
  function createBloodDrips(context) {
      context.beginPath();
      drawDrip(context, 150, 310, 150, 400); 
      drawDrip(context, 200, 310, 200, 450); 
      drawDrip(context, 450, 310, 450, 380); 
      drawDrip(context, 600, 310, 600, 440); 
      context.closePath();
      context.fill();
  }
  
  function drawDrip(context, startX, startY, endX, endY) {
      context.moveTo(startX, startY);
      context.lineTo(endX, endY); 
      context.strokeStyle = '#8B0000'; 
      context.lineWidth = 10; 
      context.stroke();
  
      context.beginPath();
      context.arc(endX, endY, 10, 0, 2 * Math.PI); 
      context.fillStyle = '#8B0000'; 
      context.fill();
  }

function animate() {
  requestAnimationFrame(animate);
  checkProximity();
  renderer.render(scene, camera);
}

animate();
