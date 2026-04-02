import { useState, useCallback, useRef, useEffect } from 'react';
import { APP_VERSION } from '../App';
import { SVG_GENERATORS } from './EasterEggs';
import {
  CATEGORY_COLORS,
  EASTER_EGG_SPECS,
  BEST_OF_BAY_SPECS,
  TOTAL_ICONS,
  BATCH_NAMES,
} from '../config/iconBatches';

const LS_STATUS_KEY = 'vv-icon-workshop-status';
const LS_FEEDBACK_KEY = 'vv-icon-workshop-feedback';

function loadStatuses() {
  try { return JSON.parse(localStorage.getItem(LS_STATUS_KEY) || '{}'); }
  catch { return {}; }
}
function saveStatuses(s) { localStorage.setItem(LS_STATUS_KEY, JSON.stringify(s)); }

function loadFeedback() {
  try { return JSON.parse(localStorage.getItem(LS_FEEDBACK_KEY) || '{}'); }
  catch { return {}; }
}
function saveFeedback(f) { localStorage.setItem(LS_FEEDBACK_KEY, JSON.stringify(f)); }

const STATUS_CYCLE = ['draft', 'review', 'approved'];
const STATUS_BADGE = { draft: '\u2B1C', review: '\uD83D\uDFE1', approved: '\u2705' };
const STATUS_LABEL = { draft: 'Draft', review: 'Review', approved: 'Approved' };

export default function IconWorkshop({ onBack, theme }) {
  const [activeBatch, setActiveBatch] = useState(1);
  const [statuses, setStatuses] = useState(loadStatuses);
  const [feedback, setFeedback] = useState(loadFeedback);
  const [feedbackTarget, setFeedbackTarget] = useState(null);
  const [feedbackText, setFeedbackText] = useState('');
  const longPressTimer = useRef(null);
  const feedbackInputRef = useRef(null);

  useEffect(() => {
    if (feedbackTarget && feedbackInputRef.current) {
      feedbackInputRef.current.focus();
    }
  }, [feedbackTarget]);

  const getStatus = useCallback((key) => statuses[key] || 'draft', [statuses]);

  const cycleStatus = useCallback((key) => {
    setStatuses((prev) => {
      const current = prev[key] || 'draft';
      const idx = STATUS_CYCLE.indexOf(current);
      const next = STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length];
      const updated = { ...prev, [key]: next };
      saveStatuses(updated);
      return updated;
    });
  }, []);

  const handleLongPressStart = useCallback((key) => {
    longPressTimer.current = setTimeout(() => {
      setFeedbackTarget(key);
      setFeedbackText(feedback[key] || '');
    }, 500);
  }, [feedback]);

  const handleLongPressEnd = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  const handleFeedbackSave = useCallback(() => {
    if (!feedbackTarget) return;
    setFeedback((prev) => {
      const updated = { ...prev };
      if (feedbackText.trim()) {
        updated[feedbackTarget] = feedbackText.trim();
      } else {
        delete updated[feedbackTarget];
      }
      saveFeedback(updated);
      return updated;
    });
    setFeedbackTarget(null);
    setFeedbackText('');
  }, [feedbackTarget, feedbackText]);

  // Count approved icons
  const approvedCount = Object.values(statuses).filter((s) => s === 'approved').length;

  // Get icons for current batch
  const batchIcons = activeBatch <= 10
    ? EASTER_EGG_SPECS.filter((s) => s.batch === activeBatch)
    : BEST_OF_BAY_SPECS;

  const isDark = theme === 'dark';

  return (
    <div style={styles.container(isDark)}>
      {/* Top bar */}
      <div style={styles.topBar(isDark)}>
        <button onClick={onBack} style={styles.backBtn(isDark)}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M10 2L4 8l6 6" />
          </svg>
          Back
        </button>
        <h1 style={styles.title}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6, verticalAlign: -3 }}>
            <path d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" />
          </svg>
          Icon Workshop <span style={{ fontSize: 12, fontWeight: 400, opacity: 0.5, marginLeft: 6 }}>{APP_VERSION}</span>
        </h1>
        <div style={styles.spacer} />
      </div>

      {/* Progress bar */}
      <div style={styles.progressWrap(isDark)}>
        <div style={styles.progressTrack(isDark)}>
          <div style={styles.progressFill(approvedCount / TOTAL_ICONS)} />
        </div>
        <span style={styles.progressLabel(isDark)}>
          {approvedCount}/{TOTAL_ICONS} approved
        </span>
      </div>

      {/* Batch selector */}
      <div style={styles.batchSelector}>
        {Array.from({ length: 11 }, (_, i) => i + 1).map((b) => {
          const batchSpecs = b <= 10
            ? EASTER_EGG_SPECS.filter((s) => s.batch === b)
            : BEST_OF_BAY_SPECS;
          const batchApproved = batchSpecs.filter((s) => getStatus(s.svgKey) === 'approved').length;
          const batchTotal = batchSpecs.length;
          const allApproved = batchApproved === batchTotal;
          return (
            <button
              key={b}
              onClick={() => setActiveBatch(b)}
              style={styles.batchTab(b === activeBatch, isDark, allApproved)}
            >
              {b <= 10 ? b : 'Bay'}
              {allApproved && <span style={{ marginLeft: 2, fontSize: 10 }}>{'\u2705'}</span>}
            </button>
          );
        })}
      </div>

      {/* Batch title */}
      <div style={styles.batchTitle(isDark)}>
        {BATCH_NAMES[activeBatch]}
      </div>

      {/* Icon grid */}
      <div style={styles.gridScroll}>
        {activeBatch <= 10 ? (
          /* Easter Egg grid */
          batchIcons.map((spec, idx) => {
            const gen = SVG_GENERATORS[spec.svgKey];
            const hasGen = !!gen;
            const status = getStatus(spec.svgKey);
            const hasFeedback = !!feedback[spec.svgKey];
            const catColor = CATEGORY_COLORS[spec.category];
            const rowDark = idx % 2 === 1;
            const bgColor = rowDark
              ? (isDark ? '#1e1e24' : '#f0eeeb')
              : (isDark ? '#27272a' : '#ffffff');

            return (
              <div
                key={spec.svgKey}
                style={{ ...styles.eggRow, background: bgColor }}
                onPointerDown={() => handleLongPressStart(spec.svgKey)}
                onPointerUp={handleLongPressEnd}
                onPointerLeave={handleLongPressEnd}
              >
                {/* Status + info header */}
                <div style={styles.rowHeader}>
                  <button
                    onClick={(e) => { e.stopPropagation(); cycleStatus(spec.svgKey); }}
                    style={styles.statusBtn}
                    title={`Status: ${STATUS_LABEL[status]} — tap to cycle`}
                  >
                    {STATUS_BADGE[status]}
                  </button>
                  <code style={styles.svgKeyLabel(isDark)}>{spec.svgKey}</code>
                  <span style={{ ...styles.catDot, background: catColor }} title={spec.category} />
                  <span style={styles.catLabel(isDark)}>{spec.category}</span>
                  <span style={styles.sizeLabel(isDark)}>{spec.size[0]}x{spec.size[1]}</span>
                  {hasFeedback && (
                    <span
                      style={styles.feedbackBadge}
                      title={feedback[spec.svgKey]}
                      onClick={(e) => {
                        e.stopPropagation();
                        setFeedbackTarget(spec.svgKey);
                        setFeedbackText(feedback[spec.svgKey] || '');
                      }}
                    >
                      {'\uD83D\uDCAC'}
                    </span>
                  )}
                </div>

                {/* Description */}
                {spec.description && (
                  <div style={styles.descriptionText(isDark)}>{spec.description}</div>
                )}

                {/* Icon previews */}
                <div style={styles.previewRow}>
                  {/* Actual size */}
                  <div style={styles.previewGroup}>
                    <div style={styles.previewLabel(isDark)}>Actual size</div>
                    <div style={styles.previewPair}>
                      <div style={styles.previewCell(isDark)}>
                        <div style={styles.stateLabel(isDark)}>Inactive</div>
                        {hasGen ? (
                          <div
                            style={{ width: spec.size[0], height: spec.size[1] }}
                            dangerouslySetInnerHTML={{ __html: gen(theme, false) }}
                          />
                        ) : (
                          <div style={styles.placeholder(spec.size[0], spec.size[1], isDark)}>?</div>
                        )}
                      </div>
                      <div style={styles.previewCell(isDark)}>
                        <div style={styles.stateLabel(isDark)}>Active</div>
                        {hasGen ? (
                          <div
                            style={{ width: spec.size[0], height: spec.size[1] }}
                            dangerouslySetInnerHTML={{ __html: gen(theme, true) }}
                          />
                        ) : (
                          <div style={styles.placeholder(spec.size[0], spec.size[1], isDark)}>?</div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 2x zoom */}
                  <div style={styles.previewGroup}>
                    <div style={styles.previewLabel(isDark)}>2x zoom</div>
                    <div style={styles.previewPair}>
                      <div style={styles.previewCell(isDark)}>
                        <div style={styles.stateLabel(isDark)}>Inactive</div>
                        {hasGen ? (
                          <div
                            style={{ width: spec.size[0] * 2, height: spec.size[1] * 2, transform: 'scale(1)', transformOrigin: 'top left' }}
                            dangerouslySetInnerHTML={{
                              __html: gen(theme, false)
                                .replace(/width="[^"]*"/, `width="${spec.size[0] * 2}"`)
                                .replace(/height="[^"]*"/, `height="${spec.size[1] * 2}"`)
                            }}
                          />
                        ) : (
                          <div style={styles.placeholder(spec.size[0] * 2, spec.size[1] * 2, isDark)}>?</div>
                        )}
                      </div>
                      <div style={styles.previewCell(isDark)}>
                        <div style={styles.stateLabel(isDark)}>Active</div>
                        {hasGen ? (
                          <div
                            style={{ width: spec.size[0] * 2, height: spec.size[1] * 2 }}
                            dangerouslySetInnerHTML={{
                              __html: gen(theme, true)
                                .replace(/width="[^"]*"/, `width="${spec.size[0] * 2}"`)
                                .replace(/height="[^"]*"/, `height="${spec.size[1] * 2}"`)
                            }}
                          />
                        ) : (
                          <div style={styles.placeholder(spec.size[0] * 2, spec.size[1] * 2, isDark)}>?</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          /* Best of the Bay grid */
          <div style={styles.bayGrid}>
            {batchIcons.map((spec) => {
              const gen = SVG_GENERATORS[spec.svgKey];
              const hasGen = !!gen;
              const status = getStatus(spec.svgKey);
              const hasFeedback = !!feedback[spec.svgKey];

              return (
                <div
                  key={spec.svgKey}
                  style={styles.bayCard(isDark)}
                  onPointerDown={() => handleLongPressStart(spec.svgKey)}
                  onPointerUp={handleLongPressEnd}
                  onPointerLeave={handleLongPressEnd}
                >
                  <div style={styles.rowHeader}>
                    <button
                      onClick={(e) => { e.stopPropagation(); cycleStatus(spec.svgKey); }}
                      style={styles.statusBtn}
                      title={`Status: ${STATUS_LABEL[status]}`}
                    >
                      {STATUS_BADGE[status]}
                    </button>
                    <code style={styles.svgKeyLabel(isDark)}>{spec.svgKey}</code>
                    {hasFeedback && (
                      <span
                        style={styles.feedbackBadge}
                        title={feedback[spec.svgKey]}
                        onClick={(e) => {
                          e.stopPropagation();
                          setFeedbackTarget(spec.svgKey);
                          setFeedbackText(feedback[spec.svgKey] || '');
                        }}
                      >
                        {'\uD83D\uDCAC'}
                      </span>
                    )}
                  </div>
                  <div style={styles.bayDestination(isDark)}>{spec.destination}</div>
                  {spec.description && (
                    <div style={styles.descriptionText(isDark)}>{spec.description}</div>
                  )}
                  <div style={styles.bayPreviewRow}>
                    {/* 24x24 actual */}
                    <div style={styles.bayPreviewCell(isDark)}>
                      <div style={styles.stateLabel(isDark)}>24x24</div>
                      <div style={styles.bayMapBg}>
                        {hasGen ? (
                          <div
                            style={{ width: 24, height: 24 }}
                            dangerouslySetInnerHTML={{ __html: gen(theme) }}
                          />
                        ) : (
                          <div style={styles.placeholder(24, 24, isDark)}>?</div>
                        )}
                      </div>
                    </div>
                    {/* 3x zoom (72x72) */}
                    <div style={styles.bayPreviewCell(isDark)}>
                      <div style={styles.stateLabel(isDark)}>3x (72x72)</div>
                      <div style={{ ...styles.bayMapBg, width: 80, height: 80 }}>
                        {hasGen ? (
                          <div
                            style={{ width: 72, height: 72 }}
                            dangerouslySetInnerHTML={{
                              __html: gen(theme)
                                .replace(/width="[^"]*"/, 'width="72"')
                                .replace(/height="[^"]*"/, 'height="72"')
                            }}
                          />
                        ) : (
                          <div style={styles.placeholder(72, 72, isDark)}>?</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Feedback modal */}
      {feedbackTarget && (
        <div style={styles.modalOverlay} onClick={() => setFeedbackTarget(null)}>
          <div style={styles.modalCard(isDark)} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalTitle(isDark)}>
              Feedback for <code>{feedbackTarget}</code>
            </div>
            <textarea
              ref={feedbackInputRef}
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder='e.g. "tentacles too thin" or "make the sail bigger"'
              style={styles.modalTextarea(isDark)}
              rows={4}
            />
            <div style={styles.modalActions}>
              <button onClick={() => setFeedbackTarget(null)} style={styles.modalBtn(isDark, false)}>
                Cancel
              </button>
              <button onClick={handleFeedbackSave} style={styles.modalBtn(isDark, true)}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const styles = {
  container: (dark) => ({
    position: 'fixed',
    inset: 0,
    zIndex: 9999,
    background: dark ? '#18181b' : '#f5f3f0',
    color: dark ? '#fafafa' : '#1c1917',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: "'IBM Plex Sans', sans-serif",
    overflow: 'hidden',
  }),
  topBar: (dark) => ({
    display: 'flex',
    alignItems: 'center',
    padding: '10px 16px',
    borderBottom: `1px solid ${dark ? '#3f3f46' : '#d6d3d1'}`,
    background: dark ? '#27272a' : '#ffffff',
    gap: 12,
    flexShrink: 0,
  }),
  backBtn: (dark) => ({
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    background: 'none',
    border: 'none',
    color: dark ? '#D4A04A' : '#B8862E',
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: 600,
    fontFamily: "'IBM Plex Sans', sans-serif",
    padding: '4px 8px',
    borderRadius: 6,
  }),
  title: {
    fontSize: 16,
    fontWeight: 700,
    margin: 0,
    flex: 1,
    textAlign: 'center',
  },
  spacer: { width: 60 },

  // Progress
  progressWrap: (dark) => ({
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '8px 16px',
    background: dark ? '#1e1e24' : '#faf9f7',
    borderBottom: `1px solid ${dark ? '#3f3f46' : '#e7e5e4'}`,
    flexShrink: 0,
  }),
  progressTrack: (dark) => ({
    flex: 1,
    height: 8,
    borderRadius: 4,
    background: dark ? '#3f3f46' : '#d6d3d1',
    overflow: 'hidden',
  }),
  progressFill: (pct) => ({
    width: `${Math.round(pct * 100)}%`,
    height: '100%',
    borderRadius: 4,
    background: 'linear-gradient(90deg, #4ADE80, #22c55e)',
    transition: 'width 0.3s',
  }),
  progressLabel: (dark) => ({
    fontSize: 12,
    fontWeight: 600,
    color: dark ? '#a1a1aa' : '#78716c',
    whiteSpace: 'nowrap',
    fontFamily: "'IBM Plex Mono', monospace",
  }),

  // Batch selector
  batchSelector: {
    display: 'flex',
    gap: 4,
    padding: '8px 16px',
    overflowX: 'auto',
    flexShrink: 0,
  },
  batchTab: (active, dark, allDone) => ({
    padding: '5px 10px',
    borderRadius: 6,
    border: `1px solid ${active ? (dark ? '#D4A04A' : '#B8862E') : (dark ? '#3f3f46' : '#d6d3d1')}`,
    background: active ? (dark ? '#D4A04A22' : '#B8862E18') : 'transparent',
    color: active ? (dark ? '#D4A04A' : '#B8862E') : (dark ? '#a1a1aa' : '#78716c'),
    cursor: 'pointer',
    fontSize: 12,
    fontWeight: active ? 700 : 500,
    fontFamily: "'IBM Plex Mono', monospace",
    whiteSpace: 'nowrap',
    display: 'flex',
    alignItems: 'center',
    gap: 2,
    opacity: allDone && !active ? 0.6 : 1,
  }),

  batchTitle: (dark) => ({
    padding: '6px 16px 2px',
    fontSize: 13,
    fontWeight: 600,
    color: dark ? '#a1a1aa' : '#78716c',
    flexShrink: 0,
  }),

  // Grid
  gridScroll: {
    flex: 1,
    overflowY: 'auto',
    padding: '8px 0',
  },

  // Easter Egg row
  eggRow: {
    padding: '12px 16px',
    borderBottom: '1px solid rgba(128,128,128,0.15)',
  },
  rowHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  descriptionText: (dark) => ({
    fontSize: 12,
    color: dark ? '#a1a1aa' : '#78716c',
    marginBottom: 8,
    lineHeight: 1.4,
    fontStyle: 'italic',
    paddingLeft: 24,
  }),
  statusBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: 16,
    padding: 0,
    lineHeight: 1,
  },
  svgKeyLabel: (dark) => ({
    fontSize: 13,
    fontFamily: "'IBM Plex Mono', monospace",
    fontWeight: 600,
    color: dark ? '#e4e4e7' : '#292524',
  }),
  catDot: {
    width: 10,
    height: 10,
    borderRadius: '50%',
    display: 'inline-block',
    flexShrink: 0,
  },
  catLabel: (dark) => ({
    fontSize: 11,
    color: dark ? '#71717a' : '#a8a29e',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  }),
  sizeLabel: (dark) => ({
    fontSize: 11,
    fontFamily: "'IBM Plex Mono', monospace",
    color: dark ? '#71717a' : '#a8a29e',
    marginLeft: 'auto',
  }),
  feedbackBadge: {
    cursor: 'pointer',
    fontSize: 14,
  },

  // Preview area
  previewRow: {
    display: 'flex',
    gap: 20,
    flexWrap: 'wrap',
  },
  previewGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  previewLabel: (dark) => ({
    fontSize: 10,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: dark ? '#71717a' : '#a8a29e',
  }),
  previewPair: {
    display: 'flex',
    gap: 12,
    alignItems: 'flex-start',
  },
  previewCell: (dark) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
    padding: 8,
    borderRadius: 6,
    border: `1px solid ${dark ? '#3f3f4640' : '#d6d3d140'}`,
    minWidth: 50,
  }),
  stateLabel: (dark) => ({
    fontSize: 9,
    fontWeight: 500,
    color: dark ? '#52525b' : '#a8a29e',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  }),
  placeholder: (w, h, dark) => ({
    width: w,
    height: h,
    borderRadius: 4,
    border: `2px dashed ${dark ? '#3f3f46' : '#d6d3d1'}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: dark ? '#52525b' : '#a8a29e',
    fontSize: Math.max(12, Math.min(w, h) / 3),
    fontWeight: 700,
  }),

  // Best of Bay
  bayGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
    gap: 12,
    padding: '0 16px 16px',
  },
  bayCard: (dark) => ({
    padding: 12,
    borderRadius: 8,
    border: `1px solid ${dark ? '#3f3f46' : '#d6d3d1'}`,
    background: dark ? '#27272a' : '#ffffff',
  }),
  bayDestination: (dark) => ({
    fontSize: 12,
    color: dark ? '#a1a1aa' : '#78716c',
    marginBottom: 8,
  }),
  bayPreviewRow: {
    display: 'flex',
    gap: 16,
    alignItems: 'flex-start',
  },
  bayPreviewCell: (dark) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
  }),
  bayMapBg: {
    background: '#e8e4d8',
    borderRadius: 4,
    padding: 4,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 36,
    minHeight: 36,
  },

  // Feedback modal
  modalOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10000,
    padding: 16,
  },
  modalCard: (dark) => ({
    background: dark ? '#27272a' : '#ffffff',
    borderRadius: 12,
    padding: 20,
    maxWidth: 400,
    width: '100%',
    boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
  }),
  modalTitle: (dark) => ({
    fontSize: 14,
    fontWeight: 600,
    marginBottom: 12,
    color: dark ? '#fafafa' : '#1c1917',
  }),
  modalTextarea: (dark) => ({
    width: '100%',
    boxSizing: 'border-box',
    borderRadius: 6,
    border: `1px solid ${dark ? '#3f3f46' : '#d6d3d1'}`,
    background: dark ? '#18181b' : '#faf9f7',
    color: dark ? '#fafafa' : '#1c1917',
    padding: 10,
    fontSize: 13,
    fontFamily: "'IBM Plex Sans', sans-serif",
    resize: 'vertical',
  }),
  modalActions: {
    display: 'flex',
    gap: 8,
    justifyContent: 'flex-end',
    marginTop: 12,
  },
  modalBtn: (dark, primary) => ({
    padding: '6px 16px',
    borderRadius: 6,
    border: primary ? 'none' : `1px solid ${dark ? '#3f3f46' : '#d6d3d1'}`,
    background: primary ? (dark ? '#D4A04A' : '#B8862E') : 'transparent',
    color: primary ? '#fff' : (dark ? '#a1a1aa' : '#78716c'),
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 600,
    fontFamily: "'IBM Plex Sans', sans-serif",
  }),
};
