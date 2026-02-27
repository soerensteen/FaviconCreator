export interface FaviconSpec {
  id: string;
  filename: string;
  size: number;
  label: string;
  isIco?: boolean;
  variant: 'light' | 'dark';
}

export interface GeneratedFavicon {
  spec: FaviconSpec;
  blob: Blob;
  dataUrl: string;
}

export type GeneratorState = 'idle' | 'generating' | 'ready' | 'error';
