let canvas = document.querySelector('canvas');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let c = canvas.getContext('2d');

function Castle(x, y, width, height, maxHealth) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;

    this.maxHealth = maxHealth;
    this.health = this.maxHealth;

    this.draw = function() {
        c.save();
        c.translate(this.x, this.y);

        c.fillStyle = "#0000ff";
        c.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
        
        const barWidth = 80;
        const barHeight = 10;

        c.fillStyle = "#333";
        c.fillRect(-barWidth / 2, -this.height / 2 - 25, barWidth, barHeight);

        const healthWidth = (this.health / this.maxHealth) * barWidth;
        c.fillStyle = "#00ff00";
        c.fillRect(-barWidth / 2, -this.height / 2 - 25, healthWidth, barHeight);

        c.restore();
    };

    this.update = function() {
        this.draw();
    };
}

function Cannon(x, y, dx, dy, radius, maxHealth, damage, firerate) {
    this.x = x;
    this.y = y;
    this.dx = dx;
    this.dy = dy;
    this.radius = radius;

    this.angle = 0;
    this.barrelLength = 60;
    this.barrelWidth = 30;

    this.recoilOffset = 0;
    this.recoilStrength = 6;
    this.recoilRecovery = 0.3;

    this.isFiring = false;
    this.fireRate = firerate;
    this.lastShot = 0;

    this.maxHealth = maxHealth;
    this.health = this.maxHealth;

    this.damage = damage;
    this.level = 1;
    this.kills = 0;

    this.draw = function() {
        c.save();
        c.translate(this.x, this.y);
        c.rotate(this.angle);

        c.fillStyle = "#444";
        c.fillRect(
            this.recoilOffset,
            -this.barrelWidth / 2,
            this.barrelLength,
            this.barrelWidth
        );

        c.restore();

        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        c.fillStyle = "#ff0000";
        c.fill();
        c.strokeStyle = "#ff0000ff";
        c.stroke();

        const barWidth = 80;
        const barHeight = 10;
        const barX = this.x - barWidth / 2;
        const barY = this.y - this.radius - 25;

        c.fillStyle = "#333";
        c.fillRect(barX, barY, barWidth, barHeight);

        const healthWidth = (this.health / this.maxHealth) * barWidth;
        c.fillStyle = "#00ff00";
        c.fillRect(barX, barY, healthWidth, barHeight);
    };

    this.update = function(xnum, ynum) {
        if (xnum < 0 && !(this.x - this.radius <= 0)) {
            this.x -= this.dx;
        } else if (xnum > 0 && !(this.x >= canvas.width - this.radius)) {
            this.x += this.dx;
        }
        if (ynum < 0 && !(this.y - this.radius <= 0)) {
            this.y -= this.dy;
        } else if (ynum > 0 && !(this.y >= canvas.height - this.radius)) {
            this.y += this.dy;
        }
        if (this.recoilOffset < 0) {
            this.recoilOffset += this.recoilRecovery;
            if (this.recoilOffset > 0) this.recoilOffset = 0;
        }
        this.draw();
    };

    this.fire = function() {
        const now = Date.now();
        if (now - this.lastShot < this.fireRate) {
            this.recoilOffset += 1;
            return;
        } else {
        this.recoilOffset = 0; 
        }
        this.lastShot = now;
        const tipX = this.x + Math.cos(this.angle) * this.barrelLength;
        const tipY = this.y + Math.sin(this.angle) * this.barrelLength;
        bullets.push(new Bullet(tipX, tipY, 10, this.angle));
        flashes.push(new Flash(tipX, tipY));
        for (let i = 0; i < 10; i++) {
            particles.push(new Particle(tipX, tipY, this.angle));
        }
        this.recoilOffset = -this.recoilStrength;
    };
}

function Bullet(x, y, dx, angle) {
    this.x = x;
    this.y = y;
    this.dx = dx;
    this.radius = 5;
    this.angle = angle;

    this.update = function() {
        this.x += Math.cos(this.angle) * this.dx;
        this.y += Math.sin(this.angle) * this.dx;
        this.draw();
    };

    this.draw = function() {
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        c.fillStyle = "#ffff00";
        c.fill();
    };
}

class Particle {
    constructor(x, y, angle) {
        this.x = x;
        this.y = y;
        this.dx = Math.random() * 4 + 1;
        this.angle = angle + (Math.random() - 0.5) * 0.6;
        this.life = 30 + Math.random() * 20;
        this.alpha = 1;
    }

    update() {
        this.x += Math.cos(this.angle) * this.dx;
        this.y += Math.sin(this.angle) * this.dx;
        this.life--;
        this.alpha = Math.max(0, this.life / 50);

        if (this.life > 0) this.draw();
    }

    draw() {
        c.globalAlpha = this.alpha;
        c.fillStyle = "#ffaa00";
        c.beginPath();
        c.arc(this.x, this.y, 3, 0, Math.PI * 2);
        c.fill();
        c.globalAlpha = 1;
    }
}

class Flash {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.life = 5;
        this.maxLife = 5;
    }

    update() {
        this.life--;
        if (this.life > 0) this.draw();
    }

    draw() {
        const size = (1 - this.life / this.maxLife) * 20;
        c.globalAlpha = this.life / this.maxLife;
        c.fillStyle = "#ffff88";
        c.beginPath();
        c.arc(this.x, this.y, size, 0, Math.PI * 2);
        c.fill();
        c.globalAlpha = 1;
    }
}

class Enemy {
    constructor(x, y, dx, angle, radius) {
        this.x = x;
        this.y = y;
        this.dx = dx;
        this.angle = angle;
        this.radius = radius;
        this.color = "#00ff00";
        this.health = 3;
    }

    update() {
        this.x += Math.cos(this.angle) * this.dx;
        this.y += Math.sin(this.angle) * this.dx;
        this.draw();
    }

    draw() {
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        c.fillStyle = this.color;
        c.fill();
    }
    
    die() {
        for (let i = 0; i < 10; i++) {
            particles.push(new Particle(this.x, this.y, Math.random() * Math.PI * 2));
        }
    }
}

const defaultX = 200;
const defaultDx = 4;
const defaultY = 200;
const defaultDy = 4;
const defaultMaxHealth = 5;
const defaultDamage = 1;
const defaultFireRate = 150;
let can = new Cannon(defaultX, defaultY, defaultDx, defaultDy, 30, defaultMaxHealth, defaultDamage, defaultFireRate);
let castle = new Castle(canvas.width / 2, canvas.height / 2, 50, 50, 5);
let xpos = 0;
let ypos = 0;
let bullets = [];
let particles = [];
let flashes = [];
let enemies = [];
let gameRunning = false;
let showUpgrades = false;
let enemySpawner = null;
let score = 0;
let timemod = can.level * 10;
let intertime = 1000;

document.addEventListener('mousemove', (event) => {
    const dx = event.clientX - can.x;
    const dy = event.clientY - can.y;
    can.angle = Math.atan2(dy, dx);
});
document.addEventListener("mousedown", () => {can.isFiring = true;});
document.addEventListener("mouseup", () => {can.isFiring = false;});
document.addEventListener('keydown', (event) => {
    if (event.key === 'w') ypos = -1;
    if (event.key === 'a') xpos = -1;
    if (event.key === 's') ypos = 1;
    if (event.key === 'd') xpos = 1;
    if (event.key === "Enter" && !showUpgrades) toggleGame();
});

document.addEventListener('keyup', (event) => {
    if (event.key === 'a' || event.key === 'd') xpos = 0;
    if (event.key === 'w' || event.key === 's') ypos = 0;
});

function getAngle(fromX, fromY, toX, toY) {
    return Math.atan2(toY - fromY, toX - fromX);
}

function spawnEnemy() {

    let count = Math.min(1 + Math.floor(can.level / 2), 7);

    for (let i = 0; i < count; i++) {
        const side = Math.floor(Math.random() * 4);
        let x, y;

        switch (side) {
            case 0: x = -50; y = Math.random() * canvas.height; break;
            case 1: x = canvas.width + 50; y = Math.random() * canvas.height; break;
            case 2: x = Math.random() * canvas.width; y = -50; break;
            case 3: x = Math.random() * canvas.width; y = canvas.height + 50; break;
        }

        const angle = getAngle(x, y, castle.x, castle.y);

        const speed = 1 + can.level * 0.1;
        const health = 3 + Math.floor(can.level / 2);

        let enemy = new Enemy(x, y, speed, angle, 25);
        enemy.health = health;

        enemies.push(enemy);
    }
}



function startGame() {
    if (gameRunning) return;
    gameRunning = true;
    can.health = can.maxHealth;
    score = 0;
    bullets = [];
    particles = [];
    flashes = [];
    enemies = [];
    can.kills = 0;
    can.level = 0;
    timemod = can.level * 5;
    intertime = Math.max(200, 2000 - timemod);
    enemySpawner = setInterval(spawnEnemy, intertime);
}

function stopGame() {
    gameRunning = false;
    clearInterval(enemySpawner);
}

function toggleGame() {
    if (gameRunning) {
        stopGame();
    } else {
        startGame();
    }
}

const canUpgrades = [
    {
        name: "Increase Damage",
        level: 0,
        max: 3,
        effect: () => (can.damage += 0.5),
    },
    {
        name: "Faster Fire Rate",
        level: 0,
        max: 5,
        effect: () => (can.fireRate *= 0.85),
    },
    {
        name: "Faster movement speed",
        level: 0,
        max: 5,
        effect: () => {
            can.dx += 1;
            can.dy += 1;
        },
    },
    {
        name: "More Cannon Health",
        level: 0,
        max: 5,
        effect: () => {
            can.maxHealth += 1;
            can.health = can.maxHealth;
        },
    }
];

const castleUpgrades = [
    {
        name: "More Castle Health",
        level: 0,
        max: 5,
        effect: () => {
            castle.maxHealth += 2;
            castle.health = castle.maxHealth;
        },
    },
    {
        name: "Heal Castle",
        level: 0,
        max: 5,
        effect: () => {
            castle.health = castle.maxHealth;
        },
    },
];

const upgrades = [...canUpgrades, ...castleUpgrades];

function openUpgradeMenu() {
    showUpgrades = true;
    gameRunning = false;
}

function applyUpgrade(upgrade) {
    if (upgrade.level < upgrade.max) {
        upgrade.level++;
        upgrade.effect();
        showUpgrades = false;
        gameRunning = true;
    }
}

function resetUpgrades() {
    can.dx = defaultDx;
    can.dy = defaultDy;
    can.maxHealth = defaultMaxHealth;
    can.health = can.maxHealth;
    can.damage = defaultDamage;
    can.fireRate = defaultFireRate;
    castle.maxHealth = defaultMaxHealth;
    castle.health = castle.maxHealth;
    upgrades.forEach(u => u.level = 0);
}

function drawUpgrades() {
    c.fillStyle = "rgba(0, 0, 0, 0.2)";
    c.fillRect(0, 0, canvas.width, canvas.height);

    c.fillStyle = "white";
    c.font = "30px Arial";
    c.textAlign = "center";
    c.fillText("Choose an Upgrade", canvas.width / 2, 100);

    const available = upgrades.filter((u) => u.level < u.max);
    for (let i = upgrades.length; i > 0; i--) {
        available.forEach((upgrade, i) => {
            const x = canvas.width / 2;
            const y = 200 + i * 100;
            const width = 300;
            const height = 60;

            c.fillStyle = "#333";
            c.fillRect(x - width / 2, y - height / 2, width, height);

            c.strokeStyle = "#fff";
            c.strokeRect(x - width / 2, y - height / 2, width, height);

            c.fillStyle = "#fff";
            c.font = "20px Arial";
            c.fillText(`${upgrade.name} (${upgrade.level}/${upgrade.max})`, x, y + 5);
        });
    }

    canvas.onclick = (e) => {
        const rect = canvas.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;
        const available = upgrades.filter((u) => u.level < u.max);
        available.forEach((upgrade, i) => {
            const x = canvas.width / 2;
            const y = 200 + i * 100;
            const width = 300;
            const height = 60;
            if (mx > x - width / 2 && mx < x + width / 2 && my > y - height / 2 && my < y + height / 2) {
                applyUpgrade(upgrade);
                canvas.onclick = null;
            }
        });
    };
}

function lc(hexColor, factor) {
    hexColor = hexColor.startsWith('#') ? hexColor.slice(1) : hexColor;
    let r = parseInt(hexColor.substring(0, 2), 16);
    let g = parseInt(hexColor.substring(2, 4), 16);
    let b = parseInt(hexColor.substring(4, 6), 16);
    r = Math.min(255, r + Math.round((255 - r) * factor));
    g = Math.min(255, g + Math.round((255 - g) * factor));
    b = Math.min(255, b + Math.round((255 - b) * factor));
    const toHex = (c) => ('0' + c.toString(16)).slice(-2);
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function collisionCheck(obj, area, enemies, i) {
    const dx = e.x - obj.x;
    const dy = e.y - obj.y;
    const dist = Math.hypot(dx, dy);
    if (dist < e.radius + area) {
        e.die();
        enemies.splice(i, 1);
        obj.health--;
        if (obj.health <= 0) {
            stopGame();
            resetUpgrades();
            enemies.splice(0, enemies.length);
        }
    }
}

function animate() {
    requestAnimationFrame(animate);
    c.clearRect(0, 0, canvas.width, canvas.height);

    if (!gameRunning && !showUpgrades) {
        c.fillStyle = "white";
        c.font = "40px Arial";
        c.textAlign = "center";
        c.fillText("Press ENTER to Start", canvas.width / 2, canvas.height / 2);
        return;
    }
    if (!gameRunning && showUpgrades) {
        drawUpgrades();
        return;
    }

    can.update(xpos, ypos);
    if (can.isFiring) can.fire();

    for (let i = bullets.length - 1; i >= 0; i--) {
        const b = bullets[i];
        b.update();
        if (b.x < 0 || b.x > canvas.width || b.y < 0 || b.y > canvas.height) {
            bullets.splice(i, 1);
            continue;
        }
        for (let j = enemies.length - 1; j >= 0; j--) {
            const e = enemies[j];
            const dx = b.x - e.x;
            const dy = b.y - e.y;
            const dist = Math.hypot(dx, dy);
            if (dist < b.radius + e.radius) {
                e.color = lc(e.color, (Math.hypot(e.health) / (2 * e.health)) + 0.1);
                e.health -= can.damage;
                bullets.splice(i, 1);
                if (e.health <= 0) {
                    e.die();
                    enemies.splice(j, 1);
                    can.kills++;
                    score++;
                    if (can.kills % 5 === 0) {
                        can.level++;
                        openUpgradeMenu();
                    }
                }
                break;
            }
        }
    }

    for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update();
        if (particles[i].life <= 0) particles.splice(i, 1);
    }
    for (let i = flashes.length - 1; i >= 0; i--) {
        flashes[i].update();
        if (flashes[i].life <= 0) flashes.splice(i, 1);
    }
    enemies.forEach((e, i) => {
        e.update();
        collisionCheck(can, can.radius, enemies, i)
        const castleRadius = Math.max(castle.width, castle.height) * 0.5;
        collisionCheck(castle, castleRadius, enemies, i)
    });

    castle.update();

    c.fillStyle = "white";
    c.font = "20px Arial";
    c.fillText(`Score: ${score}`, 80, 40);
    c.fillText(`Level: ${can.level}`, 80, 70);
}

animate();
