import { useState } from 'react';
import type { GeneratedFavicon } from '../../types';
import { generateHtmlSnippet } from '../../utils/htmlSnippet';
import { buildAndDownloadZip } from '../../utils/zipBuilder';
import './DownloadPanel.css';

interface DownloadPanelProps {
  faviconsLight: GeneratedFavicon[];
  faviconsDark: GeneratedFavicon[];
  selectedIds: Set<string>;
}

export function DownloadPanel({ faviconsLight, faviconsDark, selectedIds }: DownloadPanelProps) {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const hasDark = faviconsDark.length > 0;
  const snippet = generateHtmlSnippet(hasDark);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = async () => {
    if (selectedIds.size === 0) return;
    setDownloading(true);
    try {
      await buildAndDownloadZip(faviconsLight, faviconsDark, selectedIds);
    } finally {
      setDownloading(false);
    }
  };

  const selectedCount = selectedIds.size;

  return (
    <div className="download-panel">
      <div className="download-panel__snippet-section">
        <div className="download-panel__snippet-header">
          <h2 className="download-panel__title">HTML Snippet</h2>
          <button
            className={`download-panel__copy-btn ${copied ? 'download-panel__copy-btn--copied' : ''}`}
            onClick={handleCopy}
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
        <pre className="download-panel__code">
          <code>{snippet}</code>
        </pre>
      </div>

      <button
        className="download-panel__download-btn"
        onClick={handleDownload}
        disabled={selectedCount === 0 || downloading}
      >
        {downloading ? (
          <span className="download-panel__spinner" aria-hidden="true" />
        ) : (
          <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
            <path
              fillRule="evenodd"
              d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        )}
        {downloading
          ? 'Building ZIP…'
          : `Download ZIP (${selectedCount} file${selectedCount !== 1 ? 's' : ''})`}
      </button>
    </div>
  );
}
