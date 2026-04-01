import { useState } from "react";
import { RX_COLORS, FS_COLORS } from "../utils/colors";
import { getDemoTags } from "../utils/demographics";

function hexToRgba(hex, alpha) {
  if (!hex || hex.length < 7) return "rgba(128,128,128," + alpha + ")";
  var r = parseInt(hex.slice(1, 3), 16);
  var g = parseInt(hex.slice(3, 5), 16);
  var b = parseInt(hex.slice(5, 7), 16);
  return "rgba(" + r + ", " + g + ", " + b + ", " + alpha + ")";
}

function getTodayHoursLabel() {
  var days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return days[new Date().getDay()];
}

function buildTipCards(store) {
  var tips = [];
  if (store.target === true) {
    tips.push("Pharmacy entrance is inside the Target store");
  }
  if (store.fs24 === "Yes" && store.rx24 !== "Yes") {
    tips.push("Front store is 24hr but pharmacy has limited hours");
  }
  if (store.ymas === "Yes") {
    tips.push("This location carries the CVS y m\u00e1s product selection");
  }
  return tips;
}

export default function StoreCard({ store, onClose, onAddToRoute, onRemoveFromRoute, isInRoute, inline }) {
  var expanded = useState(false);
  var isExpanded = expanded[0];
  var setExpanded = expanded[1];

  if (!store) return null;

  var borderClass = store.rxDistrict ? "border-d" + store.rxDistrict : "";
  var demoTags = getDemoTags(store);

  var badges = [];
  if (store.target === true) badges.push({ label: "TARGET", className: "badge-target" });
  if (store.fs24 === "Yes") badges.push({ label: "FS 24hr", className: "badge-fs24" });
  if (store.rx24 === "Yes") badges.push({ label: "Rx 24hr", className: "badge-rx24" });
  if (store.ymas === "Yes") badges.push({ label: "y m\u00e1s", className: "badge-ymas" });
  if (store.driveThru === "Yes") badges.push({ label: "DT", className: "badge-drivethru" });
  if (store.minuteClinic === "Yes") badges.push({ label: "MC", className: "badge-minuteclinic" });

  var directionsUrl = "https://www.google.com/maps/dir/?api=1&destination=" + store.lat + "," + store.lng;
  var tips = buildTipCards(store);
  var todayLabel = getTodayHoursLabel();

  var rxColor = RX_COLORS[store.rxDistrict] || "#888";
  var fsColor = FS_COLORS[store.fsDistrict] || "#888";

  return (
    <div
      className={(inline ? 'store-card-inline' : 'store-card slide-up') + ' ' + borderClass}
      style={
        store.rxDistrict && RX_COLORS[store.rxDistrict]
          ? { borderTopColor: RX_COLORS[store.rxDistrict] }
          : undefined
      }
    >
      {/* Header */}
      <div className="store-card-header">
        <span className="store-number" style={{ fontFamily: 'var(--font-mono)' }}>
          CVS #{store.store}
          {store.rxDistrict ? " \u00b7 Rx D" + store.rxDistrict : ""}
        </span>
        <button className="store-close" onClick={onClose} aria-label="Close">
          \u2715
        </button>
      </div>

      {/* Nickname */}
      {store.nickname && <div className="store-nickname">{store.nickname}</div>}

      {/* Address */}
      {store.address && (
        <div className="store-address">
          {store.address}, {store.city}, FL {store.zip}
        </div>
      )}

      {/* Intersection */}
      {store.intersection && (
        <div className="store-address" style={{ fontSize: 12, color: "var(--text-muted)" }}>
          {store.intersection}
        </div>
      )}

      {/* Today's hours (if available) */}
      {(store.rxHours || store.fsHours) && (
        <div className="store-today-hours" style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
          Today ({todayLabel}):{' '}
          {store.rxHours && <span>Rx {store.rxHours}</span>}
          {store.rxHours && store.fsHours && ' \u00b7 '}
          {store.fsHours && <span>FS {store.fsHours}</span>}
        </div>
      )}

      {/* Demographic context tags */}
      {demoTags.length > 0 && (
        <div className="store-demo-tags">
          {demoTags.map(function (tag) {
            return <span key={tag} className="demo-tag">{tag}</span>;
          })}
        </div>
      )}

      {/* Badges */}
      {badges.length > 0 && (
        <div style={{ marginTop: 6 }}>
          {badges.map(function (b) {
            return (
              <span key={b.label} className={"badge " + b.className}>
                {b.label}
              </span>
            );
          })}
        </div>
      )}

      {/* District info with DL color pills */}
      {(store.rxDistrict || store.fsDistrict) && (
        <div className="store-dl-info" style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
          {store.rxDistrict && store.rxDL && (
            <span className="dl-pill" style={{
              background: hexToRgba(rxColor, 0.15),
              color: rxColor,
              border: '1px solid ' + hexToRgba(rxColor, 0.3),
            }}>
              Rx D{store.rxDistrict}: {store.rxDL}
            </span>
          )}
          {store.fsDistrict && store.fsDistrict !== 98 && store.fsDL && (
            <span className="dl-pill" style={{
              background: hexToRgba(fsColor, 0.15),
              color: fsColor,
              border: '1px solid ' + hexToRgba(fsColor, 0.3),
            }}>
              FS D{store.fsDistrict}: {store.fsDL}
            </span>
          )}
        </div>
      )}

      {/* Hollow tip cards */}
      {tips.length > 0 && (
        <div className="store-tips" style={{ marginTop: 8 }}>
          {tips.map(function (tip, i) {
            return (
              <div key={i} className="hollow-tip">
                <span className="hollow-tip-icon">\u2139\uFE0F</span>
                <span>{tip}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Phone numbers (always visible if available) */}
      {(store.rxPhone || store.fsPhone) && (
        <div style={{ marginTop: 8, display: 'flex', gap: 12, fontSize: 13 }}>
          {store.rxPhone && (
            <a href={"tel:" + store.rxPhone} style={{ color: "var(--accent)", textDecoration: "none", fontFamily: 'var(--font-mono)' }}>
              \u260E Rx: {store.rxPhone}
            </a>
          )}
          {store.fsPhone && (
            <a href={"tel:" + store.fsPhone} style={{ color: "var(--accent)", textDecoration: "none", fontFamily: 'var(--font-mono)' }}>
              \u260E FS: {store.fsPhone}
            </a>
          )}
        </div>
      )}

      {/* Enriched view */}
      {isExpanded && (
        <div className="store-section fade-in">
          {/* Info grid */}
          <div className="info-grid">
            <div className="info-grid-row">
              <span className="info-grid-label">Store #</span>
              <span className="info-grid-value font-mono">{store.store}</span>
            </div>
            {store.rxDistrict && (
              <div className="info-grid-row">
                <span className="info-grid-label">Rx District</span>
                <span className="info-grid-value font-mono">D{store.rxDistrict}</span>
              </div>
            )}
            {store.fsDistrict && (
              <div className="info-grid-row">
                <span className="info-grid-label">FS District</span>
                <span className="info-grid-value font-mono">D{store.fsDistrict}</span>
              </div>
            )}
            {store.zip && (
              <div className="info-grid-row">
                <span className="info-grid-label">ZIP</span>
                <span className="info-grid-value font-mono">{store.zip}</span>
              </div>
            )}
            <div className="info-grid-row">
              <span className="info-grid-label">Coords</span>
              <span className="info-grid-value font-mono" style={{ fontSize: 11 }}>
                {store.lat.toFixed(5)}, {store.lng.toFixed(5)}
              </span>
            </div>
          </div>

          {/* Full hours */}
          {store.fsHours && (
            <div style={{ marginBottom: 6 }}>
              <span className="store-section-label">Front Store Hours</span>
              <div style={{ fontSize: 13, fontFamily: 'var(--font-mono)', color: "var(--text-secondary)" }}>{store.fsHours}</div>
            </div>
          )}
          {store.rxHours && (
            <div style={{ marginBottom: 6 }}>
              <span className="store-section-label">Pharmacy Hours</span>
              <div style={{ fontSize: 13, fontFamily: 'var(--font-mono)', color: "var(--text-secondary)" }}>{store.rxHours}</div>
            </div>
          )}

          {/* Volume tier */}
          {store.volumeTier && (
            <div style={{ marginBottom: 6 }}>
              <span className="store-section-label">Volume Tier</span>
              <div>
                <span className="badge" style={{ background: "rgba(139,92,246,0.15)", color: "#8b5cf6", border: "1px solid rgba(139,92,246,0.3)" }}>
                  {store.volumeTier}
                </span>
              </div>
            </div>
          )}

          {/* Notes */}
          {store.notes && (
            <div style={{ marginBottom: 6 }}>
              <span className="store-section-label">Notes</span>
              <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>{store.notes}</div>
            </div>
          )}

          {/* Copy store info */}
          <button
            className="btn btn-secondary"
            style={{ fontSize: 12, minHeight: 32, marginTop: 4 }}
            onClick={function () {
              var text = 'CVS #' + store.store;
              if (store.nickname) text += ' — ' + store.nickname;
              text += '\n' + (store.address || '') + ', ' + (store.city || '') + ', FL ' + (store.zip || '');
              if (store.rxPhone) text += '\nRx: ' + store.rxPhone;
              if (store.fsPhone) text += '\nFS: ' + store.fsPhone;
              text += '\n' + store.lat.toFixed(5) + ', ' + store.lng.toFixed(5);
              navigator.clipboard.writeText(text);
            }}
          >
            Copy Store Info
          </button>
        </div>
      )}

      {/* Action buttons */}
      <div className="store-actions">
        {isInRoute ? (
          <button className="btn btn-danger" style={{ flex: 1 }} onClick={function () { onRemoveFromRoute(store); }}>
            Remove from Route
          </button>
        ) : (
          <button className="btn btn-primary" onClick={function () { onAddToRoute(store); }}>
            Add to Route
          </button>
        )}
        <a
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-secondary"
          style={{ textDecoration: "none" }}
        >
          Directions
        </a>
      </div>

      <div className="store-actions" style={{ marginTop: 8 }}>
        <button className="btn btn-secondary" onClick={function () { setExpanded(!isExpanded); }}>
          {isExpanded ? "Less Detail" : "More Detail"}
        </button>
      </div>
    </div>
  );
}
