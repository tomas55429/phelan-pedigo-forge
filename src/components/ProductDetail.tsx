import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FileText, ZoomIn, ZoomOut, RotateCcw, X, Share, ExternalLink } from 'lucide-react';
import { OptimizedImage } from '@/components/ui/optimized-image';
import Product3DViewer from './Product3DViewer';
import VariantDetail from './VariantDetail';
import { ProductVariantsTableNew } from './ProductVariantsTableNew';
import { generateProductUrl } from '@/utils/productUtils';
import { toast } from '@/components/ui/use-toast';
import type { ProductWithDetails, ProductVariant } from '@/types/product';

interface ProductDetailProps {
  productWithDetails: ProductWithDetails;
  onClose?: () => void;
  onImageEnlarge?: (imageUrl: string) => void;
  showShareButton?: boolean;
  className?: string;
}

const ProductDetail: React.FC<ProductDetailProps> = ({
  productWithDetails,
  onClose,
  onImageEnlarge,
  showShareButton = true,
  className = ""
}) => {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);

  const formatVariantName = (variant: ProductVariant): string => {
    const parts = [];
    if (variant.variant_name) parts.push(variant.variant_name);
    if (variant.height && variant.width && variant.length) {
      parts.push(`${variant.height}×${variant.width}×${variant.length}`);
    }
    return parts.join(' - ') || `Variant ${variant.id}`;
  };

  const handleShare = async () => {
    const url = `${window.location.origin}${generateProductUrl(productWithDetails.product.name, productWithDetails.product.id)}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: productWithDetails.product.name,
          text: `Check out this medical equipment: ${productWithDetails.product.name}`,
          url: url,
        });
      } catch (err) {
        // Fallback to clipboard
        navigator.clipboard.writeText(url);
        toast({
          title: "Link copied",
          description: "Product link copied to clipboard"
        });
      }
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(url);
      toast({
        title: "Link copied", 
        description: "Product link copied to clipboard"
      });
    }
  };

  const openInNewPage = () => {
    const url = generateProductUrl(productWithDetails.product.name, productWithDetails.product.id);
    window.open(url, '_blank');
  };

  return (
    <div className={className}>
      {/* Header Actions */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">{productWithDetails.product.name}</h1>
          <p className="text-xl text-muted-foreground">
            {productWithDetails.categories.length > 0 
              ? productWithDetails.categories.map(cat => cat.name).join(', ') 
              : 'Uncategorized'}
          </p>
        </div>
        
        {showShareButton && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button variant="outline" size="sm" onClick={openInNewPage}>
              <ExternalLink className="h-4 w-4 mr-2" />
              View Details
            </Button>
          </div>
        )}
      </div>
      
      <div className="grid lg:grid-cols-2 gap-12">
        {/* Left Column - Product Images */}
        <div>
          <h2 className="text-xl font-semibold mb-4">
            {productWithDetails.additionalImages && productWithDetails.additionalImages.length > 0 ? 'Product Images' : 'Product Image'}
          </h2>
          <div className="space-y-4">
            {(() => {
              const allImages = [
                ...(productWithDetails.product.image_url ? [{
                  url: productWithDetails.product.image_url,
                  description: 'Main Image'
                }] : []),
                ...(productWithDetails.additionalImages || []).map(img => ({
                  url: img.image_url,
                  description: img.description || 'Additional Image'
                }))
              ];

              if (allImages.length === 0) {
                return (
                  <div className="border-2 border-muted rounded-lg p-8 bg-muted/20 min-h-[400px] flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <p>No image available</p>
                      <p className="text-sm mt-2">
                        {productWithDetails.variants.length > 0 
                          ? `${formatVariantName(productWithDetails.variants[0])} will be considered the default, so display its image here` 
                          : 'Please add a product image'}
                      </p>
                    </div>
                  </div>
                );
              }

              return allImages.map((image, index) => (
                <div key={index} className="border-2 border-muted rounded-lg p-8 bg-muted/20 min-h-[300px] flex items-center justify-center">
                  <div className="relative group w-full">
                    <OptimizedImage 
                      src={image.url} 
                      alt={`${productWithDetails.product.name} - ${image.description}`} 
                      className="w-full h-auto object-contain max-h-96 rounded"
                      priority={index === 0}
                      quality={85}
                      onClick={() => onImageEnlarge?.(image.url)} 
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/10 rounded pointer-events-none">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="bg-background/90 backdrop-blur-sm pointer-events-auto" 
                        onClick={(e) => {
                          e.stopPropagation();
                          onImageEnlarge?.(image.url);
                        }}
                      >
                        <ZoomIn className="h-4 w-4 mr-2" />
                        Enlarge
                      </Button>
                    </div>
                    {image.description && image.description !== 'Main Image' && (
                      <div className="mt-2 text-center">
                        <p className="text-sm text-muted-foreground bg-background/80 rounded px-2 py-1">
                          {image.description}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ));
            })()}
          </div>
        </div>
        
        {/* Right Column - Product Information */}
        <div className="space-y-8">
          {/* Description */}
          {(() => {
            const description = productWithDetails.product.description || '';
            const cleanDescription = description.replace(/\n\n\[Custom Product ID: [^\]]+\]/g, '').trim();
            return cleanDescription && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Product Description</h2>
                <p className="text-muted-foreground leading-relaxed">
                  {cleanDescription}
                </p>
              </div>
            );
          })()}
           
          {/* Product Features */}
          {(() => {
            const productFeatures = productWithDetails.features.filter(feature => !feature.is_optional && !feature.variant_id);
            const hasFeatures = productFeatures.length > 0;
            return hasFeatures && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Features</h2>
                <div className="mb-4">
                  <ul className="space-y-2">
                    {productFeatures.map(feature => (
                      <li key={feature.id} className="flex items-start space-x-2">
                        <span className="text-lg leading-none mt-1">-</span>
                        <span className="font-medium">{feature.feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })()}
            
          {/* Available Accessories */}
          {(() => {
            const accessories = productWithDetails.features.filter(f => f.is_optional);
            const deduped = accessories.reduce((acc, item) => {
              if (!acc.some(a => a.feature === item.feature)) acc.push(item);
              return acc;
            }, [] as typeof accessories);
            return deduped.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Available Accessories</h2>
                <ul className="space-y-3">
                  {deduped.map(acc => (
                    <li key={acc.id} className="flex items-center gap-3">
                      {acc.image_url && (
                        <img 
                          src={acc.image_url} 
                          alt={acc.feature} 
                          className="w-16 h-16 rounded border object-cover cursor-pointer hover:opacity-80 transition-opacity" 
                          loading="lazy" 
                          decoding="async" 
                          sizes="64px" 
                          onClick={() => onImageEnlarge?.(acc.image_url)} 
                        />
                      )}
                      <span className="text-sm text-muted-foreground">{acc.feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })()}
           
          {/* Variants */}
          {productWithDetails.variants.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Variants</h2>
              <div className="space-y-3">
                {productWithDetails.variants.map(variant => (
                  <button 
                    key={variant.id} 
                    className="w-full p-4 text-left border-2 border-muted rounded-lg hover:border-primary/50 hover:bg-muted/30 transition-all" 
                    onClick={() => setSelectedVariant(variant)}
                  >
                    <div className="font-medium text-lg">
                      {formatVariantName(variant)}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* Special Notes */}
          {productWithDetails.product.special_notes && (
            <div className="p-4 bg-warning/10 border border-warning/20 rounded-lg">
              <h4 className="font-medium text-warning-foreground mb-2 flex items-center">
                <FileText className="h-4 w-4 mr-2" />
                Special Notes
              </h4>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {productWithDetails.product.special_notes}
              </p>
            </div>
          )}
        </div>
      </div>
      
      {/* 3D Model Section */}
      {productWithDetails.product.model_3d_url && (
        <div className="mt-12">
          <h2 className="text-xl font-semibold mb-4">3D Model</h2>
          <div className="border-2 border-muted rounded-lg overflow-hidden">
            <Product3DViewer 
              modelUrl={productWithDetails.product.model_3d_url} 
              productName={productWithDetails.product.name} 
              className="w-full h-[600px]" 
            />
          </div>
        </div>
      )}

      {/* Specifications Section */}
      {productWithDetails.specifications.length > 0 && (
        <div className="mt-12">
          <h2 className="text-xl font-semibold mb-4">Technical Specifications</h2>
          <div className="w-full">
            <ProductVariantsTableNew 
              productId={productWithDetails.product.id} 
              variants={productWithDetails.variants} 
              specifications={productWithDetails.specifications} 
            />
          </div>
        </div>
      )}

      {/* Variant Details Modal */}
      {selectedVariant && (
        <VariantDetail 
          variant={selectedVariant} 
          productName={productWithDetails.product.name} 
          productId={productWithDetails.product.id} 
          features={productWithDetails.features} 
          specifications={productWithDetails.specifications} 
          onClose={() => setSelectedVariant(null)} 
          onImageEnlarge={onImageEnlarge} 
        />
      )}
    </div>
  );
};

export default ProductDetail;