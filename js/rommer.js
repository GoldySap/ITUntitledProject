let canvas = document.querySelector('canvas');
let c = canvas.getContext('2d');

// 0 = empty
// 1 = wall
// 2 = door
// 3 = lever
// 4 = glass
// 5 = key
// 6 = goal

const MAPS = [
{map: [
[1,1,1,1,1,1,1], //1
[1,1,0,0,0,1,1], //2
[1,3,0,0,0,3,1], //3
[1,1,0,0,0,1,1], //4
[1,1,1,2,1,1,1], //5
[1,1,0,0,0,1,1], //6
[1,1,0,6,0,1,1], //7
[1,1,0,0,0,1,1], //8
[1,1,1,1,1,1,1]  //9
],
spawn: { x: 3.5, y: 2.5, angle: 1.58 },
REQUIRED_KEYS: null,
dcDefault: "allKeys",
dcSpesifics: [
  {
    pos: "3,4",
    logic: "AND",
    hint: "Both levers must be activated.",
    conditions: [
      {
        type: "levers",
        states: { "1,2": true }
      },
      {
        type: "levers",
        states: { "5,2": true }
      },
    ]
  },
],
hints: [
  {
    pos: "3,1",
    text: "Both levers affect the same door."
  },
]
},
{map: [
[1,1,1,1,1,1,1], //1
[1,0,0,0,0,0,1], //2
[1,5,0,0,0,5,1], //3
[1,0,0,0,0,0,1], //4
[1,0,0,0,0,0,1], //5
[1,1,1,2,1,1,1], //6
[1,1,0,0,0,1,1], //7
[1,1,0,6,0,1,1], //8
[1,1,0,0,0,1,1], //9
[1,1,1,1,1,1,1]  //10
],
spawn: { x: 3.5, y: 2.5, angle: 1.58 },
REQUIRED_KEYS: null,
dcDefault: "allKeys",
dcSpesifics: [
  {
    pos: "3,5",
    logic: "AND",
    hint: "Requires to keys.",
    conditions: [
      {
        type: "specificKey",
        states: { "1,2": true }
      },
      {
        type: "specificKey",
        states: { "5,2": true }
      },
    ]
  },
],
},
{map: [
[1,1,1,1,1,1,1,1,1,1,1], //1
[1,3,0,0,0,3,0,0,0,3,1], //2
[1,0,0,0,0,0,0,0,0,0,1], //3
[1,0,0,0,0,0,0,0,0,0,1], //4
[1,0,0,0,0,0,0,0,0,0,1], //5
[1,1,2,1,1,2,1,1,2,1,1], //6
[1,1,1,1,1,0,1,1,1,1,1], //7
[1,1,1,1,1,0,1,1,1,1,1], //8
[1,6,0,0,0,0,1,1,1,1,1], //9
[1,1,1,1,1,1,1,1,1,1,1]  //10
],
spawn: { x: 3.5, y: 2.5, angle: 1.58 },
REQUIRED_KEYS: null,
dcDefault: "allKeys",
dcSpesifics: [
  {
    pos: "2,5",
    logic: "AND",
    hint: "Note: The first is dark, the second is light, the third is bright.",
    conditions: [
      {
        type: "levers",
        states: { "1,1": true }
      },
      {
        type: "levers",
        states: { "5,1": false }
      },
      {
        type: "levers",
        states: { "9,1": false }
      },
    ]
  },
  {
    pos: "5,5",
    logic: "AND",
    hint: "Note: The first is light, the second is dark, the third is bright.",
    conditions: [
      {
        type: "levers",
        states: { "1,1": false }
      },
      {
        type: "levers",
        states: { "5,1": true }
      },
      {
        type: "levers",
        states: { "9,1": false }
      },
    ]
  },
  {
    pos: "8,5",
    logic: "AND",
    hint: "Note: The first is light, the second is bright, the third is dark.",
    conditions: [
      {
        type: "levers",
        states: { "1,1": false }
      },
      {
        type: "levers",
        states: { "5,1": false }
      },
      {
        type: "levers",
        states: { "9,1": true }
      },
    ]
  },
],
},
{map: [
[1,1,1,1,1,1,1], //1
[1,5,2,3,2,5,1], //2
[1,1,0,0,0,1,1], //3
[1,0,0,0,0,0,1], //4
[1,0,0,0,0,0,1], //5
[1,2,4,4,4,2,1], //6
[1,0,0,0,0,0,1], //7
[1,0,0,6,0,0,1], //8
[1,1,0,0,0,1,1], //9
[1,1,1,1,1,1,1]  //10
],
spawn: { x: 3.5, y: 3.5, angle: 1.58 },
REQUIRED_KEYS: null,
dcDefault: "allKeys",
dcSpesifics: [
  {
    pos: "2,1",
    logic: "AND",
    conditions: [
      {
        type: "levers",
        states: { "3,1": true }
      },
    ]
  },
  {
    pos: "4,1",
    logic: "AND",
    conditions: [
      {
        type: "levers",
        states: { "3,1": true }
      },
    ]
  },
  {
    pos: "1,5",
    logic: "AND",
    conditions: [
      {
        type: "levers",
        states: { "3,1": false }
      },
      {
        type: "specificKey",
        states: { "1,1": true }
      },
      {
        type: "specificKey",
        states: { "5,1": true }
      },
    ]
  },
  {
    pos: "5,5",
    logic: "AND",
    conditions: [
      {
        type: "levers",
        states: { "3,1": false }
      },
      {
        type: "specificKey",
        states: { "1,1": true }
      },
      {
        type: "specificKey",
        states: { "5,1": true }
      },
    ]
  },
],
},
{map: [
[1,1,1,1,1,1,1,1,1,1,1,1,1], //1
[1,0,5,0,1,0,0,0,1,0,0,0,1], //2
[1,0,0,0,1,0,0,0,2,0,0,0,1], //3
[1,0,0,0,1,0,0,0,1,0,0,0,1], //4
[1,1,2,1,1,1,3,1,1,0,0,0,1], //5
[3,0,0,0,0,0,0,0,4,0,0,0,1], //6
[1,0,0,0,0,0,0,0,4,0,0,0,1], //7
[1,1,1,1,2,1,1,1,1,1,1,0,1], //8
[1,0,2,0,0,0,0,0,0,0,1,0,1], //9
[1,0,1,0,0,0,0,0,0,0,0,0,1], //10
[1,0,1,0,0,0,0,0,0,0,1,1,1], //12
[1,0,1,1,1,1,0,0,0,0,0,0,1], //13
[1,0,0,0,0,1,0,0,0,0,0,0,1], //14
[1,1,1,1,0,1,0,0,0,0,0,0,1], //15
[1,6,0,1,0,1,0,0,0,0,0,0,1], //16
[1,0,0,0,0,1,0,3,0,3,0,3,1], //17
[1,1,1,1,1,1,1,1,1,1,1,1,1]  //18
],
spawn: { x: 6.5, y: 2.5, angle: Math.PI / 2 },
REQUIRED_KEYS: null,
dcDefault: null,
dcSpesifics: [
  {
    pos: "8,2",
    logic: "OR",
    conditions: [
      {
        type: "levers",
        states: { "6,4": true }
      }
    ]
  },
  {
    pos: "2,4",
    logic: "OR",
    conditions: [
      {
        type: "levers",
        states: { "0,5": true }
      }
    ]
  },
  {
    pos: "4,7",
    logic: "AND",
    conditions: [
      {
        type: "levers",
        states: { 
          "7,15": true,
          "9,15": false,
          "11,15": true
        }
      },
    ]
  },
  {
    pos: "2,8",
    logic: "AND",
    conditions: [
      {
        type: "levers",
        states: { 
          "0,5": true,
          "6,4": false
         }
      },
      {
        type: "specificKey",
        states: { "2,1": true }
      }
    ]
  },
],
},
];

// doorSet(doors, "9,5", {
//   type: "custom",
//   check: (door, pos, ctx) =>
//     ctx.keys?.["1,1"]?.picked === true &&
//     ctx.levers?.["17,15"]?.pressed === true
// });

let currentLevel = 0;
let MAP = [];
let REQUIRED_KEYS = 3;
let keysCollected = 0;
let msgTimeout = null; 
let msgms;
let msg = ''
let rows = null;
let cols = null;
const W = canvas.width = window.innerWidth;
const H = canvas.height = window.innerHeight;
const doors = {};
const levers = {};
const keysMap = {};
const hintTiles = {};
const items = [];
const player = {
  x: 5,
  y: 5,
  angle: 0,
  pitch: 0,
  maxPitch: Math.PI / 4,
  fov: Math.PI / 2.4,
  turn: 0
};
const hintLog = [];
const uiText = {
  msg: { text: "", timer: 0 },
  hint: { text: "", timer: 0 }
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
  TUTORIAL: "tutorial",
  HINTS: "hints",
  NONE: "none"
};

loadLevel(currentLevel);

let menuState = MENU.START;

function scanMapForGoal(){
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
};

function scanMapForLevers(){
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (MAP[y][x] === 3) {
        levers[`${x},${y}`] = { pressed: false };
        console.log(`Lever: ${x},${y}`)
      }
    }
  }
}

function scanMapForKeys(){
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
        console.log(`Key: ${x},${y}`)
      }
    }
  }
};

function scanMapForDoors(){
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (MAP[y][x] === 2) {
        doors[`${x},${y}`] = { 
          open: false, 
          height: 1,
          logic: "AND",
          conditions: [],
          hint: null,
          hintShown: false 
        };
        console.log(`Door: ${x},${y}`)
      }
    }
  }
};

function doorCheck(door, pos, context) {
  if (!door || !door.conditions || door.conditions.length === 0) {
    return true;
  }

  const logic = door.logic || "AND";

  if (logic === "OR") {
    return door.conditions.some(cond =>
      checkSingleCondition(cond, door, pos, context)
    );
  }

  return door.conditions.every(cond =>
    checkSingleCondition(cond, door, pos, context)
  );
}

function checkSingleCondition(cond, door, pos, context) {
  switch (cond.type) {

    case "allKeys":
      switch (context.requiredKeys) {
        case 0:
          break;
        case null:
          break;
        default:
          return context.keysCollected >= context.requiredKeys
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
      return typeof cond.check === "function"
        ? cond.check(door, pos, context)
        : false;

    default:
      console.warn("Unknown condition:", cond.type);
      return false;
  }
}


function doorSet(doors, pos, condition) {
  if (!doors[pos]) {
    console.warn("Door not found:", pos);
    return;
  }

  doors[pos].conditions.push(condition);
}

function applyDefault(doors, type) {
  for (let pos in doors) {
    if (doors[pos].conditions.length === 0) {
      doors[pos].conditions.push({ type });
    }
  }
}

function loadLevel(index) {
  const level = MAPS[index];
  if (!level) return;

  currentLevel = index;

  MAP = level.map.map(row => [...row]);

  rows = MAP.length;
  cols = MAP[0].length;

  REQUIRED_KEYS = level.REQUIRED_KEYS;

  player.x = level.spawn.x;
  player.y = level.spawn.y;
  player.angle = level.spawn.angle ?? 0;

  keysCollected = 0;
  items.length = 0;
  goal = null;

  for (let k in doors) delete doors[k];
  for (let k in levers) delete levers[k];
  for (let k in keysMap) delete keysMap[k];
  hintLog.length = 0;

  scanMapForDoors();
  scanMapForLevers();
  scanMapForKeys();
  scanMapForGoal();

  if (level.dcDefault) {
    applyDefault(doors, level.dcDefault);
  }

  for (const rule of level.dcSpesifics || []) {
    const door = doors[rule.pos];
    if (!door) continue;

    door.logic = rule.logic ?? door.logic;
    door.conditions.length = 0;

    if (rule.hint) {
      door.hint = rule.hint;
      door.hintShown = false;
    }

    for (const cond of rule.conditions) {
      doorSet(doors, rule.pos, cond);
    }
  }

  for (let k in hintTiles) delete hintTiles[k];

  for (const h of level.hints || []) {
    hintTiles[h.pos] = {
      text: h.text,
      collected: false
    };
  }

  showMsg(`Level ${index + 1}`, 120);
}

function SRequestPointerLock() {
  if (document.pointerLockElement === canvas) return;
  try {
    canvas.requestPointerLock();
  } catch (e) {
    console.warn("Pointer lock failed:", e);
  }
}

function SExitPointerLock() {
  if (document.pointerLockElement !== canvas) return;
  try {
    document.exitPointerLock();
  } catch (e) {
    console.warn("Exit pointer lock failed:", e);
  }
}

canvas.addEventListener("click", () => {
    if (menuState === MENU.NONE) {
      SRequestPointerLock();
    }
});

document.addEventListener("pointerlockchange", () => {
  const locked = document.pointerLockElement === canvas;
  if (!locked && gameRunning) {
    pauseGame();
  }
});

canvas.addEventListener("mousemove", e => {
  const rect = canvas.getBoundingClientRect();
  mouseX = e.clientX - rect.left;
  mouseY = e.clientY - rect.top;
});

document.addEventListener("mousemove", e => {
    if (document.pointerLockElement === canvas) {
        const sensitivity = 0.0017;
        player.angle += e.movementX * sensitivity;
        player.pitch -= e.movementY * sensitivity;
        player.pitch = Math.max(-player.maxPitch, Math.min(player.maxPitch, player.pitch));
    }
});

function isHover(cx, cy, w, h) {
  return (
    mouseX >= cx - w / 2 &&
    mouseX <= cx + w / 2 &&
    mouseY >= cy - h / 2 &&
    mouseY <= cy + h / 2
  );
}


canvas.addEventListener("mousedown", () => {
  if (menuState === MENU.START) {
    if (isHover(W/2, H/2 - 10, 280, 60)) startGame();
    if (isHover(W/2, H/2 + 80, 280, 60)) menuState = MENU.TUTORIAL;
  }

  if (menuState === MENU.PAUSE) {
    if (isHover(W/2, H/2 - 10, 280, 60)) {
      startGame();
    } else if (isHover(W/2, H/2 + 80, 280, 60)) menuState = MENU.HINTS;
    else if (isHover(W/2, H/2 + 170, 280, 60)) menuState = MENU.START;
  }

  else if (menuState === MENU.TUTORIAL) {
    if (isHover(W/2, H - 100, 260, 60)) {
      menuState = MENU.START;
    }
  }

  else if (menuState === MENU.HINTS) {
    if (isHover(W/2, H - 100, 260, 60)) {
      menuState = MENU.PAUSE;
    }
  }
});

document.addEventListener("keydown", e => {
  if (e.key === "Enter") {
    if (menuState === MENU.START || menuState === MENU.PAUSE) {
      startGame();
    }
    if (menuState === MENU.WIN) {
      hasNextLevel() ? nextGame() : restartGame();
    }
  }
  if (e.key === "Escape") {
    if (gameRunning) {
      e.preventDefault();
      pauseGame();
    }
    if (!gameRunning) {
      if (menuState === MENU.TUTORIAL) menuState = MENU.START;
      else if (menuState === MENU.HINTS) menuState = MENU.PAUSE;
    }
    if (!gameRunning && MENU.WIN) {
      SExitPointerLock();
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

function shadeColor(rgb, perpDist, depthFactor) {
  const shade = Math.max(20, 255 - perpDist * depthFactor);
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
      if (tile === 2) {
        const d = doors[`${mx},${my}`];
        if (d && d.height > 0.01) {
          hitTile = 2;
          hitX = mx;
          hitY = my;
          break;
        }
        continue;
      }
      if (tile === 1) {
          hitTile = 1;
          hitX = mx; hitY = my;
          break;
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
    let depthFactor = 35

    // Ceiling
    c.fillStyle = shadeColor(TILE0.ceiling, perpDist, depthFactor);
    c.fillRect(col, 0, 1, (H + wallTop)/2.5 + pitchOffset/2);

    // Floor
    c.fillStyle = shadeColor(TILE0.floor, perpDist, depthFactor * 2);
    c.fillRect(col, wallBottom, 1, H - wallBottom);

    if (hitTile === 1) {
      const shade = Math.max(30, 255 - perpDist * depthFactor) | 0;
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
      const shade = Math.max(30, 190 - perpDist * depthFactor) | 0;
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
      const shade = Math.max(30, 190 - perpDist * depthFactor) | 0;
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
    }
  }
  for (let pos in hintTiles) {
    const hint = hintTiles[pos];
    if (hint.collected) continue;

    const [x, y] = pos.split(",").map(Number);
    const cx = x + 0.5;
    const cy = y + 0.5;

    const dx = cx - player.x;
    const dy = cy - player.y;
    const dist = Math.hypot(dx, dy);
    let ang = Math.atan2(dy, dx) - player.angle;
    ang = (ang + Math.PI * 3) % (Math.PI * 2) - Math.PI;

    if (Math.abs(ang) <= player.fov / 2) {
      sprites.push({
        type: "hint",
        x: cx,
        y: cy,
        dist,
        ang
      });
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
    else if (s.type === "hint") {
      const spriteHeight = (1 / s.dist) * 180;
      const spriteWidth  = spriteHeight * 0.7;
      const bob = Math.sin(time * 3) * 0.12;
      const y = (H/2) - spriteHeight + bob * 30 + pitchOffset;

      const left = Math.floor(screenX - spriteWidth/2);
      const right = Math.floor(screenX + spriteWidth/2);

      for (let x = left; x <= right; x++) {
        if (x < 0 || x >= W) continue;
        if (depthBuffer[x] < s.dist) continue;
        c.fillStyle = "rgba(215, 120, 255, 0.95)";
        c.fillRect(x, y, 1, spriteHeight);
      }
    }
  }
}

function updateDoors() {
  for (let key in doors) {
    const door = doors[key];
    const allowed = doorCheck(door, key, {
      keysCollected,
      requiredKeys: REQUIRED_KEYS,
      player,
      levers,
      keys: keysMap
    });
    door.open = allowed;
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
        showMsg(lever.pressed ? "Lever activated!" : "Lever reset!", 120);
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
      showMsg('Picked up a key.', 120);
    }
  }
  for (let pos in hintTiles) {
    const hint = hintTiles[pos];
    if (hint.collected) continue;

    const [x, y] = pos.split(",").map(Number);
    const dx = x + 0.5 - player.x;
    const dy = y + 0.5 - player.y;

    if (Math.hypot(dx, dy) < 0.6) {
      hint.collected = true;
      hint.hintShown = true;
      showHint(hint.text, 120);
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
    if (d.open) {
      d.height -= dt * 0.7;
      if (d.height < 0) d.height = 0;
    } else {
      d.height += dt * 0.7;
      if (d.height > 1) d.height = 1;
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
    case 2: {
      const door = doors[`${mx},${my}`];
      if (!door) return false;
      if (door.open === true) {
          return door.height < 0.1;
      } else {
          showMsg('Door locked.', 120);
          if (door.hint && !door.hintShown) {
            showHint(door.hint);
            door.hintShown = true;
          }
          return false;
      }
    }
    case 3: return false;
    case 4: return false;
    default: return false;
  }
}

function showMsg(text, time = 120) {
  uiText.msg.text = text;
  uiText.msg.timer = time;
}

function showHint(text, time = 120) {
  uiText.hint.text = text;
  uiText.hint.timer = time;
  hintLog.push(text);
}

function drawButton(x, y, w, h, text, hover) {
  c.fillStyle = hover ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.1)";
  c.strokeStyle = hover ? "#fff" : "#aaa";
  c.lineWidth = 2;

  c.beginPath();
  c.roundRect(x - w/2, y - h/2, w, h, 15);
  c.fill();
  c.stroke();

  c.fillStyle = "white";
  c.font = "24px Arial";
  c.textAlign = "center";
  c.fillText(text, x, y + 8);
}

function drawMenu() {
  c.fillStyle = "rgba(0,0,0,0.7)";
  c.fillRect(0, 0, W, H);

  c.textAlign = "center";
  c.fillStyle = "white";

  if (menuState === MENU.START) {
    c.font = "48px Arial";
    c.fillText("Rommer", W / 2, H / 2 - 120);

    const playHover = isHover(W/2, H/2 - 10, 280, 60);
    const tutHover  = isHover(W/2, H/2 + 80, 280, 60);

    drawButton(W/2, H/2 - 10, 280, 60, "Play", playHover);
    drawButton(W/2, H/2 + 80, 280, 60, "Tutorial", tutHover);
  }

  if (menuState === MENU.TUTORIAL) {
    c.font = "36px Arial";
    c.fillText("How to Play", W/2, 120);

    c.font = "22px Arial";
    const lines = [
      "WASD – Move",
      "Mouse – Look",
      "E – Interact with levers (Green Walls)",
      "Walk into keys (Yellow Squares) to collect them",
      "Walk into the hints (Purple Squares) to get hints for the level",
      "Walk into the goal (Blue Square) to win and move onto the next level",
      "",
      "Doors (Brown Walls) open when their conditions are met.",
      "Doormarkers (Blue Squares) indicate the position of open doors",
      "Look for visual or text clues near doors."
    ];

    lines.forEach((t, i) =>
      c.fillText(t, W/2, 200 + i * 30)
    );

    const backHover  = isHover(W/2, H-100, 260, 60);

    drawButton(W/2, H - 100, 260, 60, "Back", backHover);
  }

  if (menuState === MENU.HINTS) {
    c.font = "36px Arial";
    c.fillText("Discovered Hints", W/2, 120);

    c.font = "20px Arial";
    hintLog.forEach((h, i) => {
      c.fillText("• " + h, W/2, 200 + i * 28);
    });

    if (hintLog.length === 0) {
      c.fillText("No hints discovered yet.", W/2, 220);
    }

    const backHover  = isHover(W/2, H-100, 260, 60);

    drawButton(W/2, H - 100, 260, 60, "Back", backHover);
  }

  if (menuState === MENU.PAUSE) {
    c.font = "48px Arial";
    c.fillText("Paused", W / 2, H / 2 - 120);

    const resumeHover  = isHover(W/2, H/2 - 10, 280, 60);
    const hintsHover  = isHover(W/2, H/2 + 80, 280, 60);
    const MainMenuHover  = isHover(W/2, H/2 + 170, 280, 60);

    drawButton(W/2, H/2 - 10, 280, 60, "Resume", resumeHover);
    drawButton(W/2, H/2 + 80, 280, 60, "Hints", hintsHover);
    drawButton(W/2, H/2 + 170, 280, 60, "Main Menu", MainMenuHover);
  }

  if (menuState === MENU.WIN) {
    c.font = "48px Arial";
    c.fillText("You Escaped!", W / 2, H / 2 - 40);

    c.font = "24px Arial";
    if (hasNextLevel()) {
      c.fillText("Press ENTER to go to the next level", W / 2, H / 2 + 10);
    } else {
      c.fillText("Press ENTER to Restart", W / 2, H / 2 + 10);
    }
  }
}

function drawTextBox(x, y, text) {
  if (!text) return;

  c.font = "16px monospace";
  c.textAlign = "center";

  const padding = 8;
  const width = c.measureText(text).width + padding * 2;

  c.fillStyle = "rgba(0, 0, 0, 0)";
  c.fillRect(x - width/2, y - 20, width, 28);

  c.fillStyle = "#ffffff";
  c.fillText(text, x, y);
}

function drawUI() {
  if (uiText.msg.timer > 0) {
    drawTextBox(
      W / 2,
      H - 40,
      uiText.msg.text
    );
  }

  if (uiText.hint.timer > 0) {
    drawTextBox(
      W / 2,
      40,
      uiText.hint.text
    );
  }
}

function updateUI() {
  if (!gameRunning) return;

  if (uiText.msg.timer > 0) {
    uiText.msg.timer--;
  } else if (uiText.msg.timer <= 0) {
    uiText.msg.text = "";
  }

  if (uiText.hint.timer > 0) {
    uiText.hint.timer--;
  } else if (uiText.hint.timer <= 0) {
    uiText.hint.text = "";
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
  SRequestPointerLock();
}

function pauseGame() {
  gameRunning = false;
  menuState = MENU.PAUSE;
  SExitPointerLock();
}

function winGame() {
  gameRunning = false;
  menuState = MENU.WIN;
  SExitPointerLock();
}

function hasNextLevel() {
  return currentLevel + 1 < MAPS.length;
}

function nextGame() {
  loadLevel(currentLevel + 1);
  gameRunning = true;
  menuState = MENU.NONE;
  SRequestPointerLock();
}

function restartGame() {
  loadLevel(0);
  gameRunning = true;
  menuState = MENU.NONE;
  SRequestPointerLock();
}

let last = performance.now();

function animate(now) {
    c.clearRect(0, 0, W, H);

    if (!gameRunning) {
      drawMenu();
      requestAnimationFrame(animate);
      return;
    }

    updateUI();

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
    updateDoors()
    animateDoors(dt);
    castRays();
    drawSprites(now/1000);

    c.fillStyle = "white";
    c.font = "20px Arial";
    if (!REQUIRED_KEYS || REQUIRED_KEYS <= 0) {
      c.fillText(`Keys: ${keysCollected}`, 60, 60);
    } else {
      c.fillText(`Keys: ${keysCollected} / ${REQUIRED_KEYS}`, 60, 60);
    }
    c.fillText(`${msg}`, canvas.width / 2, canvas.height - 50);

    drawUI();

    requestAnimationFrame(animate);
}

requestAnimationFrame(animate);

window.__RC_MAP = MAP;
window.__RC_DOORS = doors;
window.__RC_ITEMS = items;
window.__RC_PLAYER = player;