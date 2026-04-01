export default function Brand({ size = 'default', compact = false, dim = false }) {
  const nameSize = size === 'large' ? 36 : size === 'small' ? 14 : 17;
  const metaSize = size === 'large' ? 12 : 10;
  const badgeSize = size === 'large' ? 11 : 10;
  const dimOpacity = dim ? 0.5 : 1;

  return (
    <div className="brand" style={{ opacity: dimOpacity, display: 'flex', alignItems: 'center', gap: compact ? 6 : 10 }}>
      <span className="brand-name" style={{ fontSize: nameSize, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1 }}>
        <span className="brand-visit" style={{ color: 'var(--accent)' }}>Visit</span>
        <span className="brand-vantage" style={{ color: 'var(--text-primary)' }}>Vantage</span>
      </span>
      <span className="brand-lite" style={{
        fontSize: badgeSize,
        fontWeight: 600,
        border: '1px solid var(--border)',
        borderRadius: 4,
        padding: '1px 5px',
        letterSpacing: '0.05em',
        color: 'var(--text-secondary)',
        lineHeight: 1.4,
      }}>LITE</span>
      {!compact && (
        <span style={{
          display: 'flex',
          alignItems: 'center',
          gap: compact ? 6 : 10,
        }}>
          <span style={{ borderLeft: '1px solid var(--border)', height: 16, opacity: 0.6 }} />
          <span style={{
            fontSize: metaSize,
            fontWeight: 500,
            color: 'var(--text-secondary)',
            letterSpacing: '0.04em',
            opacity: 0.6,
          }}>MADDEN FRAMEWORKS</span>
        </span>
      )}
    </div>
  );
}
