// app.js — game engine + integration with Blockly
let workspace;
let currentLevel = 1;
let hero = { x:0, y:0, dir:0 };
let gridSize = 8;
let canvas, ctx, cellSize;
let running = false;
let stepMode = false;
let stepResolve = null;

function initBlockly(){
  workspace = Blockly.inject('blocklyDiv', { toolbox: TOOLBOX, grid: { spacing:20, length:3, colour:'#ccc', snap:true } });
  // load a default starter block
  const xmlText = '<xml><block type="move_forward" x="10" y="10"><field name="STEPS">3</field></block></xml>';
  const xml = Blockly.Xml.textToDom(xmlText);
  Blockly.Xml.domToWorkspace(xml, workspace);
}

function initUI(){
  const levelSelect = document.getElementById('levelSelect');
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
  ctx = canvas.getContext('2d');
  cellSize = canvas.width / gridSize;
}

function loadLevel(id){
  const lvl = LEVELS.find(x=>x.id===id) || LEVELS[0];
  currentLevel = lvl.id;
  gridSize = lvl.gridSize || 8;
  hero = Object.assign({}, lvl.hero);
  levelData = JSON.parse(JSON.stringify(lvl));
  initCanvas();
  drawGrid();
  document.getElementById('starsGot').textContent = 0;
  document.getElementById('status') && (document.getElementById('status').textContent = 'สถานะ: พร้อม');
}

function drawGrid(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  const size = gridSize;
  cellSize = canvas.width / size;
  ctx.strokeStyle = '#bbb';
  for(let i=0;i<=size;i++){
    ctx.beginPath(); ctx.moveTo(i*cellSize,0); ctx.lineTo(i*cellSize,canvas.height); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0,i*cellSize); ctx.lineTo(canvas.width,i*cellSize); ctx.stroke();
  }
  // draw goal
  ctx.fillStyle = 'gold';
  const g = LEVELS.find(x=>x.id===currentLevel).goal;
  ctx.fillRect(g.x*cellSize+8, g.y*cellSize+8, cellSize-16, cellSize-16);
  // draw stars
  const stars = LEVELS.find(x=>x.id===currentLevel).stars || [];
  ctx.fillStyle = '#ffdd57';
  stars.forEach(s=>{ ctx.beginPath(); ctx.arc(s.x*cellSize+cellSize/2, s.y*cellSize+cellSize/2, cellSize/6, 0, Math.PI*2); ctx.fill(); });
  // draw walls
  const walls = LEVELS.find(x=>x.id===currentLevel).walls || [];
  ctx.fillStyle = '#333';
  walls.forEach(w=>{ ctx.fillRect(w.x*cellSize+2, w.y*cellSize+2, cellSize-4, cellSize-4); });
  // draw hero
  drawHero();
}

function drawHero(){
  ctx.fillStyle = 'crimson';
  const cx = hero.x*cellSize + cellSize/2;
  const cy = hero.y*cellSize + cellSize/2;
  ctx.beginPath(); ctx.arc(cx, cy, cellSize/3, 0, Math.PI*2); ctx.fill();
}

function sleep(ms){ return new Promise(r=>setTimeout(r,ms)); }
function log(msg){ const d=document.getElementById('log'); d.innerHTML += msg + '<br>'; d.scrollTop = d.scrollHeight; }

async function waitForStep(){ return new Promise(r=> stepResolve = r); }

async function moveForward(n){
  log('moveForward ' + n);
  for(let i=0;i<n;i++){
    if(stepMode) await waitForStep();
    const next = getNextPos(hero.x, hero.y, hero.dir);
    // handle walls
    const walls = LEVELS.find(x=>x.id===currentLevel).walls || [];
    if(walls.some(w=>w.x===next.x && w.y===next.y)){
      log('ติดกำแพง ไม่สามารถเดินต่อได้'); break;
    }
    // bounds
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

function checkStar(){ const lvl = LEVELS.find(x=>x.id===currentLevel); for(let i=0;i<lvl.stars.length;i++){ const s=lvl.stars[i]; if(s.x===hero.x && s.y===hero.y){ lvl.stars.splice(i,1); const cnt = Number(document.getElementById('starsGot').textContent)||0; document.getElementById('starsGot').textContent = cnt+1; log('เก็บดาว!'); break; } }}
function checkGoal(){ const lvl = LEVELS.find(x=>x.id===currentLevel); if(hero.x===lvl.goal.x && hero.y===lvl.goal.y){ log('ถึงเป้าหมาย! ด่านสำเร็จ'); document.getElementById('status') && (document.getElementById('status').textContent = 'สถานะ: สำเร็จ'); }
}

async function runProgram(){
  if(running) return; running = true; document.getElementById('status') && (document.getElementById('status').textContent = 'สถานะ: กำลังรัน');
  try{
    const code = Blockly.JavaScript.workspaceToCode(workspace);
    log('--- รันโค้ด ---');
    const asyncFunc = new Function('moveForward','turnLeft','turnRight','jump','sleep','log', 'return (async function(){' + code + '})();');
    await asyncFunc(moveForward, turnLeft, turnRight, jump, sleep, log);
    log('--- จบการรัน ---');
  }catch(e){ log('Error: ' + e); }
  running = false; document.getElementById('status') && (document.getElementById('status').textContent = 'สถานะ: พร้อม');
}

// Init
window.addEventListener('load', ()=>{
  initBlockly();
  initUI();
  loadLevel(1);
});
