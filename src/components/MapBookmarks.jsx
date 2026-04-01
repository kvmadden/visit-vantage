import { useState, useCallback } from 'react';

const MAX_BOOKMARKS = 8;

export default function MapBookmarks({ mapRef, onRestore }) {
  const [bookmarks, setBookmarks] = useState([]);
  const [naming, setNaming] = useState(false);
  const [nameInput, setNameInput] = useState('');

  const handleSave = useCallback(() => {
    if (!mapRef) return;
    setNaming(true);
    setNameInput('');
  }, [mapRef]);

  const handleConfirmSave = useCallback(() => {
    if (!mapRef) return;
    const center = mapRef.getCenter();
    const zoom = mapRef.getZoom();
    const label = nameInput.trim() || ('View ' + (bookmarks.length + 1));
    setBookmarks((prev) => {
      const next = [...prev, { id: Date.now(), label, lat: center.lat, lng: center.lng, zoom }];
      return next.slice(-MAX_BOOKMARKS);
    });
    setNaming(false);
    setNameInput('');
  }, [mapRef, nameInput, bookmarks.length]);

  const handleRestore = useCallback((bm) => {
    if (onRestore) onRestore(bm);
  }, [onRestore]);

  const handleDelete = useCallback((id) => {
    setBookmarks((prev) => prev.filter((b) => b.id !== id));
  }, []);

  const handleClearAll = useCallback(() => {
    setBookmarks([]);
  }, []);

  return (
    <div className="map-bookmarks">
      <div className="bookmarks-header">
        <span className="bookmarks-label">Bookmarks</span>
        {bookmarks.length > 0 && (
          <button className="bookmarks-clear" onClick={handleClearAll}>Clear all</button>
        )}
      </div>

      <div className="bookmarks-row">
        {bookmarks.map((bm) => (
          <div key={bm.id} className="bookmark-pill" onClick={() => handleRestore(bm)}>
            <span className="bookmark-pill-icon">&#x1F4CD;</span>
            <span className="bookmark-pill-label">{bm.label}</span>
            <button
              className="bookmark-pill-delete"
              onClick={(e) => { e.stopPropagation(); handleDelete(bm.id); }}
              aria-label="Remove bookmark"
            >
              ✕
            </button>
          </div>
        ))}

        {naming ? (
          <div className="bookmark-name-input">
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleConfirmSave(); if (e.key === 'Escape') setNaming(false); }}
              placeholder="Name..."
              autoFocus
              maxLength={20}
            />
            <button className="bookmark-name-save" onClick={handleConfirmSave}>Save</button>
          </div>
        ) : (
          <button className="bookmark-add-btn" onClick={handleSave} disabled={!mapRef}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Bookmark view
          </button>
        )}
      </div>
    </div>
  );
}
