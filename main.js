import './style.css';
import { getTheme, setTheme, updateTheme, drawBackground, createRaindrops, drawRaindrops } from './themes.js';

// Canvas setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 400;
canvas.height = 600;

// UI elements
const startScreen = document.getElementById('start-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const scoreDisplay = document.getElementById('score');
const finalScoreDisplay = document.getElementById('final-score');
const restartBtn = document.getElementById('restart-btn');
const themeBtn = document.getElementById('theme-toggle');
const difficultyButtons = document.querySelectorAll('.difficulty-btn');

if (themeBtn) {
  themeBtn.addEventListener('click', () => {
    const current = getTheme();
    const next = current === 'day' ? 'night' : current === 'night' ? 'rain' : 'day';
    setTheme(next);
    drawBackground();
    if (next === 'rain') drawRaindrops();
  });
}

// ---------------------- GAME STATE ----------------------
let gameState = 'start'; // 'start', 'playing', 'gameOver'
let score = 0;
let animationId = null;

// Difficulty settings
let difficulty = 'normal';
let pipeGap = 150;
let pipeSpeed = 2;

// Adaptive difficulty settings
const adaptiveIncreaseScore = 10; // every 10 points
const speedIncrement = 0.3; // increase speed slightly

// ---------------------- BIRD ----------------------
const bird = {
  x: 80,
  y: canvas.height / 2,
  width: 34,
  height: 24,
  velocity: 0,
  gravity: 0.5,
  jumpStrength: -9,

  draw() {
    ctx.fillStyle = '#ffd700';
    ctx.fillRect(this.x, this.y, this.width, this.height);

    // Eye
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(this.x + 25, this.y + 8, 3, 0, Math.PI * 2);
    ctx.fill();

    // Beak
    ctx.fillStyle = '#ff6b6b';
    ctx.beginPath();
    ctx.moveTo(this.x + this.width, this.y + 10);
    ctx.lineTo(this.x + this.width + 8, this.y + 12);
    ctx.lineTo(this.x + this.width, this.y + 14);
    ctx.closePath();
    ctx.fill();
  },

  update() {
    this.velocity += this.gravity;
    this.y += this.velocity;

    if (this.y < 0) {
      this.y = 0;
      this.velocity = 0;
    }

    if (this.y + this.height > canvas.height) {
      this.y = canvas.height - this.height;
      endGame();
    }
  },

  jump() {
    this.velocity = this.jumpStrength;
  },

  reset() {
    this.y = canvas.height / 2;
    this.velocity = 0;
  }
};

// ---------------------- PIPES ----------------------
const pipes = [];
const pipeWidth = 60;
let frameCount = 0;
const pipeSpawnInterval = 90;

function createPipe() {
  const minHeight = 50;
  const maxHeight = canvas.height - pipeGap - minHeight;
  const topHeight = Math.random() * (maxHeight - minHeight) + minHeight;

  pipes.push({
    x: canvas.width,
    topHeight,
    bottomY: topHeight + pipeGap,
    scored: false
  });
}

function drawPipes() {
  ctx.fillStyle = '#5cb85c';
  pipes.forEach(pipe => {
    ctx.fillRect(pipe.x, 0, pipeWidth, pipe.topHeight);
    ctx.fillStyle = '#4caf50';
    ctx.fillRect(pipe.x - 5, pipe.topHeight - 20, pipeWidth + 10, 20);

    ctx.fillStyle = '#5cb85c';
    ctx.fillRect(pipe.x, pipe.bottomY, pipeWidth, canvas.height - pipe.bottomY);

    ctx.fillStyle = '#4caf50';
    ctx.fillRect(pipe.x - 5, pipe.bottomY, pipeWidth + 10, 20);
  });
}

function updatePipes() {
  pipes.forEach(pipe => {
    pipe.x -= pipeSpeed;

    if (!pipe.scored && pipe.x + pipeWidth < bird.x) {
      pipe.scored = true;
      score++;
      scoreDisplay.textContent = score;
      updateTheme(score);

      // Adaptive difficulty increase
      if (score % adaptiveIncreaseScore === 0) {
        pipeSpeed += speedIncrement;
      }
    }
  });

  if (pipes.length > 0 && pipes[0].x + pipeWidth < 0) {
    pipes.shift();
  }

  frameCount++;
  if (frameCount % pipeSpawnInterval === 0) {
    createPipe();
  }
}

function checkCollision() {
  for (const pipe of pipes) {
    if (bird.x + bird.width > pipe.x && bird.x < pipe.x + pipeWidth) {
      if (bird.y < pipe.topHeight || bird.y + bird.height > pipe.bottomY) {
        endGame();
        return;
      }
    }
  }
}

// ---------------------- GAME LOOP ----------------------
function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (gameState === 'playing') {
    drawBackground();
    if (getTheme() === 'rain') drawRaindrops();

    bird.update();
    updatePipes();
    checkCollision();
    drawPipes();
    bird.draw();

    animationId = requestAnimationFrame(gameLoop);
  }
}

// ---------------------- GAME FLOW ----------------------
function startGame() {
  gameState = 'playing';
  score = 0;
  frameCount = 0;
  pipes.length = 0;
  bird.reset();
  scoreDisplay.textContent = score;

  startScreen.classList.add('hidden');
  gameOverScreen.classList.add('hidden');

  // Show difficulty buttons
  document.getElementById('difficulty-buttons').style.display = 'flex';

  createRaindrops();
  gameLoop();
}

function endGame() {
  if (gameState === 'gameOver') return;
  gameState = 'gameOver';
  cancelAnimationFrame(animationId);
  finalScoreDisplay.textContent = `Score: ${score}`;
  gameOverScreen.classList.remove('hidden');

  // Show difficulty buttons even on Game Over screen
  document.getElementById('difficulty-buttons').style.display = 'flex';
}

// ---------------------- CONTROLS ----------------------
document.addEventListener('keydown', e => {
  if (e.code === 'Space') {
    e.preventDefault();
    if (gameState === 'start') {
      startGame();
    } else if (gameState === 'playing') {
      bird.jump();
    }
  }
});

restartBtn.addEventListener('click', () => {
  // Apply currently selected difficulty before restarting
  const selectedBtn = document.querySelector('.difficulty-btn.selected'); 
  if (selectedBtn) selectedBtn.click(); // this sets pipeGap & pipeSpeed correctly
  startGame();
});


difficultyButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    // Remove previous selection
    difficultyButtons.forEach(b => b.classList.remove('selected'));

    // Add selection to clicked button
    btn.classList.add('selected');

    difficulty = btn.dataset.difficulty;

    if (difficulty === 'easy') {
      pipeGap = 250;
      pipeSpeed = 1.5;
    } else if (difficulty === 'normal') {
      pipeGap = 150;
      pipeSpeed = 2;
    } else if (difficulty === 'hard') {
      pipeGap = 100;
      pipeSpeed = 2.8;
    }

    console.log(`Difficulty set to ${difficulty}`);
  });
});

// Initialize first button as selected on page load
document.querySelector('.difficulty-btn[data-difficulty="normal"]').classList.add('selected');

// Initial draw
bird.draw();
