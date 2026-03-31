import { useState, useRef, useCallback, useEffect } from 'react';

const DETENTS = {
  collapsed: 48,
  peek: 160,
  full: null, // calculated as % of viewport
};

const FULL_RATIO = 0.72; // 72% of viewport height

export default function BottomSheet({ children, forceOpen, onCollapse }) {
  const [detent, setDetent] = useState('collapsed');
  const [dragOffset, setDragOffset] = useState(0);
  const sheetRef = useRef(null);
  const dragStartRef = useRef(null);
  const startHeightRef = useRef(0);

  // When forceOpen changes (e.g. store selected), expand to full
  useEffect(() => {
    if (forceOpen) {
      setDetent('full');
    } else {
      setDetent('collapsed');
    }
  }, [forceOpen]);

  const getHeight = useCallback((d) => {
    if (d === 'full') return window.innerHeight * FULL_RATIO;
    return DETENTS[d] || DETENTS.collapsed;
  }, []);

  const currentHeight = getHeight(detent) + dragOffset;

  const handleTouchStart = useCallback((e) => {
    dragStartRef.current = e.touches[0].clientY;
    startHeightRef.current = getHeight(detent);
  }, [detent, getHeight]);

  const handleTouchMove = useCallback((e) => {
    if (dragStartRef.current === null) return;
    const delta = dragStartRef.current - e.touches[0].clientY;
    setDragOffset(delta);
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (dragStartRef.current === null) return;
    const finalHeight = startHeightRef.current + dragOffset;
    const fullH = window.innerHeight * FULL_RATIO;
    const peekH = DETENTS.peek;
    const collapsedH = DETENTS.collapsed;

    // Snap to nearest detent
    const distFull = Math.abs(finalHeight - fullH);
    const distPeek = Math.abs(finalHeight - peekH);
    const distCollapsed = Math.abs(finalHeight - collapsedH);

    const minDist = Math.min(distFull, distPeek, distCollapsed);
    if (minDist === distFull) {
      setDetent('full');
    } else if (minDist === distPeek) {
      setDetent('peek');
    } else {
      setDetent('collapsed');
      onCollapse?.();
    }

    setDragOffset(0);
    dragStartRef.current = null;
  }, [dragOffset, onCollapse]);

  const handleHandleClick = useCallback(() => {
    if (detent === 'collapsed') {
      setDetent('peek');
    } else if (detent === 'peek') {
      setDetent('full');
    } else {
      setDetent('collapsed');
      onCollapse?.();
    }
  }, [detent, onCollapse]);

  return (
    <div
      ref={sheetRef}
      className="bottom-sheet"
      style={{
        height: Math.max(DETENTS.collapsed, currentHeight),
        transition: dragOffset !== 0 ? 'none' : 'height 0.3s cubic-bezier(0.32, 0.72, 0, 1)',
      }}
    >
      <div
        className="bottom-sheet-handle"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={handleHandleClick}
      >
        <div className="bottom-sheet-grip" />
      </div>
      <div className="bottom-sheet-content">
        {children}
      </div>
    </div>
  );
}
