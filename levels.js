// levels.js — ข้อมูลด่าน (ตัวอย่าง)
const LEVELS = [
  {
    id: 1,
    title: "ด่าน 1: เดินไปหาธง",
    gridSize: 8,
    hero: { x:0, y:7, dir:0 },
    goal: { x:7, y:0 },
    stars: [],
    walls: [],
    holes: []
  },
  {
    id: 2,
    title: "ด่าน 2: เก็บดาว 1 ดวง",
    gridSize: 8,
    hero: { x:0, y:7, dir:0 },
    goal: { x:7, y:0 },
    stars: [{x:3,y:4}],
    walls: [],
    holes: []
  },
  {
    id: 3,
    title: "ด่าน 3: ข้ามหลุม",
    gridSize: 8,
    hero: { x:0, y:7, dir:0 },
    goal: { x:7, y:0 },
    stars: [],
    walls: [],
    holes: [{x:2,y:6}]
  },
  {
    id: 4,
    title: "ด่าน 4: วนและเก็บดาว 3 ดวง",
    gridSize: 8,
    hero: { x:1, y:6, dir:1 },
    goal: { x:7, y:0 },
    stars: [{x:2,y:6},{x:3,y:6},{x:4,y:6}],
    walls: [],
    holes: []
  },
  {
    id: 5,
    title: "ด่าน 5: เงื่อนไขง่าย (มีผนัง)",
    gridSize: 8,
    hero: { x:0, y:7, dir:0 },
    goal: { x:7, y:0 },
    stars: [],
    walls: [{x:1,y:6},{x:1,y:5}],
    holes: []
  }
];

if (typeof window !== 'undefined') window.LEVELS = LEVELS;
