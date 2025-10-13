// difficulty.js
const DIFFICULTY_PRESETS = {
  easy:   { pipeGap: 190, baseSpeed: 1.6 },
  normal: { pipeGap: 150, baseSpeed: 2.2 },
  hard:   { pipeGap: 120, baseSpeed: 3.0 }
};

let currentGap = DIFFICULTY_PRESETS.normal.pipeGap;
let currentSpeed = DIFFICULTY_PRESETS.normal.baseSpeed;

const ADAPTIVE = {
  enabled: true,
  increaseEveryPipes: 4,
  speedIncreaseFactor: 1.06,
  gapDecreaseStep: 6,
  maxSpeed: 6.5,
  minGap: 90
};

let adaptiveLevel = 0;
let pipesPassed = 0;
let selectedPreset = 'normal';

// init UI hooks (call from main)
export function initDifficulty({ selectEl, adaptiveDisplayEl, adaptiveToggleEl }) {
  // load saved preset
  const saved = localStorage.getItem('flappy_difficulty');
  if (saved && DIFFICULTY_PRESETS[saved]) selectedPreset = saved;

  // apply initial
  applyPreset(selectedPreset);

  // hookup select element
  if (selectEl) {
    selectEl.value = selectedPreset;
    selectEl.addEventListener('change', (e) => {
      applyPreset(e.target.value);
      localStorage.setItem('flappy_difficulty', e.target.value);
    });
  }

  // hookup adaptive toggle
  if (adaptiveToggleEl) {
    // load saved setting
    const savedAdaptive = localStorage.getItem('flappy_adaptive_enabled');
    if (savedAdaptive !== null) ADAPTIVE.enabled = savedAdaptive === 'true';
    adaptiveToggleEl.checked = ADAPTIVE.enabled;

    adaptiveToggleEl.addEventListener('change', (e) => {
      ADAPTIVE.enabled = e.target.checked;
      localStorage.setItem('flappy_adaptive_enabled', ADAPTIVE.enabled);
    });
  }

  // adaptive display updater
  updateAdaptiveDisplay(adaptiveDisplayEl);
}

export function applyPreset(name) {
  if (!DIFFICULTY_PRESETS[name]) name = 'normal';
  selectedPreset = name;
  const p = DIFFICULTY_PRESETS[name];
  currentGap = p.pipeGap;
  currentSpeed = p.baseSpeed;
  adaptiveLevel = 0;
  pipesPassed = 0;
}

export function resetAdaptive() {
  applyPreset(selectedPreset);
}

export function getCurrentGap() {
  return currentGap;
}

export function getCurrentSpeed() {
  return currentSpeed;
}

export function getAdaptiveLevel() {
  return adaptiveLevel;
}

export function onPipePassed(adaptiveDisplayEl) {
  pipesPassed++;
  // call adaptive step every N pipes
  if (ADAPTIVE.enabled && pipesPassed % ADAPTIVE.increaseEveryPipes === 0) {
    // increase speed
    currentSpeed = Math.min(ADAPTIVE.maxSpeed, currentSpeed * ADAPTIVE.speedIncreaseFactor);
    // decrease gap
    currentGap = Math.max(ADAPTIVE.minGap, currentGap - ADAPTIVE.gapDecreaseStep);
    adaptiveLevel++;
    // update UI
    updateAdaptiveDisplay(adaptiveDisplayEl);
  }
}

function updateAdaptiveDisplay(el) {
  if (!el) return;
  el.textContent = `Adaptive: ${adaptiveLevel}`;
}
