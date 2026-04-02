import Brand from './Brand';
import FindMyStore from './FindMyStore';
import { APP_VERSION } from '../App';

const FEATURES = [
  { icon: 'pin', text: 'Every store in your region, mapped' },
  { icon: 'route', text: 'Build and optimize your visit route' },
  { icon: 'details', text: 'Store details at a tap' },
];

function FeatureIcon({ type }) {
  if (type === 'pin') return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
    </svg>
  );
  if (type === 'route') return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 3 21 3 21 8" /><line x1="4" y1="20" x2="21" y2="3" /><polyline points="21 16 21 21 16 21" /><line x1="15" y1="15" x2="21" y2="21" /><line x1="4" y1="4" x2="9" y2="9" />
    </svg>
  );
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="9" y1="21" x2="9" y2="9" />
    </svg>
  );
}

export default function LandingPage({ onStart, onLocate, onOpenWorkshop }) {
  return (
    <div className="landing">
      <div className="landing-glow landing-glow-1" />
      <div className="landing-glow landing-glow-2" />

      {/* Version — top-left */}
      <div style={{
        position: 'absolute',
        top: 14,
        left: 16,
        zIndex: 10,
        color: 'rgba(255,255,255,0.4)',
        fontSize: 13,
        fontFamily: "'IBM Plex Sans', sans-serif",
        fontWeight: 600,
        letterSpacing: '0.5px',
      }}>
        {APP_VERSION}
      </div>

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
                <span className="landing-feature-icon"><FeatureIcon type={f.icon} /></span>
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
        </div>

        {/* Icon Workshop — big centered button at bottom */}
        {onOpenWorkshop && (
          <button
            onClick={onOpenWorkshop}
            style={{
              animationDelay: '0.85s',
              marginTop: 24,
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: 12,
              padding: '14px 32px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              color: 'rgba(255,255,255,0.6)',
              fontSize: 16,
              fontFamily: "'IBM Plex Sans', sans-serif",
              fontWeight: 600,
              transition: 'background 0.2s, color 0.2s',
              width: '100%',
              maxWidth: 320,
            }}
            className="landing-feature"
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; e.currentTarget.style.color = 'rgba(255,255,255,0.9)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}
            title="Icon Workshop"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
            </svg>
            Icon Workshop
          </button>
        )}
      </div>
    </div>
  );
}
