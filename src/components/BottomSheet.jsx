import { useState, useRef, useCallback, useEffect } from 'react';

const DETENTS = {
  collapsed: 48,
  peek: 160,
  full: null, // calculated as % of viewport
};

const FULL_RATIO = 0.72; // 72% of viewport height

export default function BottomSheet({ children, forceOpen, onCollapse }) {
  const [detent, setDetent] = useState('peek');
  const [dragOffset, setDragOffset] = useState(0);
  const sheetRef = useRef(null);
  const dragStartRef = useRef(null);
  const startHeightRef = useRef(0);

  // When forceOpen changes (e.g. store selected), expand to full
  // When deselected, return to peek (not collapsed) so filters stay visible
  const prevForceOpen = useRef(forceOpen);
  useEffect(() => {
    if (forceOpen) {
      setDetent('full');
    } else if (prevForceOpen.current) {
      // Only go to peek when deselecting, not on initial load
      setDetent('peek');
    }
    prevForceOpen.current = forceOpen;
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

  // Mouse drag support for desktop
  const handleMouseDown = useCallback((e) => {
    dragStartRef.current = e.clientY;
    startHeightRef.current = getHeight(detent);
    const onMouseMove = (ev) => {
      if (dragStartRef.current === null) return;
      const delta = dragStartRef.current - ev.clientY;
      setDragOffset(delta);
    };
    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      handleTouchEnd();
    };
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }, [detent, getHeight, handleTouchEnd]);

  // Keyboard: Escape collapses
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape' && detent !== 'collapsed') {
        setDetent('collapsed');
        onCollapse?.();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [detent, onCollapse]);

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
        onMouseDown={handleMouseDown}
        onClick={handleHandleClick}
        role="button"
        tabIndex={0}
        aria-label="Drag to resize panel"
      >
        <div className="bottom-sheet-grip" />
      </div>
      <div className="bottom-sheet-content">
        {children}
      </div>
    </div>
  );
}
