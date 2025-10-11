// themes.js
let currentTheme = 'day'; // internal state

const raindrops = [];
const numRaindrops = 50;

function getTheme() {
  return currentTheme;
}

function setTheme(newTheme) {
  currentTheme = newTheme;
  if(currentTheme === 'rain') createRaindrops();
}

function updateTheme(score) {
  if(score <= 1) currentTheme = 'day';
  else if(score <= 2) currentTheme = 'night';
  else currentTheme = 'rain';
}

function drawBackground() {
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');

  if(currentTheme === 'day') ctx.fillStyle = '#87ceeb';
  else if(currentTheme === 'night') ctx.fillStyle = '#1b263b';
  else if(currentTheme === 'rain') ctx.fillStyle = '#2c3e50';
  
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function createRaindrops() {
  raindrops.length = 0;
  for(let i=0;i<numRaindrops;i++) {
    raindrops.push({ x: Math.random()*400, y: Math.random()*600, length: Math.random()*10+5 });
  }
}

function drawRaindrops() {
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  ctx.strokeStyle = 'rgba(173,216,230,0.5)';
  raindrops.forEach(drop => {
    ctx.beginPath();
    ctx.moveTo(drop.x, drop.y);
    ctx.lineTo(drop.x, drop.y + drop.length);
    ctx.stroke();
    drop.y += 4;
    if(drop.y > canvas.height) drop.y = 0;
  });
}

export { getTheme, setTheme, updateTheme, drawBackground, createRaindrops, drawRaindrops };
