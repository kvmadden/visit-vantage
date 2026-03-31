import { useState } from "react";
import { RX_COLORS } from "../utils/colors";

export default function StoreCard({ store, onClose, onAddToRoute, onRemoveFromRoute, isInRoute }) {
  const [expanded, setExpanded] = useState(false);

  if (!store) return null;

  const borderClass = store.rxDistrict ? `border-d${store.rxDistrict}` : "";

  const badges = [];
  if (store.target === true) badges.push({ label: "TARGET", className: "badge-target" });
  if (store.fs24 === "Yes") badges.push({ label: "FS 24hr", className: "badge-fs24" });
  if (store.rx24 === "Yes") badges.push({ label: "Rx 24hr", className: "badge-rx24" });
  if (store.ymas === "Yes") badges.push({ label: "Y M\u00e1s", className: "badge-ymas" });
  if (store.driveThru === "Yes") badges.push({ label: "Drive-Thru", className: "badge-drivethru" });
  if (store.minuteClinic === "Yes") badges.push({ label: "MinuteClinic", className: "badge-minuteclinic" });

  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${store.lat},${store.lng}`;

  return (
    <div
      className={`store-card slide-up ${borderClass}`}
      style={
        store.rxDistrict && RX_COLORS[store.rxDistrict]
          ? { borderTopColor: RX_COLORS[store.rxDistrict] }
          : undefined
      }
    >
      {/* Header */}
      <div className="store-card-header">
        <span className="store-number">
          CVS #{store.store}
          {store.rxDistrict ? ` \u00b7 Rx D${store.rxDistrict}` : ""}
        </span>
        <button className="store-close" onClick={onClose} aria-label="Close">
          ✕
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

      {/* Badges */}
      {badges.length > 0 && (
        <div style={{ marginTop: 6 }}>
          {badges.map((b) => (
            <span key={b.label} className={`badge ${b.className}`}>
              {b.label}
            </span>
          ))}
        </div>
      )}

      {/* District info */}
      {(store.rxDistrict || store.fsDistrict) && (
        <div className="store-dl-info">
          {store.rxDistrict && store.rxDL && (
            <div>Rx D{store.rxDistrict}: {store.rxDL}</div>
          )}
          {store.fsDistrict && store.fsDistrict !== 98 && store.fsDL && (
            <div>FS D{store.fsDistrict}: {store.fsDL}</div>
          )}
        </div>
      )}

      {/* Enriched view */}
      {expanded && (
        <div className="store-section fade-in">
          {/* Phone numbers */}
          {store.fsPhone && (
            <div style={{ marginBottom: 6 }}>
              <span className="store-section-label">Front Store Phone</span>
              <div>
                <a href={`tel:${store.fsPhone}`} style={{ color: "var(--accent)", textDecoration: "none" }}>
                  {store.fsPhone}
                </a>
              </div>
            </div>
          )}
          {store.rxPhone && (
            <div style={{ marginBottom: 6 }}>
              <span className="store-section-label">Pharmacy Phone</span>
              <div>
                <a href={`tel:${store.rxPhone}`} style={{ color: "var(--accent)", textDecoration: "none" }}>
                  {store.rxPhone}
                </a>
              </div>
            </div>
          )}

          {/* Hours */}
          {store.fsHours && (
            <div style={{ marginBottom: 6 }}>
              <span className="store-section-label">Front Store Hours</span>
              <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>{store.fsHours}</div>
            </div>
          )}
          {store.rxHours && (
            <div style={{ marginBottom: 6 }}>
              <span className="store-section-label">Pharmacy Hours</span>
              <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>{store.rxHours}</div>
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
        </div>
      )}

      {/* Action buttons */}
      <div className="store-actions">
        {isInRoute ? (
          <button className="btn btn-danger" style={{ flex: 1 }} onClick={() => onRemoveFromRoute(store)}>
            Remove from Route
          </button>
        ) : (
          <button className="btn btn-primary" onClick={() => onAddToRoute(store)}>
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
          Get Directions
        </a>
      </div>

      <div className="store-actions" style={{ marginTop: 8 }}>
        <button className="btn btn-secondary" onClick={() => setExpanded(!expanded)}>
          {expanded ? "Less Detail" : "More Detail"}
        </button>
      </div>
    </div>
  );
}
