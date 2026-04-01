import { useState, useCallback, useMemo } from 'react';
import { RX_COLORS, FS_COLORS } from '../utils/colors';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function formatTime(minutes) {
  if (minutes >= 60) {
    var h = Math.floor(minutes / 60);
    var m = Math.round(minutes % 60);
    return h + 'h ' + m + 'm';
  }
  return Math.round(minutes) + ' min';
}

var TIME_BUDGETS = {
  '1hr': 60,
  '2hr': 120,
  half: 240,
  full: 480,
};

function buildShareText(routeStores, routeStats) {
  var lines = ['VisitVantage Route (' + routeStores.length + ' stops)'];
  routeStores.forEach(function (store, i) {
    lines.push((i + 1) + '. CVS #' + store.store + ' — ' + (store.nickname || store.address));
  });
  if (routeStats) {
    lines.push('');
    lines.push(routeStats.totalDistance.toFixed(1) + ' mi · ' + formatTime(routeStats.estimatedTime));
  }
  return lines.join('\n');
}

function SortableStop({ store, index, leg, isLongestLeg, showTransition, transitionColor, districtMode, districtField, onRemoveFromRoute, stopStatus, onStatusChange }) {
  var colorMap = districtMode === 'fs' ? FS_COLORS : RX_COLORS;
  var districtColor = colorMap[store[districtField]] || 'var(--text-muted)';

  var { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: String(store.store),
  });

  var style = {
    transform: CSS.Transform.toString(transform),
    transition: transition,
    opacity: isDragging ? 0.5 : 1,
    position: 'relative',
    zIndex: isDragging ? 100 : 'auto',
  };

  var isVisited = stopStatus === 'visited';
  var isSkipped = stopStatus === 'skipped';
  var isActive = stopStatus === 'active';

  return (
    <li ref={setNodeRef} style={style}>
      {leg && (
        <div className="route-leg-connector">
          <div className="route-leg-line" />
          <div className="route-leg-detail" style={{ fontFamily: 'var(--font-mono)' }}>
            {leg.distance.toFixed(1)} mi · {formatTime(leg.duration)}
            {isLongestLeg && <span className="route-longest-tag">Longest leg</span>}
          </div>
        </div>
      )}
      {showTransition && (
        <div className="route-district-transition" style={{ color: transitionColor }}>
          <span className="route-transition-dot" style={{ backgroundColor: transitionColor }} />
          Entering {districtMode === 'fs' ? 'FS' : 'Rx'} D{store[districtField]}
        </div>
      )}
      <div className={'route-stop' + (isVisited ? ' route-stop-visited' : '') + (isSkipped ? ' route-stop-skipped' : '') + (isActive ? ' route-stop-active' : '')}>
        <span className="route-drag-handle" {...attributes} {...listeners}>⠿</span>
        <span className={'route-stop-number' + (isActive ? ' route-stop-number-pulse' : '')}>{index + 1}</span>
        <div className="route-stop-info">
          <span className="route-stop-name">
            {store.nickname} <span style={{ fontFamily: 'var(--font-mono)' }}>#{store.store}</span>
          </span>
          <span className="route-stop-addr">{store.address}</span>
        </div>
        <span className="route-stop-district" style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: districtColor }}>
          D{store[districtField]}
        </span>
        <div className="route-stop-status-btns">
          {!isVisited && !isSkipped && (
            <button className="route-status-btn" onClick={function () { onStatusChange(store.store, 'visited'); }} title="Mark visited">
              ✓
            </button>
          )}
          {!isSkipped && !isVisited && (
            <button className="route-status-btn route-status-skip" onClick={function () { onStatusChange(store.store, 'skipped'); }} title="Skip">
              ⏭
            </button>
          )}
          {(isVisited || isSkipped) && (
            <button className="route-status-btn" onClick={function () { onStatusChange(store.store, 'planned'); }} title="Reset">
              ↺
            </button>
          )}
        </div>
        <button className="route-stop-remove" onClick={function () { onRemoveFromRoute(store); }}>✕</button>
      </div>
    </li>
  );
}

export default function RoutePlanner({
  routeStores,
  onRemoveFromRoute,
  onOptimizeRoute,
  onClearRoute,
  onOpenInMaps,
  gpsPosition,
  onRequestGps,
  routeStats,
  inline,
  sessionConfig,
  districtMode = 'rx',
  onReorderRoute,
  stopStatuses = {},
  onStopStatusChange,
}) {
  var stateArr = useState(null);
  var copiedIdx = stateArr[0];
  var setCopiedIdx = stateArr[1];
  var [isCustomOrder, setIsCustomOrder] = useState(false);

  var sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  var handleDragEnd = useCallback(function (event) {
    var active = event.active;
    var over = event.over;
    if (!over || active.id === over.id) return;

    var oldIndex = routeStores.findIndex(function (s) { return String(s.store) === active.id; });
    var newIndex = routeStores.findIndex(function (s) { return String(s.store) === over.id; });
    if (oldIndex === -1 || newIndex === -1) return;

    var newOrder = Array.from(routeStores);
    var moved = newOrder.splice(oldIndex, 1)[0];
    newOrder.splice(newIndex, 0, moved);
    onReorderRoute(newOrder);
    setIsCustomOrder(true);
  }, [routeStores, onReorderRoute]);

  var handleOptimize = useCallback(function () {
    setIsCustomOrder(false);
    onOptimizeRoute();
  }, [onOptimizeRoute]);

  var handleCopyRoute = useCallback(function () {
    var text = buildShareText(routeStores, routeStats);
    navigator.clipboard.writeText(text).then(function () {
      setCopiedIdx('all');
      setTimeout(function () { setCopiedIdx(null); }, 1500);
    });
  }, [routeStores, routeStats]);

  var handleShareRoute = useCallback(function () {
    if (navigator.share) {
      navigator.share({ title: 'VisitVantage Route', text: buildShareText(routeStores, routeStats) });
    } else {
      handleCopyRoute();
    }
  }, [routeStores, routeStats, handleCopyRoute]);

  // Find the longest leg index
  var longestLegIdx = useMemo(function () {
    if (!routeStats || !routeStats.legs || routeStats.legs.length < 2) return -1;
    var maxDist = 0;
    var maxIdx = -1;
    routeStats.legs.forEach(function (l, i) {
      if (l.distance > maxDist) { maxDist = l.distance; maxIdx = i; }
    });
    return maxIdx;
  }, [routeStats]);

  if (!routeStores || routeStores.length === 0) return null;

  var timeBudget = sessionConfig && TIME_BUDGETS[sessionConfig.timeAvailable];
  var pacingLabel = null;
  if (timeBudget && routeStats && routeStores.length > 0) {
    var driveTime = routeStats.estimatedTime || 0;
    var storeTime = Math.max(0, timeBudget - driveTime);
    var perStore = Math.round(storeTime / routeStores.length);
    if (perStore > 0) pacingLabel = '~' + perStore + ' min/store';
  }

  var budgetPct = null;
  if (timeBudget && routeStats) {
    budgetPct = Math.min(100, Math.round((routeStats.estimatedTime / timeBudget) * 100));
  }

  var districtField = districtMode === 'fs' ? 'fsDistrict' : 'rxDistrict';

  if (inline) {
    return (
      <div className="route-inline">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <span style={{ fontWeight: 600, fontSize: 15 }}>Route</span>
          <span className="route-badge">{routeStores.length}</span>
          {pacingLabel && <span className="route-pacing-pill">{pacingLabel}</span>}
          {isCustomOrder && <span style={{ fontSize: 10, color: 'var(--text-muted)', fontStyle: 'italic' }}>Custom order</span>}
          <button className="btn btn-secondary" style={{ marginLeft: 'auto', minHeight: 32, padding: '0 10px', fontSize: 12 }} onClick={onRequestGps}>GPS</button>
        </div>

        {gpsPosition && (
          <div className="route-gps-status">
            GPS active ({gpsPosition.lat.toFixed(4)}, {gpsPosition.lng.toFixed(4)})
          </div>
        )}

        {routeStats && (
          <div className="route-total-stats">
            <span>{routeStats.totalDistance.toFixed(1)} mi</span>
            <span>{formatTime(routeStats.estimatedTime)}</span>
            <span>{routeStores.length} stops</span>
          </div>
        )}

        {budgetPct !== null && (
          <div className="route-budget-bar" style={{ marginBottom: 8 }}>
            <div className="route-budget-track">
              <div className="route-budget-fill" style={{
                width: budgetPct + '%',
                backgroundColor: budgetPct > 95 ? 'var(--destructive)' : budgetPct > 80 ? 'var(--warning)' : 'var(--accent)',
              }} />
            </div>
            <span className="route-budget-label font-mono">{budgetPct}% of time budget (drive only)</span>
          </div>
        )}

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={routeStores.map(function (s) { return String(s.store); })} strategy={verticalListSortingStrategy}>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {routeStores.map(function (store, index) {
                var legIdx = gpsPosition ? index : index - 1;
                var leg = routeStats && routeStats.legs && routeStats.legs[legIdx];
                var isLongest = legIdx === longestLegIdx;

                var prevStore = index > 0 ? routeStores[index - 1] : null;
                var showTransition = prevStore && prevStore[districtField] !== store[districtField];
                var transitionColor = showTransition
                  ? (districtMode === 'fs' ? FS_COLORS : RX_COLORS)[store[districtField]] || 'var(--text-muted)'
                  : null;

                return (
                  <SortableStop
                    key={store.store}
                    store={store}
                    index={index}
                    leg={leg}
                    isLongestLeg={isLongest}
                    showTransition={showTransition}
                    transitionColor={transitionColor}
                    districtMode={districtMode}
                    districtField={districtField}
                    onRemoveFromRoute={onRemoveFromRoute}
                    stopStatus={stopStatuses[store.store] || 'planned'}
                    onStatusChange={onStopStatusChange}
                  />
                );
              })}
            </ul>
          </SortableContext>
        </DndContext>

        {/* Route total */}
        {routeStats && routeStats.totalDistance > 0 && (
          <div className="route-total-summary">
            Total: {routeStats.totalDistance.toFixed(1)} mi · {formatTime(routeStats.estimatedTime)}
          </div>
        )}

        <div className="route-actions">
          <button className="btn btn-primary" onClick={handleOptimize} disabled={routeStores.length < 2}>Optimize</button>
          <button className="btn btn-secondary" onClick={onOpenInMaps} disabled={routeStores.length < 1}>Open in Maps</button>
          <button className="btn btn-danger" onClick={onClearRoute}>Clear</button>
        </div>

        <div className="route-actions" style={{ marginTop: 6 }}>
          <button className="btn btn-secondary" style={{ flex: 1, minHeight: 36, fontSize: 12 }} onClick={handleCopyRoute}>
            {copiedIdx === 'all' ? 'Copied!' : 'Copy Route'}
          </button>
          <button className="btn btn-secondary" style={{ flex: 1, minHeight: 36, fontSize: 12 }} onClick={handleShareRoute}>
            Share
          </button>
        </div>
      </div>
    );
  }
  return null;
}
