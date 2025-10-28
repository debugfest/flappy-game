// daily-challenges.js
const CHALLENGE_TYPES = {
  COLLECT_COINS: 'collect_coins',
  SURVIVE_TIME: 'survive_time',
  SCORE_POINTS: 'score_points',
  PERFECT_RUN: 'perfect_run',
  JUMP_COUNT: 'jump_count'
};

const CHALLENGE_DIFFICULTIES = {
  EASY: { multiplier: 1, streakBonus: 1 },
  MEDIUM: { multiplier: 1.5, streakBonus: 2 },
  HARD: { multiplier: 2, streakBonus: 3 }
};

// Challenge templates with different objectives
const CHALLENGE_TEMPLATES = [
  {
    type: CHALLENGE_TYPES.COLLECT_COINS,
    name: "Coin Collector",
    description: "Collect {target} coins in a single run",
    icon: "🪙",
    baseReward: 5,
    difficulty: CHALLENGE_DIFFICULTIES.EASY
  },
  {
    type: CHALLENGE_TYPES.SURVIVE_TIME,
    name: "Survivor",
    description: "Survive for {target} seconds",
    icon: "⏱️",
    baseReward: 8,
    difficulty: CHALLENGE_DIFFICULTIES.EASY
  },
  {
    type: CHALLENGE_TYPES.SCORE_POINTS,
    name: "Score Master",
    description: "Score {target} points in a single run",
    icon: "🎯",
    baseReward: 10,
    difficulty: CHALLENGE_DIFFICULTIES.MEDIUM
  },
  {
    type: CHALLENGE_TYPES.PERFECT_RUN,
    name: "Perfect Flight",
    description: "Complete a run without hitting any pipes",
    icon: "✨",
    baseReward: 15,
    difficulty: CHALLENGE_DIFFICULTIES.HARD
  },
  {
    type: CHALLENGE_TYPES.JUMP_COUNT,
    name: "Jump Master",
    description: "Jump {target} times in a single run",
    icon: "🦘",
    baseReward: 6,
    difficulty: CHALLENGE_DIFFICULTIES.EASY
  }
];

// Target ranges for different difficulties
const TARGET_RANGES = {
  [CHALLENGE_TYPES.COLLECT_COINS]: { easy: [5, 15], medium: [15, 25], hard: [25, 40] },
  [CHALLENGE_TYPES.SURVIVE_TIME]: { easy: [10, 20], medium: [20, 35], hard: [35, 60] },
  [CHALLENGE_TYPES.SCORE_POINTS]: { easy: [5, 15], medium: [15, 30], hard: [30, 50] },
  [CHALLENGE_TYPES.JUMP_COUNT]: { easy: [10, 25], medium: [25, 40], hard: [40, 60] }
};

class DailyChallenge {
  constructor(template, target, difficulty) {
    this.id = this.generateId();
    this.template = template;
    this.target = target;
    this.difficulty = difficulty;
    this.completed = false;
    this.progress = 0;
    this.reward = Math.floor(template.baseReward * difficulty.multiplier);
    this.date = new Date().toDateString();
  }

  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  updateProgress(value) {
    this.progress = Math.min(value, this.target);
    if (this.progress >= this.target) {
      this.completed = true;
    }
  }

  getDescription() {
    return this.template.description.replace('{target}', this.target);
  }

  getProgressPercentage() {
    return Math.min((this.progress / this.target) * 100, 100);
  }
}

class DailyChallengeManager {
  constructor() {
    this.challenges = [];
    this.streak = 0;
    this.lastCompletedDate = null;
    this.totalCoinsEarned = 0;
    this.loadFromStorage();
    this.generateDailyChallenges();
  }

  generateDailyChallenges() {
    const today = new Date().toDateString();
    const lastGeneration = localStorage.getItem('flappy_last_challenge_generation');
    
    // Generate new challenges if it's a new day
    if (lastGeneration !== today) {
      this.challenges = [];
      
      // Generate 3 random challenges
      const shuffledTemplates = [...CHALLENGE_TEMPLATES].sort(() => Math.random() - 0.5);
      
      for (let i = 0; i < 3; i++) {
        const template = shuffledTemplates[i];
        const difficulty = this.getRandomDifficulty();
        const target = this.generateTarget(template.type, difficulty);
        
        const challenge = new DailyChallenge(template, target, difficulty);
        this.challenges.push(challenge);
      }
      
      localStorage.setItem('flappy_last_challenge_generation', today);
      this.saveToStorage();
    }
  }

  getRandomDifficulty() {
    const rand = Math.random();
    if (rand < 0.5) return CHALLENGE_DIFFICULTIES.EASY;
    if (rand < 0.8) return CHALLENGE_DIFFICULTIES.MEDIUM;
    return CHALLENGE_DIFFICULTIES.HARD;
  }

  generateTarget(type, difficulty) {
    const ranges = TARGET_RANGES[type];
    if (!ranges) return 10;
    
    const range = ranges[difficulty === CHALLENGE_DIFFICULTIES.EASY ? 'easy' : 
                        difficulty === CHALLENGE_DIFFICULTIES.MEDIUM ? 'medium' : 'hard'];
    
    return Math.floor(Math.random() * (range[1] - range[0] + 1)) + range[0];
  }

  updateChallengeProgress(type, value) {
    const challenge = this.challenges.find(c => c.template.type === type && !c.completed);
    if (challenge) {
      challenge.updateProgress(value);
      this.saveToStorage();
    }
  }

  completeChallenge(challengeId) {
    const challenge = this.challenges.find(c => c.id === challengeId);
    if (challenge && !challenge.completed) {
      challenge.completed = true;
      
      // Calculate reward with streak bonus
      const streakBonus = this.streak * challenge.difficulty.streakBonus;
      const totalReward = challenge.reward + streakBonus;
      
      this.totalCoinsEarned += totalReward;
      this.updateStreak();
      this.saveToStorage();
      
      return totalReward;
    }
    return 0;
  }

  updateStreak() {
    const today = new Date().toDateString();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toDateString();
    
    if (this.lastCompletedDate === yesterdayStr) {
      this.streak++;
    } else if (this.lastCompletedDate !== today) {
      this.streak = 1;
    }
    
    this.lastCompletedDate = today;
  }

  getCompletedChallenges() {
    return this.challenges.filter(c => c.completed);
  }

  getActiveChallenges() {
    return this.challenges.filter(c => !c.completed);
  }

  getStreakBonus() {
    return this.streak;
  }

  saveToStorage() {
    const data = {
      challenges: this.challenges,
      streak: this.streak,
      lastCompletedDate: this.lastCompletedDate,
      totalCoinsEarned: this.totalCoinsEarned
    };
    localStorage.setItem('flappy_daily_challenges', JSON.stringify(data));
  }

  loadFromStorage() {
    const data = localStorage.getItem('flappy_daily_challenges');
    if (data) {
      try {
        const parsed = JSON.parse(data);
        this.challenges = parsed.challenges || [];
        this.streak = parsed.streak || 0;
        this.lastCompletedDate = parsed.lastCompletedDate;
        this.totalCoinsEarned = parsed.totalCoinsEarned || 0;
      } catch (e) {
        console.error('Error loading daily challenges:', e);
        this.challenges = [];
        this.streak = 0;
        this.lastCompletedDate = null;
        this.totalCoinsEarned = 0;
      }
    }
  }
}

// Global instance
let dailyChallengeManager = new DailyChallengeManager();

// Export functions for use in main game
export function getDailyChallenges() {
  return dailyChallengeManager.getActiveChallenges();
}

export function updateChallengeProgress(type, value) {
  dailyChallengeManager.updateChallengeProgress(type, value);
}

export function completeChallenge(challengeId) {
  return dailyChallengeManager.completeChallenge(challengeId);
}

export function getStreakBonus() {
  return dailyChallengeManager.getStreakBonus();
}

export function getTotalCoinsEarned() {
  return dailyChallengeManager.totalCoinsEarned;
}

export function getCompletedChallenges() {
  return dailyChallengeManager.getCompletedChallenges();
}

export { CHALLENGE_TYPES, DailyChallengeManager };
