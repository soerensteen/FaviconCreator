import { useCallback, useState } from 'react';
import { useFaviconGenerator } from './hooks/useFaviconGenerator';
import { FAVICON_SPECS, DARK_FAVICON_SPECS } from './constants';
import { UploadZone } from './components/UploadZone/UploadZone';
import { BrowserTabPreview } from './components/BrowserTabPreview/BrowserTabPreview';
import { SizeGrid } from './components/SizeGrid/SizeGrid';
import { DownloadPanel } from './components/DownloadPanel/DownloadPanel';
import './App.css';

function App() {
  const [svgFileLight, setSvgFileLight] = useState<File | null>(null);
  const [svgFileDark, setSvgFileDark] = useState<File | null>(null);
  const [appTheme, setAppTheme] = useState<'light' | 'dark'>('light');

  const allIds = [...FAVICON_SPECS.map((s) => s.id), ...DARK_FAVICON_SPECS.map((s) => s.id)];
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(allIds));

  const { generatorState, faviconsLight, faviconsDark, error, generate, reset } = useFaviconGenerator();

  const handleLightFile = useCallback(
    async (file: File) => {
      setSvgFileLight(file);
      reset();
      await generate(file, svgFileDark ?? undefined);
    },
    [generate, reset, svgFileDark],
  );

  const handleDarkFile = useCallback(
    async (file: File) => {
      setSvgFileDark(file);
      reset();
      if (svgFileLight) {
        await generate(svgFileLight, file);
      }
    },
    [generate, reset, svgFileLight],
  );

  const handleToggle = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    const ids = [
      ...FAVICON_SPECS.map((s) => s.id),
      ...DARK_FAVICON_SPECS.map((s) => s.id),
    ];
    setSelectedIds(new Set(ids));
  }, []);

  const handleDeselectAll = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const toggleTheme = useCallback(() => {
    setAppTheme((t) => (t === 'light' ? 'dark' : 'light'));
  }, []);

  // 16px favicons for browser tab preview
  const favicon16Light = faviconsLight.find((f) => f.spec.id === 'png-16');
  const favicon16Dark = faviconsDark.find((f) => f.spec.id === 'dark-png-16');

  return (
    <div className="app" data-theme={appTheme}>
      <header className="app-header">
        <div className="app-header__inner">
          <div className="app-header__logo">
            <img src="/favicon.svg" alt="" className="app-header__logo-icon" width="32" height="32" />
            <span className="app-header__name">Favicon Creator</span>
          </div>
          <p className="app-header__tagline">
            Convert any SVG to a complete favicon package in seconds
          </p>
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={appTheme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
          >
            {appTheme === 'light' ? (
              <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18" aria-hidden="true">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18" aria-hidden="true">
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="1" x2="12" y2="3"/>
                <line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/>
                <line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
            )}
          </button>
        </div>
      </header>

      <main className="app-main">
        {/* Upload section */}
        <section className="app-section">
          <div className="upload-pair">
            <UploadZone
              onFile={handleLightFile}
              currentFile={svgFileLight}
              label="Light mode SVG"
              enablePaste={true}
            />
            <UploadZone
              onFile={handleDarkFile}
              currentFile={svgFileDark}
              label="Dark mode SVG (optional)"
              isDark={true}
              enablePaste={false}
            />
          </div>
        </section>

        {/* Generating spinner */}
        {generatorState === 'generating' && (
          <section className="app-section app-section--center">
            <div className="app-spinner" aria-label="Generating favicons…">
              <div className="app-spinner__ring" />
            </div>
            <p className="app-status-text">Generating favicons…</p>
          </section>
        )}

        {/* Error */}
        {generatorState === 'error' && error && (
          <section className="app-section">
            <div className="app-error">
              <strong>Error:</strong> {error}
            </div>
          </section>
        )}

        {/* Results */}
        {generatorState === 'ready' && faviconsLight.length > 0 && (
          <>
            {/* Browser tab preview */}
            <section className="app-section">
              <h2 className="app-section__title">Browser Tab Preview</h2>
              <BrowserTabPreview
                faviconDataUrl={favicon16Light?.dataUrl ?? null}
                faviconDarkDataUrl={favicon16Dark?.dataUrl ?? null}
              />
            </section>

            {/* Size grid */}
            <section className="app-section">
              <SizeGrid
                faviconsLight={faviconsLight}
                faviconsDark={faviconsDark}
                selectedIds={selectedIds}
                onToggle={handleToggle}
                onSelectAll={handleSelectAll}
                onDeselectAll={handleDeselectAll}
              />
            </section>

            {/* Download panel */}
            <section className="app-section">
              <DownloadPanel
                faviconsLight={faviconsLight}
                faviconsDark={faviconsDark}
                selectedIds={selectedIds}
              />
            </section>
          </>
        )}
      </main>

      <footer className="app-footer">
        <p>All processing happens in your browser — your SVG never leaves your device.</p>
      </footer>
    </div>
  );
}

export default App;
