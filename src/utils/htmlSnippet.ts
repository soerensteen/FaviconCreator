/**
 * Generates the HTML <link> snippet and site.webmanifest JSON content
 * that users paste into their HTML <head>.
 */
export function generateHtmlSnippet(hasDark = false): string {
  if (!hasDark) {
    return `<!-- Favicon -->
<link rel="icon" type="image/x-icon" href="/favicon.ico">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="48x48" href="/favicon-48x48.png">
<link rel="icon" type="image/png" sizes="64x64" href="/favicon-64x64.png">
<link rel="icon" type="image/png" sizes="96x96" href="/favicon-96x96.png">
<link rel="icon" type="image/png" sizes="128x128" href="/favicon-128x128.png">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">`;
  }

  return `<!-- Favicon – light mode -->
<link rel="icon" media="(prefers-color-scheme: light)" type="image/x-icon" href="/favicon.ico">
<link rel="icon" media="(prefers-color-scheme: light)" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="icon" media="(prefers-color-scheme: light)" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" media="(prefers-color-scheme: light)" type="image/png" sizes="48x48" href="/favicon-48x48.png">
<link rel="icon" media="(prefers-color-scheme: light)" type="image/png" sizes="64x64" href="/favicon-64x64.png">
<link rel="icon" media="(prefers-color-scheme: light)" type="image/png" sizes="96x96" href="/favicon-96x96.png">
<link rel="icon" media="(prefers-color-scheme: light)" type="image/png" sizes="128x128" href="/favicon-128x128.png">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">

<!-- Favicon – dark mode -->
<link rel="icon" media="(prefers-color-scheme: dark)" type="image/x-icon" href="/favicon-dark.ico">
<link rel="icon" media="(prefers-color-scheme: dark)" type="image/png" sizes="16x16" href="/favicon-dark-16x16.png">
<link rel="icon" media="(prefers-color-scheme: dark)" type="image/png" sizes="32x32" href="/favicon-dark-32x32.png">
<link rel="icon" media="(prefers-color-scheme: dark)" type="image/png" sizes="48x48" href="/favicon-dark-48x48.png">
<link rel="icon" media="(prefers-color-scheme: dark)" type="image/png" sizes="64x64" href="/favicon-dark-64x64.png">
<link rel="icon" media="(prefers-color-scheme: dark)" type="image/png" sizes="96x96" href="/favicon-dark-96x96.png">
<link rel="icon" media="(prefers-color-scheme: dark)" type="image/png" sizes="128x128" href="/favicon-dark-128x128.png">

<link rel="manifest" href="/site.webmanifest">`;
}

export function generateWebManifest(): string {
  return JSON.stringify(
    {
      name: 'My Website',
      short_name: 'My Website',
      icons: [
        {
          src: '/android-chrome-192x192.png',
          sizes: '192x192',
          type: 'image/png',
        },
        {
          src: '/android-chrome-512x512.png',
          sizes: '512x512',
          type: 'image/png',
        },
      ],
      theme_color: '#ffffff',
      background_color: '#ffffff',
      display: 'standalone',
    },
    null,
    2,
  );
}

export function generateReadmeHtml(htmlSnippet: string, webManifest: string): string {
  const escapeHtml = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Favicon Usage Instructions</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 800px; margin: 40px auto; padding: 0 20px; color: #1a1a1a; }
    h1 { font-size: 1.5rem; }
    h2 { font-size: 1.1rem; margin-top: 2rem; }
    pre { background: #f5f5f5; border: 1px solid #e0e0e0; border-radius: 6px; padding: 16px; overflow-x: auto; font-size: 0.875rem; }
    p { line-height: 1.6; }
  </style>
</head>
<body>
  <h1>Favicon Package</h1>
  <p>Place all favicon files in the root of your website (or your <code>public/</code> folder).</p>

  <h2>1. Add to your HTML <code>&lt;head&gt;</code></h2>
  <pre>${escapeHtml(htmlSnippet)}</pre>

  <h2>2. Create <code>site.webmanifest</code></h2>
  <pre>${escapeHtml(webManifest)}</pre>
</body>
</html>`;
}
