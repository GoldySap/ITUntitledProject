let canvas = document.querySelector('canvas');
let c = canvas.getContext('2d');

// 0 = empty
// 1 = wall
// 2 = door
// 3 = lever
// 4 = glass

const MAP = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,4,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,1],
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
const levers = {};
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

(function scanMapForDoors(){
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (MAP[y][x] === 2) {
        doors[`${x},${y}`] = { 
          open: false, 
          height: 1,
          condition: { 
            type: "allKeys"
          }
        };;
      }
    }
  }
})();

(function scanMapForLevers(){
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (MAP[y][x] === 3) {
        levers[`${x},${y}`] = { pressed: false };
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
          return { x: x, y: y, picked:false, anim: Math.random()*6 };
        }
      }
    }
    tries++;
  }
  return { x: player.x+1, y: player.y, picked:false, anim:0 };
}

let items = [spawnKey(), spawnKey(), spawnKey()];
let keysCollected = 0;

function doorCheck(door, pos, context) {
    const cond = door.condition || { type: "allKeys" };
    switch (cond.type) {
        case "allKeys":
            return context.keysCollected >= context.requiredKeys;
        case "specificKey":
            return context.player.inventory?.[cond.keyName] === true;
        case "lever":
            return context.levers[cond.leverPos]?.pressed === true;
        case "keyCount":
            return (context.player.keyCount?.[cond.keyType] || 0) >= cond.amount;
        case "totalKeys":
            return context.keysCollected >= cond.amount;
        case "custom":
            return typeof cond.check === "function" 
                ? cond.check(door, pos, context) 
                : false;
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

function applyDefault(doors, type="allKeys") {
    for (let pos in doors) {
        if (!doors[pos].condition) {
            doors[pos].condition = { type };
        }
    }
}

applyDefault(doors, "allKeys");
doorSet(doors, "1,1", { 
    type: "lever",
    leverPos: "13,4"
});
doorSet(doors, "10,1", {
    type: "totalKeys",
    amount: 1
});
// doorSet(doors, "7,1", {
//     type: "custom",
//     doorCheck: (door, pos, ctx) => {
//         return ctx.keysCollected >= 2 && ctx.levers["13,4"].pressed;
//     }
// });


canvas.addEventListener("click", () => {
    canvas.requestPointerLock();
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
  if (e.key === "e") tryInteract();
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

let depthBuffer = new Float64Array(W);

function castRays() {
  const pitchOffset = player.pitch * (H * 0.9);

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
        if (mx < 0 || my < 0 || mx >= MAP[0].length || my >= MAP.length) {
            hitTile = 1;
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
            const allowed = doorCheck(d, key, {
                keysCollected,
                requiredKeys: REQUIRED_KEYS,
                player,
                levers
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
        if (tile === 4) {
            hitTile = 4;
            hitX = mx; hitY = my;
            break;
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
      c.fillRect(col, (H - doorLineHeight)/2 + pitchOffset, 1, doorLineHeight);
    } else if (hitTile === 3) { 
      const key = `${hitX},${hitY}`; 
      const lever = levers[key]; 
      const pressed = lever ? lever.pressed : false; 
      const color = pressed ? "rgb(180,40,40)" : "rgb(40,180,40)"; 
      const small = lineHeight * 1; 
      const y = (H - small) / 2 + pitchOffset; 
      c.fillStyle = `${color}`;
      c.fillRect(col, y, 1, lineHeight);
    } else if (hitTile === 4) {
      const shade = Math.max(30, 255 - perpDist*35) | 0;
      const opacity = Math.min(Math.max(0 + (perpDist * 0.25), 0.4), 1);
      c.fillStyle = `rgba(${shade},${shade},${shade},${opacity})`;
      c.fillRect(col, (H - lineHeight)/2 + pitchOffset, 1, lineHeight);
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
        levers
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
        const key = `${door.mx},${door.my}`;
        const allowed = doorCheck(door, key, {
            keysCollected,
            requiredKeys: REQUIRED_KEYS,
            player,
            levers
        });
        if (allowed) {
            doors[key].open = true;
            return true;
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