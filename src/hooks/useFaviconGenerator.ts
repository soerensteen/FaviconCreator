import { useCallback, useEffect, useRef, useState } from 'react';
import type { GeneratedFavicon, GeneratorState } from '../types';
import { FAVICON_SPECS, DARK_FAVICON_SPECS, ICO_SIZES } from '../constants';
import { svgToPngBlob } from '../utils/svgToCanvas';
import { buildIco } from '../utils/icoBuilder';

interface UseFaviconGeneratorReturn {
  generatorState: GeneratorState;
  faviconsLight: GeneratedFavicon[];
  faviconsDark: GeneratedFavicon[];
  error: string | null;
  generate: (lightFile: File, darkFile?: File) => Promise<void>;
  reset: () => void;
}

async function generateFromFile(
  svgString: string,
  specs: typeof FAVICON_SPECS,
  objectUrlsRef: React.MutableRefObject<string[]>,
): Promise<GeneratedFavicon[]> {
  const pngSizes = Array.from(
    new Set([...ICO_SIZES, ...specs.filter((s) => !s.isIco && !s.isSvg).map((s) => s.size)]),
  );

  const sizeToBlob = new Map<number, Blob>();

  for (const size of pngSizes) {
    const blob = await svgToPngBlob(svgString, size);
    sizeToBlob.set(size, blob);
  }

  // Build ICO from 16, 32, 48 PNG blobs
  const icoBlobs = ICO_SIZES.map((s) => sizeToBlob.get(s)!);
  const icoBlob = await buildIco(icoBlobs);

  // SVG blob — wrap the original SVG text
  const svgBlob = new Blob([svgString], { type: 'image/svg+xml' });

  const generated: GeneratedFavicon[] = [];

  for (const spec of specs) {
    let blob: Blob;
    if (spec.isSvg) {
      blob = svgBlob;
    } else if (spec.isIco) {
      blob = icoBlob;
    } else {
      blob = sizeToBlob.get(spec.size)!;
    }

    const dataUrl = URL.createObjectURL(blob);
    objectUrlsRef.current.push(dataUrl);

    generated.push({ spec, blob, dataUrl });
  }

  return generated;
}

export function useFaviconGenerator(): UseFaviconGeneratorReturn {
  const [generatorState, setGeneratorState] = useState<GeneratorState>('idle');
  const [faviconsLight, setFaviconsLight] = useState<GeneratedFavicon[]>([]);
  const [faviconsDark, setFaviconsDark] = useState<GeneratedFavicon[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Track object URLs for cleanup
  const objectUrlsRef = useRef<string[]>([]);

  // Cleanup object URLs when component unmounts or on reset
  const cleanupUrls = useCallback(() => {
    objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    objectUrlsRef.current = [];
  }, []);

  useEffect(() => {
    return cleanupUrls;
  }, [cleanupUrls]);

  const reset = useCallback(() => {
    cleanupUrls();
    setFaviconsLight([]);
    setFaviconsDark([]);
    setGeneratorState('idle');
    setError(null);
  }, [cleanupUrls]);

  const generate = useCallback(async (lightFile: File, darkFile?: File) => {
    setGeneratorState('generating');
    setError(null);
    cleanupUrls();

    try {
      const lightSvg = await lightFile.text();
      const light = await generateFromFile(lightSvg, FAVICON_SPECS, objectUrlsRef);
      setFaviconsLight(light);

      if (darkFile) {
        const darkSvg = await darkFile.text();
        const dark = await generateFromFile(darkSvg, DARK_FAVICON_SPECS, objectUrlsRef);
        setFaviconsDark(dark);
      } else {
        setFaviconsDark([]);
      }

      setGeneratorState('ready');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(message);
      setGeneratorState('error');
    }
  }, [cleanupUrls]);

  return { generatorState, faviconsLight, faviconsDark, error, generate, reset };
}
