const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const width = canvas.width;
const height = canvas.height;

ctx.textAlign = "center";
ctx.textBaseline = "middle";

// ✦ - ✦ - ✦ - ✦ - ✦ - ✦ - ✦ - ✦ - ✦ - ✦ - ✦
// ПАНЕЛЬ НАЛАШТУВАНЬ ГРИ
// ✦ - ✦ - ✦ - ✦ - ✦ - ✦ - ✦ - ✦ - ✦ - ✦ - ✦

const SETTINGS = {
  ufoSpeed: 6, // Швидкість НЛО
  ufoSize: 55, // Розмір НЛО

  starSpeed: 10, // Швидкість зірочки
  starSize: 50, // Розмір зірочки
  shootWaitTime: 250, // Затримка між пострілами (менше = швидше)

  alienSpeed: 2, // Швидкість прибульців
  alienSize: 35, // Розмір прибульців
  alienWaitTime: 1200, // Як часто з'являються вороги
  maxAliens: 5, // Максимум ворогів на екрані
};

// Базовий стан гри
let score = 0;
let gameOver = false;
let isStarted = false;

let lastShootTime = 0;
let lastAlienTime = 0;

const stars = [];
const aliens = [];
let ufo;

const keys = {
  KeyW: false,
  KeyA: false,
  KeyS: false,
  KeyD: false,
  ArrowUp: false,
  ArrowDown: false,
  ArrowLeft: false,
  ArrowRight: false,
};

// ✦ - ✦ - ✦ - ✦ - ✦ - ✦ - ✦ - ✦ - ✦ - ✦ - ✦
// КЛАСИ (Об'єкти гри)
// ✦ - ✦ - ✦ - ✦ - ✦ - ✦ - ✦ - ✦ - ✦ - ✦ - ✦

// 🌌 Ufo
class Ufo {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = SETTINGS.ufoSize;
    this.speed = SETTINGS.ufoSpeed;
    this.hitArea = this.size * 0.6;
    this.emoji = "🐒";
  }

  draw(ctx) {
    ctx.font = this.size + "px Arial";
    ctx.fillText(this.emoji, this.x, this.y);
  }

  move(keys, canvasWidth, canvasHeight) {
    const canMoveUp = this.y > this.size / 2;
    const canMoveDown = this.y < canvasHeight - this.size / 2;
    const canMoveLeft = this.x > this.size / 2;
    const canMoveRight = this.x < canvasWidth - this.size / 2;

    if (keys.KeyW && canMoveUp) this.y -= this.speed;
    if (keys.KeyS && canMoveDown) this.y += this.speed;
    if (keys.KeyA && canMoveLeft) this.x -= this.speed;
    if (keys.KeyD && canMoveRight) this.x += this.speed;
  }
}

// 🌌 Star
class Star {
  constructor(x, y, vx, vy) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.size = SETTINGS.starSize;
    this.emoji = "🍌";
  }

  move() {
    this.x += this.vx;
    this.y += this.vy;
  }

  draw(ctx) {
    ctx.font = this.size + "px Arial";
    ctx.fillText(this.emoji, this.x, this.y);
  }

  isOut = (w, h) => this.x < 0 || this.x > w || this.y < 0 || this.y > h;
}

// 🌌 Alien
class Alien {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.speed = SETTINGS.alienSpeed;
    this.size = SETTINGS.alienSize;
    this.emoji = "🐊";
  }

  draw(ctx) {
    ctx.font = this.size + "px Arial";
    ctx.fillText(this.emoji, this.x, this.y);
  }

  move(target) {
    const angle = Math.atan2(target.y - this.y, target.x - this.x);
    this.x += Math.cos(angle) * this.speed;
    this.y += Math.sin(angle) * this.speed;
  }
}

// ✦ - ✦ - ✦ - ✦ - ✦ - ✦ - ✦ - ✦ - ✦ - ✦ - ✦
// ФУНКЦІЇ СТАНУ ГРИ
// ✦ - ✦ - ✦ - ✦ - ✦ - ✦ - ✦ - ✦ - ✦ - ✦ - ✦

function startGame() {
  score = 0;
  gameOver = false;
  isStarted = true;

  stars.length = 0;
  aliens.length = 0;

  lastAlienTime = Date.now();
  lastShootTime = 0;

  ufo = new Ufo(width / 2, height / 2);
}

// ✦ - ✦ - ✦ - ✦ - ✦ - ✦ - ✦ - ✦ - ✦ - ✦ - ✦
// ФУНКЦІЇ МАЛЮВАННЯ (Меню та Інтерфейс)
// ✦ - ✦ - ✦ - ✦ - ✦ - ✦ - ✦ - ✦ - ✦ - ✦ - ✦

function drawScore() {
  ctx.save();
  ctx.fillStyle = "#66fcf1";
  ctx.textAlign = "left";
  ctx.font = "bold 24px Arial";
  ctx.fillText("Рахунок: " + score, 20, 40);
  ctx.restore();
}
 
function drawMenu() {
  ctx.fillStyle = "rgba(11, 12, 16, 0.8)";
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = "#66fcf1";
  ctx.font = "bold 50px Arial";
  ctx.fillText("Jungle Arcade 🌴", width / 2, height / 2 - 40);
  ctx.fillStyle = "#c5c6c7";
  ctx.font = "20px Arial";
  ctx.fillText("Натисни ПРОБІЛ, щоб почати", width / 2, height / 2 + 30);
  ctx.fillText("WASD - рух, СТРІЛКИ - стрільба", width / 2, height / 2 + 70);
}
 
function drawEnd() {
  ctx.fillStyle = "rgba(11, 12, 16, 0.8)";
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = "#66fcf1";
  ctx.font = "bold 50px Arial";
  ctx.fillText("Кінець гри!", width / 2, height / 2 - 40);
  ctx.font = "30px Arial";
  ctx.fillText(`Твій рахунок: ${score}`, width / 2, height / 2 + 10);
  ctx.fillStyle = "#c5c6c7";
  ctx.font = "20px Arial";
  ctx.fillText("Натисни ПРОБІЛ, щоб грати знову", width / 2, height / 2 + 60);
}

// ✦ - ✦ - ✦ - ✦ - ✦ - ✦ - ✦ - ✦ - ✦ - ✦ - ✦
// ФУНКЦІЇ ІГРОВОЇ ЛОГІКИ
// ✦ - ✦ - ✦ - ✦ - ✦ - ✦ - ✦ - ✦ - ✦ - ✦ - ✦

// 🌌 shootStars
function shootStars(now) {
  const canShoot = now - lastShootTime > SETTINGS.shootWaitTime;

  if (canShoot) {
    let dx = 0;
    let dy = 0;

    if (keys.ArrowUp) dy -= 1;
    if (keys.ArrowDown) dy += 1;
    if (keys.ArrowLeft) dx -= 1;
    if (keys.ArrowRight) dx += 1;

    if (dx !== 0 || dy !== 0) {
      const distance = Math.hypot(dx, dy);
      const vx = (dx / distance) * SETTINGS.starSpeed;
      const vy = (dy / distance) * SETTINGS.starSpeed;

      stars.push(new Star(ufo.x, ufo.y, vx, vy));
      lastShootTime = now;
    }
  }
}

// 🌌 makeAlien
function makeAlien(now) {
  const isTime = now - lastAlienTime > SETTINGS.alienWaitTime;

  if (isTime && aliens.length < SETTINGS.maxAliens) {
    let x;
    let y;

    if (Math.random() < 0.5) {
      x = Math.random() * width;
      y = Math.random() < 0.5 ? -40 : height + 40;
    } else {
      x = Math.random() < 0.5 ? -40 : width + 40;
      y = Math.random() * height;
    }

    aliens.push(new Alien(x, y));
    lastAlienTime = now;
  }
}

// 🌌 isHit
function isHit(obj1, obj2) {
  const distance = Math.hypot(obj1.x - obj2.x, obj1.y - obj2.y);
  return distance < obj1.size / 2 + obj2.size / 2;
}

// 🌌 updateAll
function updateAll() {
  for (let i = stars.length - 1; i >= 0; i--) {
    let star = stars[i];
    star.move();

    if (star.isOut(width, height)) stars.splice(i, 1);
  }

  for (let i = aliens.length - 1; i >= 0; i--) {
    let alien = aliens[i];
    alien.move(ufo);

    const ufoHitArea = { x: ufo.x, y: ufo.y, size: ufo.hitArea };
    if (isHit(ufoHitArea, alien)) {
      gameOver = true;
      break;
    }

    for (let j = stars.length - 1; j >= 0; j--) {
      let star = stars[j];

      if (isHit(alien, star)) {
        aliens.splice(i, 1);
        stars.splice(j, 1);
        score += 10;
        break;
      }
    }
  }
}

// ✦ - ✦ - ✦ - ✦ - ✦ - ✦ - ✦ - ✦ - ✦ - ✦ - ✦
// КЕРУВАННЯ КЛАВІАТУРОЮ
// ✦ - ✦ - ✦ - ✦ - ✦ - ✦ - ✦ - ✦ - ✦ - ✦ - ✦

window.addEventListener("keydown", (e) => {
  if (keys.hasOwnProperty(e.code)) keys[e.code] = true;
  if (e.code === "Space") {
    if (!isStarted || gameOver) startGame();
    e.preventDefault();
  }
});

window.addEventListener("keyup", (e) => {
  if (keys.hasOwnProperty(e.code)) keys[e.code] = false;
});

// ✦ - ✦ - ✦ - ✦ - ✦ - ✦ - ✦ - ✦ - ✦ - ✦ - ✦
// ГОЛОВНИЙ ЦИКЛ ГРИ (Play)
// ✦ - ✦ - ✦ - ✦ - ✦ - ✦ - ✦ - ✦ - ✦ - ✦ - ✦

function play() {
  requestAnimationFrame(play);
  ctx.clearRect(0, 0, width, height);
 
  if (!isStarted) {
    drawMenu();
    return;
  }
 
  if (gameOver) {
    drawEnd();
    return;
  }
 
  const now = Date.now();
 
  ufo.move(keys, width, height);
  shootStars(now);
  makeAlien(now);
  updateAll();
 
  ufo.draw(ctx);
  stars.forEach((star) => star.draw(ctx));
  aliens.forEach((alien) => alien.draw(ctx));
  drawScore();
}

// ✦ - ✦ - ✦ - ✦ - ✦ - ✦ - ✦ - ✦ - ✦ - ✦ - ✦
// Запускаємо гру!
// startGame();
play(); // Запускаємо гру!
