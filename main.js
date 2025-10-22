import './style.css';
import { getTheme, setTheme, updateTheme, drawBackground, createRaindrops, drawRaindrops } from './themes.js';
import { getCurrentGap, getCurrentSpeed, onPipePassed, initDifficulty } from './difficulty.js';

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

const characterSelection = document.getElementById('character-selection');
const skinsListEl = document.getElementById('skins-list');
const confirmSkinBtn = document.getElementById('confirm-skin');
const coinCountEl = document.getElementById('coin-count');
const coinHudCount = document.getElementById('coin-hud-count');
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
let gameState = 'start'; // 'start', 'characterSelect', 'playing', 'gameOver'
let score = 0;
let coins = 0;
let animationId = null;

// Difficulty settings 
let pipeGap = getCurrentGap ? getCurrentGap() : 150;
let pipeSpeed = getCurrentSpeed ? getCurrentSpeed() : 2;

const adaptiveIncreaseScore = 10; 
const speedIncrement = 0.3;

const SKINS = [
  {
    id: 'default',
    name: 'Yellowbird',
    unlockScore: 0,
    unlockCoins: 0,
    draw(ctx, x, y, w, h) {
      ctx.fillStyle = '#ffd700';
      ctx.fillRect(x, y, w, h);
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(x + 20, y + 7, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ff6b6b';
      ctx.beginPath();
      ctx.moveTo(x + w, y + 8);
      ctx.lineTo(x + w + 8, y + 10);
      ctx.lineTo(x + w, y + 12);
      ctx.closePath();
      ctx.fill();
    }
  },
  {
    id: 'parrot',
    name: 'Parrot',
    unlockScore: 8,
    unlockCoins: 0,
    draw(ctx, x, y, w, h) {
      ctx.fillStyle = '#2ecc71';
      ctx.fillRect(x, y, w, h);
      ctx.fillStyle = '#3498db';
      ctx.fillRect(x + 4, y - 4, w - 8, h / 2);
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(x + 18, y + 8, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(x + 18, y + 8, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#e67e22';
      ctx.beginPath();
      ctx.moveTo(x + w, y + 10);
      ctx.lineTo(x + w + 10, y + 12);
      ctx.lineTo(x + w, y + 14);
      ctx.closePath();
      ctx.fill();
    }
  },
  {
    id: 'humming',
    name: 'Hummingbird',
    unlockScore: 16,
    unlockCoins: 3,
    draw(ctx, x, y, w, h) {
      ctx.fillStyle = '#9b59b6';
      ctx.fillRect(x, y, w - 8, h);
      ctx.fillStyle = '#8e44ad';
      ctx.beginPath();
      ctx.ellipse(x + 8, y + 12, 10, 6, -0.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(x + 18, y + 8, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  },
  {
    id: 'owl',
    name: 'Owl',
    unlockScore: 28,
    unlockCoins: 6,
    draw(ctx, x, y, w, h) {
      ctx.fillStyle = '#6b4f4f';
      ctx.fillRect(x, y, w, h);
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(x + 14, y + 8, 6, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(x + 24, y + 8, 6, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#000';
      ctx.beginPath(); ctx.arc(x + 14, y + 8, 2.5, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(x + 24, y + 8, 2.5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#f1c40f';
      ctx.beginPath();
      ctx.moveTo(x + w - 2, y + 11); ctx.lineTo(x + w + 6, y + 13); ctx.lineTo(x + w - 2, y + 15);
      ctx.closePath(); ctx.fill();
    }
  }
];

// localStorage keys
const LS_SELECTED_SKIN = 'flappy_selected_skin';
const LS_UNLOCKED_SKINS = 'flappy_unlocked_skins';
let unlockedSkins = new Set();
let selectedSkinId = localStorage.getItem(LS_SELECTED_SKIN) || 'default';

// load unlocked skins
(function loadUnlocked() {
  const raw = localStorage.getItem(LS_UNLOCKED_SKINS);
  if (raw) {
    try {
      const arr = JSON.parse(raw);
      unlockedSkins = new Set(arr);
    } catch (e) {
      unlockedSkins = new Set(['default']);
    }
  }
  if (!unlockedSkins.has('default')) unlockedSkins.add('default');
})();

function saveUnlocked() {
  localStorage.setItem(LS_UNLOCKED_SKINS, JSON.stringify([...unlockedSkins]));
}
function saveSelectedSkin() {
  localStorage.setItem(LS_SELECTED_SKIN, selectedSkinId);
}

function getSkinById(id) {
  return SKINS.find(s => s.id === id) || SKINS[0];
}

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
    const skin = getSkinById(selectedSkinId);
    skin.draw(ctx, this.x, this.y, this.width, this.height);
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
  // consult difficulty's currentGap (sync to UI selection)
  const activeGap = pipeGap;
  const maxHeight = canvas.height - activeGap - minHeight;
  const topHeight = Math.random() * (maxHeight - minHeight) + minHeight;

  pipes.push({
    x: canvas.width,
    topHeight,
    bottomY: topHeight + activeGap,
    scored: false
  });
}

function drawPipes() {
  pipes.forEach(pipe => {
    ctx.fillStyle = '#5cb85c';
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

      // inform difficulty adaptive module
      if (typeof onPipePassed === 'function') onPipePassed();

      // Adaptive difficulty (legacy)
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

// ---------------------- COINS ----------------------
const coinsArr = [];
const coinRadius = 8;
let coinSpawnTimer = 0;
const coinSpawnInterval = 230; 

function createCoin() {
  const y = Math.random() * (canvas.height - 80) + 40;
  coinsArr.push({ x: canvas.width + 20, y, r: coinRadius, collected: false });
}

function updateCoins() {
  coinsArr.forEach(coin => {
    coin.x -= pipeSpeed; 
    const distX = (bird.x + bird.width / 2) - coin.x;
    const distY = (bird.y + bird.height / 2) - coin.y;
    const dist = Math.sqrt(distX * distX + distY * distY);
    if (!coin.collected && dist < coinRadius + Math.min(bird.width, bird.height) / 2) {
      coin.collected = true;
      coins++;
      coinCountEl.textContent = coins;
      coinHudCount.textContent = coins;
    }
  });
  while (coinsArr.length && (coinsArr[0].x + coinRadius < 0 || coinsArr[0].collected)) {
    coinsArr.shift();
  }

  coinSpawnTimer++;
  if (coinSpawnTimer % coinSpawnInterval === 0) {
    createCoin();
  }
}

function drawCoins() {
  coinsArr.forEach(coin => {
    if (coin.collected) return;
    ctx.beginPath();
    ctx.fillStyle = '#f5c542';
    ctx.arc(coin.x, coin.y, coin.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.arc(coin.x - 3, coin.y - 3, 2.5, 0, Math.PI * 2);
    ctx.fill();
  });
}

// ---------------------- GAME LOOP ----------------------
function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (gameState === 'playing') {
    drawBackground();
    if (getTheme() === 'rain') drawRaindrops();

    bird.update();
    updatePipes();
    updateCoins();
    checkCollision();
    drawPipes();
    drawCoins();
    bird.draw();

    animationId = requestAnimationFrame(gameLoop);
  }
}

// ---------------------- GAME FLOW ----------------------
function openCharacterSelection() {
  skinsListEl.innerHTML = '';
  SKINS.forEach(skin => {
    const card = document.createElement('div');
    card.className = 'skin-card';
    if (!unlockedSkins.has(skin.id)) card.classList.add('locked');
    if (skin.id === selectedSkinId) card.classList.add('selected');

    const preview = document.createElement('canvas');
    preview.className = 'skin-preview';
    preview.width = 100 ;
    preview.height = 60;
    preview.style.display = 'block';

    // draw preview
    const pctx = preview.getContext('2d');
    pctx.clearRect(0,0,preview.width, preview.height);
    // center draw
    skin.draw(pctx, 10, 10, 40, 30);

    const title = document.createElement('div');
    title.textContent = skin.name;

    const lockInfo = document.createElement('div');
    lockInfo.style.fontSize = '10px';
    lockInfo.style.marginTop = '6px';
    if (!unlockedSkins.has(skin.id)) {
      lockInfo.textContent = `Lock: score ${skin.unlockScore} or ${skin.unlockCoins} coins`;
    } else {
      lockInfo.textContent = 'Unlocked';
    }

    card.appendChild(preview);
    card.appendChild(title);
    card.appendChild(lockInfo);

    card.addEventListener('click', () => {
      // if locked, attempting to unlock
      if (!unlockedSkins.has(skin.id)) {
        if (score >= skin.unlockScore || coins >= skin.unlockCoins) {
          unlockedSkins.add(skin.id);
          saveUnlocked();
          // if coins used for unlock, deduct coins if condition required:
          if (coins >= skin.unlockCoins && skin.unlockCoins > 0) {
            coins -= skin.unlockCoins;
            coinCountEl.textContent = coins;
            coinHudCount.textContent = coins;
          }
          // visual
          card.classList.remove('locked');
          lockInfo.textContent = 'Unlocked';
        } else {
          // briefly flash to indicate locked (no alert)
          card.style.transform = 'translateY(-4px)';
          setTimeout(()=>card.style.transform='', 120);
          return;
        }
      }

      // select skin
      document.querySelectorAll('.skin-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      selectedSkinId = skin.id;
      saveSelectedSkin();
    });

    skinsListEl.appendChild(card);
  });

  // update coin display
  coinCountEl.textContent = coins;
  characterSelection.classList.remove('hidden');
  gameState = 'characterSelect';
}

function startGame() {
  pipeGap = getCurrentGap ? getCurrentGap() : pipeGap;
  pipeSpeed = getCurrentSpeed ? getCurrentSpeed() : pipeSpeed;
  gameState = 'playing';
  score = 0;
  frameCount = 0;
  pipes.length = 0;
  coinsArr.length = 0;
  coinSpawnTimer = 0;
  bird.reset();
  scoreDisplay.textContent = score;
  coinCountEl.textContent = coins;
  coinHudCount.textContent = coins;
  startScreen.classList.add('hidden');
  gameOverScreen.classList.add('hidden');
  characterSelection.classList.add('hidden');

  // Hide difficulty buttons until needed
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

  // check for skin unlocks based on final score
  SKINS.forEach(skin => {
    if (!unlockedSkins.has(skin.id)) {
      if (score >= skin.unlockScore) {
        unlockedSkins.add(skin.id);
      }
    }
  });
  saveUnlocked();
}

// ---------------------- CONTROLS ----------------------
document.addEventListener('keydown', e => {
  if (e.code === 'Space') {
    e.preventDefault();
    if (gameState === 'start') {
      openCharacterSelection();
    } else if (gameState === 'characterSelect') {
      confirmSkinBtn.click();
    } else if (gameState === 'playing') {
      bird.jump();
    }
  }
});

restartBtn.addEventListener('click', () => {
  // Apply currently selected difficulty before restarting
  const selectedBtn = document.querySelector('.difficulty-btn.selected'); 
  if (selectedBtn) selectedBtn.click(); // this sets pipeGap & pipeSpeed correctly
  openCharacterSelection();
});


difficultyButtons.forEach(btn => {
  btn.addEventListener('click', () => {
     // Remove previous selection
    difficultyButtons.forEach(b => b.classList.remove('selected'));
    // Add selection to clicked button
    btn.classList.add('selected');

    const chosen = btn.dataset.difficulty;
    if (chosen === 'easy') {
      pipeGap = 250;
      pipeSpeed = 1.5;
    } else if (chosen === 'normal') {
      pipeGap = 150;
      pipeSpeed = 2;
    } else if (chosen === 'hard') {
      pipeGap = 100;
      pipeSpeed = 2.8;
    }

    console.log(`Difficulty set to ${chosen}`);
  });
});

// Initialize first button as selected on page load
document.querySelector('.difficulty-btn[data-difficulty="normal"]').classList.add('selected');

// Initial draw of bird and HUD
bird.draw();
coinHudCount.textContent = coins;

// ---------------------- CHARACTER SELECTION ACTIONS ----------------------
confirmSkinBtn.addEventListener('click', () => {
  const skin = getSkinById(selectedSkinId);
  if (!unlockedSkins.has(skin.id)) {
    if (score >= skin.unlockScore || coins >= skin.unlockCoins) {
      unlockedSkins.add(skin.id);
      saveUnlocked();
    } else {
      return;
    }
  }
  saveSelectedSkin();
  startGame();
});

// ---------------------- Save unlocked periodically (in case coins or score unlock) -----------
setInterval(() => {
  let changed = false;
  SKINS.forEach(s => {
    if (!unlockedSkins.has(s.id)) {
      if (score >= s.unlockScore || coins >= s.unlockCoins) {
        unlockedSkins.add(s.id);
        changed = true;
      }
    }
  });
  if (changed) saveUnlocked();
}, 2000);
