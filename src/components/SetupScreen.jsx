import { useState, useCallback } from 'react';
import Brand from './Brand';

const TIME_OPTIONS = [
  { label: '1 hour', value: '1hr' },
  { label: '2 hours', value: '2hr' },
  { label: 'Half day', value: 'half' },
  { label: 'Full day', value: 'full' },
];

const DISTRICTS = [
  { label: 'All districts', value: '' },
  { label: 'D20', value: '20' },
  { label: 'D21', value: '21' },
  { label: 'D22', value: '22' },
  { label: 'D23', value: '23' },
  { label: 'D24', value: '24' },
  { label: 'D25', value: '25' },
  { label: 'D26', value: '26' },
  { label: 'D27', value: '27' },
];

export default function SetupScreen({ onBack, onGo, theme, onThemeToggle }) {
  const [timeAvailable, setTimeAvailable] = useState('half');
  const [focusDistrict, setFocusDistrict] = useState('');
  const [focusNote, setFocusNote] = useState('');
  const [gpsStatus, setGpsStatus] = useState('idle'); // idle | requesting | got | error
  const [startLocation, setStartLocation] = useState(null);
  const [manualZip, setManualZip] = useState('');

  const handleGps = useCallback(function () {
    setGpsStatus('requesting');
    navigator.geolocation.getCurrentPosition(
      function (pos) {
        setStartLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGpsStatus('got');
      },
      function () {
        setGpsStatus('error');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  const handleGo = useCallback(function () {
    onGo({
      timeAvailable,
      focusDistrict: focusDistrict || null,
      focusNote: focusNote.trim() || null,
      startLocation,
      manualZip: manualZip.trim() || null,
    });
  }, [timeAvailable, focusDistrict, focusNote, startLocation, manualZip, onGo]);

  return (
    <div className="setup">
      <div className="setup-header">
        <button className="setup-back" onClick={onBack} aria-label="Back">&larr;</button>
        <Brand compact dim />
        <div style={{ marginLeft: 'auto' }}>
          <button
            className="theme-toggle"
            onClick={onThemeToggle}
            aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
          >
            {theme === 'light' ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="1" x2="12" y2="3"/>
                <line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/>
                <line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
            )}
          </button>
        </div>
      </div>

      <div className="setup-body">
        <div className="setup-section">
          <label className="setup-label">Starting location</label>
          <button className="setup-gps-btn" onClick={handleGps} disabled={gpsStatus === 'requesting'}>
            {gpsStatus === 'idle' && 'Use my location'}
            {gpsStatus === 'requesting' && 'Requesting location\u2026'}
            {gpsStatus === 'got' && 'Location acquired'}
            {gpsStatus === 'error' && 'Location unavailable \u2014 try again'}
          </button>
          <p className="setup-or">or</p>
          <input
            className="setup-input"
            type="text"
            placeholder="ZIP code or city name"
            value={manualZip}
            onChange={function (e) { setManualZip(e.target.value); }}
          />
        </div>

        <div className="setup-section">
          <label className="setup-label">Time available</label>
          <div className="setup-pills">
            {TIME_OPTIONS.map(function (opt) {
              return (
                <button
                  key={opt.value}
                  className={'setup-pill' + (timeAvailable === opt.value ? ' active' : '')}
                  onClick={function () { setTimeAvailable(opt.value); }}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="setup-section">
          <label className="setup-label">Focus area</label>
          <p className="setup-sublabel">Optional — pre-filters the map</p>
          <select
            className="setup-select"
            value={focusDistrict}
            onChange={function (e) { setFocusDistrict(e.target.value); }}
          >
            {DISTRICTS.map(function (d) {
              return <option key={d.value} value={d.value}>{d.label}</option>;
            })}
          </select>
        </div>

        <div className="setup-section">
          <label className="setup-label">Today&apos;s focus</label>
          <p className="setup-sublabel">Optional — shown as a banner on the map</p>
          <input
            className="setup-input"
            type="text"
            placeholder="e.g., Immunization workflow checks"
            value={focusNote}
            onChange={function (e) { setFocusNote(e.target.value.slice(0, 80)); }}
            maxLength={80}
          />
        </div>

        <button className="setup-go" onClick={handleGo}>
          Let&apos;s go
        </button>
      </div>
    </div>
  );
}
