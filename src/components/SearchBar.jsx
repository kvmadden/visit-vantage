import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";

function highlightMatch(text, query) {
  if (!query || !text) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <span className="search-highlight">{text.slice(idx, idx + query.length)}</span>
      {text.slice(idx + query.length)}
    </>
  );
}

export default function SearchBar({ stores, onStoreSelect, searchText, onSearchChange }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  const query = searchText.toLowerCase();

  const filteredStores = useMemo(() => {
    if (!query) return [];

    const matches = stores.filter((store) => {
      const num = String(store.store);
      const nickname = store.nickname?.toLowerCase() || "";
      const city = store.city?.toLowerCase() || "";
      const address = store.address?.toLowerCase() || "";
      const zip = store.zip || "";
      return (
        num.includes(query) ||
        nickname.includes(query) ||
        city.includes(query) ||
        address.includes(query) ||
        zip.includes(query)
      );
    });

    matches.sort((a, b) => {
      const aExact = String(a.store) === query;
      const bExact = String(b.store) === query;
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;

      const aNick = (a.nickname?.toLowerCase() || "").includes(query);
      const bNick = (b.nickname?.toLowerCase() || "").includes(query);
      if (aNick && !bNick) return -1;
      if (!aNick && bNick) return 1;

      return 0;
    });

    return matches.slice(0, 8);
  }, [stores, query]);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  // Show dropdown when there are results and query is non-empty
  useEffect(() => {
    setShowDropdown(filteredStores.length > 0 && query.length > 0);
  }, [filteredStores, query]);

  const handleInputChange = useCallback(
    (e) => {
      onSearchChange(e.target.value);
    },
    [onSearchChange]
  );

  const handleSelect = useCallback(
    (store) => {
      onStoreSelect(store);
      setShowDropdown(false);
    },
    [onStoreSelect]
  );

  const handleClear = useCallback(() => {
    onSearchChange("");
    setShowDropdown(false);
    inputRef.current?.focus();
  }, [onSearchChange]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter" && filteredStores.length === 1) {
        handleSelect(filteredStores[0]);
      }
    },
    [filteredStores, handleSelect]
  );

  return (
    <div className="search-bar" ref={containerRef}>
      <svg
        className="search-icon"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>

      <input
        ref={inputRef}
        className="search-input"
        type="text"
        placeholder="Search stores by name, number, city, or ZIP..."
        value={searchText}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
      />

      {searchText && (
        <button className="search-clear" onClick={handleClear} aria-label="Clear search">
          ✕
        </button>
      )}

      {showDropdown && containerRef.current && createPortal(
        <div
          className="search-dropdown"
          style={{
            position: 'fixed',
            top: containerRef.current.getBoundingClientRect().bottom + 4,
            left: containerRef.current.getBoundingClientRect().left,
            width: containerRef.current.getBoundingClientRect().width,
          }}
        >
          {filteredStores.map((store) => {
            const nickname = store.nickname || "";
            const num = String(store.store);
            const city = store.city || "";
            return (
              <div
                key={store.store}
                className="search-suggestion"
                onMouseDown={() => handleSelect(store)}
              >
                <span>{highlightMatch(nickname, searchText)}</span>
                <span> → Store #{highlightMatch(num, searchText)}</span>
                <span> → {highlightMatch(city, searchText)}</span>
              </div>
            );
          })}
        </div>,
        document.body
      )}
    </div>
  );
}
