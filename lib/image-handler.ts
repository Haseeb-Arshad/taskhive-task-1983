/**
 * Image Handler Utilities
 * Handles image uploads, validation, compression, and base64 conversion.
 */

import type { ImageAsset } from './types';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_FORMATS = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const COMPRESSION_QUALITY = 0.8;

/**
 * Validate image file
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: `File size exceeds ${(MAX_FILE_SIZE / 1024 / 1024).toFixed(1)}MB limit` };
  }

  // Check file type
  if (!ALLOWED_FORMATS.includes(file.type)) {
    return { valid: false, error: `Unsupported format. Allowed: ${ALLOWED_FORMATS.join(', ')}` };
  }

  return { valid: true };
}

/**
 * Convert file to base64 string
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result);
    };
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Get image dimensions
 */
export function getImageDimensions(src: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
    // Allow CORS for external images
    img.crossOrigin = 'anonymous';
    img.src = src;
  });
}

/**
 * Compress image using canvas (client-side)
 */
export function compressImage(
  file: File,
  maxWidth: number = 1920,
  maxHeight: number = 1080,
  quality: number = COMPRESSION_QUALITY
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.naturalWidth;
        let height = img.naturalHeight;

        // Calculate scaling
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to compress image'));
              return;
            }
            resolve(blob);
          },
          file.type,
          quality
        );
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Generate a unique image ID
 */
function generateImageId(): string {
  return `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Process and create an ImageAsset from a File
 */
export async function processImageFile(
  file: File,
  alt: string = '',
  caption?: string
): Promise<ImageAsset> {
  // Validate
  const validation = validateImageFile(file);
  if (!validation.valid) {
    throw new Error(validation.error || 'Invalid image file');
  }

  // Compress if needed
  let processedFile = file;
  if (file.size > 2 * 1024 * 1024) {
    // Compress if over 2MB
    const compressedBlob = await compressImage(file);
    processedFile = new File([compressedBlob], file.name, { type: file.type });
  }

  // Convert to base64
  const base64 = await fileToBase64(processedFile);

  // Get dimensions
  const { width, height } = await getImageDimensions(base64);

  return {
    id: generateImageId(),
    src: base64,
    alt,
    caption,
    width,
    height,
    uploadedAt: new Date().toISOString(),
  };
}

/**
 * Create an ImageAsset from a URL
 */
export async function createImageAssetFromUrl(
  url: string,
  alt: string = '',
  caption?: string
): Promise<ImageAsset> {
  try {
    const { width, height } = await getImageDimensions(url);

    return {
      id: generateImageId(),
      src: url,
      alt,
      caption,
      width,
      height,
      uploadedAt: new Date().toISOString(),
    };
  } catch (error) {
    throw new Error(`Failed to process image from URL: ${String(error)}`);
  }
}

/**
 * Calculate image aspect ratio
 */
export function getImageAspectRatio(width?: number, height?: number): string | null {
  if (!width || !height) return null;
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  const divisor = gcd(width, height);
  return `${width / divisor}/${height / divisor}`;
}

/**
 * Get image size category
 */
export function getImageSizeCategory(size: number): string {
  const kb = size / 1024;
  if (kb < 100) return 'tiny';
  if (kb < 500) return 'small';
  if (kb < 1000) return 'medium';
  if (kb < 5000) return 'large';
  return 'huge';
}

/**
 * Validate and optimize image from file input
 */
export async function handleImageUpload(
  file: File,
  options: { alt?: string; caption?: string; compress?: boolean } = {}
): Promise<{ success: boolean; asset?: ImageAsset; error?: string }> {
  try {
    const { alt = '', caption = '', compress = true } = options;

    // Validate
    const validation = validateImageFile(file);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    // Process
    if (compress && file.size > 2 * 1024 * 1024) {
      const compressedBlob = await compressImage(file);
      const compressedFile = new File([compressedBlob], file.name, { type: file.type });
      const asset = await processImageFile(compressedFile, alt, caption);
      return { success: true, asset };
    }

    const asset = await processImageFile(file, alt, caption);
    return { success: true, asset };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

/**
 * Generate responsive image srcset (placeholder for future optimization)
 */
export function generateImageSrcSet(base64: string, alt: string = ''): string {
  // In production, this would generate multiple sizes
  // For now, return the base64 as-is
  return base64;
}

/**
 * Extract EXIF data from image (basic implementation)
 */
export async function getImageMetadata(
  file: File
): Promise<{
  name: string;
  size: number;
  type: string;
  lastModified: number;
}> {
  return {
    name: file.name,
    size: file.size,
    type: file.type,
    lastModified: file.lastModified,
  };
}
