// scene.jsx — main scene wiring physics + interactions + grid snapping

const {
  PhysicsWorld, AESTHETIC_THEMES, INITIAL_TASKS, SIZE_PRESETS, DEFAULT_TAGS, PALETTES,
  GRID, snap, snapMin,
  Block, ContextMenu, GroupLabel, PaletteManager,
  TweaksPanel, TweakSection, TweakRadio, TweakToggle, TweakSlider, TweakButton, TweakSelect,
  useTweaks, TWEAK_DEFAULTS, formatShortcut,
} = window;

let __idc = 1000;
const nextId = () => 't' + (++__idc);

const snapTo = (v, g) => Math.round(v / g) * g;
const snapMinTo = (v, g) => Math.max(g, Math.round(v / g) * g);

// ── Gear icon SVG ────────────────────────────────────────────────────────────
function GearIcon({ size = 16, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" style={{ display: 'block', flexShrink: 0 }}>
      <path
        d="M10 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"
        stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      />
      <path
        d="M16.2 12.5a1.38 1.38 0 0 0 .28 1.52l.05.05a1.67 1.67 0 0 1-1.18 2.85 1.67 1.67 0 0 1-1.18-.49l-.05-.05a1.38 1.38 0 0 0-1.52-.28 1.38 1.38 0 0 0-.84 1.27V17.5a1.67 1.67 0 1 1-3.33 0v-.07a1.38 1.38 0 0 0-.9-1.27 1.38 1.38 0 0 0-1.52.28l-.05.05a1.67 1.67 0 0 1-2.36-2.36l.05-.05a1.38 1.38 0 0 0 .28-1.52 1.38 1.38 0 0 0-1.27-.84H2.5a1.67 1.67 0 1 1 0-3.33h.07a1.38 1.38 0 0 0 1.27-.9 1.38 1.38 0 0 0-.28-1.52l-.05-.05a1.67 1.67 0 0 1 2.36-2.36l.05.05a1.38 1.38 0 0 0 1.52.28h.07A1.38 1.38 0 0 0 8.33 2.57V2.5a1.67 1.67 0 1 1 3.33 0v.07a1.38 1.38 0 0 0 .84 1.27 1.38 1.38 0 0 0 1.52-.28l.05-.05a1.67 1.67 0 0 1 2.36 2.36l-.05.05a1.38 1.38 0 0 0-.28 1.52v.07a1.38 1.38 0 0 0 1.27.84h.07a1.67 1.67 0 1 1 0 3.33h-.07a1.38 1.38 0 0 0-1.27.83Z"
        stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  );
}

// ── Settings Page ────────────────────────────────────────────────────────────
// Full-panel settings overlay (replaces TweaksPanel, covers the right side).

const AESTHETIC_META = [
  { id: 'playful',   label: 'Playful',   desc: 'Dark + vibrant, chunky shadows' },
  { id: 'modern',    label: 'Modern',    desc: 'Light + minimal, soft tints' },
  { id: 'brutalist', label: 'Brutalist', desc: 'Monochrome, bold borders' },
  { id: 'neon',      label: 'Neon',      desc: 'Near-black, glowing edges' },
  { id: 'soft',      label: 'Soft',      desc: 'Warm cream, rounded & gentle' },
  { id: 'terminal',  label: 'Terminal',  desc: 'Green-on-black, mono grid' },
];

function SettingsPage({
  open, reducedMotion,
  t, setTweak, theme,
  tags, onUpdateTags,
  palettes, customSwatches, onUpdateCustomSwatches,
  addTask, clearBoard, onExport, onImport, importError,
  onOpenPalette,
  onClose,
}) {
  const [section, setSection] = React.useState('appearance');
  const [clearArmed, setClearArmed] = React.useState(false);
  React.useEffect(() => {
    if (!clearArmed) return;
    const id = setTimeout(() => setClearArmed(false), 3000);
    return () => clearTimeout(id);
  }, [clearArmed]);
  const fileInputRef = React.useRef(null);

  const sectionStyle = (id) => ({
    appearance: 'none',
    border: 'none',
    background: section === id
      ? (theme.aesthetic === 'modern' || theme.aesthetic === 'soft' ? 'rgba(0,0,0,0.07)' : 'rgba(255,255,255,0.09)')
      : 'transparent',
    color: section === id ? theme.panelText : (theme.aesthetic === 'modern' || theme.aesthetic === 'soft' ? 'rgba(0,0,0,0.45)' : 'rgba(255,255,255,0.45)'),
    fontFamily: theme.blockFontFamily,
    fontSize: 11.5,
    fontWeight: section === id ? 700 : 500,
    letterSpacing: '0.02em',
    padding: '7px 12px',
    borderRadius: theme.aesthetic === 'brutalist' ? 0 : 7,
    cursor: 'default',
    textAlign: 'left',
    width: '100%',
    transition: 'background .12s, color .12s',
  });

  const isDark = theme.aesthetic === 'playful' || theme.aesthetic === 'neon' || theme.aesthetic === 'terminal';
  const divider = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)';
  const subText = isDark ? 'rgba(255,255,255,0.42)' : 'rgba(0,0,0,0.42)';

  return (
    <div
      onMouseDown={(e) => e.stopPropagation()}
      onContextMenu={(e) => e.stopPropagation()}
      style={{
        position: 'fixed',
        top: 0, right: 0, bottom: 0,
        width: 420,
        background: theme.panelBg,
        backdropFilter: 'blur(24px) saturate(180%)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        color: theme.panelText,
        borderLeft: theme.aesthetic === 'brutalist'
          ? `3px solid ${theme.panelBorder}`
          : `0.5px solid ${theme.panelBorder}`,
        boxShadow: isDark ? '-20px 0 60px rgba(0,0,0,0.5)' : '-20px 0 60px rgba(0,0,0,0.12)',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: theme.blockFontFamily,
        zIndex: 1200,
        overflow: 'hidden',
        transform: open ? 'translateX(0)' : 'translateX(100%)',
        transition: reducedMotion ? 'none' : 'transform .22s cubic-bezier(.2,.8,.2,1)',
      }}
    >
      {/* Header */}
      <div style={{
        padding: '16px 20px 14px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: `0.5px solid ${divider}`,
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <GearIcon size={15} color={theme.panelText} />
          <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.02em' }}>Settings</span>
        </div>
        <button
          onClick={onClose}
          style={{
            border: 0, background: 'transparent', color: theme.panelText,
            fontSize: 18, lineHeight: 1, cursor: 'pointer', padding: '2px 6px',
            opacity: 0.55, borderRadius: 6,
          }}
        >✕</button>
      </div>

      {/* Body: sidebar nav + content */}
      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>

        {/* Sidebar nav */}
        <div style={{
          width: 120,
          flexShrink: 0,
          padding: '10px 8px',
          borderRight: `0.5px solid ${divider}`,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}>
          {[
            { id: 'appearance', label: 'Appearance' },
            { id: 'grid',       label: 'Grid' },
            { id: 'physics',    label: 'Physics' },
            { id: 'display',    label: 'Display' },
            { id: 'palettes',   label: 'Palettes' },
            { id: 'board',      label: 'Board' },
          ].map((s) => (
            <button key={s.id} style={sectionStyle(s.id)} onClick={() => setSection(s.id)}>
              {s.label}
            </button>
          ))}
        </div>

        {/* Content area */}
        <div style={{
          flex: 1,
          minWidth: 0,
          overflowY: 'auto',
          padding: '16px 20px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
        }}>

          {/* ── Appearance ── */}
          {section === 'appearance' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <SettingsGroup label="Style">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {AESTHETIC_META.map((a) => {
                    const active = t.aesthetic === a.id;
                    const swatch = AESTHETIC_THEMES[a.id];
                    return (
                      <button
                        key={a.id}
                        onClick={() => setTweak('aesthetic', a.id)}
                        style={{
                          appearance: 'none',
                          border: active
                            ? `2px solid ${theme.accentColor}`
                            : `1.5px solid ${divider}`,
                          borderRadius: theme.aesthetic === 'brutalist' ? 0 : 10,
                          background: active
                            ? (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)')
                            : 'transparent',
                          cursor: 'default',
                          padding: '10px 12px',
                          textAlign: 'left',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 6,
                          transition: 'border-color .15s, background .15s',
                        }}
                      >
                        {/* Mini preview strip */}
                        <div style={{
                          height: 28,
                          borderRadius: theme.aesthetic === 'brutalist' ? 0 : 6,
                          background: swatch.bg,
                          border: `1px solid ${divider}`,
                          overflow: 'hidden',
                          position: 'relative',
                          display: 'flex',
                          alignItems: 'flex-end',
                          padding: 4,
                          gap: 3,
                        }}>
                          {[0,1,2].map((i) => {
                            const paletteColors = ['#00B5C9','#F2C200','#A459D1'];
                            const fc = swatch.fillMode === 'tint' ? tint(paletteColors[i], 0.55)
                              : swatch.fillMode === 'neon' ? darken(paletteColors[i], 0.72)
                              : swatch.fillMode === 'terminal' ? 'rgba(0,20,8,0.85)'
                              : paletteColors[i];
                            return (
                              <div key={i} style={{
                                height: [14,20,12][i],
                                flex: 1,
                                background: fc,
                                borderRadius: swatch.blockRadius || 2,
                                border: swatch.blockBorder === '2px solid #000' ? '1px solid #000' : 'none',
                              }} />
                            );
                          })}
                        </div>
                        <div>
                          <div style={{ fontSize: 11, fontWeight: 700, color: theme.panelText }}>{a.label}</div>
                          <div style={{ fontSize: 9.5, color: subText, marginTop: 1 }}>{a.desc}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </SettingsGroup>

              <SettingsGroup label="Blocks">
                <SettingsRow label="Flat blocks" sub="Remove shadows and deformation physics">
                  <ToggleSwitch value={t.flatBlocks} onChange={(v) => setTweak('flatBlocks', v)} theme={theme} />
                </SettingsRow>
              </SettingsGroup>
            </div>
          )}

          {/* ── Grid ── */}
          {section === 'grid' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <SettingsGroup label="Snapping">
                <SettingsRow label="Snap to grid" sub="Blocks lock to grid on release">
                  <ToggleSwitch value={t.snapToGrid} onChange={(v) => setTweak('snapToGrid', v)} theme={theme} />
                </SettingsRow>
                <SettingsRow label="Show snap grid while dragging" sub="Highlights grid lines during drag">
                  <ToggleSwitch value={t.showGridDuringDrag} onChange={(v) => setTweak('showGridDuringDrag', v)} theme={theme} />
                </SettingsRow>
              </SettingsGroup>
              <SettingsGroup label="Display">
                <SettingsRow label="Always-on background grid" sub="Subtle grid overlay at all times">
                  <ToggleSwitch value={t.showGrid} onChange={(v) => setTweak('showGrid', v)} theme={theme} />
                </SettingsRow>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 6, color: theme.panelText }}>Grid size</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <input
                      type="range" min={8} max={80} step={4} value={t.gridSize}
                      onChange={(e) => setTweak('gridSize', Number(e.target.value))}
                      style={{ flex: 1, accentColor: theme.accentColor }}
                    />
                    <span style={{ fontSize: 11, fontVariantNumeric: 'tabular-nums', opacity: 0.65, minWidth: 30, textAlign: 'right' }}>{t.gridSize}px</span>
                  </div>
                </div>
              </SettingsGroup>
            </div>
          )}

          {/* ── Physics ── */}
          {section === 'physics' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <SettingsGroup label="Gravity">
                <SettingsRow label="Gravity on" sub="Blocks fall and stack">
                  <ToggleSwitch value={t.gravityOn} onChange={(v) => setTweak('gravityOn', v)} theme={theme} />
                </SettingsRow>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 11, fontWeight: 600 }}>Gravity strength</span>
                    <span style={{ fontSize: 11, opacity: 0.55, fontVariantNumeric: 'tabular-nums' }}>{t.gravityStrength}%</span>
                  </div>
                  <input
                    type="range" min={20} max={200} step={5} value={t.gravityStrength}
                    onChange={(e) => setTweak('gravityStrength', Number(e.target.value))}
                    style={{ width: '100%', accentColor: theme.accentColor }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                    <span style={{ fontSize: 9, opacity: 0.4 }}>Moon</span>
                    <span style={{ fontSize: 9, opacity: 0.4 }}>Normal</span>
                    <span style={{ fontSize: 9, opacity: 0.4 }}>Jupiter</span>
                  </div>
                </div>
              </SettingsGroup>
            </div>
          )}

          {/* ── Display ── */}
          {section === 'display' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <SettingsGroup label="Visual effects">
                <SettingsRow label="Glowing baseline" sub="Animated glow at the floor / do-now zone">
                  <ToggleSwitch value={t.showActionableGlow} onChange={(v) => setTweak('showActionableGlow', v)} theme={theme} />
                </SettingsRow>
                <SettingsRow label="Group labels" sub="Show group outlines & labels">
                  <ToggleSwitch value={t.labelGroups} onChange={(v) => setTweak('labelGroups', v)} theme={theme} />
                </SettingsRow>
              </SettingsGroup>
            </div>
          )}

          {/* ── Palettes ── */}
          {section === 'palettes' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <SettingsGroup label="Color palette">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                  {palettes.map((p) => {
                    const sw = customSwatches[p.id] || p.swatches;
                    const active = p.id === t.paletteId;
                    return (
                      <button key={p.id} onClick={() => setTweak('paletteId', p.id)} style={{
                        appearance: 'none',
                        border: active ? `2px solid ${theme.accentColor}` : `1.5px solid ${divider}`,
                        borderRadius: theme.aesthetic === 'brutalist' ? 0 : 8,
                        background: active ? (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)') : 'transparent',
                        cursor: 'default',
                        padding: '8px 10px',
                        textAlign: 'left',
                        transition: 'border-color .12s',
                      }}>
                        <div style={{ display: 'flex', gap: 2, height: 8, marginBottom: 5 }}>
                          {sw.map((c, i) => <div key={i} style={{ flex: 1, background: c, borderRadius: 1 }} />)}
                        </div>
                        <div style={{ fontSize: 10.5, fontWeight: 600, color: theme.panelText, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                        {customSwatches[p.id] && <div style={{ fontSize: 9, opacity: 0.4, marginTop: 1 }}>customised</div>}
                      </button>
                    );
                  })}
                </div>
              </SettingsGroup>
              <SettingsGroup label="Advanced">
                <SettingsActionButton theme={theme} onClick={onOpenPalette} isDark={isDark}>
                  Edit swatches & tags…
                </SettingsActionButton>
              </SettingsGroup>
            </div>
          )}

          {/* ── Board ── */}
          {section === 'board' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <SettingsGroup label="Actions">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <SettingsActionButton theme={theme} isDark={isDark} onClick={addTask}>
                    + Drop random task
                  </SettingsActionButton>
                  <SettingsActionButton
                    theme={theme}
                    isDark={isDark}
                    destructive
                    onClick={() => {
                      if (clearArmed) { clearBoard(); setClearArmed(false); }
                      else { setClearArmed(true); }
                    }}
                  >
                    {clearArmed ? 'Click again to confirm — clears all tasks' : 'Clear board'}
                  </SettingsActionButton>
                </div>
              </SettingsGroup>
              <SettingsGroup label="Backup">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <SettingsActionButton theme={theme} isDark={isDark} onClick={onExport}>
                    Export to file…
                  </SettingsActionButton>
                  <SettingsActionButton
                    theme={theme}
                    isDark={isDark}
                    onClick={() => fileInputRef.current && fileInputRef.current.click()}
                  >
                    Import from file…
                  </SettingsActionButton>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="application/json,.json"
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      const f = e.target.files && e.target.files[0];
                      if (f) onImport(f);
                      e.target.value = '';
                    }}
                  />
                  {importError && (
                    <div style={{
                      fontSize: 11,
                      color: '#ff6b6b',
                      padding: '4px 2px',
                      lineHeight: 1.4,
                    }}>{importError}</div>
                  )}
                </div>
              </SettingsGroup>
              <SettingsGroup label="Keyboard shortcuts">
                <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '6px 12px', fontSize: 11 }}>
                  {[
                    ['drag', 'move block'],
                    ['drag corner', 'resize'],
                    ['✓ tick', 'complete (floor only)'],
                    ['double-click', 'edit title'],
                    ['right-click', 'context menu'],
                    ['drag empty', 'lasso select'],
                    [formatShortcut('mod+n'), 'new task'],
                    ['enter', 'complete selected'],
                    ['delete / ⌫', 'delete selected'],
                    ['g', 'group selected (2+)'],
                    ['space', 'pause / resume gravity'],
                    ['shift-click', 'add to selection'],
                    ['?', 'help overlay'],
                  ].map(([k, v]) => (
                    <React.Fragment key={k}>
                      <div style={{
                        fontSize: 10, padding: '2px 6px',
                        background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)',
                        color: theme.panelText,
                        borderRadius: theme.aesthetic === 'brutalist' ? 0 : 4,
                        fontFamily: 'ui-monospace, monospace', whiteSpace: 'nowrap',
                        alignSelf: 'start',
                      }}>{k}</div>
                      <div style={{ opacity: 0.6, alignSelf: 'center' }}>{v}</div>
                    </React.Fragment>
                  ))}
                </div>
              </SettingsGroup>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

// ── Settings sub-components ──────────────────────────────────────────────────

function SettingsGroup({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', opacity: 0.45 }}>
        {label}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {children}
      </div>
    </div>
  );
}

function SettingsRow({ label, sub, children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, fontWeight: 500 }}>{label}</div>
        {sub && <div style={{ fontSize: 10, opacity: 0.45, marginTop: 2 }}>{sub}</div>}
      </div>
      {children}
    </div>
  );
}

function ToggleSwitch({ value, onChange, theme }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      style={{
        flexShrink: 0,
        width: 36,
        height: 20,
        borderRadius: 999,
        border: 'none',
        background: value ? theme.accentColor : (theme.aesthetic === 'modern' || theme.aesthetic === 'soft' ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.15)'),
        position: 'relative',
        cursor: 'default',
        transition: 'background .15s',
        padding: 0,
      }}
    >
      <span style={{
        position: 'absolute',
        top: 3, left: value ? 17 : 3,
        width: 14, height: 14,
        borderRadius: '50%',
        background: '#fff',
        boxShadow: '0 1px 3px rgba(0,0,0,0.25)',
        transition: 'left .15s',
      }} />
    </button>
  );
}

function SettingsActionButton({ theme, children, onClick, isDark, destructive }) {
  const [hover, setHover] = React.useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        appearance: 'none',
        border: destructive
          ? `1.5px solid ${hover ? '#ef4444' : 'rgba(239,68,68,0.35)'}`
          : `1.5px solid ${isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)'}`,
        borderRadius: theme.aesthetic === 'brutalist' ? 0 : 8,
        background: destructive
          ? (hover ? 'rgba(239,68,68,0.12)' : 'transparent')
          : (hover ? (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)') : 'transparent'),
        color: destructive ? '#ef4444' : theme.panelText,
        fontFamily: theme.blockFontFamily,
        fontSize: 12,
        fontWeight: 500,
        padding: '9px 14px',
        cursor: 'default',
        textAlign: 'left',
        transition: 'background .12s, border-color .12s',
      }}
    >
      {children}
    </button>
  );
}

// ── Scene ────────────────────────────────────────────────────────────────────

function Scene() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const theme = { ...AESTHETIC_THEMES[t.aesthetic], aesthetic: t.aesthetic };

  const [tags, setTags] = React.useState(DEFAULT_TAGS);
  const tagsById = React.useMemo(() => {
    const m = {};
    for (const tg of tags) m[tg.id] = tg;
    return m;
  }, [tags]);

  const [customSwatches, setCustomSwatches] = React.useState({});
  const [importError, setImportError] = React.useState('');
  const palette = React.useMemo(() => {
    const base = PALETTES.find((p) => p.id === t.paletteId) || PALETTES[0];
    const overrides = customSwatches[base.id];
    return overrides ? { ...base, swatches: overrides } : base;
  }, [t.paletteId, customSwatches]);

  const sceneRef = React.useRef(null);
  const worldRef = React.useRef(null);
  const tasksRef = React.useRef(new Map());
  const [, forceRender] = React.useReducer((x) => x + 1, 0);
  const tick = forceRender;

  const [selectedIds, setSelectedIds] = React.useState(new Set());
  const [editingId, setEditingId] = React.useState(null);
  const [completing, setCompleting] = React.useState(new Set());
  const [deleting, setDeleting] = React.useState(new Set());
  const reducedMotion = window.usePrefersReducedMotion();
  const [lasso, setLasso] = React.useState(null);
  const [groups, setGroups] = React.useState([]);
  const [contextMenu, setContextMenu] = React.useState(null);
  const [bounds, setBounds] = React.useState({ w: 1000, h: 700 });
  const [glowPulse, setGlowPulse] = React.useState(0);
  const [helpOpen, setHelpOpen] = React.useState(false);
  const [paletteOpen, setPaletteOpen] = React.useState(false);
  const [settingsOpen, setSettingsOpen] = React.useState(false);
  const [settingsMounted, setSettingsMounted] = React.useState(false);
  React.useEffect(() => {
    if (settingsOpen) {
      setSettingsMounted(true);
    } else if (settingsMounted) {
      const id = setTimeout(() => setSettingsMounted(false), 240);
      return () => clearTimeout(id);
    }
  }, [settingsOpen]);
  const [draggingAny, setDraggingAny] = React.useState(false);

  React.useEffect(() => {
    const el = sceneRef.current;
    const r = el.getBoundingClientRect();
    const W = r.width, H = r.height;
    setBounds({ w: W, h: H });
    const world = new PhysicsWorld(W, H);
    worldRef.current = world;

    // Board starts empty; user adds tasks via + Task, Cmd+N, or right-click.
  }, []);

  React.useEffect(() => {
    if (!sceneRef.current) return;
    const ro = new ResizeObserver((entries) => {
      const r = entries[0].contentRect;
      setBounds({ w: r.width, h: r.height });
      const world = worldRef.current;
      if (!world) return;
      world.setBounds(r.width, r.height);
      // Reclaim any block that's now outside the new bounds. Wake it so the
      // physics step settles it correctly into the smaller area.
      for (const b of world.bodies.values()) {
        const maxX = Math.max(0, r.width - b.w);
        const maxY = Math.max(0, r.height - b.h);
        if (b.x > maxX) { b.x = maxX; b.vx = 0; b._snapped = false; b.restFrames = 0; }
        if (b.y > maxY) { b.y = maxY; b.vy = 0; b._snapped = false; b.restFrames = 0; }
      }
    });
    ro.observe(sceneRef.current);
    return () => ro.disconnect();
  }, []);

  React.useEffect(() => {
    let raf;
    let last = performance.now();
    let active = true;
    const loop = (now) => {
      if (!active) return;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const world = worldRef.current;
      if (world) {
        world.gravityOn = t.gravityOn;
        world.snapEnabled = t.snapToGrid;
        world.gridSize = t.gridSize;
        if (window.__gravityScale !== t.gravityStrength / 100) {
          window.__gravityScale = t.gravityStrength / 100;
          window.PHYS.GRAVITY = 1800 * (t.gravityStrength / 100);
        }
        world.step(dt);
        setGlowPulse((p) => (p + dt) % (Math.PI * 4));
        forceRender();
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => { active = false; cancelAnimationFrame(raf); };
  }, [t.gravityOn, t.gravityStrength]);

  const getTask = (id) => tasksRef.current.get(id);
  const updateTask = (id, patch) => {
    const x = tasksRef.current.get(id);
    if (!x) return;
    tasksRef.current.set(id, { ...x, ...patch });
  };

  const onBlockPointerDown = (e, taskId) => {
    if (e.button === 2) return;
    e.stopPropagation();
    const world = worldRef.current;
    const body = world.get(taskId);
    if (!body) return;

    let nextSel;
    if (e.shiftKey) {
      nextSel = new Set(selectedIds);
      if (nextSel.has(taskId)) nextSel.delete(taskId); else nextSel.add(taskId);
    } else if (selectedIds.has(taskId) && selectedIds.size > 1) {
      nextSel = new Set(selectedIds);
    } else {
      nextSel = new Set([taskId]);
    }
    setSelectedIds(nextSel);

    const sceneRect = sceneRef.current.getBoundingClientRect();
    const startMx = e.clientX - sceneRect.left;
    const startMy = e.clientY - sceneRect.top;
    const dragging = [...nextSel].map((id) => {
      const b = world.get(id);
      return b ? { id, ox: b.x - startMx, oy: b.y - startMy, body: b } : null;
    }).filter(Boolean);

    dragging.forEach((d) => { d.body.dragging = true; d.body.vx = 0; d.body.vy = 0; });
    setDraggingAny(true);

    let moved = false;
    let lastMx = startMx, lastMy = startMy;
    let lastT = performance.now();

    const move = (ev) => {
      const mx = ev.clientX - sceneRect.left;
      const my = ev.clientY - sceneRect.top;
      if (Math.abs(mx - startMx) + Math.abs(my - startMy) > 3) moved = true;
      dragging.forEach((d) => {
        let nx = mx + d.ox;
        let ny = my + d.oy;
        if (t.snapToGrid) { nx = snapTo(nx, t.gridSize); ny = snapTo(ny, t.gridSize); }
        d.body.x = nx; d.body.y = ny;
      });
      const now = performance.now();
      const dt = Math.max(0.001, (now - lastT) / 1000);
      const vx = (mx - lastMx) / dt;
      const vy = (my - lastMy) / dt;
      dragging.forEach((d) => { d.body._lastVx = vx; d.body._lastVy = vy; });
      lastMx = mx; lastMy = my; lastT = now;
    };
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      dragging.forEach((d) => {
        d.body.dragging = false;
        if (t.snapToGrid) {
          d.body.x = snapTo(d.body.x, t.gridSize);
          d.body.y = snapTo(d.body.y, t.gridSize);
          d.body.vx = 0; d.body.vy = 0;
        } else {
          d.body.vx = Math.max(-1500, Math.min(1500, (d.body._lastVx || 0) * 0.6));
          d.body.vy = Math.max(-1500, Math.min(1500, (d.body._lastVy || 0) * 0.6));
        }
      });
      setDraggingAny(false);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  const onBlockResizeStart = (e, taskId, dir) => {
    e.stopPropagation(); e.preventDefault();
    const world = worldRef.current;
    const body = world.get(taskId);
    if (!body) return;
    const sx = e.clientX, sy = e.clientY;
    const sw = body.w, sh = body.h;
    const startX = body.x, startY = body.y;
    body.dragging = true; body.vx = 0; body.vy = 0; body.snapAnim = false;
    setDraggingAny(true);

    const minW = t.gridSize * 2, minH = t.gridSize, maxW = 600, maxH = 400;
    const hasN = dir.includes('n'), hasS = dir.includes('s');
    const hasW = dir.includes('w'), hasE = dir.includes('e');

    const move = (ev) => {
      const dx = ev.clientX - sx, dy = ev.clientY - sy;
      let nx = startX, ny = startY, nw = sw, nh = sh;
      if (hasE) nw = sw + dx;
      if (hasW) { nw = sw - dx; nx = startX + dx; }
      if (hasS) nh = sh + dy;
      if (hasN) { nh = sh - dy; ny = startY + dy; }
      const clampedW = Math.max(minW, Math.min(maxW, nw));
      const clampedH = Math.max(minH, Math.min(maxH, nh));
      if (hasW) nx = startX + (sw - clampedW);
      if (hasN) ny = startY + (sh - clampedH);
      nw = clampedW; nh = clampedH;
      if (t.snapToGrid) {
        const g = t.gridSize;
        if (hasE) { const right = nx + nw; nw = Math.max(minW, snapTo(right, g) - nx); }
        if (hasW) { const right = startX + sw; nx = snapTo(nx, g); nw = Math.max(minW, right - nx); }
        if (hasS) { const bottom = ny + nh; nh = Math.max(minH, snapTo(bottom, g) - ny); }
        if (hasN) { const bottom = startY + sh; ny = snapTo(ny, g); nh = Math.max(minH, bottom - ny); }
      }
      body.x = nx; body.y = ny; body.w = nw; body.h = nh;
    };
    const up = () => {
      body.dragging = false;
      if (t.snapToGrid) {
        body.x = snapTo(body.x, t.gridSize); body.y = snapTo(body.y, t.gridSize);
        body.w = snapMinTo(body.w, t.gridSize); body.h = snapMinTo(body.h, t.gridSize);
        body.snapAnim = true;
        setTimeout(() => { body.snapAnim = false; forceRender(); }, 220);
      }
      body.vx = 0; body.vy = 0;
      setDraggingAny(false);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  const onScenePointerDown = (e) => {
    if (e.target !== sceneRef.current && !e.target.dataset.sceneLayer) return;
    if (e.button !== 0) return;
    setSelectedIds(new Set()); setEditingId(null);
    const sceneRect = sceneRef.current.getBoundingClientRect();
    const sx = e.clientX - sceneRect.left, sy = e.clientY - sceneRect.top;
    setLasso({ x1: sx, y1: sy, x2: sx, y2: sy });
    const move = (ev) => {
      const mx = ev.clientX - sceneRect.left, my = ev.clientY - sceneRect.top;
      setLasso({ x1: sx, y1: sy, x2: mx, y2: my });
    };
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      setLasso((curr) => {
        if (!curr) return null;
        const x1 = Math.min(curr.x1, curr.x2), y1 = Math.min(curr.y1, curr.y2);
        const x2 = Math.max(curr.x1, curr.x2), y2 = Math.max(curr.y1, curr.y2);
        const w = worldRef.current;
        if (w) {
          const inLasso = new Set();
          for (const b of w.bodies.values()) {
            if (b.x + b.w > x1 && b.x < x2 && b.y + b.h > y1 && b.y < y2) inLasso.add(b.id);
          }
          if (inLasso.size > 0) setSelectedIds(inLasso);
        }
        return null;
      });
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  const completeTask = (id) => {
    setCompleting((c) => new Set(c).add(id));
    setTimeout(() => {
      const world = worldRef.current;
      if (world) world.remove(id);
      tasksRef.current.delete(id);
      setCompleting((c) => { const n = new Set(c); n.delete(id); return n; });
      setSelectedIds((c) => { const n = new Set(c); n.delete(id); return n; });
      setGroups((gs) => gs.map((g) => ({ ...g, taskIds: g.taskIds.filter((tid) => tid !== id) })).filter((g) => g.taskIds.length >= 2));
    }, 350);
  };

  const deleteTask = (id) => {
    if (reducedMotion) {
      const world = worldRef.current;
      if (world) world.remove(id);
      tasksRef.current.delete(id);
      setSelectedIds((c) => { const n = new Set(c); n.delete(id); return n; });
      setGroups((gs) => gs.map((g) => ({ ...g, taskIds: g.taskIds.filter((tid) => tid !== id) })).filter((g) => g.taskIds.length >= 2));
      forceRender();
      return;
    }
    setDeleting((c) => new Set(c).add(id));
    setTimeout(() => {
      const world = worldRef.current;
      if (world) world.remove(id);
      tasksRef.current.delete(id);
      setDeleting((c) => { const n = new Set(c); n.delete(id); return n; });
      setSelectedIds((c) => { const n = new Set(c); n.delete(id); return n; });
      setGroups((gs) => gs.map((g) => ({ ...g, taskIds: g.taskIds.filter((tid) => tid !== id) })).filter((g) => g.taskIds.length >= 2));
    }, 180);
  };

  const toggleWaiting = (id) => {
    const tk = getTask(id);
    if (!tk) return;
    updateTask(id, { waiting: !tk.waiting });
    forceRender();
  };

  const addTask = (overrides = {}) => {
    const id = nextId();
    const tag0 = tags[0]?.id || 'eng';
    const task = { id, title: overrides.title || 'New task', tag: overrides.tag || tag0, size: overrides.size || 'M', waiting: false, done: false, ...overrides };
    tasksRef.current.set(id, task);
    const sz = SIZE_PRESETS[task.size];
    const w = worldRef.current;
    if (!w) return;
    const g = t.gridSize;
    const cols = Math.max(1, Math.floor((bounds.w - sz.w - g * 2) / g));
    const col = Math.floor(Math.random() * cols);
    const x = g + col * g;
    const y = -sz.h - g;
    w.add({ id, x, y, w: sz.w, h: sz.h, vx: 0, vy: 0 });
    setEditingId(id);
    setSelectedIds(new Set([id]));
  };

  const groupSelected = (label) => {
    const ids = [...selectedIds];
    if (ids.length < 2) return;
    setGroups((gs) => [...gs, { id: 'g' + Date.now(), label: label || 'group', taskIds: ids, justCreated: !label }]);
  };

  const handleUpdateTags = (newTags) => {
    if (newTags.length === 0) return;
    const validIds = new Set(newTags.map((tg) => tg.id));
    const fallback = newTags[0].id;
    for (const [id, tk] of tasksRef.current.entries()) {
      if (!validIds.has(tk.tag)) tasksRef.current.set(id, { ...tk, tag: fallback });
    }
    setTags(newTags);
  };

  const clearBoard = () => {
    const w = worldRef.current;
    if (!w) return;
    for (const id of [...w.bodies.keys()]) w.remove(id);
    tasksRef.current.clear();
    setGroups([]); setSelectedIds(new Set());
  };

  const handleExport = () => {
    const world = worldRef.current;
    const tasks = [];
    for (const [id, task] of tasksRef.current.entries()) {
      const body = world && world.get(id);
      tasks.push({
        ...task,
        x: body ? body.x : 0,
        y: body ? body.y : 0,
        w: body ? body.w : 250,
        h: body ? body.h : 100,
      });
    }
    const payload = {
      version: 1,
      exportedAt: new Date().toISOString(),
      tasks,
      tags,
      groups,
      customSwatches,
      tweaks: { ...t },
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const stamp = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `task-tetris-${stamp}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = async (file) => {
    setImportError('');
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      if (data.version !== 1) throw new Error(`Unsupported version: ${data.version}`);
      if (!Array.isArray(data.tasks)) throw new Error('Missing tasks array');
      if (!Array.isArray(data.tags)) throw new Error('Missing tags array');

      const w = worldRef.current;
      if (w) for (const id of [...w.bodies.keys()]) w.remove(id);
      tasksRef.current.clear();

      for (const task of data.tasks) {
        const { x = 0, y = 0, w: bw = 250, h: bh = 100, ...rest } = task;
        tasksRef.current.set(task.id, rest);
        if (w) w.add({ id: task.id, x, y, w: bw, h: bh });
      }
      setTags(data.tags);
      setGroups(Array.isArray(data.groups) ? data.groups : []);
      setCustomSwatches(data.customSwatches && typeof data.customSwatches === 'object' ? data.customSwatches : {});
      if (data.tweaks && typeof data.tweaks === 'object') setTweak(data.tweaks);
      setSelectedIds(new Set());
      forceRender();
    } catch (err) {
      setImportError('Import failed: ' + (err.message || 'invalid file'));
    }
  };

  const openBlockContext = (e, taskId) => {
    e.preventDefault(); e.stopPropagation();
    if (!selectedIds.has(taskId)) setSelectedIds(new Set([taskId]));
    const task = getTask(taskId);
    if (!task) return;
    const ids = selectedIds.has(taskId) && selectedIds.size > 1 ? [...selectedIds] : [taskId];
    setContextMenu({
      x: e.clientX, y: e.clientY,
      items: [
        { label: ids.length > 1 ? `Complete ${ids.length} tasks` : 'Complete', shortcut: '⏎', onClick: () => ids.forEach(completeTask) },
        { label: 'Edit title', onClick: () => setEditingId(taskId), disabled: ids.length > 1 },
        { label: task.waiting ? 'Unmark as waiting' : 'Mark as waiting', onClick: () => ids.forEach(toggleWaiting) },
        { divider: true },
        { label: 'Cycle tag', onClick: () => {
          const keys = tags.map((tg) => tg.id);
          ids.forEach((id) => {
            const tk = getTask(id);
            if (tk) { const i = keys.indexOf(tk.tag); updateTask(id, { tag: keys[(i + 1) % keys.length] }); }
          });
          forceRender();
        }},
        { label: 'Cycle size', onClick: () => {
          const keys = Object.keys(SIZE_PRESETS);
          ids.forEach((id) => {
            const tk = getTask(id);
            const body = worldRef.current.get(id);
            if (tk && body) {
              const i = keys.indexOf(tk.size);
              const next = keys[(i + 1) % keys.length];
              const sz = SIZE_PRESETS[next];
              updateTask(id, { size: next });
              body.w = sz.w; body.h = sz.h;
            }
          });
          forceRender();
        }},
        { divider: true },
        ids.length >= 2 ? { label: 'Group selected', onClick: () => groupSelected() } : null,
        { label: ids.length > 1 ? `Delete ${ids.length} tasks` : 'Delete', shortcut: '⌫', onClick: () => ids.forEach(deleteTask) },
      ].filter(Boolean),
    });
  };

  const openSceneContext = (e) => {
    if (e.target !== sceneRef.current && !e.target.dataset.sceneLayer) return;
    e.preventDefault();
    setContextMenu({
      x: e.clientX, y: e.clientY,
      items: [
        { label: 'Add task here', onClick: () => addTask() },
        { label: t.gravityOn ? 'Pause gravity' : 'Resume gravity', shortcut: 'space', onClick: () => setTweak('gravityOn', !t.gravityOn) },
        { divider: true },
        { label: 'Settings…', onClick: () => setSettingsOpen(true) },
        { label: 'Manage palettes & tags…', onClick: () => setPaletteOpen(true) },
        { divider: true },
        { label: 'Drop a wave (+5 random)', onClick: () => {
          const tagIds = tags.map((tg) => tg.id);
          const sizes = ['XS','S','M','L'];
          for (let i = 0; i < 5; i++) {
            setTimeout(() => addTask({
              title: ['Triage bug', 'Quick review', 'Sync notes', 'Doc update', 'Spike'][i],
              tag: tagIds[Math.floor(Math.random() * tagIds.length)],
              size: sizes[Math.floor(Math.random() * sizes.length)],
            }), i * 80);
          }
        }},
      ],
    });
  };

  React.useEffect(() => {
    const onKey = (e) => {
      if (editingId) return;
      if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
      if (paletteOpen || settingsOpen) return;
      if (e.key === ' ') { e.preventDefault(); setTweak('gravityOn', !t.gravityOn); }
      if (e.key === 'Enter' && selectedIds.size > 0) { e.preventDefault(); [...selectedIds].forEach(completeTask); }
      if ((e.key === 'Backspace' || e.key === 'Delete') && selectedIds.size > 0) { e.preventDefault(); [...selectedIds].forEach(deleteTask); }
      if (e.key === 'g' && selectedIds.size >= 2) { e.preventDefault(); groupSelected(); }
      if (e.key === 'n' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); addTask(); }
      if (e.key === 'Escape') { setSelectedIds(new Set()); setContextMenu(null); setSettingsOpen(false); }
      if (e.key === '?') setHelpOpen((v) => !v);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [t.gravityOn, selectedIds, editingId, paletteOpen, settingsOpen, tags]);

  const groupsWithBbox = React.useMemo(() => {
    const w = worldRef.current;
    if (!w) return [];
    return groups.map((g) => {
      const bodies = g.taskIds.map((id) => w.get(id)).filter(Boolean);
      if (bodies.length < 2) return null;
      const x1 = Math.min(...bodies.map((b) => b.x));
      const y1 = Math.min(...bodies.map((b) => b.y));
      const x2 = Math.max(...bodies.map((b) => b.x + b.w));
      const y2 = Math.max(...bodies.map((b) => b.y + b.h));
      return { ...g, bbox: { x1, y1, x2, y2 } };
    }).filter(Boolean);
  }, [groups, glowPulse]);

  const world = worldRef.current;
  const bodies = world ? [...world.bodies.values()] : [];
  const pulse = 0.7 + 0.3 * Math.sin(glowPulse * 1.5);
  const showGridStrong = t.snapToGrid && t.showGridDuringDrag && draggingAny;
  const isDark = theme.aesthetic === 'playful' || theme.aesthetic === 'neon' || theme.aesthetic === 'terminal';
  const compact = bounds.w < 900;
  const tight = bounds.w < 600;
  const actionableCount = bodies.filter((b) => world && world.isActionable(b.id)).length;
  const newTaskShortcut = formatShortcut('mod+n');

  return (
    <div
      ref={sceneRef}
      onPointerDown={onScenePointerDown}
      onContextMenu={openSceneContext}
      style={{
        position: 'fixed', inset: 0, overflow: 'hidden',
        background: theme.bg,
        cursor: lasso ? 'crosshair' : 'default',
        filter: t.gravityOn ? 'none' : 'saturate(0.85)',
        transition: reducedMotion ? 'none' : 'filter .25s ease',
      }}
    >
      {/* Background grid */}
      {t.showGrid && (
        <div data-scene-layer="1" style={{
          position: 'absolute', inset: 0,
          backgroundImage: `linear-gradient(${theme.bgGrid} 1px, transparent 1px), linear-gradient(90deg, ${theme.bgGrid} 1px, transparent 1px)`,
          backgroundSize: `${t.gridSize}px ${t.gridSize}px`,
          pointerEvents: 'none',
          maskImage: 'radial-gradient(ellipse at center, black 40%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, black 40%, transparent 100%)',
        }} />
      )}

      {showGridStrong && (
        <div data-scene-layer="1" style={{
          position: 'absolute', inset: 0,
          backgroundImage: `linear-gradient(${theme.bgGridStrong} 1px, transparent 1px), linear-gradient(90deg, ${theme.bgGridStrong} 1px, transparent 1px)`,
          backgroundSize: `${t.gridSize}px ${t.gridSize}px`,
          pointerEvents: 'none',
          transition: 'opacity .15s',
        }} />
      )}

      {/* Floor */}
      <div data-scene-layer="1" style={{
        position: 'absolute', left: 0, right: 0, bottom: 0, height: 4,
        background: theme.floor,
        borderTop: theme.aesthetic === 'brutalist' ? '4px solid #000' : 'none',
        pointerEvents: 'none',
      }} />
      {t.showActionableGlow && (
        <div data-scene-layer="1" style={{
          position: 'absolute', left: 0, right: 0, bottom: 0, height: 80,
          background: `linear-gradient(to top, ${theme.floorGlow} 0%, transparent 100%)`,
          opacity: (0.18 + 0.07 * pulse) * (t.gravityOn ? 1 : 0.35),
          pointerEvents: 'none',
          mixBlendMode: theme.aesthetic === 'modern' || theme.aesthetic === 'soft' ? 'multiply' : 'screen',
          transition: reducedMotion ? 'none' : 'opacity .25s ease',
        }} />
      )}
      {t.showActionableGlow && (
        <div data-scene-layer="1" style={{
          position: 'absolute', left: 0, right: 0, bottom: 4, height: 1,
          background: theme.floorGlow,
          boxShadow: `0 0 ${12 + 8 * pulse}px ${theme.floorGlow}, 0 0 ${4 + 2 * pulse}px ${theme.floorGlow}`,
          opacity: (0.6 + 0.3 * pulse) * (t.gravityOn ? 1 : 0.35),
          pointerEvents: 'none',
          transition: reducedMotion ? 'none' : 'opacity .25s ease',
        }} />
      )}

      {/* Empty-board floor rule — strengthens the "do-now zone" metaphor before any block has landed */}
      {bodies.length === 0 && (
        <div data-scene-layer="1" style={{
          position: 'absolute', left: 0, right: 0, bottom: 24, height: 1,
          borderTop: `1px dashed ${theme.floorGlow}`,
          opacity: 0.4,
          pointerEvents: 'none',
          transition: reducedMotion ? 'none' : 'opacity .25s ease',
        }} />
      )}
      <div data-scene-layer="1" style={{
        position: 'absolute', left: 16, bottom: 12,
        fontSize: 10, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase',
        color: isDark
          ? `rgba(255,255,255,${bodies.length === 0 ? 0.7 : 0.45})`
          : `rgba(20,18,12,${bodies.length === 0 ? 0.7 : 0.45})`,
        fontFamily: theme.blockFontFamily,
        pointerEvents: 'none',
        transition: reducedMotion ? 'none' : 'color .25s ease',
      }}>
        ↓ Actionable now
      </div>

      {/* Group labels */}
      {t.labelGroups && groupsWithBbox.map((g) => (
        <GroupLabel key={g.id} group={g} theme={theme}
          onRename={(label) => setGroups((gs) => gs.map((x) => x.id === g.id ? { ...x, label, justCreated: false } : x))}
          onDelete={() => setGroups((gs) => gs.filter((x) => x.id !== g.id))}
        />
      ))}

      {/* Empty state card */}
      {bodies.length === 0 && (
        <div data-scene-layer="1" style={{
          position: 'absolute', left: '50%', top: '50%',
          transform: 'translate(-50%, -50%)',
          padding: '22px 28px',
          background: theme.panelBg,
          border: `0.5px solid ${theme.panelBorder}`,
          borderRadius: theme.aesthetic === 'brutalist' ? 0 : 12,
          color: theme.panelText,
          fontFamily: theme.blockFontFamily,
          maxWidth: 340,
          textAlign: 'center',
          pointerEvents: 'none',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          boxShadow: isDark ? '0 18px 60px rgba(0,0,0,0.4)' : '0 18px 60px rgba(0,0,0,0.10)',
          opacity: 0.95,
        }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>
            Nothing on deck
          </div>
          <div style={{ fontSize: 12, opacity: 0.65, lineHeight: 1.5 }}>
            Press{' '}
            <span style={{
              padding: '1px 6px',
              background: theme.chipBg,
              borderRadius: 4,
              fontFamily: '"JetBrains Mono", ui-monospace, monospace',
              fontSize: 10,
            }}>+ Task</span>
            {' '}or{' '}
            <span style={{
              padding: '1px 6px',
              background: theme.chipBg,
              borderRadius: 4,
              fontFamily: '"JetBrains Mono", ui-monospace, monospace',
              fontSize: 10,
            }}>{newTaskShortcut}</span>
            {' '}to add one. Right-click anywhere for more.
          </div>
        </div>
      )}

      {/* Blocks */}
      {bodies.map((body) => {
        const task = tasksRef.current.get(body.id);
        if (!task) return null;
        const isActionable = world ? world.isActionable(body.id) : false;
        return (
          <Block
            key={body.id}
            task={task} body={body} theme={theme}
            palette={palette} tagsById={tagsById}
            selected={selectedIds.has(body.id)}
            completing={completing.has(body.id)}
            deleting={deleting.has(body.id)}
            editing={editingId === body.id}
            isActionable={isActionable}
            flatBlocks={t.flatBlocks}
            glowPulse={glowPulse}
            showActionableGlow={t.showActionableGlow}
            reducedMotion={reducedMotion}
            onPointerDown={(e) => onBlockPointerDown(e, body.id)}
            onResizeStart={(e, dir) => onBlockResizeStart(e, body.id, dir)}
            onContextMenu={(e) => openBlockContext(e, body.id)}
            onDoubleClick={() => setEditingId(body.id)}
            onComplete={() => completeTask(body.id)}
            onCommitEdit={(v) => { updateTask(body.id, { title: v || 'Untitled' }); setEditingId(null); forceRender(); }}
            onCancelEdit={() => setEditingId(null)}
          />
        );
      })}

      {/* Lasso */}
      {lasso && (
        <div style={{
          position: 'absolute',
          left: Math.min(lasso.x1, lasso.x2), top: Math.min(lasso.y1, lasso.y2),
          width: Math.abs(lasso.x2 - lasso.x1), height: Math.abs(lasso.y2 - lasso.y1),
          background: `${theme.accentColor}15`,
          border: `1px dashed ${theme.accentColor}`,
          pointerEvents: 'none',
        }} />
      )}

      {/* Header bar */}
      <div data-scene-layer="1" style={{
        position: 'absolute', left: 0, right: 0, top: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        pointerEvents: 'none', fontFamily: theme.blockFontFamily,
        background: theme.topBarBg,
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: `0.5px solid ${theme.topBarBorder}`,
        padding: '0 16px',
        height: 48,
        zIndex: 200,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, pointerEvents: 'auto', minWidth: 0 }}>
          {!compact && (
            <div style={{
              fontSize: 13, fontWeight: 700, letterSpacing: '0.04em',
              color: isDark ? 'rgba(255,255,255,0.85)' : 'rgba(20,18,12,0.85)',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }} title="Ship the new pricing page">
              <span style={{ opacity: 0.45 }}>Project ·</span> Ship the new pricing page
            </div>
          )}
          <div style={{
            fontSize: 10.5, padding: '3px 8px',
            background: theme.chipBg, color: theme.chipFg,
            borderRadius: theme.aesthetic === 'brutalist' ? 0 : 999,
            fontWeight: 600, letterSpacing: '0.05em',
            whiteSpace: 'nowrap',
          }}
          title={`${bodies.length} blocks · ${actionableCount} actionable`}
          >
            {compact
              ? `${bodies.length}/${actionableCount}`
              : `${bodies.length} blocks · ${actionableCount} actionable`}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, pointerEvents: 'auto' }}>
          <ToolbarButton theme={theme} isDark={isDark} onClick={() => addTask()} title={`New task (${newTaskShortcut})`} ariaLabel="New task" iconOnly={tight}>
            {tight ? '+' : '+ Task'}
          </ToolbarButton>
          {!tight && (
            <ToolbarButton theme={theme} isDark={isDark} onClick={() => setPaletteOpen(true)} title="Choose palette" ariaLabel="Choose palette">
              <PaletteSwatchPreview palette={palette} />
              {!compact && <span>{palette.name}</span>}
            </ToolbarButton>
          )}
          <ToolbarButton
            theme={theme}
            isDark={isDark}
            onClick={() => setTweak('gravityOn', !t.gravityOn)}
            active={!t.gravityOn}
            title={t.gravityOn ? 'Pause gravity (space)' : 'Resume gravity (space)'}
            ariaLabel={t.gravityOn ? 'Pause gravity' : 'Resume gravity'}
            iconOnly={tight}
          >
            {tight ? (t.gravityOn ? '⏸' : '▶') : (t.gravityOn ? 'Pause' : 'Resume')}
          </ToolbarButton>
          <ToolbarButton theme={theme} isDark={isDark} onClick={() => setHelpOpen((v) => !v)} title="Help (?)" ariaLabel="Help" iconOnly>?</ToolbarButton>
          {/* Gear / settings button */}
          <ToolbarButton theme={theme} isDark={isDark} onClick={() => setSettingsOpen((v) => !v)} active={settingsOpen} title="Settings" ariaLabel="Settings" iconOnly>
            <GearIcon size={14} color={
              settingsOpen
                ? (isDark ? '#0a0e18' : '#fff')
                : (isDark ? 'rgba(255,255,255,0.85)' : 'rgba(20,18,12,0.85)')
            } />
          </ToolbarButton>
        </div>
      </div>

      <div data-scene-layer="1" style={{
        position: 'absolute', right: 16, bottom: 12,
        fontSize: 10,
        color: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(20,18,12,0.4)',
        fontFamily: theme.blockFontFamily, pointerEvents: 'none',
        textAlign: 'right', lineHeight: 1.5,
      }}>
        right-click for menu · double-click to edit · drag corner to resize
      </div>

      {helpOpen && <HelpOverlay theme={theme} isDark={isDark} onClose={() => setHelpOpen(false)} gridSize={t.gridSize} />}

      {paletteOpen && (
        <PaletteManager
          theme={theme} palettes={PALETTES}
          currentPaletteId={t.paletteId} onPickPalette={(id) => setTweak('paletteId', id)}
          tags={tags} onUpdateTags={handleUpdateTags}
          customSwatches={customSwatches} onUpdateCustomSwatches={setCustomSwatches}
          onClose={() => setPaletteOpen(false)}
        />
      )}

      {settingsMounted && (
        <SettingsPage
          open={settingsOpen}
          reducedMotion={reducedMotion}
          t={t} setTweak={setTweak} theme={theme}
          tags={tags} onUpdateTags={handleUpdateTags}
          palettes={PALETTES} customSwatches={customSwatches} onUpdateCustomSwatches={setCustomSwatches}
          addTask={() => addTask({
            title: ['Reply to Slack', 'Doc cleanup', 'Weekly review', 'Hotfix'][Math.floor(Math.random() * 4)],
            tag: tags[Math.floor(Math.random() * tags.length)].id,
            size: ['XS','S','M','L'][Math.floor(Math.random() * 4)],
          })}
          clearBoard={clearBoard}
          onExport={handleExport}
          onImport={handleImport}
          importError={importError}
          onOpenPalette={() => { setPaletteOpen(true); }}
          onClose={() => { setSettingsOpen(false); setImportError(''); }}
        />
      )}

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x} y={contextMenu.y} items={contextMenu.items}
          theme={theme} onClose={() => setContextMenu(null)}
        />
      )}

      {/* TweaksPanel still wired up (toolbar toggle), but empty — settings live in the gear page */}
      <TweaksPanel title="Tweaks" />
    </div>
  );
}

// ── Toolbar button ───────────────────────────────────────────────────────────

function ToolbarButton({ theme, children, onClick, active, isDark, title, ariaLabel, iconOnly }) {
  const [hover, setHover] = React.useState(false);
  return (
    <button
      onClick={onClick}
      title={title}
      aria-label={ariaLabel || title}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        appearance: 'none',
        border: theme.aesthetic === 'brutalist' ? `2px solid ${theme.topBarBorder}` : `0.5px solid ${theme.topBarBorder}`,
        borderRadius: theme.aesthetic === 'brutalist' ? 0 : 7,
        background: active
          ? theme.accentColor
          : (hover ? (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.07)') : 'transparent'),
        color: active
          ? (isDark ? '#0a0e18' : '#fff')
          : (isDark ? 'rgba(255,255,255,0.85)' : 'rgba(20,18,12,0.85)'),
        font: 'inherit',
        fontSize: 11.5, fontWeight: 600, letterSpacing: '0.02em',
        padding: iconOnly ? '6px 8px' : '6px 12px',
        cursor: 'default',
        transition: 'background .12s, color .12s',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
      }}
    >
      {children}
    </button>
  );
}

function PaletteSwatchPreview({ palette }) {
  return (
    <span style={{ display: 'inline-flex', gap: 1, height: 12, borderRadius: 2, overflow: 'hidden' }}>
      {palette.swatches.map((c, i) => (
        <span key={i} style={{ width: 4, height: 12, background: c }} />
      ))}
    </span>
  );
}

function HelpOverlay({ theme, isDark, onClose, gridSize }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,.4)', zIndex: 999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backdropFilter: 'blur(4px)', fontFamily: theme.blockFontFamily,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: theme.panelBg,
          border: theme.aesthetic === 'brutalist' ? `2px solid ${theme.panelBorder}` : `0.5px solid ${theme.panelBorder}`,
          borderRadius: theme.aesthetic === 'brutalist' ? 0 : 14,
          boxShadow: theme.aesthetic === 'brutalist' ? '6px 6px 0 #000' : '0 24px 80px rgba(0,0,0,.3)',
          padding: 24, width: 460,
          color: theme.panelText,
        }}
      >
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, letterSpacing: '0.02em' }}>
          Task Tetris — how it works
        </div>
        <div style={{ fontSize: 12, lineHeight: 1.6, opacity: 0.85, marginBottom: 16 }}>
          Tasks fall and stack. Whatever <b>touches the floor</b> is what you can do right now —
          those blocks get a tick (✓) you can click to complete. Stuff above falls into place.
          Blocks snap to a {gridSize}px grid when you drag or resize.
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '6px 14px', fontSize: 11.5 }}>
          {[
            ['drag', 'move (snaps to grid)'],
            ['drag corner', 'resize (snaps to grid)'],
            ['tick (✓)', 'complete (bottom-row only)'],
            ['double-click', 'edit title'],
            ['right-click', 'menu'],
            ['drag empty area', 'lasso select'],
            [formatShortcut('mod+n'), 'new task'],
            ['enter', 'complete selected'],
            ['delete / ⌫', 'delete selected'],
            ['g', 'group selected (2+)'],
            ['space', 'pause / resume gravity'],
            ['shift-click', 'add to selection'],
          ].map(([k, v]) => (
            <React.Fragment key={k}>
              <div style={{
                fontSize: 10, padding: '2px 6px',
                background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)',
                color: theme.panelText,
                borderRadius: theme.aesthetic === 'brutalist' ? 0 : 4,
                fontFamily: 'ui-monospace, monospace', whiteSpace: 'nowrap', alignSelf: 'start',
              }}>{k}</div>
              <div style={{ opacity: 0.75 }}>{v}</div>
            </React.Fragment>
          ))}
        </div>
        <div style={{ marginTop: 16, fontSize: 11, opacity: 0.55 }}>Click anywhere to close.</div>
      </div>
    </div>
  );
}

window.Scene = Scene;
