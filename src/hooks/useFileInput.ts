import { useCallback, useEffect, useRef, useState } from 'react';

interface UseFileInputOptions {
  onFile: (file: File) => void;
  enablePaste?: boolean;
}

interface UseFileInputReturn {
  isDragging: boolean;
  dropZoneProps: {
    onDragEnter: React.DragEventHandler;
    onDragOver: React.DragEventHandler;
    onDragLeave: React.DragEventHandler;
    onDrop: React.DragEventHandler;
  };
  openFilePicker: () => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
}

function isSvgFile(file: File): boolean {
  return file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg');
}

export function useFileInput({ onFile, enablePaste = true }: UseFileInputOptions): UseFileInputReturn {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const dragCounterRef = useRef(0);

  const handleDragEnter: React.DragEventHandler = useCallback((e) => {
    e.preventDefault();
    dragCounterRef.current++;
    setIsDragging(true);
  }, []);

  const handleDragOver: React.DragEventHandler = useCallback((e) => {
    e.preventDefault();
  }, []);

  const handleDragLeave: React.DragEventHandler = useCallback((e) => {
    e.preventDefault();
    dragCounterRef.current--;
    if (dragCounterRef.current === 0) {
      setIsDragging(false);
    }
  }, []);

  const handleDrop: React.DragEventHandler = useCallback(
    (e) => {
      e.preventDefault();
      dragCounterRef.current = 0;
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file && isSvgFile(file)) {
        onFile(file);
      }
    },
    [onFile],
  );

  const openFilePicker = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // Clipboard paste support (Ctrl+V / Cmd+V)
  useEffect(() => {
    if (!enablePaste) return;

    const handlePaste = async (e: ClipboardEvent) => {
      // Check for SVG file in clipboard
      const items = e.clipboardData?.items;
      if (!items) return;

      for (const item of Array.from(items)) {
        if (item.kind === 'file') {
          const file = item.getAsFile();
          if (file && isSvgFile(file)) {
            onFile(file);
            return;
          }
        }
        // Check for SVG text pasted directly
        if (item.kind === 'string' && item.type === 'text/plain') {
          item.getAsString((text) => {
            const trimmed = text.trim();
            if (trimmed.startsWith('<svg') || trimmed.startsWith('<?xml')) {
              const blob = new Blob([trimmed], { type: 'image/svg+xml' });
              const file = new File([blob], 'pasted.svg', { type: 'image/svg+xml' });
              onFile(file);
            }
          });
          return;
        }
      }
    };

    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [onFile, enablePaste]);

  return {
    isDragging,
    dropZoneProps: {
      onDragEnter: handleDragEnter,
      onDragOver: handleDragOver,
      onDragLeave: handleDragLeave,
      onDrop: handleDrop,
    },
    openFilePicker,
    fileInputRef,
  };
}
