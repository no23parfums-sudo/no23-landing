type SearchOverlayProps = {
  isOpen: boolean;
  onClose: () => void;
};

const SUGGESTIONS = ["Ganymede", "Iris", "Xerjoff", "Quentin Bisch"] as const;

export function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  return (
    <div
      className={`search-overlay${isOpen ? " is-open" : ""}`}
      data-search-overlay
    >
      <button
        className="search-close"
        data-close-search
        type="button"
        onClick={onClose}
      >
        ×
      </button>
      <div className="search-inner">
        <span>BUSCAR EN NO.23</span>
        <input
          type="search"
          placeholder="Perfume, casa, nota o perfumista"
        />
        <div className="search-suggestions">
          {SUGGESTIONS.map((suggestion) => (
            <span key={suggestion}>{suggestion}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
