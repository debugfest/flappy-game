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
if(themeBtn){
  themeBtn.addEventListener('click', () => {
    // manual switch
    const current = getTheme();
    const next = current === 'day' ? 'night' : current === 'night' ? 'rain' : 'day';
    setTheme(next);

    // redraw background immediately
    drawBackground();
    if(next === 'rain') drawRaindrops();
  });
}


// Game state
let gameState = 'start'; // 'start', 'playing', 'gameOver'
let score = 0;
let animationId = null;

// Bird properties
const bird = {
  x: 80,
  y: canvas.height / 2,
  width: 34,
  height: 24,
  velocity: 0,
  gravity: 0.5,
  jumpStrength: -9,

  draw() {
    // Draw bird body (simple rectangle with rounded edges effect)
    ctx.fillStyle = '#ffd700';
    ctx.fillRect(this.x, this.y, this.width, this.height);

    // Draw bird eye
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(this.x + 25, this.y + 8, 3, 0, Math.PI * 2);
    ctx.fill();

    // Draw bird beak
    ctx.fillStyle = '#ff6b6b';
    ctx.beginPath();
    ctx.moveTo(this.x + this.width, this.y + 10);
    ctx.lineTo(this.x + this.width + 8, this.y + 12);
    ctx.lineTo(this.x + this.width, this.y + 14);
    ctx.closePath();
    ctx.fill();
  },

  update() {
    // Apply gravity
    this.velocity += this.gravity;
    this.y += this.velocity;

    // Prevent bird from going off screen top
    if (this.y < 0) {
      this.y = 0;
      this.velocity = 0;
    }

    // Check if bird hit the ground
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

// Pipe properties
const pipes = [];
const pipeWidth = 60;
const pipeGap = 150;
const pipeSpeed = 2;
let frameCount = 0;
const pipeSpawnInterval = 90; // Spawn pipe every 90 frames (1.5 seconds at 60fps)

/**
 * Creates a new pipe pair with random height
 * TODO: Add difficulty levels that change pipe gap size and speed
 */
function createPipe() {
  const minHeight = 50;
  const maxHeight = canvas.height - pipeGap - minHeight;
  const topHeight = Math.random() * (maxHeight - minHeight) + minHeight;

  pipes.push({
    x: canvas.width,
    topHeight: topHeight,
    bottomY: topHeight + pipeGap,
    scored: false
  });
}

/**
 * Draws all pipes on the canvas
 */
function drawPipes() {
  ctx.fillStyle = '#5cb85c';

  pipes.forEach(pipe => {
    // Draw top pipe
    ctx.fillRect(pipe.x, 0, pipeWidth, pipe.topHeight);

    // Draw pipe cap (top)
    ctx.fillStyle = '#4caf50';
    ctx.fillRect(pipe.x - 5, pipe.topHeight - 20, pipeWidth + 10, 20);

    // Draw bottom pipe
    ctx.fillStyle = '#5cb85c';
    ctx.fillRect(pipe.x, pipe.bottomY, pipeWidth, canvas.height - pipe.bottomY);

    // Draw pipe cap (bottom)
    ctx.fillStyle = '#4caf50';
    ctx.fillRect(pipe.x - 5, pipe.bottomY, pipeWidth + 10, 20);
  });
}

/**
 * Updates pipe positions and removes off-screen pipes
 */
function updatePipes() {
  // Move pipes left
  pipes.forEach(pipe => {
    pipe.x -= pipeSpeed;

    // Check if bird passed the pipe (for scoring)
    if (!pipe.scored && pipe.x + pipeWidth < bird.x) {
      pipe.scored = true;
      score++;
      scoreDisplay.textContent = score;
      updateTheme(score); 
    }
  });

  // Remove pipes that are off screen
  if (pipes.length > 0 && pipes[0].x + pipeWidth < 0) {
    pipes.shift();
  }

  // Spawn new pipes
  frameCount++;
  if (frameCount % pipeSpawnInterval === 0) {
    createPipe();
  }
}

/**
 * Checks collision between bird and pipes or ground
 * Uses rectangular collision detection
 */
function checkCollision() {
  for (const pipe of pipes) {
    // Check if bird is in horizontal range of pipe
    if (
      bird.x + bird.width > pipe.x &&
      bird.x < pipe.x + pipeWidth
    ) {
      // Check collision with top or bottom pipe
      if (
        bird.y < pipe.topHeight ||
        bird.y + bird.height > pipe.bottomY
      ) {
        endGame();
        return;
      }
    }
  }
}

/**
 * Main game loop - runs every frame
 */
function gameLoop() {
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (gameState === 'playing') {
    drawBackground();
    if(getTheme() === 'rain') drawRaindrops();

    // Update game objects
    bird.update();
    updatePipes();
    checkCollision();

    // Draw game objects
    drawPipes();
    bird.draw();

    // Continue loop
    animationId = requestAnimationFrame(gameLoop);
  }
}

/**
 * Starts a new game
 */
function startGame() {
  gameState = 'playing';
  score = 0;
  frameCount = 0;
  pipes.length = 0;

  bird.reset();
  scoreDisplay.textContent = score;

  startScreen.classList.add('hidden');
  gameOverScreen.classList.add('hidden');
  createRaindrops(); // prepares particles for rain
  //  if(theme === 'rain') createRaindrops();

  gameLoop();
}

/**
 * Ends the game and shows game over screen
 */
function endGame() {
  if (gameState === 'gameOver') return;

  gameState = 'gameOver';
  cancelAnimationFrame(animationId);

  finalScoreDisplay.textContent = `Score: ${score}`;
  gameOverScreen.classList.remove('hidden');

  // TODO: Save high scores to database for leaderboard feature
}

/**
 * Handles bird jump on spacebar press
 */
function handleKeyPress(e) {
  if (e.code === 'Space') {
    e.preventDefault();

    if (gameState === 'start') {
      startGame();
    } else if (gameState === 'playing') {
      bird.jump();
    }
  }
}

/**
 * Handles restart button click
 */
function handleRestart() {
  startGame();
}

// TODO: Add touch/click controls for mobile support
// TODO: Add different themes (night mode, seasonal themes)
// TODO: Add sound effects and background music
// TODO: Add difficulty levels (easy: slower pipes, larger gap; hard: faster pipes, smaller gap)
// TODO: Add particle effects on jump and collision
// TODO: Add leaderboard using Supabase database
// TODO: Add power-ups (shield, slow motion, double points)

// Event listeners
document.addEventListener('keydown', handleKeyPress);
restartBtn.addEventListener('click', handleRestart);

// Draw initial bird on start screen
bird.draw();
