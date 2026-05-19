// app.jsx — themes, block, context menu, group label, palette/tag manager

const { useTweaks, TweaksPanel, TweakSection, TweakSlider, TweakRadio, TweakToggle, TweakButton, TweakSelect } = window;
const { PhysicsWorld, PHYS, DEFAULT_TAGS, SIZE_PRESETS, INITIAL_TASKS, PALETTES, GRID } = window;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "aesthetic": "playful",
  "flatBlocks": false,
  "gravityOn": true,
  "showActionableGlow": true,
  "showGrid": true,
  "labelGroups": true,
  "gravityStrength": 100,
  "paletteId": "tetris-classic",
  "snapToGrid": true,
  "showGridDuringDrag": true,
  "gridSize": 50
}/*EDITMODE-END*/;

// ── Aesthetic themes ─────────────────────────────────────────────────────────
const AESTHETIC_THEMES = {
  playful: {
    bg: '#0e1320',
    bgGrid: 'rgba(255,255,255,0.04)',
    bgGridStrong: 'rgba(255,255,255,0.10)',
    floor: '#080b14',
    floorGlow: 'rgba(120, 220, 255, 0.85)',
    blockShadow: '0 6px 0 rgba(0,0,0,.35), 0 12px 24px rgba(0,0,0,.4)',
    blockBorder: '0',
    blockRadius: '6px',
    blockFontFamily: '"DM Sans", ui-sans-serif, system-ui, sans-serif',
    blockFontWeight: 600,
    titleColor: '#0a0e18',
    tagBg: 'rgba(0,0,0,.18)',
    tagColor: '#0a0e18',
    fillMode: 'asis',
    panelBg: 'rgba(20, 26, 42, 0.92)',
    panelBorder: 'rgba(255,255,255,0.08)',
    panelText: 'rgba(255,255,255,0.92)',
    accentColor: '#7dd3fc',
    chipBg: 'rgba(255,255,255,0.06)',
    chipFg: 'rgba(255,255,255,0.9)',
    topBarBg: 'rgba(14,19,32,0.7)',
    topBarBorder: 'rgba(255,255,255,0.07)',
  },
  modern: {
    bg: '#f5f3ee',
    bgGrid: 'rgba(0,0,0,0.04)',
    bgGridStrong: 'rgba(0,0,0,0.10)',
    floor: '#e9e4d8',
    floorGlow: 'rgba(64, 96, 220, 0.5)',
    blockShadow: '0 1px 0 rgba(255,255,255,.7) inset, 0 1px 2px rgba(0,0,0,.06), 0 8px 20px rgba(0,0,0,.08)',
    blockBorder: '0.5px solid rgba(0,0,0,0.08)',
    blockRadius: '10px',
    blockFontFamily: '"Inter", ui-sans-serif, system-ui, sans-serif',
    blockFontWeight: 500,
    titleColor: 'rgba(20,18,12,0.92)',
    tagBg: 'rgba(0,0,0,.05)',
    tagColor: 'rgba(20,18,12,0.6)',
    fillMode: 'tint',
    panelBg: 'rgba(255,253,248,0.95)',
    panelBorder: 'rgba(0,0,0,0.08)',
    panelText: 'rgba(20,18,12,0.92)',
    accentColor: '#3b5bdb',
    chipBg: 'rgba(0,0,0,0.05)',
    chipFg: 'rgba(20,18,12,0.7)',
    topBarBg: 'rgba(245,243,238,0.85)',
    topBarBorder: 'rgba(0,0,0,0.06)',
  },
  brutalist: {
    bg: '#fafaf5',
    bgGrid: 'rgba(0,0,0,0.06)',
    bgGridStrong: 'rgba(0,0,0,0.14)',
    floor: '#000',
    floorGlow: '#ffeb00',
    blockShadow: '4px 4px 0 #000',
    blockBorder: '2px solid #000',
    blockRadius: '0',
    blockFontFamily: '"JetBrains Mono", ui-monospace, monospace',
    blockFontWeight: 600,
    titleColor: '#000',
    tagBg: '#000',
    tagColor: '#fff',
    fillMode: 'asis',
    panelBg: '#fff',
    panelBorder: '#000',
    panelText: '#000',
    accentColor: '#000',
    chipBg: '#000',
    chipFg: '#fff',
    topBarBg: '#fff',
    topBarBorder: '#000',
  },
  // ── 3 new aesthetics ──────────────────────────────────────────────────────
  neon: {
    bg: '#08040f',
    bgGrid: 'rgba(180,0,255,0.07)',
    bgGridStrong: 'rgba(180,0,255,0.18)',
    floor: '#04020a',
    floorGlow: 'rgba(0,255,200,1)',
    blockShadow: '0 0 0 1px rgba(255,255,255,0.06), 0 0 18px rgba(0,200,255,0.25)',
    blockBorder: '1px solid rgba(255,255,255,0.12)',
    blockRadius: '4px',
    blockFontFamily: '"JetBrains Mono", ui-monospace, monospace',
    blockFontWeight: 500,
    titleColor: '#fff',
    tagBg: 'rgba(255,255,255,0.08)',
    tagColor: 'rgba(255,255,255,0.85)',
    fillMode: 'neon',   // special: darken fill + colored glow border
    panelBg: 'rgba(12,6,22,0.96)',
    panelBorder: 'rgba(0,255,200,0.2)',
    panelText: 'rgba(220,220,255,0.92)',
    accentColor: '#00ffc8',
    chipBg: 'rgba(0,255,200,0.08)',
    chipFg: '#00ffc8',
    topBarBg: 'rgba(8,4,15,0.85)',
    topBarBorder: 'rgba(0,255,200,0.12)',
  },
  soft: {
    bg: '#fdf6f0',
    bgGrid: 'rgba(180,120,80,0.05)',
    bgGridStrong: 'rgba(180,120,80,0.12)',
    floor: '#f0e4d4',
    floorGlow: 'rgba(255,150,100,0.5)',
    blockShadow: '0 2px 0 rgba(200,150,100,0.2), 0 6px 20px rgba(180,100,60,0.08)',
    blockBorder: '1px solid rgba(200,150,100,0.18)',
    blockRadius: '16px',
    blockFontFamily: '"DM Sans", ui-sans-serif, system-ui, sans-serif',
    blockFontWeight: 500,
    titleColor: '#3d2a1a',
    tagBg: 'rgba(180,120,60,0.1)',
    tagColor: '#6b4226',
    fillMode: 'tint',
    panelBg: 'rgba(255,250,244,0.97)',
    panelBorder: 'rgba(200,150,100,0.15)',
    panelText: '#3d2a1a',
    accentColor: '#d4845a',
    chipBg: 'rgba(180,120,60,0.08)',
    chipFg: '#6b4226',
    topBarBg: 'rgba(253,246,240,0.9)',
    topBarBorder: 'rgba(200,150,100,0.12)',
  },
  terminal: {
    bg: '#0d1117',
    bgGrid: 'rgba(0,255,65,0.04)',
    bgGridStrong: 'rgba(0,255,65,0.1)',
    floor: '#010409',
    floorGlow: 'rgba(0,255,65,0.9)',
    blockShadow: '0 0 0 1px rgba(0,255,65,0.2)',
    blockBorder: '1px solid rgba(0,255,65,0.3)',
    blockRadius: '2px',
    blockFontFamily: '"JetBrains Mono", ui-monospace, monospace',
    blockFontWeight: 400,
    titleColor: '#00ff41',
    tagBg: 'rgba(0,255,65,0.12)',
    tagColor: '#00ff41',
    fillMode: 'terminal', // special: dark bg + green tint
    panelBg: 'rgba(13,17,23,0.98)',
    panelBorder: 'rgba(0,255,65,0.25)',
    panelText: '#00ff41',
    accentColor: '#00ff41',
    chipBg: 'rgba(0,255,65,0.08)',
    chipFg: '#00ff41',
    topBarBg: 'rgba(13,17,23,0.9)',
    topBarBorder: 'rgba(0,255,65,0.2)',
  },
};

// ── Color helpers ────────────────────────────────────────────────────────────
function hexToRgb(hex) {
  const h = hex.replace('#', '');
  const v = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  return {
    r: parseInt(v.slice(0, 2), 16),
    g: parseInt(v.slice(2, 4), 16),
    b: parseInt(v.slice(4, 6), 16),
  };
}
function rgbToHex({ r, g, b }) {
  const h = (n) => Math.round(n).toString(16).padStart(2, '0');
  return '#' + h(r) + h(g) + h(b);
}
function tint(hex, amt) {
  const c = hexToRgb(hex);
  return rgbToHex({
    r: c.r + (255 - c.r) * amt,
    g: c.g + (255 - c.g) * amt,
    b: c.b + (255 - c.b) * amt,
  });
}
function darken(hex, amt) {
  const c = hexToRgb(hex);
  return rgbToHex({ r: c.r * (1 - amt), g: c.g * (1 - amt), b: c.b * (1 - amt) });
}
function luminance(hex) {
  const { r, g, b } = hexToRgb(hex);
  const a = [r, g, b].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
}
function readableFg(hex) {
  return luminance(hex) > 0.55 ? '#0a0e18' : '#ffffff';
}

// ── Platform-aware shortcut hints ────────────────────────────────────────────
// Returns the user-facing string for a shortcut. Mac shows ⌘, ⌥, etc.;
// everywhere else shows Ctrl, Alt, Shift. Tokens: mod, alt, shift, plus a key.
const __isMac = (() => {
  if (typeof navigator === 'undefined') return false;
  const p = (navigator.userAgentData && navigator.userAgentData.platform) || navigator.platform || '';
  return /mac/i.test(p);
})();
function formatShortcut(combo) {
  return combo.split('+').map((part) => {
    const k = part.trim().toLowerCase();
    if (k === 'mod')   return __isMac ? '⌘' : 'Ctrl';
    if (k === 'alt')   return __isMac ? '⌥' : 'Alt';
    if (k === 'shift') return __isMac ? '⇧' : 'Shift';
    return part.length === 1 ? part.toUpperCase() : part;
  }).join(__isMac ? '' : '+');
}

// ── HSL helpers ──────────────────────────────────────────────────────────────
function rgbToHsl({ r, g, b }) {
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
  let h = 0, s = 0; const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rn: h = (gn - bn) / d + (gn < bn ? 6 : 0); break;
      case gn: h = (bn - rn) / d + 2; break;
      case bn: h = (rn - gn) / d + 4; break;
    }
    h *= 60;
  }
  return { h, s, l };
}
function hslToRgb({ h, s, l }) {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const hp = h / 60;
  const x = c * (1 - Math.abs(hp % 2 - 1));
  let rp = 0, gp = 0, bp = 0;
  if (hp < 1) { rp = c; gp = x; }
  else if (hp < 2) { rp = x; gp = c; }
  else if (hp < 3) { gp = c; bp = x; }
  else if (hp < 4) { gp = x; bp = c; }
  else if (hp < 5) { rp = x; bp = c; }
  else { rp = c; bp = x; }
  const m = l - c / 2;
  return { r: (rp + m) * 255, g: (gp + m) * 255, b: (bp + m) * 255 };
}
function adjustSaturation(hex, mult) {
  const hsl = rgbToHsl(hexToRgb(hex));
  hsl.s = Math.max(0, Math.min(1, hsl.s * mult));
  return rgbToHex(hslToRgb(hsl));
}

// ── Reduced motion ───────────────────────────────────────────────────────────
function usePrefersReducedMotion() {
  const [reduced, setReduced] = React.useState(() =>
    typeof window !== 'undefined' && window.matchMedia
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false
  );
  React.useEffect(() => {
    if (!window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return reduced;
}

// ── Resolve a tag's fill color ───────────────────────────────────────────────
function resolveTagFill(tag, palette, theme) {
  const idx = (tag && Number.isFinite(tag.colorIndex)) ? tag.colorIndex : 0;
  const swatches = palette.swatches;
  const base = swatches[idx % swatches.length];
  if (theme.fillMode === 'tint') return tint(base, 0.55);
  if (theme.fillMode === 'neon') return darken(base, 0.72);
  if (theme.fillMode === 'terminal') return 'rgba(0,20,8,0.85)';
  return base;
}

// ── Block ────────────────────────────────────────────────────────────────────

function Block({
  task, body, theme, palette, tagsById,
  selected, completing, deleting, editing, isActionable,
  onPointerDown, onResizeStart, onContextMenu, onDoubleClick,
  onCommitEdit, onCancelEdit, onComplete,
  resizing, flatBlocks, glowPulse, showActionableGlow, reducedMotion,
}) {
  const inputRef = React.useRef(null);
  React.useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const tag = tagsById[task.tag] || { name: task.tag, colorIndex: 0 };
  const fill = resolveTagFill(tag, palette, theme);

  // Neon: fg is always the palette color itself (bright), rest is dark bg
  let fg;
  if (theme.fillMode === 'neon') {
    const base = palette.swatches[(tag.colorIndex || 0) % palette.swatches.length];
    fg = base;
  } else if (theme.fillMode === 'terminal') {
    fg = '#00ff41';
  } else if (theme.fillMode === 'tint') {
    fg = theme.titleColor;
  } else {
    fg = readableFg(fill);
  }

  const deformY = flatBlocks ? 0 : (body.deform || 0);
  let sx = 1 - deformY * 0.6;
  let sy = 1 + deformY * 0.6;
  // Drag lift: scale up slightly when held; deform overrides this if active.
  if (body.dragging && !deformY) { sx = 1.03; sy = 1.03; }
  // Completion celebration: brief pop on the first ~80ms, then settle to fade scale.
  if (completing) { sx *= 0.92; sy *= 0.92; }
  if (deleting) { sx *= 0.92; sy *= 0.92; }
  const rot = flatBlocks ? 0 : (body.av || 0);

  // Flat mode overrides
  const flatShadow = theme.aesthetic === 'brutalist' ? '4px 4px 0 #000' : 'none';
  const flatBorder = theme.aesthetic === 'brutalist' ? '2px solid #000'
    : theme.aesthetic === 'terminal' ? '1px solid rgba(0,255,65,0.3)'
    : theme.aesthetic === 'neon' ? '1px solid rgba(255,255,255,0.12)'
    : theme.fillMode === 'tint' ? '1px solid rgba(0,0,0,0.10)' : 'none';

  // Neon glow border when not flat
  let neonGlow = 'none';
  if (theme.fillMode === 'neon' && !flatBlocks) {
    const base = palette.swatches[(tag.colorIndex || 0) % palette.swatches.length];
    neonGlow = `0 0 0 1px ${base}44, 0 0 16px ${base}55, 0 0 40px ${base}22`;
  }

  // Compose block shadow: theme shadow + optional drag lift + optional actionable halo.
  const baseShadow = flatBlocks ? flatShadow : (theme.fillMode === 'neon' ? neonGlow : theme.blockShadow);
  const dragShadow = body.dragging && !flatBlocks
    ? '0 14px 30px rgba(0,0,0,.45), 0 6px 12px rgba(0,0,0,.35)'
    : null;
  const haloOn = !!(showActionableGlow && isActionable && !completing && !deleting && !body.dragging);
  const haloPulse = haloOn ? (0.45 + 0.25 * Math.sin((glowPulse || 0) * 1.6)) : 0;
  const haloShadow = haloOn ? `0 0 0 1px ${theme.floorGlow}, 0 0 24px ${theme.floorGlow.replace(/[\d.]+\)$/, haloPulse.toFixed(2) + ')')}` : null;
  const composedShadow = [haloShadow, dragShadow || baseShadow].filter(Boolean).join(', ');

  // Build transition string. Animations are suppressed during drag/completing/
  // deleting so motion stays snappy when the user is actively moving things.
  let transitionStr;
  if (reducedMotion) {
    transitionStr = 'none';
  } else if (completing) {
    transitionStr = 'opacity .27s ease .08s, transform .35s cubic-bezier(.2,.8,.2,1)';
  } else if (deleting) {
    transitionStr = 'opacity .18s ease, transform .18s ease';
  } else if (body.snapAnim) {
    transitionStr = 'left .18s cubic-bezier(.2,.8,.2,1), top .18s cubic-bezier(.2,.8,.2,1), width .18s cubic-bezier(.2,.8,.2,1), height .18s cubic-bezier(.2,.8,.2,1)';
  } else if (body.dragging) {
    transitionStr = 'transform .12s ease, box-shadow .12s ease';
  } else {
    // Idle: cross-fade colors when palette/theme changes; quick lift-down.
    transitionStr = 'background-color .25s ease, border-color .25s ease, color .25s ease, transform .12s ease, box-shadow .25s ease';
  }

  const baseStyle = {
    position: 'absolute',
    left: body.x,
    top: body.y,
    width: body.w,
    height: body.h,
    transform: `rotate(${rot}rad) scale(${sx}, ${sy})`,
    transformOrigin: 'center bottom',
    background: fill,
    border: flatBlocks ? flatBorder : (theme.blockBorder || 'none'),
    borderRadius: theme.blockRadius,
    boxShadow: composedShadow,
    color: fg,
    fontFamily: theme.blockFontFamily,
    fontWeight: theme.blockFontWeight,
    cursor: body.dragging ? 'grabbing' : 'grab',
    userSelect: 'none',
    zIndex: body.dragging ? 100000 : Math.floor(body.y + body.h),
    transition: transitionStr,
    opacity: (completing || deleting) ? 0 : 1,
    willChange: 'transform, top, left, width, height',
    display: 'flex',
    flexDirection: 'column',
    padding: '8px 10px',
    boxSizing: 'border-box',
    overflow: 'hidden',
  };

  if (task.waiting) {
    baseStyle.opacity = completing ? 0 : 0.5;
    baseStyle.borderStyle = 'dashed';
    baseStyle.borderWidth = theme.aesthetic === 'brutalist' ? '2px' : '1.5px';
    baseStyle.borderColor = theme.aesthetic === 'brutalist' ? '#000'
      : theme.fillMode === 'terminal' ? 'rgba(0,255,65,0.3)'
      : theme.fillMode === 'neon' ? 'rgba(255,255,255,0.15)'
      : darken(fill, 0.3);
    baseStyle.boxShadow = theme.aesthetic === 'brutalist' ? '4px 4px 0 #000' : '0 2px 6px rgba(0,0,0,.06)';
  }

  if (selected) {
    baseStyle.outline = theme.aesthetic === 'brutalist'
      ? '3px solid #ff3d00'
      : `2px solid ${theme.accentColor}`;
    baseStyle.outlineOffset = '2px';
  }

  // Derive chip from the block's actual fill (resolveTagFill output) so chips
  // stay readable on light palettes / light themes. Brutalist/terminal/neon
  // keep their distinctive looks; everything else uses luminance-based contrast.
  let tagBg, tagFg;
  if (theme.aesthetic === 'brutalist') {
    tagBg = '#000'; tagFg = '#fff';
  } else if (theme.fillMode === 'terminal') {
    tagBg = 'rgba(0,255,65,0.12)'; tagFg = '#00ff41';
  } else if (theme.fillMode === 'neon') {
    tagBg = 'rgba(255,255,255,0.07)'; tagFg = fg;
  } else {
    const lightFill = luminance(fill) > 0.55;
    tagBg = lightFill ? 'rgba(0,0,0,0.14)' : 'rgba(255,255,255,0.18)';
    tagFg = lightFill ? '#0a0e18' : '#ffffff';
  }

  return (
    <div
      style={baseStyle}
      onPointerDown={onPointerDown}
      onContextMenu={onContextMenu}
      onDoubleClick={onDoubleClick}
      data-block-id={task.id}
      data-block-role="block"
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
        <span style={{
          fontSize: 9.5,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          fontWeight: 700,
          padding: '2px 6px',
          borderRadius: (theme.aesthetic === 'brutalist' || theme.aesthetic === 'terminal') ? 0 : 999,
          background: tagBg,
          color: tagFg,
          opacity: task.waiting ? 0.7 : 1,
        }}>{tag.name}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {isActionable && !editing && !task.waiting && (
            <button
              onPointerDown={(e) => { e.stopPropagation(); }}
              onClick={(e) => { e.stopPropagation(); onComplete(); }}
              title="Mark complete"
              aria-label="Mark complete"
              style={{
                width: 24, height: 24,
                borderRadius: (theme.aesthetic === 'brutalist' || theme.aesthetic === 'terminal') ? 0 : '50%',
                border: theme.aesthetic === 'brutalist' ? '2px solid #000'
                  : theme.fillMode === 'terminal' ? '1px solid #00ff41'
                  : theme.fillMode === 'neon' ? `1px solid ${fg}`
                  : `1.5px solid ${darken(fill, 0.35)}`,
                background: theme.aesthetic === 'brutalist' ? '#fff'
                  : theme.fillMode === 'terminal' ? 'rgba(0,255,65,0.1)'
                  : theme.fillMode === 'neon' ? 'rgba(255,255,255,0.07)'
                  : 'rgba(255,255,255,.55)',
                color: theme.aesthetic === 'brutalist' ? '#000'
                  : theme.fillMode === 'terminal' ? '#00ff41'
                  : theme.fillMode === 'neon' ? fg
                  : darken(fill, 0.5),
                cursor: 'pointer',
                padding: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: theme.aesthetic === 'brutalist' ? '2px 2px 0 #000' : 'none',
                transition: 'transform .1s, background .1s',
                flexShrink: 0,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = theme.aesthetic === 'brutalist' ? '#ffeb00'
                  : theme.fillMode === 'terminal' ? 'rgba(0,255,65,0.25)'
                  : '#fff';
                e.currentTarget.style.transform = 'scale(1.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = theme.aesthetic === 'brutalist' ? '#fff'
                  : theme.fillMode === 'terminal' ? 'rgba(0,255,65,0.1)'
                  : 'rgba(255,255,255,.55)';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <svg width="12" height="12" viewBox="0 0 12 12">
                <path d="M2.5 6.5 L5 9 L9.5 3.5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}
          <span style={{
            fontSize: 9.5,
            letterSpacing: '0.05em',
            fontWeight: 600,
            opacity: 0.6,
            fontVariantNumeric: 'tabular-nums',
          }}>{task.size}</span>
        </div>
      </div>

      {editing ? (
        <input
          ref={inputRef}
          defaultValue={task.title}
          onBlur={(e) => onCommitEdit(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') { e.preventDefault(); onCommitEdit(e.target.value); }
            if (e.key === 'Escape') { e.preventDefault(); onCancelEdit(); }
          }}
          style={{
            marginTop: 2,
            background: 'rgba(255,255,255,.5)',
            border: 'none',
            outline: '2px solid rgba(0,0,0,.4)',
            font: 'inherit',
            color: '#0a0e18',
            padding: '2px 4px',
            borderRadius: (theme.aesthetic === 'brutalist' || theme.aesthetic === 'terminal') ? 0 : 4,
            width: '100%',
            boxSizing: 'border-box',
          }}
        />
      ) : (
        <div style={{
          marginTop: 4,
          fontSize: Math.max(11, Math.min(15, body.h * 0.16)),
          lineHeight: 1.2,
          textWrap: 'pretty',
          flex: 1,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          paddingRight: 0,
        }}>
          {task.title}
        </div>
      )}

      {!editing && !completing && (
        <React.Fragment>
          {[
            { dir: 'n',  style: { top: -3, left: 8, right: 8, height: 8, cursor: 'ns-resize' } },
            { dir: 's',  style: { bottom: -3, left: 8, right: 8, height: 8, cursor: 'ns-resize' } },
            { dir: 'w',  style: { left: -3, top: 8, bottom: 8, width: 8, cursor: 'ew-resize' } },
            { dir: 'e',  style: { right: -3, top: 8, bottom: 8, width: 8, cursor: 'ew-resize' } },
            { dir: 'nw', style: { top: -4, left: -4, width: 12, height: 12, cursor: 'nwse-resize' } },
            { dir: 'ne', style: { top: -4, right: -4, width: 12, height: 12, cursor: 'nesw-resize' } },
            { dir: 'sw', style: { bottom: -4, left: -4, width: 12, height: 12, cursor: 'nesw-resize' } },
            { dir: 'se', style: { bottom: -4, right: -4, width: 12, height: 12, cursor: 'nwse-resize' } },
          ].map((h) => (
            <div
              key={h.dir}
              data-resize-dir={h.dir}
              onPointerDown={(e) => onResizeStart(e, h.dir)}
              onDoubleClick={(e) => e.stopPropagation()}
              style={{
                position: 'absolute',
                ...h.style,
                zIndex: 2,
                touchAction: 'none',
              }}
            />
          ))}
          <div style={{
            position: 'absolute',
            right: 2, bottom: 2,
            width: 12, height: 12,
            opacity: selected ? 0.6 : 0.25,
            color: fg,
            pointerEvents: 'none',
            transition: 'opacity .15s',
          }}>
            <svg width="12" height="12" viewBox="0 0 12 12" style={{ display: 'block' }}>
              <path d="M12 4 L4 12 M12 8 L8 12" stroke="currentColor" strokeWidth="1.2" />
            </svg>
          </div>
        </React.Fragment>
      )}
    </div>
  );
}

// ── Context Menu ─────────────────────────────────────────────────────────────

function ContextMenu({ x, y, items, theme, onClose }) {
  React.useEffect(() => {
    const close = () => onClose();
    window.addEventListener('mousedown', close);
    window.addEventListener('blur', close);
    return () => {
      window.removeEventListener('mousedown', close);
      window.removeEventListener('blur', close);
    };
  }, [onClose]);

  return (
    <div
      onMouseDown={(e) => e.stopPropagation()}
      style={{
        position: 'fixed',
        left: x, top: y,
        background: theme.panelBg,
        backdropFilter: 'blur(20px) saturate(160%)',
        WebkitBackdropFilter: 'blur(20px) saturate(160%)',
        border: theme.aesthetic === 'brutalist' ? `2px solid ${theme.panelBorder}` : `0.5px solid ${theme.panelBorder}`,
        borderRadius: theme.aesthetic === 'brutalist' ? 0 : 10,
        boxShadow: theme.aesthetic === 'brutalist' ? '4px 4px 0 #000' : '0 12px 40px rgba(0,0,0,.18)',
        padding: 4,
        minWidth: 200,
        zIndex: 1000,
        fontFamily: theme.blockFontFamily,
        fontSize: 12,
        color: theme.panelText,
      }}
    >
      {items.map((item, i) => item.divider ? (
        <div key={i} style={{ height: 1, background: theme.panelBorder, margin: '4px 0' }} />
      ) : (
        <button
          key={i}
          onClick={() => { item.onClick(); onClose(); }}
          disabled={item.disabled}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            padding: '7px 10px',
            border: 0,
            background: 'transparent',
            color: 'inherit',
            font: 'inherit',
            textAlign: 'left',
            borderRadius: theme.aesthetic === 'brutalist' ? 0 : 6,
            opacity: item.disabled ? 0.4 : 1,
            cursor: item.disabled ? 'not-allowed' : 'default',
          }}
          onMouseEnter={(e) => { if (!item.disabled) e.currentTarget.style.background = theme.aesthetic === 'modern' ? 'rgba(0,0,0,.06)' : 'rgba(255,255,255,.08)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
        >
          <span>{item.label}</span>
          {item.shortcut && <span style={{ opacity: 0.5, fontSize: 10, fontVariantNumeric: 'tabular-nums' }}>{item.shortcut}</span>}
        </button>
      ))}
    </div>
  );
}

// ── Group Label ──────────────────────────────────────────────────────────────

function GroupLabel({ group, theme, onRename, onDelete }) {
  const [editing, setEditing] = React.useState(group.justCreated);
  const inputRef = React.useRef(null);
  React.useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const { x1, y1, x2 } = group.bbox;

  return (
    <div
      style={{
        position: 'absolute',
        left: x1 - 6,
        top: y1 - 28,
        width: x2 - x1 + 12,
        pointerEvents: 'none',
      }}
    >
      <div style={{
        position: 'absolute',
        left: 0, top: 22,
        right: 0, bottom: -(group.bbox.y2 - group.bbox.y1 + 10),
        border: `1.5px dashed ${theme.accentColor}`,
        borderRadius: theme.aesthetic === 'brutalist' ? 0 : 8,
        opacity: 0.5,
      }} />
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          background: theme.accentColor,
          color: theme.aesthetic === 'modern' ? '#fff' : (theme.aesthetic === 'brutalist' ? '#fff' : '#0a0e18'),
          padding: '3px 10px',
          fontSize: 10.5,
          fontWeight: 700,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          borderRadius: theme.aesthetic === 'brutalist' ? 0 : 999,
          fontFamily: theme.blockFontFamily,
          pointerEvents: 'auto',
          boxShadow: theme.aesthetic === 'brutalist' ? '2px 2px 0 #000' : '0 2px 8px rgba(0,0,0,.15)',
        }}
        onDoubleClick={() => setEditing(true)}
      >
        {editing ? (
          <input
            ref={inputRef}
            defaultValue={group.label}
            onBlur={(e) => { onRename(e.target.value || 'group'); setEditing(false); }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') { onRename(e.target.value || 'group'); setEditing(false); }
              if (e.key === 'Escape') { setEditing(false); }
            }}
            style={{
              background: 'rgba(255,255,255,.25)',
              border: 0,
              outline: 'none',
              font: 'inherit',
              color: 'inherit',
              width: 120,
              padding: 0,
            }}
          />
        ) : (
          <span>{group.label}</span>
        )}
        <button
          onClick={onDelete}
          style={{
            border: 0,
            background: 'transparent',
            color: 'inherit',
            opacity: 0.7,
            cursor: 'default',
            padding: 0,
            font: 'inherit',
            lineHeight: 1,
          }}
          aria-label="Remove group"
        >×</button>
      </div>
    </div>
  );
}

// ── Palette Manager ──────────────────────────────────────────────────────────

function PaletteManager({
  theme, palettes, currentPaletteId, onPickPalette,
  tags, onUpdateTags,
  customSwatches, onUpdateCustomSwatches,
  onClose,
}) {
  const palette = palettes.find((p) => p.id === currentPaletteId) || palettes[0];
  const swatches = customSwatches[palette.id] || palette.swatches;
  const isCustom = !!customSwatches[palette.id];

  // Saturation slider state — local, resets on palette change. Acts as a
  // multiplier (0–2x) applied to all 6 current swatches and committed as a
  // normal palette customization.
  const [satPct, setSatPct] = React.useState(100);
  const satBaseRef = React.useRef(swatches);
  React.useEffect(() => {
    setSatPct(100);
    satBaseRef.current = customSwatches[palette.id] || palette.swatches;
  }, [palette.id]);

  const fontFamily = theme.blockFontFamily;
  const text = theme.panelText;

  const updateSwatch = (i, color) => {
    const next = [...swatches];
    next[i] = color;
    onUpdateCustomSwatches({ ...customSwatches, [palette.id]: next });
    satBaseRef.current = next;
    setSatPct(100);
  };
  const applySaturation = (pct) => {
    setSatPct(pct);
    const mult = pct / 100;
    const base = satBaseRef.current;
    const next = base.map((c) => adjustSaturation(c, mult));
    onUpdateCustomSwatches({ ...customSwatches, [palette.id]: next });
  };
  const resetSwatches = () => {
    const { [palette.id]: _, ...rest } = customSwatches;
    onUpdateCustomSwatches(rest);
    setSatPct(100);
    satBaseRef.current = palette.swatches;
  };

  const updateTag = (id, patch) => {
    onUpdateTags(tags.map((t) => t.id === id ? { ...t, ...patch } : t));
  };
  const deleteTag = (id) => {
    if (tags.length <= 1) return;
    onUpdateTags(tags.filter((t) => t.id !== id));
  };
  const addTag = () => {
    const id = 'tag' + Date.now();
    onUpdateTags([...tags, { id, name: 'new', colorIndex: tags.length % swatches.length }]);
  };

  return (
    <div
      onMouseDown={(e) => e.stopPropagation()}
      onContextMenu={(e) => e.stopPropagation()}
      style={{
        position: 'fixed',
        top: 60,
        right: 16,
        bottom: 16,
        width: 360,
        background: theme.panelBg,
        backdropFilter: 'blur(20px) saturate(160%)',
        WebkitBackdropFilter: 'blur(20px) saturate(160%)',
        color: text,
        border: theme.aesthetic === 'brutalist' ? `2px solid ${theme.panelBorder}` : `0.5px solid ${theme.panelBorder}`,
        borderRadius: theme.aesthetic === 'brutalist' ? 0 : 14,
        boxShadow: theme.aesthetic === 'brutalist' ? '6px 6px 0 #000' : '0 24px 60px rgba(0,0,0,.35)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        fontFamily,
        zIndex: 1100,
      }}
    >
        <div style={{
          padding: '12px 14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: theme.aesthetic === 'brutalist' ? `2px solid ${theme.panelBorder}` : `0.5px solid ${theme.panelBorder}`,
          flexShrink: 0,
        }}>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.04em' }}>Palette & Tags</div>
          <button onClick={onClose} style={{ border: 0, background: 'transparent', color: 'inherit', fontSize: 18, lineHeight: 1, cursor: 'pointer', padding: 4 }}>×</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflowY: 'auto' }}>
          <div style={{ padding: 10, borderBottom: theme.aesthetic === 'brutalist' ? `2px solid ${theme.panelBorder}` : `0.5px solid ${theme.panelBorder}` }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', opacity: 0.6, padding: '0 4px 8px' }}>
              Palettes ({palettes.length})
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
            {palettes.map((p) => {
              const sw = customSwatches[p.id] || p.swatches;
              const active = p.id === currentPaletteId;
              return (
                <button key={p.id} onClick={() => onPickPalette(p.id)} style={{
                  textAlign: 'left', padding: '6px 8px',
                  background: active ? (theme.aesthetic === 'modern' ? 'rgba(0,0,0,.06)' : 'rgba(255,255,255,.08)') : 'transparent',
                  border: active ? (theme.aesthetic === 'brutalist' ? `2px solid ${theme.panelBorder}` : `1px solid ${theme.accentColor}`) : (theme.aesthetic === 'brutalist' ? `2px solid transparent` : `1px solid transparent`),
                  borderRadius: theme.aesthetic === 'brutalist' ? 0 : 6,
                  color: 'inherit', font: 'inherit', cursor: 'pointer',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 }}>
                    <span style={{ fontSize: 10.5, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</span>
                    {customSwatches[p.id] && <span style={{ fontSize: 8, opacity: 0.5 }}>edited</span>}
                  </div>
                  <div style={{ display: 'flex', gap: 1, height: 10 }}>
                    {sw.map((c, i) => (<div key={i} style={{ flex: 1, background: c, borderRadius: theme.aesthetic === 'brutalist' ? 0 : 1 }} />))}
                  </div>
                </button>
              );
            })}
            </div>
          </div>

          <div style={{ padding: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700 }}>{palette.name}</div>
                <div style={{ fontSize: 10, opacity: 0.55, marginTop: 1 }}>Click a swatch to edit</div>
              </div>
              {isCustom && (
                <button onClick={resetSwatches} style={{ border: theme.aesthetic === 'brutalist' ? `2px solid ${theme.panelBorder}` : `1px solid ${theme.panelBorder}`, background: 'transparent', color: 'inherit', padding: '3px 8px', fontSize: 10, fontWeight: 600, borderRadius: theme.aesthetic === 'brutalist' ? 0 : 5, cursor: 'pointer', font: 'inherit' }}>Reset</button>
              )}
            </div>

            <div style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', opacity: 0.6 }}>Saturation</div>
                <div style={{ fontSize: 10, opacity: 0.55, fontVariantNumeric: 'tabular-nums' }}>{satPct}%</div>
              </div>
              <input
                type="range"
                min={0}
                max={200}
                step={1}
                value={satPct}
                onChange={(e) => applySaturation(parseInt(e.target.value, 10))}
                style={{ width: '100%', accentColor: theme.accentColor }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 4, marginBottom: 16 }}>
              {swatches.map((c, i) => (
                <label key={i} style={{ position: 'relative', aspectRatio: '1', borderRadius: theme.aesthetic === 'brutalist' ? 0 : 6, border: theme.aesthetic === 'brutalist' ? '2px solid #000' : '1px solid rgba(0,0,0,.1)', background: c, cursor: 'pointer', overflow: 'hidden', boxShadow: theme.aesthetic === 'brutalist' ? '2px 2px 0 #000' : '0 1px 2px rgba(0,0,0,.1)' }}>
                  <input type="color" value={c} onChange={(e) => updateSwatch(i, e.target.value)} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', border: 0 }} />
                  <div style={{ position: 'absolute', top: 2, right: 4, fontSize: 8, fontWeight: 700, color: readableFg(c), opacity: 0.7 }}>{i}</div>
                </label>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <div style={{ fontSize: 11, fontWeight: 700 }}>Tags</div>
              <button onClick={addTag} style={{ border: theme.aesthetic === 'brutalist' ? `2px solid ${theme.panelBorder}` : `1px solid ${theme.panelBorder}`, background: 'transparent', color: 'inherit', padding: '3px 8px', fontSize: 10, fontWeight: 600, borderRadius: theme.aesthetic === 'brutalist' ? 0 : 5, cursor: 'pointer', font: 'inherit' }}>+ Add</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {tags.map((tag) => (
                <div key={tag.id} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: 5, border: theme.aesthetic === 'brutalist' ? `2px solid ${theme.panelBorder}` : `1px solid ${theme.panelBorder}`, borderRadius: theme.aesthetic === 'brutalist' ? 0 : 6 }}>
                  <input value={tag.name} onChange={(e) => updateTag(tag.id, { name: e.target.value })} style={{ flex: 1, minWidth: 0, background: 'transparent', border: 0, outline: 'none', color: 'inherit', font: 'inherit', fontSize: 11, fontWeight: 500, padding: '2px 4px' }} />
                  <div style={{ display: 'flex', gap: 2 }}>
                    {swatches.map((c, i) => (
                      <button key={i} onClick={() => updateTag(tag.id, { colorIndex: i })} title={`Color ${i}`} style={{ width: 18, height: 18, background: c, border: tag.colorIndex === i ? (theme.aesthetic === 'brutalist' ? '2px solid #000' : `2px solid ${theme.accentColor}`) : (theme.aesthetic === 'brutalist' ? '2px solid transparent' : '1px solid rgba(0,0,0,.15)'), borderRadius: theme.aesthetic === 'brutalist' ? 0 : 3, cursor: 'pointer', padding: 0, outline: 'none' }} />
                    ))}
                  </div>
                  <button onClick={() => deleteTag(tag.id)} disabled={tags.length <= 1} style={{ width: 20, height: 20, border: 0, background: 'transparent', color: 'inherit', opacity: tags.length <= 1 ? 0.25 : 0.55, cursor: tags.length <= 1 ? 'not-allowed' : 'pointer', fontSize: 14, lineHeight: 1, padding: 0 }}>×</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
  );
}

window.Block = Block;
window.ContextMenu = ContextMenu;
window.GroupLabel = GroupLabel;
window.PaletteManager = PaletteManager;
window.AESTHETIC_THEMES = AESTHETIC_THEMES;
window.resolveTagFill = resolveTagFill;
window.readableFg = readableFg;
window.darken = darken;
window.tint = tint;
window.adjustSaturation = adjustSaturation;
window.usePrefersReducedMotion = usePrefersReducedMotion;
window.luminance = luminance;
window.formatShortcut = formatShortcut;
window.TWEAK_DEFAULTS = TWEAK_DEFAULTS;
