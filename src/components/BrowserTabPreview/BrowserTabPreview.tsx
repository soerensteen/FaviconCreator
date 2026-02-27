import './BrowserTabPreview.css';

interface BrowserTabPreviewProps {
  faviconDataUrl: string | null;
  faviconDarkDataUrl?: string | null;
}

interface SinglePreviewProps {
  faviconDataUrl: string | null;
  isDark?: boolean;
}

function SinglePreview({ faviconDataUrl, isDark = false }: SinglePreviewProps) {
  return (
    <div className={`browser-preview ${isDark ? 'browser-preview--dark' : ''}`}>
      <div className="browser-chrome">
        {/* Traffic lights */}
        <div className="browser-chrome__traffic-lights">
          <span className="traffic-light traffic-light--red" />
          <span className="traffic-light traffic-light--yellow" />
          <span className="traffic-light traffic-light--green" />
        </div>

        {/* Tab strip */}
        <div className="browser-chrome__tab-strip">
          <div className="browser-tab browser-tab--active">
            {faviconDataUrl ? (
              <img
                className="browser-tab__favicon"
                src={faviconDataUrl}
                alt="Favicon preview"
                width={16}
                height={16}
              />
            ) : (
              <span className="browser-tab__favicon-placeholder" />
            )}
            <span className="browser-tab__title">My Website</span>
            <span className="browser-tab__close">×</span>
          </div>
          <div className="browser-tab browser-tab--inactive">
            <span className="browser-tab__favicon-placeholder" />
            <span className="browser-tab__title browser-tab__title--muted">New Tab</span>
          </div>
        </div>
      </div>

      {/* Address bar */}
      <div className="browser-address-bar">
        <span className="browser-address-bar__lock">
          <svg viewBox="0 0 16 16" fill="currentColor" width="12" height="12">
            <path d="M8 1a3 3 0 0 0-3 3v2H4a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1h-1V4a3 3 0 0 0-3-3zm0 1a2 2 0 0 1 2 2v2H6V4a2 2 0 0 1 2-2z"/>
          </svg>
        </span>
        <span className="browser-address-bar__url">mywebsite.com</span>
      </div>
    </div>
  );
}

export function BrowserTabPreview({ faviconDataUrl, faviconDarkDataUrl }: BrowserTabPreviewProps) {
  if (faviconDarkDataUrl) {
    return (
      <div className="browser-preview-pair">
        <div className="browser-preview-pair__item">
          <p className="browser-preview-pair__label">Light</p>
          <SinglePreview faviconDataUrl={faviconDataUrl} isDark={false} />
        </div>
        <div className="browser-preview-pair__item">
          <p className="browser-preview-pair__label">Dark</p>
          <SinglePreview faviconDataUrl={faviconDarkDataUrl} isDark={true} />
        </div>
      </div>
    );
  }

  return <SinglePreview faviconDataUrl={faviconDataUrl} />;
}
