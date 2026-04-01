import { useState, useCallback } from 'react';

export default function MapAnnotations({ annotations, onAdd, onRemove, onClear }) {
  const [inputText, setInputText] = useState('');
  const [adding, setAdding] = useState(false);

  const handleStartAdd = useCallback(() => {
    setAdding(true);
    setInputText('');
  }, []);

  const handleCancel = useCallback(() => {
    setAdding(false);
    setInputText('');
  }, []);

  const handleConfirmAdd = useCallback(() => {
    if (inputText.trim() && onAdd) {
      onAdd(inputText.trim());
    }
    setAdding(false);
    setInputText('');
  }, [inputText, onAdd]);

  return (
    <div className="map-annotations">
      <div className="annotations-header">
        <span className="annotations-label">Map Notes</span>
        {annotations.length > 0 && (
          <button className="annotations-clear" onClick={onClear}>Clear all</button>
        )}
      </div>

      {annotations.length > 0 && (
        <div className="annotations-list">
          {annotations.map((note, i) => (
            <div key={i} className="annotation-item">
              <span className="annotation-icon">&#x1F4CC;</span>
              <span className="annotation-text">{note.text}</span>
              <button
                className="annotation-delete"
                onClick={() => onRemove(i)}
                aria-label="Remove note"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {adding ? (
        <div className="annotation-input-row">
          <input
            type="text"
            className="annotation-input"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleConfirmAdd(); if (e.key === 'Escape') handleCancel(); }}
            placeholder="Add a note..."
            autoFocus
            maxLength={100}
          />
          <button className="annotation-save-btn" onClick={handleConfirmAdd}>Add</button>
          <button className="annotation-cancel-btn" onClick={handleCancel}>Cancel</button>
        </div>
      ) : (
        <button className="annotation-add-btn" onClick={handleStartAdd}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add note
        </button>
      )}
    </div>
  );
}
