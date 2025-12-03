let canvas = document.querySelector('canvas');
let c = canvas.getContext('2d');

// 0 = empty
// 1 = wall
// 2 = door

const MAP = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1],
  [1,1,1,1,2,2,1,1,1,1,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

const REQUIRED_KEYS = 3;
let msg = ''
const W = canvas.width = window.innerWidth;
const H = canvas.height = window.innerHeight;
const rows = MAP.length;
const cols = MAP[0].length;
const doors = {};
const player = {
  x: 5,
  y: 5,
  angle: 0,
  pitch: 0,
  maxPitch: Math.PI / 4,
  fov: Math.PI / 2.8,
  turn: 0
};
const pitchOffset = player.pitch * (H * 0.9);
const moveSpeed = 3.2;
const rotSpeed = 2.8;
let mouseX = 0;
let mouseY = 0;
let moveForward = 0;
let moveSide = 0;

(function scanMapForDoors(){
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (MAP[y][x] === 2) {
        doors[`${x},${y}`] = { open: false, height: 1 };
      }
    }
  }
})();

function spawnKey() {
  let tries = 0;
  while (tries < 200) {
    const x = Math.random() * cols;
    const y = Math.random() * rows;
    const mx = Math.floor(x);
    const my = Math.floor(y);
    if (mx >= 0 && my >= 0 && mx < cols && my < rows) {
      if (MAP[my][mx] === 0) {
        const dx = x + 0.5 - player.x;
        const dy = y + 0.5 - player.y;
        if (Math.hypot(dx,dy) > 1.2) {
          return { x: x+0.25, y: y+0.25, picked:false, anim: Math.random()*6 };
        }
      }
    }
    tries++;
  }
  return { x: player.x+1, y: player.y, picked:false, anim:0 };
}

let items = [spawnKey(), spawnKey(), spawnKey()];
let keysCollected = 0;

canvas.addEventListener("click", () => {
    canvas.requestPointerLock();
});

document.addEventListener("mousemove", e => {
    if (document.pointerLockElement === canvas) {
        const sensitivity = 0.002;
        player.angle += e.movementX * sensitivity;
        player.pitch -= e.movementY * sensitivity;
        player.pitch = Math.max(-player.maxPitch, Math.min(player.maxPitch, player.pitch));
    }
});

document.addEventListener("keydown", e => {
  if (e.key === "w") moveForward = 1;
  if (e.key === "s") moveForward = -1;
  if (e.key === "a") moveSide = -1;
  if (e.key === "d") moveSide = 1;
  if (e.key === "ArrowLeft") player.turn = -1;
  if (e.key === "ArrowRight") player.turn = 1;
});

document.addEventListener("keyup", e => {
  if (e.key === "w" || e.key === "s") moveForward = 0;
  if (e.key === "a" || e.key === "d") moveSide = 0;
  if (e.key === "ArrowLeft" || e.key === "ArrowRight") player.turn = 0;
});

let depthBuffer = new Float32Array(W);

function castRays() {
  // Sky
  c.fillStyle = '#87CEEB';
  c.fillRect(0, -H/2 + pitchOffset, W, H);

  // Floor
  c.fillStyle = '#444';
  c.fillRect(0, H/2 + pitchOffset, W, H);

  for (let col = 0; col < W; col++) {
    const rayAngle = player.angle - player.fov/2 + (col / W) * player.fov;
    const sin = Math.sin(rayAngle);
    const cos = Math.cos(rayAngle);

    let dist = 0;
    let hitTile = 0;
    let hitX = 0, hitY = 0;
    while (dist < 30) {
      dist += 0.02;
      const rx = player.x + cos * dist;
      const ry = player.y + sin * dist;
      const mx = Math.floor(rx);
      const my = Math.floor(ry);
      if (mx < 0 || my < 0 || my >= MAP.length || mx >= MAP[0].length) {
        hitTile = 1;
        hitX = mx; hitY = my;
        break;
      }
      const tile = MAP[my][mx];
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
      }
    }
    const perpDist = dist * Math.cos(rayAngle - player.angle);
    depthBuffer[col] = perpDist;

    let lineHeight = (H / (perpDist + 0.0001)) * 0.8;
    if (hitTile === 1) {
      const shade = Math.max(30, 255 - perpDist*35) | 0;
      c.fillStyle = `rgb(${shade},${shade},${shade})`;
      c.fillRect(col, (H - lineHeight)/2 + pitchOffset, 1, lineHeight);
    } else if (hitTile === 2) {
      const key = `${hitX},${hitY}`;
      const d = doors[key];
      let hscale = d ? d.height : 1;
      let doorLineHeight = lineHeight * hscale;
      const shade = Math.max(30, 190 - perpDist*30) | 0;
      c.fillStyle = `rgb(${shade/1.2|0},${shade/1.6|0},${shade/3|0})`;
      c.fillRect(col, (H - doorLineHeight)/2, 1, doorLineHeight);
    }
  }
}

function drawSprites(time) {
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
    const [mx,my] = key.split(',').map(Number);
    const d = doors[key];
    if (!d.open && keysCollected >= REQUIRED_KEYS) {
      const cx = mx + 0.5, cy = my + 0.5;
      const dx = cx - player.x;
      const dy = cy - player.y;
      const dist = Math.hypot(dx,dy);
      let ang = Math.atan2(dy,dx) - player.angle;
      ang = (ang + Math.PI*3) % (Math.PI*2) - Math.PI;
      if (Math.abs(ang) <= player.fov/2) sprites.push({ type:'doorMark', x:cx, y:cy, dist, ang, doorKey:key });
    }
  }

  sprites.sort((a,b) => b.dist - a.dist);

  for (let s of sprites) {
    const screenX = (s.ang / (player.fov/2)) * (W/2) + (W/2);
    const baseSize = (1 / Math.max(0.001, s.dist)) * 240;
    let size = baseSize;
    if (s.type === 'key') {
      const bob = Math.sin(s.item.anim + time*3) * 0.12;
      s.item.anim += 0.02;
      size *= 1 + Math.sin(time*3 + s.item.anim) * 0.08;
      const y = (H/2) - size + bob*30 + pitchOffset;
      const col = Math.floor(screenX);
      if (col >= 0 && col < W && depthBuffer[col] < s.dist - 0.05) {
        continue;
      }
      c.fillStyle = '#ffdf66';
      c.fillRect(screenX - size/2, y, size, size);
    } else if (s.type === 'doorMark') {
      const y = (H/2) - size - 30 + pitchOffset;
      const col = Math.floor(screenX);
      if (col >= 0 && col < W && depthBuffer[col] < s.dist - 0.05) continue;
      c.fillStyle = 'rgba(255,80,80,0.95)';
      c.fillRect(screenX - size/6, y, size/3, size/3);
    }
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
      if (keysCollected >= REQUIRED_KEYS) unlockAllDoors();
    }
  }
}

function unlockAllDoors() {
    for (let key in doors) {
        doors[key].open = true;
    }
    showMsg('All keys collected. doors opening!', 1400);
}

function animateDoors(dt) {
    for (let key in doors) {
        const d = doors[key];
        if (d.open && d.height > 0) {
        d.height -= dt * 0.7;
        if (d.height < 0) d.height = 0;
        if (d.height = 0) {
            const [mx,my] = key.split(',').map(Number);
            MAP[my][mx] = 0;
        }
        }
    }
}

function collisionCheck(x, y) {
    const mx = Math.floor(x);
    const my = Math.floor(y);
    if (mx < 0 || my < 0 || my >= MAP.length || mx >= MAP[0].length) return false;
    const tile = MAP[my][mx];
    if (tile === 0) return true;
    if (tile === 1) return false;
    if (tile === 2) {
        const key = `${mx},${my}`;
        const d = doors[key];
        if (d && d.height <= 0.2) return true;
        showMsg('Door locked. Find all keys!', 900);
        return false;
    }
    return false;
}

let msgTimeout = null;
function showMsg(text, ms=1200) {
    msg = text;
    if (msgTimeout) clearTimeout(msgTimeout);
    msgTimeout = setTimeout(()=>{ msg = ''; }, ms);
}

let last = performance.now();

function animate(now) {
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
