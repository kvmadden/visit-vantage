const TIME_LABELS = {
  '1hr': '1 hour',
  '2hr': '2 hours',
  half: 'Half day',
  full: 'Full day',
};

export default function FocusBanner({ config, onEdit }) {
  if (!config) return null;

  const parts = [];
  if (config.timeAvailable) {
    parts.push(TIME_LABELS[config.timeAvailable] || config.timeAvailable);
  }
  if (config.focusDistrict) {
    parts.push('D' + config.focusDistrict);
  }

  const hasFocusNote = config.focusNote && config.focusNote.trim().length > 0;

  if (parts.length === 0 && !hasFocusNote) return null;

  return (
    <div className="focus-banner">
      <div className="focus-banner-row">
        {parts.length > 0 && (
          <div className="focus-banner-pills">
            {parts.map(function (p) {
              return (
                <span key={p} className="focus-banner-pill">{p}</span>
              );
            })}
          </div>
        )}
        {hasFocusNote && (
          <span className="focus-banner-note">{config.focusNote}</span>
        )}
        {onEdit && (
          <button className="focus-banner-edit" onClick={onEdit} aria-label="Edit session">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
