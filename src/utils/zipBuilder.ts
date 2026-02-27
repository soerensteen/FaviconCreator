import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import type { GeneratedFavicon } from '../types';
import { generateHtmlSnippet, generateWebManifest, generateReadmeHtml } from './htmlSnippet';

export async function buildAndDownloadZip(
  faviconsLight: GeneratedFavicon[],
  faviconsDark: GeneratedFavicon[],
  selectedIds: Set<string>,
): Promise<void> {
  const zip = new JSZip();

  const allFavicons = [...faviconsLight, ...faviconsDark];
  const selected = allFavicons.filter((f) => selectedIds.has(f.spec.id));

  for (const favicon of selected) {
    zip.file(favicon.spec.filename, favicon.blob);
  }

  const hasDark = faviconsDark.length > 0;
  const htmlSnippet = generateHtmlSnippet(hasDark);
  const webManifest = generateWebManifest();
  const readmeHtml = generateReadmeHtml(htmlSnippet, webManifest);

  zip.file('site.webmanifest', webManifest);
  zip.file('README.html', readmeHtml);

  const zipBlob = await zip.generateAsync({ type: 'blob' });
  saveAs(zipBlob, 'favicons.zip');
}
