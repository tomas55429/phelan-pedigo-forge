import React, { useState } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  onLoad?: () => void;
  onError?: () => void;
  loading?: 'lazy' | 'eager';
  decoding?: 'auto' | 'async' | 'sync';
  placeholder?: string;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className,
  sizes = "(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw",
  priority = false,
  onLoad,
  onError,
  loading = 'lazy',
  decoding = 'async',
  placeholder
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  // Generate responsive image URLs if the source supports it
  const generateSrcSet = (baseSrc: string) => {
    // For Supabase storage URLs, we can add transform parameters
    if (baseSrc.includes('supabase')) {
      const url = new URL(baseSrc);
      return [
        `${baseSrc}?width=400&quality=80 400w`,
        `${baseSrc}?width=800&quality=80 800w`,
        `${baseSrc}?width=1200&quality=80 1200w`
      ].join(', ');
    }
    
    // For other URLs, just return the original
    return undefined;
  };

  const srcSet = generateSrcSet(src);

  if (hasError && placeholder) {
    return (
      <div 
        className={cn(
          "flex items-center justify-center bg-muted text-muted-foreground",
          className
        )}
      >
        <span className="text-sm">Image not available</span>
      </div>
    );
  }

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {/* Loading placeholder */}
      {!isLoaded && (
        <div 
          className={cn(
            "absolute inset-0 bg-muted animate-pulse",
            className
          )}
        />
      )}
      
      <img
        src={src}
        srcSet={srcSet}
        alt={alt}
        sizes={sizes}
        loading={priority ? 'eager' : loading}
        decoding={decoding}
        onLoad={handleLoad}
        onError={handleError}
        className={cn(
          "transition-opacity duration-300",
          isLoaded ? "opacity-100" : "opacity-0",
          className
        )}
      />
    </div>
  );
};

export default OptimizedImage;