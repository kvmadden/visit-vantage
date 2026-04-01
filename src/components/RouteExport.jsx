import { useState, useCallback } from 'react';
import html2canvas from 'html2canvas';

export default function RouteExport({ routeStores, routeStats, sessionConfig }) {
  const [exporting, setExporting] = useState(false);

  const handleExport = useCallback(async () => {
    if (routeStores.length === 0) return;
    setExporting(true);

    try {
      // Create a temporary export container
      const container = document.createElement('div');
      container.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:420px;padding:24px;background:#18181b;color:#fafafa;font-family:IBM Plex Sans,sans-serif;border-radius:16px;';

      // Header
      const header = document.createElement('div');
      header.style.cssText = 'margin-bottom:16px;padding-bottom:12px;border-bottom:1px solid #3f3f46;';
      header.innerHTML = `
        <div style="font-size:18px;font-weight:700;margin-bottom:4px;">
          <span style="color:#D4A04A;">Visit</span><span>Vantage</span> Route
        </div>
        <div style="font-size:12px;color:#a1a1aa;">
          ${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
          ${sessionConfig?.focusDistrict ? ' · District ' + sessionConfig.focusDistrict : ''}
        </div>
      `;
      container.appendChild(header);

      // Stops
      routeStores.forEach((store, i) => {
        const row = document.createElement('div');
        row.style.cssText = 'display:flex;align-items:center;gap:10px;padding:8px 0;' + (i < routeStores.length - 1 ? 'border-bottom:1px solid #27272a;' : '');
        row.innerHTML = `
          <div style="width:24px;height:24px;border-radius:50%;background:#D4A04A;color:#18181b;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;flex-shrink:0;">${i + 1}</div>
          <div style="flex:1;min-width:0;">
            <div style="font-size:14px;font-weight:600;">Store #${store.store}</div>
            <div style="font-size:12px;color:#a1a1aa;">${store.nickname || ''} · ${store.city || ''}</div>
          </div>
        `;
        container.appendChild(row);
      });

      // Stats footer
      if (routeStats) {
        const footer = document.createElement('div');
        footer.style.cssText = 'margin-top:12px;padding-top:12px;border-top:1px solid #3f3f46;display:flex;gap:16px;font-size:12px;color:#a1a1aa;';
        footer.innerHTML = `
          <span>${routeStores.length} stops</span>
          <span>${routeStats.totalMiles?.toFixed(1) || '—'} mi</span>
          <span>~${routeStats.totalMinutes || '—'} min</span>
        `;
        container.appendChild(footer);
      }

      document.body.appendChild(container);

      const canvas = await html2canvas(container, {
        backgroundColor: '#18181b',
        scale: 2,
        useCORS: true,
      });

      document.body.removeChild(container);

      // Download
      const link = document.createElement('a');
      link.download = `route-${new Date().toISOString().slice(0, 10)}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setExporting(false);
    }
  }, [routeStores, routeStats, sessionConfig]);

  if (routeStores.length === 0) return null;

  return (
    <button className="route-export-btn" onClick={handleExport} disabled={exporting}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
      {exporting ? 'Exporting...' : 'Export route'}
    </button>
  );
}
