/**
 * Converts an SVG string to a PNG Blob at the specified size.
 *
 * Handles the common case where SVGs from design tools (Figma, Illustrator)
 * have fixed width/height (e.g., width="24") instead of percentage/auto.
 * Without normalization, drawing to a 512×512 canvas would produce a tiny
 * 24px result in the top-left corner.
 */
export async function svgToPngBlob(svgString: string, size: number): Promise<Blob> {
  const normalized = normalizeSvg(svgString, size);
  const blob = new Blob([normalized], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);

  try {
    const img = await loadImage(url);
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get 2D canvas context');
    ctx.drawImage(img, 0, 0, size, size);
    return await canvasToBlob(canvas);
  } finally {
    URL.revokeObjectURL(url);
  }
}

/**
 * Normalizes an SVG string so it renders at exactly `size`×`size` pixels.
 * - Ensures a viewBox exists (derived from width/height if needed)
 * - Forces width and height to the target pixel size
 */
function normalizeSvg(svgString: string, size: number): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgString, 'image/svg+xml');
  const svg = doc.documentElement;

  // Check for parse errors
  const parseError = doc.querySelector('parsererror');
  if (parseError) {
    throw new Error('Invalid SVG: ' + parseError.textContent);
  }

  const existingViewBox = svg.getAttribute('viewBox');
  const existingWidth = svg.getAttribute('width');
  const existingHeight = svg.getAttribute('height');

  // If no viewBox, construct one from width/height attributes
  if (!existingViewBox) {
    const w = parseFloat(existingWidth || '100');
    const h = parseFloat(existingHeight || '100');
    if (!isNaN(w) && !isNaN(h) && w > 0 && h > 0) {
      svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
    }
  }

  // Force dimensions to target size so browser scales correctly
  svg.setAttribute('width', String(size));
  svg.setAttribute('height', String(size));

  const serializer = new XMLSerializer();
  return serializer.serializeToString(doc);
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load SVG image from ${url}`));
    img.src = url;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('canvas.toBlob() returned null'));
    }, 'image/png');
  });
}
