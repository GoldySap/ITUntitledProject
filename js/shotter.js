let canvas = document.querySelector('canvas');

canvas.width = window.innerWidth
canvas.height = window.innerHeight

let c = canvas.getContext('2d');

function Cannon(x, y, dx, dy, radius) {
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
    this.fireRate = 150;
    this.lastShot = 0;

    this.maxHealth = 5;
    this.health = this.maxHealth;

    this.damage = 1;
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
    }

    this.update = function(xnum, ynum) {
        if (xnum < 0 && !(this.x - this.radius <= 0)) {
            this.x -= this.dx;
        } else if (xnum > 0 && !(this.y >= innerWidth - this.radius)) {
            this.x += this.dx;
        }
        if (ynum < 0 && !(this.y - this.radius <= 0)) {
            this.y -= this.dy;
        } else if (ynum > 0 && !(this.y >= innerHeight - this.radius)) {
            this.y += this.dy;
        }
        this.draw();
    }

    this.fire = function() {
        const now = Date.now();
        if (now - this.lastShot < this.fireRate) {
            this.recoilOffset = 0;
            return;
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
    }
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
        this.alpha = this.life / 50;

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
    constructor(x, y, dx, radius) {
        this.x = x;
        this.y = y;
        this.dx = dx;
        this.radius = radius;
        this.health = 3;
    }

    update() {
        this.x -= this.dx;
        this.draw();
    }

    draw() {
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        c.fillStyle = "#00ff00";
        c.fill();
    }
}

let can = new Cannon(200, 200, 4, 4, 30);
let xpos = 0;
let ypos = 0;
let bullets = [];
let particles = [];
let flashes = [];
let enemies = [];
let gameRunning = false;
let showUpgrades = false;
let enemySpawner;
let score = 0;

setInterval(() => {
  enemies.push(
    new Enemy(innerWidth + 50, Math.random() * innerHeight, 2, 25)
  );
}, 2000);

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

function startGame() {
    if (gameRunning) return;
    gameRunning = true;
    can.health = can.maxHealth;
    score = 0;
    bullets = [];
    particles = [];
    flashes = [];
    can.kills = 0;
    can.level = 1;

    enemySpawner = setInterval(() => {
        enemies.push(new Enemy(innerWidth + 50, Math.random() * innerHeight, 25, 2));
    }, 2000);
}

function stopGame() {
    gameRunning = false;
    clearInterval(enemySpawner);
}

function toggleGame() {
    if (gameRunning) stopGame();
    else startGame();
}
const upgrades = [
    {
        name: "Increase Damage",
        level: 0,
        max: 5,
        effect: () => (can.damage += 1),
    },
    {
        name: "Faster Fire Rate",
        level: 0,
        max: 5,
        effect: () => (can.fireRate *= 0.8),
    },
    {
        name: "Faster movement speed",
        level: 0,
        max: 5,
        effect: () => {
            can.dx += 5;
            can.dy += 5;
        },
    },
    {
        name: "More Health",
        level: 0,
        max: 5,
        effect: () => {
        can.maxHealth += 1;
        can.health = can.maxHealth;
        },
    },
];

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

function drawUpgrades() {
    c.fillStyle = "rgba(0,0,0,0.7)";
    c.fillRect(0, 0, canvas.width, canvas.height);

    c.fillStyle = "white";
    c.font = "30px Arial";
    c.textAlign = "center";
    c.fillText("Choose an Upgrade", canvas.width / 2, 100);

    const available = upgrades.filter((u) => u.level < u.max);
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

function animate() {
    requestAnimationFrame(animate);
    c.clearRect(0, 0, innerWidth, innerHeight);
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
        for (let j = enemies.length - 1; j >= 0; j--) {
            const e = enemies[j];
            const dx = b.x - e.x;
            const dy = b.y - e.y;
            const dist = Math.hypot(dx, dy);
            if (dist < b.radius + e.radius) {
                e.health--;
                bullets.splice(i, 1);
                if (e.health <= 0) {
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
            if (b.x < 0 || b.x > innerWidth || b.y < 0 || b.y > innerHeight) {
                bullets.splice(i, 1);
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
    for (let i = enemies.length - 1; i >= 0; i--) {
        enemies[i].update();
        if (enemies[i].x < -50) enemies.splice(i, 1);
    }
    enemies.forEach((e, i) => {
        e.update();
        const dx = e.x - can.x;
        const dy = e.y - can.y;
        const dist = Math.hypot(dx, dy);
        if (dist < e.radius + can.radius) {
        enemies.splice(i, 1);
        can.health--;
        if (can.health <= 0) stopGame();
        }
        if (e.x < -50) enemies.splice(i, 1);
    });
    c.fillStyle = "white";
    c.font = "20px Arial";
    c.fillText(`Score: ${score}`, 80, 40);
    c.fillText(`Level: ${can.level}`, 80, 70);
}

animate();