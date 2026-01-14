let canvas = document.querySelector('canvas');
let c = canvas.getContext('2d');

// 0 = empty
// 1 = wall
// 2 = door
// 3 = lever
// 4 = glass
// 5 = key
// 6 = goal

// MAP = 20x17
const MAP = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,5,1,1,1,0,1,1,1,1,1,1,0,1,1,1,1,1,0,1],
  [1,5,1,3,1,0,1,4,4,4,4,1,0,1,3,0,0,1,0,1],
  [1,0,1,1,1,0,1,4,0,0,4,1,0,1,1,1,0,1,0,1],
  [1,0,0,0,0,0,1,4,0,2,4,1,0,0,0,1,0,0,0,1],
  [1,1,1,1,1,0,1,4,4,4,4,1,1,1,0,1,1,1,0,1],
  [1,0,0,0,1,0,0,0,0,0,0,0,0,1,0,0,0,1,0,1],
  [1,0,1,0,1,1,1,1,2,1,1,1,0,1,1,1,0,1,0,1],
  [1,0,1,0,0,0,0,1,0,1,0,0,0,0,0,1,0,0,0,1],
  [1,0,1,1,1,1,0,1,0,1,0,1,1,1,0,1,1,1,0,1],
  [1,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,0,1],
  [1,1,1,1,0,1,1,1,0,1,1,1,0,1,1,1,1,1,0,1],
  [1,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1],
  [1,0,2,1,1,1,0,1,1,1,0,1,1,1,0,1,1,1,0,1],
  [1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,6,3,0,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

const REQUIRED_KEYS = 3;
let msg = ''
const W = canvas.width = window.innerWidth;
const H = canvas.height = window.innerHeight;
const rows = MAP.length;
const cols = MAP[0].length;
const doors = {};
const levers = {};
const keysMap = {};
const player = {
  x: 5,
  y: 5,
  angle: 0,
  pitch: 0,
  maxPitch: Math.PI / 4,
  fov: Math.PI / 2.4,
  turn: 0
};
const moveSpeed = 2.8;
const rotSpeed = 2.8;
let mouseX = 0;
let mouseY = 0;
let moveForward = 0;
let moveSide = 0;
let IsInteracting = false;
let gameRunning = false;
let goal = null;
const MENU = {
  START: "start",
  PAUSE: "pause",
  WIN: "win",
  NONE: "none"
};

let menuState = MENU.START;

(function scanMapForGoal(){
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (MAP[y][x] === 6) {
        goal = {
          x: x + 0.5,
          y: y + 0.5,
          mapX: x,
          mapY: y,
          reached: false
        };
        console.log(`Goal: ${x},${y}`);
        MAP[y][x] = 0;
      }
    }
  }
})();

(function scanMapForLevers(){
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (MAP[y][x] === 3) {
        levers[`${x},${y}`] = { pressed: false };
        console.log(`Lever: ${x},${y}`)
      }
    }
  }
})();

const items = [];

(function scanMapForKeys(){
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (MAP[y][x] === 5) {
        const keyObj = {
          x: x + 0.5,
          y: y + 0.5,
          picked: false,
          anim: Math.random() * 6,
          mapX: x,
          mapY: y
        };
        items.push(keyObj);
        keysMap[`${x},${y}`] = keyObj;
        MAP[y][x] = 0;
      }
    }
  }
})();

let keysCollected = 0;

(function scanMapForDoors(){
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (MAP[y][x] === 2) {
        doors[`${x},${y}`] = { 
          open: false, 
          height: 1,
          condition: null
        };;
        console.log(`Door: ${x},${y}`)
      }
    }
  }
})();

function doorCheck(door, pos, context) {
    const cond = door.condition || { type: "allKeys" };
    switch (cond.type) {
        case "allKeys":
          if (context.keysCollected >= context.requiredKeys) {
            return true;
          } else {
            return false;
          }
        case "specificKey":
          for (const keyPos in cond.states) {
            const expected = cond.states[keyPos];
            const actual = context.keys[keyPos]?.picked === true;
            if (actual !== expected) return false;
          }
          return true;
        case "levers":
          for (const leverPos in cond.states) {
            const expected = cond.states[leverPos];
            const actual = context.levers[leverPos]?.pressed ?? false;
            if (actual !== expected) return false;
          }
          return true;
        case "keyCount":
            return (context.player.keyCount?.[cond.keyType] || 0) >= cond.amount;
        case "totalKeys":
            return context.keysCollected >= cond.amount;
        case "custom":
            return typeof cond.check === "function" ? cond.check(door, pos, context) : false;
        default:
            return false;
    }
}

function doorSet(doors, pos, condition) {
    if (!doors[pos]) {
        console.warn("Door not found:", pos);
        return;
    }
    doors[pos].condition = condition;
}

function doorGet(doors, pos) {
    return doors[pos]?.condition || null;
}

function applyDefault(doors, type) {
  for (let pos in doors) {
    if (!doors[pos].condition) {
      doors[pos].condition = { type };
    }
  }
}


applyDefault(doors, "allKeys");
doorSet(doors, "8,8", {
  type: "levers",
  states: {
    "17,15": true
  }
});
// doorSet(doors, "2,14", {
//     type: "specificKey",
//     states: {
//       "1,1": true
//     }
// });
// doorSet(doors, "9,5", {
//   type: "custom",
//   check: (door, pos, ctx) =>
//     ctx.keys?.["1,1"]?.picked === true &&
//     ctx.levers?.["17,15"]?.pressed === true
// });



canvas.addEventListener("click", () => {
    canvas.requestPointerLock();
});

document.addEventListener("pointerlockchange", () => {
  const locked = document.pointerLockElement === canvas;
  if (!locked && gameRunning) {
    pauseGame();
  }
});

document.addEventListener("mousemove", e => {
    if (document.pointerLockElement === canvas) {
        const sensitivity = 0.0017;
        player.angle += e.movementX * sensitivity;
        player.pitch -= e.movementY * sensitivity;
        player.pitch = Math.max(-player.maxPitch, Math.min(player.maxPitch, player.pitch));
    }
});

document.addEventListener("keydown", e => {
  if (e.key === "Enter") {
    if (menuState === MENU.START || menuState === MENU.PAUSE) {
      startGame();
    }
    if (menuState === MENU.WIN) {
      startGame();
    }
  }
  if (e.key === "Escape") {
    if (gameRunning) {
      e.preventDefault();
      pauseGame();
    }
    if (!gameRunning && MENU.WIN) {
      document.exitPointerLock
    }
  }
  if (!gameRunning) return;

  if (e.key === "e") tryInteract();
  if (e.key === "w") moveForward = 1;
  if (e.key === "s") moveForward = -1;
  if (e.key === "a") moveSide = -1;
  if (e.key === "d") moveSide = 1;
});


document.addEventListener("keyup", e => {
  if (e.key === "w" || e.key === "s") moveForward = 0;
  if (e.key === "a" || e.key === "d") moveSide = 0;
  if (e.key === "ArrowLeft" || e.key === "ArrowRight") player.turn = 0;
});

let depthBuffer = new Float64Array(W);

const TILE0 = {
  ceiling: [180, 180, 180],
  floor:   [55, 55, 55]
};

function shadeColor(rgb, perpDist, factor) {
  const shade = Math.max(20, 255 - perpDist * factor);
  return `rgb(
    ${(rgb[0] * shade / 255) | 0},
    ${(rgb[1] * shade / 255) | 0},
    ${(rgb[2] * shade / 255) | 0}
  )`;
}

function castRays() {
  const pitchOffset = player.pitch * (H * 0.9);

  for (let col = 0; col < W; col++) {
    const rayAngle = player.angle - player.fov/2 + (col / W) * player.fov;
    const sin = Math.sin(rayAngle);
    const cos = Math.cos(rayAngle);

    let dist = 0;
    let hitTile = 0;
    let hitX = 0, hitY = 0;
    let glassHit = null;

    while (dist < 30) {
      dist += 0.02;
      const rx = player.x + cos * dist;
      const ry = player.y + sin * dist;
      const mx = Math.floor(rx);
      const my = Math.floor(ry);
      if (mx < 0 || my < 0 || mx >= MAP[0].length || my >= MAP.length) {
          hitTile = 1;
          break;
      }
      const tile = MAP[my][mx];
      if (tile === 4) {
        if (!glassHit) {
            glassHit = {
                dist,
                x: mx,
                y: my
            };
        }
      }
      if (tile === 1) {
          hitTile = 1;
          hitX = mx; hitY = my;
          break;
      }
      if (tile === 2) {
          const key = `${mx},${my}`;
          const d = doors[key];
          if (d && d.height > 0.02) {
            hitTile = 2;
            hitX = mx; hitY = my;
            break;
          }
          const allowed = doorCheck(d, key, {
              keysCollected,
              requiredKeys: REQUIRED_KEYS,
              player,
              levers,
              keys: keysMap
          });
          if (allowed) {
              d.open = true;
              hitTile = 2;
              hitX = mx;
              hitY = my;
              break;
          } else {
              showMsg('Door locked.', 900);
              hitTile = 2;
              hitX = mx;
              hitY = my;
              break;
          }
      }
      if (tile === 3) {
          const l = levers[`${mx},${my}`];
          if (l) {
              hitTile = 3;
              hitX = mx; hitY = my;
              break;
          }
      }
    }
    const perpDist = dist * Math.cos(rayAngle - player.angle);
    depthBuffer[col] = perpDist;
    let lineHeight = (H / (perpDist + 0.0001)) * 0.8;
    const wallTop = (H - lineHeight) / 2 + pitchOffset;
    const wallBottom = wallTop + lineHeight;
    let factor = 30

    // Ceiling
    c.fillStyle = shadeColor(TILE0.ceiling, perpDist, factor);
    c.fillRect(col, 0, 1, (H + wallTop)/2.5 + pitchOffset/2);

    // Floor
    c.fillStyle = shadeColor(TILE0.floor, perpDist, factor * 2);
    c.fillRect(col, wallBottom, 1, H - wallBottom);

    if (hitTile === 1) {
      const shade = Math.max(30, 255 - perpDist * factor) | 0;
      const fog = Math.min(perpDist * 12, 120) | 0;
      c.fillStyle = `rgb(
        ${Math.max(shade - fog, 10)},
        ${Math.max(shade - fog, 10)},
        ${Math.max(shade - fog, 10)}
      )`;
      c.fillRect(col, wallTop, 1, lineHeight);
    } else if (hitTile === 1) {
      const shade = Math.max(30, 255 - perpDist * factor) | 0;
      const fog = Math.min(perpDist * 12, 120) | 0;
      c.fillStyle = `rgb(
        ${Math.max(shade - fog, 20)},
        ${Math.max(shade - fog, 20)},
        ${Math.max(shade - fog, 20)}
      )`;
      c.fillRect(col, (H - lineHeight)/2 + pitchOffset, 1, lineHeight);
    } else if (hitTile === 2) {
      const key = `${hitX},${hitY}`;
      const d = doors[key];
      let hscale = d ? d.height : 1;
      let doorLineHeight = lineHeight * hscale;
      const shade = Math.max(30, 190 - perpDist * factor) | 0;
      const fog = Math.min(perpDist * 12, 120) | 0;
      c.fillStyle = `rgb(
        ${Math.max(shade/1.3 - fog, 20)},
        ${Math.max(shade/1.7 - fog, 20)},
        ${Math.max(shade/3 - fog, 20)}
      )`;
      c.fillRect(col, (H - doorLineHeight)/2 + pitchOffset, 1, doorLineHeight);
    } else if (hitTile === 3) { 
      const key = `${hitX},${hitY}`; 
      const lever = levers[key]; 
      const pressed = lever ? lever.pressed : false; 
      const shade = Math.max(30, 190 - perpDist * factor) | 0;
      const fog = Math.min(perpDist * 12, 120) | 0;
      const color = pressed ? `rgb(${Math.max(shade/1.1 - fog, 20)}, ${Math.max(shade/3 - fog, 20)}, ${Math.max(shade/3 - fog, 20)})` : `rgb(${Math.max(shade/3 - fog, 20)}, ${Math.max(shade/1.1 - fog, 20)}, ${Math.max(shade/3 - fog, 20)})`; 
      const small = lineHeight * 1; 
      const y = (H - small) / 2 + pitchOffset; 
      c.fillStyle = `${color}`;
      c.fillRect(col, y, 1, lineHeight);
    }
    if (glassHit) {
      const gDist = glassHit.dist * Math.cos(rayAngle - player.angle);
      const gHeight = (H / (gDist + 0.0001)) * 0.8;

      const gTop = (H - gHeight) / 2 + pitchOffset;

      const alpha = Math.max(0.5, 0.1 + gDist * 0.15);
      const shade = Math.max(50, 200 - gDist * 15) | 0;
      const fog = Math.min(perpDist * 12, 120) | 0;

      c.fillStyle = `rgba(${shade - fog, 40 / alpha},${shade - fog, 40 / alpha},${shade - fog, 40 / alpha},${alpha/2})`;
      c.fillRect(col, gTop, 1, gHeight);
    }
  }
}

let bobbing = 3;

function drawSprites(time) {
  const pitchOffset = player.pitch * (H * 0.9);
  const sprites = [];

  for (let item of items) {
    if (item.picked) continue;
    const dx = item.x - player.x;
    const dy = item.y - player.y;
    const dist = Math.hypot(dx, dy);
    let ang = Math.atan2(dy, dx) - player.angle;
    ang = (ang + Math.PI*3) % (Math.PI*2) - Math.PI;
    if (Math.abs(ang) > player.fov/2) continue;
    sprites.push({ type:'key', x:item.x, y:item.y, dist, ang, item });
  }
  for (let key in doors) {
    const [mx, my] = key.split(',').map(Number);
    const door = doors[key];
    const allowed = doorCheck(door, key, {
        keysCollected,
        requiredKeys: REQUIRED_KEYS,
        player,
        levers,
        keys: keysMap
    });
    if (!allowed) continue;
    const cx = mx + 0.5;
    const cy = my + 0.5;
    const dx = cx - player.x;
    const dy = cy - player.y;
    const dist = Math.hypot(dx, dy);
    let ang = Math.atan2(dy, dx) - player.angle;
    ang = (ang + Math.PI * 3) % (Math.PI * 2) - Math.PI;
    if (Math.abs(ang) <= player.fov / 2) {
      sprites.push({
          type: 'doorMark',
          x: cx,
          y: cy,
          dist,
          ang,
          doorKey: key
      });
      door.open = true; 
      door.height < 0.2;
    }
  }

  if (goal && !goal.reached) {
    const dx = goal.x - player.x;
    const dy = goal.y - player.y;
    const dist = Math.hypot(dx, dy);
    let ang = Math.atan2(dy, dx) - player.angle;
    ang = (ang + Math.PI*3) % (Math.PI*2) - Math.PI;

    if (Math.abs(ang) <= player.fov / 2) {
      sprites.push({
        type: 'goal',
        x: goal.x,
        y: goal.y,
        dist,
        ang
      });
    }
  }

  sprites.sort((a,b) => b.dist - a.dist);

  for (let s of sprites) {
    const screenX = (s.ang / (player.fov/2)) * (W/2) + (W/2);
    if (s.type === 'key') {
      const spriteHeight = (1 / s.dist) * 240;
      const spriteWidth  = spriteHeight * 0.7;
      const bob = Math.sin(s.item.anim + time*3) * 0.12;
      s.item.anim += 0.02;
      const y = (H/2) - spriteHeight + bob*30 + pitchOffset;
      const left = Math.floor(screenX - spriteWidth/2);
      const right = Math.floor(screenX + spriteWidth/2);
      for (let x = left; x <= right; x++) {
          if (x < 0 || x >= W) continue;
          if (depthBuffer[x] < s.dist) continue;
          c.fillStyle = '#ffdf66';
          c.fillRect(x, y, 1, spriteHeight);
      }
    } else if (s.type === 'doorMark') {
      const spriteHeight = (1 / s.dist) * 100;
      const spriteWidth  = spriteHeight * 1;
      const bob = Math.sin(bobbing + time*3) * 0.12;
      bobbing += 0.02;
      const y = (H/2) - spriteHeight + bob*30 + pitchOffset;
      const left = Math.floor(screenX - spriteWidth/2);
      const right = Math.floor(screenX + spriteWidth/2);
      for (let x = left; x <= right; x++) {
          if (x < 0 || x >= W) continue;
          // if (depthBuffer[x] < s.dist) continue;
          c.fillStyle = 'rgba(255,80,80,0.95)';
          c.fillRect(x, y, 1, spriteHeight);
      }
    } else if (s.type === 'goal') {
      const spriteHeight = (1 / s.dist) * 260;
      const spriteWidth  = spriteHeight * 0.9;
      const pulse = Math.sin(time * 4) * 0.15;
      const y = (H/2) - spriteHeight + pulse * 30 + pitchOffset;

      const left = Math.floor(screenX - spriteWidth / 2);
      const right = Math.floor(screenX + spriteWidth / 2);

      for (let x = left; x <= right; x++) {
        if (x < 0 || x >= W) continue;
        if (depthBuffer[x] < s.dist) continue;

        c.fillStyle = 'rgba(80,200,255,0.95)';
        c.fillRect(x, y, 1, spriteHeight);
      }
    }
  }
}

function tryInteract() {
    const reach = 1.2;
    const tx = player.x + Math.cos(player.angle) * reach;
    const ty = player.y + Math.sin(player.angle) * reach;
    const mx = Math.floor(tx);
    const my = Math.floor(ty);
    if (MAP[my] && MAP[my][mx] === 3) {
        const key = `${mx},${my}`;
        const lever = levers[key];
        if (!lever) return;
        lever.pressed = !lever.pressed;
        showMsg(lever.pressed ? "Lever activated!" : "Lever reset!", 1000);
    }
}

function checkPickups() {
  for (let it of items) {
    if (it.picked) continue;
    const dx = it.x - player.x;
    const dy = it.y - player.y;
    if (Math.hypot(dx,dy) < 0.55) {
      it.picked = true;
      keysCollected++;
      showMsg('Picked up a key.', 1100);
    }
  }
}

function checkGoal() {
  if (!goal || goal.reached) return;

  const dx = goal.x - player.x;
  const dy = goal.y - player.y;

  if (Math.hypot(dx, dy) < 0.6) {
    goal.reached = true;
    winGame();
  }
}

function animateDoors(dt) {
  for (let key in doors) {
    const d = doors[key];
    if (d.open && d.height > 0) {
      d.height -= dt * 0.7;
      if (d.height < 0) d.height = 0;
    }
    if (d.open && d.height === 0) {
      const [mx,my] = key.split(',').map(Number);
      MAP[my][mx] = 0;
    }
  }
}

function collisionCheck(x, y) {
  const mx = Math.floor(x);
  const my = Math.floor(y);
  if (mx < 0 || my < 0 || my >= MAP.length || mx >= MAP[0].length) return false;
  const tile = MAP[my][mx];
  switch (tile) {
    case 0: return true;
    case 1: return false;
    case 2:
      const doorKey = `${mx},${my}`;
      const door = doors[doorKey];

      if (!door) return false;

      const allowed = doorCheck(door, doorKey, {
        keysCollected,
        requiredKeys: REQUIRED_KEYS,
        player,
        levers,
        keys: keysMap
      });

      if (allowed) {
        door.open = true;
        return door.height < 0.2;
      } else {
        showMsg('Door locked.', 900);
        return false;
      }
    case 3: return false;
    case 4: return false;
    default: return false;
  }
}

let msgTimeout = null;

function showMsg(text, ms=1200) {
  msg = text;
  if (msgTimeout) clearTimeout(msgTimeout);
  msgTimeout = setTimeout(()=>{ msg = ''; }, ms);
}

function drawMenu() {
  c.fillStyle = "rgba(0,0,0,0.7)";
  c.fillRect(0, 0, W, H);

  c.textAlign = "center";
  c.fillStyle = "white";

  if (menuState === MENU.START) {
    c.font = "48px Arial";
    c.fillText("RAYCAST GAME", W / 2, H / 2 - 60);

    c.font = "24px Arial";
    c.fillText("Press ENTER to Start", W / 2, H / 2);
    c.fillText("WASD to move • Mouse to look • E to interact", W / 2, H / 2 + 40);
  }

  if (menuState === MENU.PAUSE) {
    c.font = "42px Arial";
    c.fillText("Paused", W / 2, H / 2 - 40);

    c.font = "24px Arial";
    c.fillText("Press ENTER to Resume", W / 2, H / 2);
    c.fillText("ESC to Pause", W / 2, H / 2 + 40);
  }

  if (menuState === MENU.WIN) {
    c.font = "48px Arial";
    c.fillText("You Escaped!", W / 2, H / 2 - 40);

    c.font = "24px Arial";
    c.fillText("Press ENTER to Restart", W / 2, H / 2 + 10);
  }
}


function toggleGame() {
    if (gameRunning) {
        stopGame();
    } else {
        startGame();
    }
}

function startGame() {
  gameRunning = true;
  menuState = MENU.NONE;
  canvas.requestPointerLock();
}

function pauseGame() {
  gameRunning = false;
  menuState = MENU.PAUSE;
  document.exitPointerLock();
}

function winGame() {
  gameRunning = false;
  menuState = MENU.WIN;
  document.exitPointerLock();
}

function restartGame() {
  gameRunning = true;
  menuState = MENU.NONE;
  canvas.requestPointerLock();
}

let last = performance.now();

function animate(now) {
    c.clearRect(0, 0, W, H);

    if (!gameRunning) {
      drawMenu();
      requestAnimationFrame(animate);
      return;
    }

    checkGoal();

    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
   
    player.angle += player.turn * rotSpeed * dt;
    const speed = moveSpeed * dt;
    const forwardX = Math.cos(player.angle);
    const forwardY = Math.sin(player.angle);
    const sideX = Math.cos(player.angle + Math.PI / 2);
    const sideY = Math.sin(player.angle + Math.PI / 2);
    let nx = player.x + (forwardX * moveForward + sideX * moveSide) * speed;
    let ny = player.y + (forwardY * moveForward + sideY * moveSide) * speed;
    if (collisionCheck(nx, player.y)) player.x = nx;
    if (collisionCheck(player.x, ny)) player.y = ny;

    checkPickups();
    animateDoors(dt);
    castRays();
    drawSprites(now/1000);

    c.fillStyle = "white";
    c.font = "20px Arial";
    c.fillText(`Keys: ${keysCollected} / ${REQUIRED_KEYS}`, 60, 60);
    c.fillText(`${msg}`, canvas.width / 2, canvas.height - 50);

    requestAnimationFrame(animate);
}

requestAnimationFrame(animate);

window.__RC_MAP = MAP;
window.__RC_DOORS = doors;
window.__RC_ITEMS = items;
window.__RC_PLAYER = player;