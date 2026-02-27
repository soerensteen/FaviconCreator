import type { GeneratedFavicon } from '../../types';
import './SizeGrid.css';

interface SizeGridProps {
  faviconsLight: GeneratedFavicon[];
  faviconsDark: GeneratedFavicon[];
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
}

export function SizeGrid({
  faviconsLight,
  faviconsDark,
  selectedIds,
  onToggle,
  onSelectAll,
  onDeselectAll,
}: SizeGridProps) {
  const allFavicons = [...faviconsLight, ...faviconsDark];
  const allSelected = allFavicons.every((f) => selectedIds.has(f.spec.id));

  return (
    <div className="size-grid">
      <div className="size-grid__header">
        <h2 className="size-grid__title">Generated Favicons</h2>
        <div className="size-grid__actions">
          <button className="size-grid__action-btn" onClick={onSelectAll} disabled={allSelected}>
            Select all
          </button>
          <button
            className="size-grid__action-btn"
            onClick={onDeselectAll}
            disabled={selectedIds.size === 0}
          >
            Deselect all
          </button>
        </div>
      </div>

      <div className="size-grid__section">
        {faviconsDark.length > 0 && (
          <p className="size-grid__section-title">Light</p>
        )}
        <div className="size-grid__grid">
          {faviconsLight.map((favicon) => (
            <SizeCell
              key={favicon.spec.id}
              favicon={favicon}
              selected={selectedIds.has(favicon.spec.id)}
              onToggle={() => onToggle(favicon.spec.id)}
            />
          ))}
        </div>
      </div>

      {faviconsDark.length > 0 && (
        <div className="size-grid__section">
          <p className="size-grid__section-title size-grid__section-title--dark">Dark</p>
          <div className="size-grid__grid">
            {faviconsDark.map((favicon) => (
              <SizeCell
                key={favicon.spec.id}
                favicon={favicon}
                selected={selectedIds.has(favicon.spec.id)}
                onToggle={() => onToggle(favicon.spec.id)}
                isDark
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface SizeCellProps {
  favicon: GeneratedFavicon;
  selected: boolean;
  onToggle: () => void;
  isDark?: boolean;
}

function SizeCell({ favicon, selected, onToggle, isDark = false }: SizeCellProps) {
  const { spec, dataUrl } = favicon;
  // Clamp display size: min 16, max 64
  const displaySize = Math.min(64, Math.max(16, spec.size));

  return (
    <label className={`size-cell ${selected ? 'size-cell--selected' : ''} ${isDark ? 'size-cell--dark-variant' : ''}`}>
      <input
        type="checkbox"
        className="size-cell__checkbox"
        checked={selected}
        onChange={onToggle}
      />
      <div className="size-cell__preview-wrap">
        <div
          className={`size-cell__checkerboard ${isDark ? 'size-cell__checkerboard--dark' : ''}`}
          style={{ width: displaySize, height: displaySize }}
        >
          <img
            src={dataUrl}
            alt={spec.label}
            width={displaySize}
            height={displaySize}
            style={{ imageRendering: spec.size <= 32 ? 'pixelated' : 'auto' }}
          />
        </div>
      </div>
      <div className="size-cell__info">
        <span className="size-cell__filename">{spec.filename}</span>
        <span className="size-cell__label">{spec.label}</span>
      </div>
    </label>
  );
}
