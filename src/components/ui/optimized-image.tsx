import React, { useState, useRef, useEffect } from 'react';
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
  quality?: number;
  onClick?: () => void;
  useIntersectionObserver?: boolean;
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
  placeholder,
  quality = 80,
  onClick,
  useIntersectionObserver = true
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(priority || !useIntersectionObserver);
  const imgRef = useRef<HTMLImageElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!useIntersectionObserver || priority || shouldLoad) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShouldLoad(true);
            observer.disconnect();
          }
        });
      },
      { rootMargin: '50px' }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [useIntersectionObserver, priority, shouldLoad]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  // Check if browser supports WebP
  const supportsWebP = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  };

  // Generate responsive image URLs with optimization
  const generateSrcSet = (baseSrc: string) => {
    if (baseSrc.includes('supabase')) {
      const baseQuality = priority ? Math.min(quality + 10, 90) : quality;
      const format = supportsWebP() ? 'webp' : 'jpeg';
      
      return [
        `${baseSrc}?width=400&quality=${Math.max(baseQuality - 20, 60)}&format=${format} 400w`,
        `${baseSrc}?width=800&quality=${baseQuality}&format=${format} 800w`,
        `${baseSrc}?width=1200&quality=${baseQuality}&format=${format} 1200w`,
        `${baseSrc}?width=1600&quality=${baseQuality}&format=${format} 1600w`
      ].join(', ');
    }
    
    return undefined;
  };

  // Generate optimized src URL
  const getOptimizedSrc = (baseSrc: string) => {
    if (baseSrc.includes('supabase')) {
      const baseQuality = priority ? Math.min(quality + 10, 90) : quality;
      const format = supportsWebP() ? 'webp' : 'jpeg';
      return `${baseSrc}?width=800&quality=${baseQuality}&format=${format}`;
    }
    return baseSrc;
  };

  const srcSet = shouldLoad ? generateSrcSet(src) : undefined;
  const optimizedSrc = shouldLoad ? getOptimizedSrc(src) : undefined;

  if (hasError && placeholder) {
    return (
      <div 
        className={cn(
          "flex items-center justify-center bg-muted text-muted-foreground rounded-md",
          className
        )}
      >
        <span className="text-sm">Image not available</span>
      </div>
    );
  }

  return (
    <div className={cn("relative overflow-hidden", className)} onClick={onClick}>
      {/* Loading placeholder with skeleton animation */}
      {!isLoaded && shouldLoad && (
        <div 
          className={cn(
            "absolute inset-0 bg-gradient-to-r from-muted via-muted/70 to-muted animate-pulse",
            "before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite]",
            "before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent",
            className
          )}
        />
      )}
      
      {/* Intersection observer target */}
      {!shouldLoad && (
        <div 
          ref={imgRef}
          className={cn(
            "bg-muted/50 flex items-center justify-center",
            className
          )}
        >
          <div className="animate-pulse w-8 h-8 bg-muted-foreground/20 rounded-full" />
        </div>
      )}
      
      {shouldLoad && (
        <img
          src={optimizedSrc}
          srcSet={srcSet}
          alt={alt}
          sizes={sizes}
          loading={priority ? 'eager' : loading}
          decoding={decoding}
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            "transition-all duration-500",
            isLoaded ? "opacity-100 scale-100" : "opacity-0 scale-95",
            onClick && "cursor-pointer hover:opacity-90",
            className
          )}
        />
      )}
    </div>
  );
};

export default OptimizedImage;