import { useFileInput } from '../../hooks/useFileInput';
import './UploadZone.css';

interface UploadZoneProps {
  onFile: (file: File) => void;
  currentFile: File | null;
  label?: string;
  isDark?: boolean;
  enablePaste?: boolean;
}

export function UploadZone({ onFile, currentFile, label, isDark = false, enablePaste = true }: UploadZoneProps) {
  const { isDragging, dropZoneProps, openFilePicker, fileInputRef } = useFileInput({ onFile, enablePaste });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFile(file);
    // Reset so the same file can be re-selected
    e.target.value = '';
  };

  return (
    <div className="upload-zone-wrapper">
      {label && <p className="upload-zone__label">{label}</p>}
      <div
        className={`upload-zone ${isDragging ? 'upload-zone--dragging' : ''} ${currentFile ? 'upload-zone--has-file' : ''} ${isDark ? 'upload-zone--dark' : ''}`}
        {...dropZoneProps}
        onClick={openFilePicker}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') openFilePicker();
        }}
        aria-label={label ? `Upload ${label} SVG file` : 'Upload SVG file'}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".svg,image/svg+xml"
          onChange={handleFileChange}
          style={{ display: 'none' }}
          aria-hidden="true"
        />

        {currentFile ? (
          <div className="upload-zone__file-info">
            <span className="upload-zone__icon upload-zone__icon--file">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
            </span>
            <span className="upload-zone__filename">{currentFile.name}</span>
            <span className="upload-zone__hint">Click or drop a new SVG to replace</span>
          </div>
        ) : (
          <div className="upload-zone__prompt">
            <span className="upload-zone__icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
            </span>
            <p className="upload-zone__title">Drop your SVG here</p>
            <p className="upload-zone__subtitle">
              or <span className="upload-zone__link">click to browse</span>
              {enablePaste && <>{' '}· or paste with Ctrl+V</>}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
