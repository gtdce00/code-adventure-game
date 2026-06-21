// app.js — game engine + integration with Blockly (add hero sprite preload and DPR scaling)
let workspace;
let currentLevel = 1;
let hero = { x:0, y:0, dir:0 };
let gridSize = 8;
let canvas, ctx, cellSize;
let running = false;
let stepMode = false;
let stepResolve = null;
let levelData = null;

// HERO sprite preload
const HERO_SPRITE_SRC = 'assets/hero.svg';
let heroImg = new Image();
let heroImgLoaded = false;
heroImg.onload = () => { heroImgLoaded = true; console.log('hero image loaded'); drawGrid(); };
heroImg.onerror = () => { heroImgLoaded = false; console.warn('hero image failed to load'); };
heroImg.src = HERO_SPRITE_SRC;

function initBlockly(){
  const toolboxEl = document.getElementById('toolbox');
  workspace = Blockly.inject('blocklyDiv', {
    toolbox: toolboxEl,
    grid: { spacing:20, length:3, colour:'#ccc', snap:true },
    renderer: 'zelos'
  });

  if (workspace.getTopBlocks(false).length === 0) {
    const xmlText = '<xml><block type="move_forward" x="10" y="10"><field name="STEPS">3</field></block></xml>';
    const xml = Blockly.Xml.textToDom(xmlText);
    Blockly.Xml.domToWorkspace(xml, workspace);
  }
}

function initUI(){
  const levelSelect = document.getElementById('levelSelect');
  if (!window.LEVELS) { console.error('LEVELS not found'); return; }
  LEVELS.forEach(l=>{
    const opt = document.createElement('option'); opt.value = l.id; opt.textContent = l.title; levelSelect.appendChild(opt);
  });
  levelSelect.addEventListener('change', e=>{
    loadLevel(Number(e.target.value));
  });

  document.getElementById('runBtn').addEventListener('click', async ()=>{
    stepMode = false; await runProgram();
  });
  document.getElementById('stepBtn').addEventListener('click', async ()=>{
    if(!stepMode){ stepMode = true; log('--- โหมดทีละคำสั่ง ---'); await runProgram(); }
    else { if(stepResolve) { stepResolve(); stepResolve = null; } }
  });
  document.getElementById('resetBtn').addEventListener('click', ()=>{ loadLevel(currentLevel); });
  document.getElementById('clearBtn')?.addEventListener('click', ()=>{ workspace.clear(); });
}

function initCanvas(){
  canvas = document.getElementById('gameCanvas');
  if(!canvas){ console.error('Canvas not found'); return; }
  const rect = canvas.getBoundingClientRect();
  let dpr = window.devicePixelRatio || 1;
  // set internal size to CSS size * DPR for crisp rendering
  if (rect.width > 0 && rect.height > 0) {
    canvas.width = Math.max(1, Math.floor(rect.width * dpr));
    canvas.height = Math.max(1, Math.floor(rect.height * dpr));
  }
  // keep CSS display size
  canvas.style.width = rect.width + 'px';
  canvas.style.height = rect.height + 'px';
  ctx = canvas.getContext('2d');
  // reset transform and scale to DPR so drawing uses CSS pixels logically
  ctx.setTransform(1,0,0,1,0,0);
  ctx.scale(dpr, dpr);
  cellSize = rect.width / gridSize;
}

function loadLevel(id){
  const lvl = LEVELS.find(x=>x.id===id) || LEVELS[0];
  if(!lvl){ console.error('loadLevel: level not found', id); return; }
  currentLevel = lvl.id;
  gridSize = lvl.gridSize || 8;
  hero = Object.assign({}, lvl.hero);
  levelData = JSON.parse(JSON.stringify(lvl));
  initCanvas();
  drawGrid();
  document.getElementById('starsGot').textContent = 0;
  const statusEl = document.getElementById('status');
  if(statusEl) statusEl.textContent = 'สถานะ: พร้อม';
}

function drawGrid(){
  if(!ctx) { console.warn('drawGrid: context not ready'); return; }
  const lvl = LEVELS.find(x=>x.id===currentLevel);
  if(!lvl){ console.error('drawGrid: level data missing for', currentLevel); return; }

  // clear using CSS pixels (context is scaled)
  const cssWidth = canvas.getBoundingClientRect().width;
  const cssHeight = canvas.getBoundingClientRect().height;
  ctx.clearRect(0,0,cssWidth,cssHeight);

  const size = gridSize;
  cellSize = cssWidth / size;
  ctx.strokeStyle = '#bbb';
  for(let i=0;i<=size;i++){
    ctx.beginPath(); ctx.moveTo(i*cellSize,0); ctx.lineTo(i*cellSize,cssHeight); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0,i*cellSize); ctx.lineTo(cssWidth,i*cellSize); ctx.stroke();
  }
  // draw goal
  ctx.fillStyle = 'gold';
  const g = lvl.goal;
  if(g) ctx.fillRect(g.x*cellSize+8, g.y*cellSize+8, cellSize-16, cellSize-16);
  // draw stars
  const stars = lvl.stars || [];
  ctx.fillStyle = '#ffdd57';
  stars.forEach(s=>{ ctx.beginPath(); ctx.arc(s.x*cellSize+cellSize/2, s.y*cellSize+cellSize/2, cellSize/6, 0, Math.PI*2); ctx.fill(); });
  // draw walls
  const walls = lvl.walls || [];
  ctx.fillStyle = '#333';
  walls.forEach(w=>{ ctx.fillRect(w.x*cellSize+2, w.y*cellSize+2, cellSize-4, cellSize-4); });
  // draw hero
  drawHero();
}

function drawHero(){
  if(!ctx){ console.warn('drawHero: ctx missing'); return; }
  hero.x = Math.max(0, Math.min(gridSize - 1, Number(hero.x) || 0));
  hero.y = Math.max(0, Math.min(gridSize - 1, Number(hero.y) || 0));
  const cssWidth = canvas.getBoundingClientRect().width;
  const cx = hero.x * cellSize + cellSize / 2;
  const cy = hero.y * cellSize + cellSize / 2;
  if(heroImgLoaded){
    const drawW = Math.min(cellSize * 0.9, 64);
    const drawH = drawW;
    ctx.save();
    const angle = hero.dir * (Math.PI / 2);
    ctx.translate(cx, cy);
    ctx.rotate(angle);
    ctx.drawImage(heroImg, -drawW/2, -drawH/2, drawW, drawH);
    ctx.restore();
  } else {
    // fallback circle
    ctx.fillStyle = 'crimson';
    ctx.beginPath();
    ctx.arc(cx, cy, Math.max(6, cellSize/3), 0, Math.PI*2);
    ctx.fill();
    ctx.fillStyle = 'white';
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(hero.dir * (Math.PI/2));
    ctx.beginPath();
    ctx.moveTo(0, -cellSize/4);
    ctx.lineTo(cellSize/8, cellSize/8);
    ctx.lineTo(-cellSize/8, cellSize/8);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
}

function sleep(ms){ return new Promise(r=>setTimeout(r,ms)); }
function log(msg){ const d=document.getElementById('log'); if(d){ d.innerHTML += msg + '<br>'; d.scrollTop = d.scrollHeight; } else console.log(msg); }

async function waitForStep(){ return new Promise(r=> stepResolve = r); }

async function moveForward(n){
  log('moveForward ' + n);
  const lvl = LEVELS.find(x=>x.id===currentLevel) || { walls:[] };
  for(let i=0;i<n;i++){
    if(stepMode) await waitForStep();
    const next = getNextPos(hero.x, hero.y, hero.dir);
    const walls = lvl.walls || [];
    if(walls.some(w=>w.x===next.x && w.y===next.y)){
      log('ติดกำแพง ไม่สามารถเดินต่อได้'); break;
    }
    hero.x = Math.max(0, Math.min(gridSize-1, next.x));
    hero.y = Math.max(0, Math.min(gridSize-1, next.y));
    drawGrid();
    await sleep(350);
    checkStar();
    checkGoal();
  }
}

async function turnLeft(){ log('turnLeft'); if(stepMode) await waitForStep(); hero.dir = (hero.dir + 3) % 4; drawGrid(); await sleep(200); }
async function turnRight(){ log('turnRight'); if(stepMode) await waitForStep(); hero.dir = (hero.dir + 1) % 4; drawGrid(); await sleep(200); }
async function jump(){ log('jump'); if(stepMode) await waitForStep(); const next = getNextPos(hero.x, hero.y, hero.dir); hero.x = Math.max(0, Math.min(gridSize-1, next.x)); hero.y = Math.max(0, Math.min(gridSize-1, next.y)); drawGrid(); await sleep(300); checkStar(); checkGoal(); }

function getNextPos(x,y,dir){ if(dir===0) return {x,y:y-1}; if(dir===1) return {x:x+1,y}; if(dir===2) return {x,y:y+1}; return {x:x-1,y}; }

function checkStar(){ const lvl = LEVELS.find(x=>x.id===currentLevel); if(!lvl) return; for(let i=0;i<lvl.stars.length;i++){ const s=lvl.stars[i]; if(s.x===hero.x && s.y===hero.y){ lvl.stars.splice(i,1); const cnt = Number(document.getElementById('starsGot').textContent)||0; document.getElementById('starsGot').textContent = cnt+1; log('เก็บดาว!'); break; } }}
function checkGoal(){ const lvl = LEVELS.find(x=>x.id===currentLevel); if(!lvl) return; if(hero.x===lvl.goal.x && hero.y===lvl.goal.y){ log('ถึงเป้าหมาย! ด่านสำเร็จ'); const statusEl = document.getElementById('status'); if(statusEl) statusEl.textContent = 'สถานะ: สำเร็จ'; }
}

async function runProgram(){
  if(running) return; running = true; const statusEl = document.getElementById('status'); if(statusEl) statusEl.textContent = 'สถานะ: กำลังรัน';
  try{
    const code = Blockly.JavaScript.workspaceToCode(workspace);
    log('--- รันโค้ด ---');
    const asyncFunc = new Function('moveForward','turnLeft','turnRight','jump','sleep','log', 'return (async function(){' + code + '})();');
    await asyncFunc(moveForward, turnLeft, turnRight, jump, sleep, log);
    log('--- จบการรัน ---');
  }catch(e){ log('Error: ' + e); console.error(e); }
  running = false; if(statusEl) statusEl.textContent = 'สถานะ: พร้อม';
}

window.addEventListener('load', ()=>{
  initBlockly();
  initUI();
  loadLevel(1);
});
