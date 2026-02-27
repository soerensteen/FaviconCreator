/**
 * Builds a real multi-resolution .ico file from PNG Blobs.
 *
 * ICO format (modern, PNG-embedded):
 *   - 6-byte ICONDIR header
 *   - 16-byte ICONDIRENTRY per image
 *   - Raw PNG data concatenated at the end
 *
 * Magic bytes: 00 00 01 00  (idReserved=0, idType=1)
 */
export async function buildIco(pngBlobs: Blob[]): Promise<Blob> {
  const pngBuffers = await Promise.all(pngBlobs.map((b) => b.arrayBuffer()));

  const numImages = pngBuffers.length;
  const headerSize = 6;
  const entrySize = 16;
  const directorySize = headerSize + entrySize * numImages;

  const totalSize =
    directorySize + pngBuffers.reduce((acc, buf) => acc + buf.byteLength, 0);

  const buffer = new ArrayBuffer(totalSize);
  const view = new DataView(buffer);

  // ICONDIR header (6 bytes)
  view.setUint16(0, 0, true);  // idReserved = 0
  view.setUint16(2, 1, true);  // idType = 1 (ICO)
  view.setUint16(4, numImages, true); // idCount

  // ICONDIRENTRY array (16 bytes each)
  let dataOffset = directorySize;

  for (let i = 0; i < numImages; i++) {
    const png = pngBuffers[i];
    const size = getIcoSize(png);
    const entryOffset = headerSize + i * entrySize;

    view.setUint8(entryOffset + 0, size === 256 ? 0 : size);  // bWidth (0 means 256)
    view.setUint8(entryOffset + 1, size === 256 ? 0 : size);  // bHeight
    view.setUint8(entryOffset + 2, 0);   // bColorCount (0 = not palette)
    view.setUint8(entryOffset + 3, 0);   // bReserved
    view.setUint16(entryOffset + 4, 1, true);  // wPlanes
    view.setUint16(entryOffset + 6, 32, true); // wBitCount
    view.setUint32(entryOffset + 8, png.byteLength, true);   // dwBytesInRes
    view.setUint32(entryOffset + 12, dataOffset, true); // dwImageOffset

    dataOffset += png.byteLength;
  }

  // Copy PNG data after the directory
  let writeOffset = directorySize;
  for (const png of pngBuffers) {
    const src = new Uint8Array(png);
    const dst = new Uint8Array(buffer, writeOffset);
    dst.set(src);
    writeOffset += png.byteLength;
  }

  return new Blob([buffer], { type: 'image/x-icon' });
}

/**
 * Reads the PNG IHDR chunk to get image dimensions.
 * PNG header: 8 bytes signature, then 4-byte length, 4-byte "IHDR",
 * then 4-byte width, 4-byte height.
 */
function getIcoSize(pngBuffer: ArrayBuffer): number {
  const view = new DataView(pngBuffer);
  // Width is at offset 16 in a standard PNG
  return view.getInt32(16, false); // big-endian
}
