// data.jsx — initial task set, tag definitions, palettes

// ── Grid ─────────────────────────────────────────────────────────────────────
// All sizes/positions snap to multiples of GRID. Pick a value that divides
// nicely into common block sizes.
const GRID = 50; // default; user can change via tweaks. Anywhere a snap is needed at runtime, prefer the value from tweaks.

// ── Tag identities ───────────────────────────────────────────────────────────
// Tags are *roles*; their visual color comes from the active PALETTE,
// resolved by tag.colorIndex. Editable via the Tag Manager.
const DEFAULT_TAGS = [
  { id: 'design',   name: 'design',   colorIndex: 0 },
  { id: 'eng',      name: 'eng',      colorIndex: 1 },
  { id: 'research', name: 'research', colorIndex: 2 },
  { id: 'copy',     name: 'copy',     colorIndex: 3 },
  { id: 'ops',      name: 'ops',      colorIndex: 4 },
  { id: 'meeting',  name: 'meeting',  colorIndex: 5 },
];

// Estimate -> default block dimensions (px), all multiples of GRID(50).
const SIZE_PRESETS = {
  XS: { w: 150, h: 50  },
  S:  { w: 200, h: 100 },
  M:  { w: 250, h: 100 },
  L:  { w: 300, h: 100 },
  XL: { w: 350, h: 150 },
};

// ── 20 palettes ──────────────────────────────────────────────────────────────
// Each palette has 6 swatches (matching tag count). Curated sets — not random.
// Colors are chosen to feel cohesive within a palette: shared chroma/lightness
// range, intentional hue spacing.
const PALETTES = [
  { id: 'tetris-classic', name: 'Tetris classic',
    swatches: ['#00B5C9', '#F2C200', '#A459D1', '#34C759', '#F26B3A', '#E63946'] },
  { id: 'gameboy', name: 'Game Boy',
    swatches: ['#9bbc0f', '#8bac0f', '#306230', '#0f380f', '#cadc9f', '#506850'] },
  { id: 'sunset', name: 'Sunset',
    swatches: ['#F4A261', '#E76F51', '#E9C46A', '#F4845F', '#D4626E', '#264653'] },
  { id: 'ocean', name: 'Ocean',
    swatches: ['#48cae4', '#0096c7', '#023e8a', '#90e0ef', '#0077b6', '#03045e'] },
  { id: 'meadow', name: 'Meadow',
    swatches: ['#a3c9a8', '#84b59f', '#69a297', '#50808e', '#cce6cf', '#465c69'] },
  { id: 'pastel', name: 'Pastel',
    swatches: ['#ffd6e0', '#ffefcf', '#d4f0f0', '#cce2cb', '#e0c3fc', '#fde2e4'] },
  { id: 'highlighter', name: 'Highlighter',
    swatches: ['#ffeb3b', '#ff80ab', '#80d8ff', '#b9f6ca', '#ffab40', '#e040fb'] },
  { id: 'mono-warm', name: 'Mono warm',
    swatches: ['#f5e9d4', '#e8c9a0', '#d9a878', '#b8845a', '#8a5a3e', '#5e3a26'] },
  { id: 'mono-cool', name: 'Mono cool',
    swatches: ['#e3edf7', '#bcd3e8', '#8cb4d4', '#5e8fb8', '#3d6b94', '#1f4060'] },
  { id: 'jewel', name: 'Jewel',
    swatches: ['#bb1e44', '#1e6091', '#577590', '#43aa8b', '#90be6d', '#f9c74f'] },
  { id: 'neon', name: 'Neon',
    swatches: ['#ff006e', '#fb5607', '#ffbe0b', '#8338ec', '#3a86ff', '#06ffa5'] },
  { id: 'autumn', name: 'Autumn',
    swatches: ['#bb4d00', '#d68c45', '#eab464', '#a23b1f', '#7c4a2d', '#553a26'] },
  { id: 'spring', name: 'Spring',
    swatches: ['#a8dadc', '#f1faee', '#ffafcc', '#bde0fe', '#cdb4db', '#fcbf49'] },
  { id: 'mist', name: 'Mist',
    swatches: ['#cfd8dc', '#b0bec5', '#90a4ae', '#78909c', '#607d8b', '#455a64'] },
  { id: 'tropical', name: 'Tropical',
    swatches: ['#ff9f1c', '#ffbf69', '#2ec4b6', '#cbf3f0', '#e71d36', '#011627'] },
  { id: 'royal', name: 'Royal',
    swatches: ['#3a0ca3', '#4361ee', '#7209b7', '#560bad', '#f72585', '#b5179e'] },
  { id: 'paper', name: 'Paper',
    swatches: ['#fef9f0', '#f0e4d0', '#dfc9a3', '#c4a276', '#a8784f', '#735035'] },
  { id: 'noir', name: 'Noir',
    swatches: ['#212529', '#495057', '#6c757d', '#adb5bd', '#dee2e6', '#f8f9fa'] },
  { id: 'candy', name: 'Candy',
    swatches: ['#ff70a6', '#ff9770', '#ffd670', '#e9ff70', '#70d6ff', '#a479ff'] },
  { id: 'forest', name: 'Forest',
    swatches: ['#2d5a3d', '#52796f', '#84a98c', '#cad2c5', '#354f52', '#a98467'] },
];

// ── Project: "Ship the new pricing page" ─────────────────────────────────────
const INITIAL_TASKS = [
  { id: 't1',  title: 'Pricing model spreadsheet', tag: 'ops',      size: 'M',  waiting: false, done: false },
  { id: 't2',  title: 'Competitor teardown',       tag: 'research', size: 'S',  waiting: false, done: false },
  { id: 't3',  title: 'Lock messaging hierarchy',  tag: 'copy',     size: 'M',  waiting: false, done: false },
  { id: 't4',  title: 'Wireframe: 3-tier layout',  tag: 'design',   size: 'L',  waiting: false, done: false },
  { id: 't5',  title: 'Hi-fi mocks + dark mode',   tag: 'design',   size: 'L',  waiting: false, done: false },
  { id: 't6',  title: 'Legal review on copy',      tag: 'ops',      size: 'S',  waiting: true,  done: false },
  { id: 't7',  title: 'Build /pricing route',      tag: 'eng',      size: 'M',  waiting: false, done: false },
  { id: 't8',  title: 'Stripe price IDs',          tag: 'eng',      size: 'S',  waiting: false, done: false },
  { id: 't9',  title: 'Plan toggle interaction',   tag: 'eng',      size: 'M',  waiting: false, done: false },
  { id: 't10', title: 'QA on staging',             tag: 'eng',      size: 'S',  waiting: false, done: false },
  { id: 't11', title: 'Launch announcement',       tag: 'copy',     size: 'M',  waiting: false, done: false },
  { id: 't12', title: 'Schedule launch sync',      tag: 'meeting',  size: 'XS', waiting: false, done: false },
];

// Snap helpers
const snap = (v, g = GRID) => Math.round(v / g) * g;
const snapMin = (v, g = GRID) => Math.max(g, Math.round(v / g) * g);
const snapFloor = (v, g = GRID) => Math.floor(v / g) * g;

window.GRID = GRID;
window.snap = snap;
window.snapMin = snapMin;
window.snapFloor = snapFloor;
window.DEFAULT_TAGS = DEFAULT_TAGS;
window.SIZE_PRESETS = SIZE_PRESETS;
window.PALETTES = PALETTES;
window.INITIAL_TASKS = INITIAL_TASKS;
