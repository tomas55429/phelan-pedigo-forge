/**
 * Image optimization utilities for better page performance
 */

export interface ImageCompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png';
}

export interface ResponsiveImageSizes {
  small: { width: number; height: number };
  medium: { width: number; height: number };
  large: { width: number; height: number };
}

/**
 * Compress an image file for optimized upload
 */
export const compressImage = async (
  file: File,
  options: ImageCompressionOptions = {}
): Promise<Blob> => {
  const {
    maxWidth = 1920,
    maxHeight = 1920,
    quality = 0.8,
    format = 'webp'
  } = options;

  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Could not get canvas context'));
      return;
    }

    img.onload = () => {
      // Calculate new dimensions maintaining aspect ratio
      let { width, height } = img;
      
      if (width > maxWidth || height > maxHeight) {
        const aspectRatio = width / height;
        
        if (width > height) {
          width = maxWidth;
          height = width / aspectRatio;
          
          if (height > maxHeight) {
            height = maxHeight;
            width = height * aspectRatio;
          }
        } else {
          height = maxHeight;
          width = height * aspectRatio;
          
          if (width > maxWidth) {
            width = maxWidth;
            height = width / aspectRatio;
          }
        }
      }

      canvas.width = width;
      canvas.height = height;

      // Draw and compress the image
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to compress image'));
          }
        },
        `image/${format}`,
        quality
      );
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Generate multiple sizes of an image for responsive loading
 */
export const generateResponsiveImages = async (
  file: File,
  sizes: ResponsiveImageSizes = {
    small: { width: 400, height: 300 },
    medium: { width: 800, height: 600 },
    large: { width: 1200, height: 900 }
  }
): Promise<{ [key: string]: Blob }> => {
  const results: { [key: string]: Blob } = {};

  for (const [sizeKey, dimensions] of Object.entries(sizes)) {
    try {
      const compressedBlob = await compressImage(file, {
        maxWidth: dimensions.width,
        maxHeight: dimensions.height,
        quality: 0.8,
        format: 'webp'
      });
      results[sizeKey] = compressedBlob;
    } catch (error) {
      console.warn(`Failed to generate ${sizeKey} size:`, error);
    }
  }

  return results;
};

/**
 * Check if browser supports WebP format
 */
export const supportsWebP = (): boolean => {
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
};

/**
 * Get optimized image format based on browser support
 */
export const getOptimalFormat = (originalFormat?: string): 'webp' | 'jpeg' | 'png' => {
  if (supportsWebP()) {
    return 'webp';
  }
  
  if (originalFormat === 'png') {
    return 'png';
  }
  
  return 'jpeg';
};

/**
 * Create a file name with optimization suffix
 */
export const createOptimizedFileName = (
  originalName: string,
  size: string,
  format: string
): string => {
  const nameWithoutExt = originalName.replace(/\.[^/.]+$/, '');
  return `${nameWithoutExt}_${size}.${format}`;
};