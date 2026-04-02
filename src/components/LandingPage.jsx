import Brand from './Brand';
import FindMyStore from './FindMyStore';
import { APP_VERSION } from '../App';

const FEATURES = [
  { icon: '\u{1F4CD}', text: 'Every store in your region, mapped' },
  { icon: '\u{1F500}', text: 'Build and optimize your visit route' },
  { icon: '\u{1F4CB}', text: 'Store details at a tap' },
];

export default function LandingPage({ onStart, onLocate, onOpenWorkshop }) {
  return (
    <div className="landing">
      <div className="landing-glow landing-glow-1" />
      <div className="landing-glow landing-glow-2" />

      {/* Icon Workshop button — top-right corner */}
      {onOpenWorkshop && (
        <button
          onClick={onOpenWorkshop}
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            zIndex: 10,
            background: 'rgba(255,255,255,0.12)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: 10,
            padding: '10px 16px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            color: 'rgba(255,255,255,0.7)',
            fontSize: 14,
            fontFamily: "'IBM Plex Sans', sans-serif",
            fontWeight: 600,
            transition: 'background 0.2s, color 0.2s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.2)'; e.currentTarget.style.color = 'rgba(255,255,255,0.95)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; }}
          title="Icon Workshop"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
          </svg>
          Icon Workshop
        </button>
      )}

      <div className="landing-content">
        <div className="landing-icon" style={{ animationDelay: '0s' }}>
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <defs>
              <linearGradient id="pin-grad" x1="0" y1="0" x2="48" y2="48">
                <stop offset="0%" stopColor="#D4A04A" />
                <stop offset="100%" stopColor="#B8862E" />
              </linearGradient>
            </defs>
            <path d="M24 4C16.27 4 10 10.27 10 18c0 10.5 14 26 14 26s14-15.5 14-26c0-7.73-6.27-14-14-14zm0 19a5 5 0 110-10 5 5 0 010 10z" fill="url(#pin-grad)" />
          </svg>
        </div>

        <h1 className="landing-title" style={{ animationDelay: '0.1s' }}>
          <span style={{ color: 'var(--accent)' }}>Visit</span>
          <span style={{ color: '#fafafa' }}>Vantage</span>
        </h1>

        <p className="landing-tagline" style={{ animationDelay: '0.18s' }}>
          Lead in the field.
        </p>

        <div className="landing-features">
          {FEATURES.map(function (f, i) {
            return (
              <div
                key={i}
                className="landing-feature"
                style={{ animationDelay: (0.25 + i * 0.1) + 's' }}
              >
                <span className="landing-feature-icon">{f.icon}</span>
                <span className="landing-feature-text">{f.text}</span>
              </div>
            );
          })}
        </div>

        <button
          className="landing-cta"
          onClick={onStart}
          style={{ animationDelay: '0.55s' }}
        >
          Start planning
        </button>

        <div className="landing-locate" style={{ animationDelay: '0.6s' }}>
          <FindMyStore onLocate={onLocate} />
        </div>

        <p className="landing-trust" style={{ animationDelay: '0.65s' }}>
          Session only &middot; No visit history &middot; No personal data &middot; Resets when you close
        </p>

        <div className="landing-footer" style={{ animationDelay: '0.75s' }}>
          <span className="footer-pill" style={{ borderColor: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.4)' }}>
            &copy; 2026 Madden Frameworks
          </span>
          <p className="landing-footer-tagline">Smart systems. Better judgment.</p>
          <p className="landing-version" style={{ color: 'rgba(255,255,255,0.25)', fontSize: '10px', marginTop: '6px' }}>{APP_VERSION}</p>
        </div>
      </div>
    </div>
  );
}
