/**
 * Client-side image compression and WebP conversion.
 * Uses Canvas API — works in all modern browsers.
 */

const MAX_DIMENSION = 2048;
const DEFAULT_QUALITY = 0.82;

/**
 * Compresses an image file to WebP format with optional resizing.
 * Returns a new File object ready for upload.
 */
export async function compressImage(
  file: File,
  options?: {
    maxDimension?: number;
    quality?: number;
  }
): Promise<File> {
  const maxDim = options?.maxDimension ?? MAX_DIMENSION;
  const quality = options?.quality ?? DEFAULT_QUALITY;

  // Load image into an HTMLImageElement
  const img = await loadImage(file);

  // Calculate new dimensions (maintain aspect ratio)
  let { width, height } = img;
  if (width > maxDim || height > maxDim) {
    if (width > height) {
      height = Math.round((height / width) * maxDim);
      width = maxDim;
    } else {
      width = Math.round((width / height) * maxDim);
      height = maxDim;
    }
  }

  // Draw to canvas
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context not available");
  ctx.drawImage(img, 0, 0, width, height);

  // Convert to WebP blob
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Canvas toBlob failed"))),
      "image/webp",
      quality
    );
  });

  // Create a new File with .webp extension
  const baseName = file.name.replace(/\.[^.]+$/, "");
  return new File([blob], `${baseName}.webp`, { type: "image/webp" });
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Image load failed"));
    };
    img.src = url;
  });
}
