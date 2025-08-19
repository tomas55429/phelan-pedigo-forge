import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import Product3DViewer from './Product3DViewer';
import { ProductVariantsTableNew } from './ProductVariantsTableNew';
interface ProductVariant {
  id: string;
  variant_name: string;
  variant_description?: string;
  image_url?: string;
  model_3d_url?: string;
}
interface ProductFeature {
  id: string;
  feature: string;
  is_optional?: boolean;
  variant_id: string; // Now required since all features must belong to variants
  image_url?: string;
}
interface ProductSpecification {
  id: string;
  variant_id?: string;
  specification_key: string;
  specification_value: string;
  sort_order?: number;
}
interface VariantDetailProps {
  variant: ProductVariant;
  productName: string;
  productId: string; // Add productId for the new table
  features: ProductFeature[];
  specifications: ProductSpecification[];
  onClose: () => void;
  onImageEnlarge?: (imageUrl: string) => void;
}
export const VariantDetail: React.FC<VariantDetailProps> = ({
  variant,
  productName,
  productId,
  features,
  specifications,
  onClose,
  onImageEnlarge
}) => {
  // Helper function to format variant name - only removes trailing product codes after hyphens
  const formatVariantName = (variantName: string) => {
    const name = variantName || '';
    
    // If name starts with hyphen, return the full name
    if (name.startsWith('-')) {
      return name;
    }
    
    // Otherwise, remove hyphen and everything after it (product codes)
    const cleanName = name.split('-')[0].trim();
    return cleanName;
  };
  const variantFeatures = features.filter(f => f.variant_id === variant.id);
  const variantSpecs = specifications.filter(s => s.variant_id === variant.id);
  const sizeSpecs = specifications.filter(spec => (spec.variant_id === variant.id || spec.variant_id === null) && (spec.specification_key.toLowerCase().includes('size') || spec.specification_key.toLowerCase().includes('dimension') || spec.specification_key.toLowerCase().includes('length') || spec.specification_key.toLowerCase().includes('lenght') ||
  // Handle misspelling
  spec.specification_key.toLowerCase().includes('width') || spec.specification_key.toLowerCase().includes('height')));
  return <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-2 md:p-4 z-50">
      <div className="bg-background rounded-lg p-4 md:p-8 max-w-7xl w-full max-h-[95vh] md:max-h-[90vh] overflow-y-auto relative">
        {/* Floating Close Button */}
        <Button variant="outline" size="sm" onClick={onClose} className="fixed top-2 right-2 md:top-4 md:right-4 z-50 bg-background/90 backdrop-blur-sm hover:bg-background shadow-lg border-2 touch-manipulation">
          <X className="h-4 w-4" />
        </Button>
        
        {/* Variant Header */}
        <div className="mb-6 md:mb-8 pr-12">
          <h1 className="text-2xl md:text-4xl font-bold mb-2">{formatVariantName(variant.variant_name)}</h1>
        </div>
        
        <div className="grid lg:grid-cols-2 gap-6 md:gap-12">
          {/* Left Column - Variant Details */}
          <div className="space-y-6 md:space-y-8">
            {/* Description */}
            <div>
              
              {variant.variant_description && <p className="text-muted-foreground leading-relaxed">
                  {variant.variant_description}
                </p>}
            </div>
            
            {/* Variant Features */}
            <div>
              <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-4">Variant Features</h2>
              
              {variantFeatures.length > 0 ? <div className="space-y-3">
                  {variantFeatures.map(feature => (
                    <div key={feature.id} className="flex items-start space-x-2">
                      <span className="text-lg leading-none mt-1">-</span>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span>{feature.feature}</span>
                          {feature.is_optional && <Badge variant="secondary" className="text-xs">Optional</Badge>}
                        </div>
                        {feature.image_url && (
                          <div className="mt-2">
                            <img 
                              src={feature.image_url} 
                              alt={feature.feature}
                              className="w-full h-24 object-cover rounded border cursor-pointer hover:opacity-90 transition-opacity"
                              onClick={() => window.open(feature.image_url, '_blank')}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div> : <ul className="space-y-2 text-muted-foreground">
                  
                </ul>}
            </div>
            
            {/* Size Chart */}
            <div>
              <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-4">Size Chart</h2>
              <div className="border-2 border-muted rounded-lg overflow-x-auto overflow-y-hidden">
                {specifications.length > 0 ? (
                  <ProductVariantsTableNew 
                    productId={productId}
                    variants={[variant]}
                    specifications={specifications}
                  />
                ) : (
                  <div className="p-6 bg-muted/10 min-h-[200px] flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <div className="text-lg mb-2">Size Chart for {formatVariantName(variant.variant_name)}</div>
                      <p className="text-sm">No specifications available</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="mt-4 text-sm text-muted-foreground text-center">
                Custom sizes available
              </div>
            </div>
          </div>
          
          {/* Right Column - 3D Viewer and Image */}
          <div className="space-y-6 md:space-y-8">
            {/* 3D Model Viewer */}
            <div>
              <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-4">3D Model Viewer</h2>
              <div className="border-2 border-muted rounded-lg p-3 md:p-6 bg-muted/10 min-h-[250px] md:min-h-[300px] flex items-center justify-center">
                {variant.model_3d_url ? <Product3DViewer modelUrl={variant.model_3d_url} imageUrl={variant.image_url} productName={`${productName} - ${formatVariantName(variant.variant_name)}`} className="w-full h-60 md:h-80" /> : <div className="text-center text-muted-foreground">
                    <div className="text-lg mb-2">3D model of {formatVariantName(variant.variant_name)}</div>
                    <p className="text-sm">No 3D model available</p>
                  </div>}
              </div>
            </div>
            
            {/* Product Image */}
            <div>
              <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-4">Product Image</h2>
              <div className="border-2 border-muted rounded-lg p-3 md:p-6 bg-muted/10 min-h-[250px] md:min-h-[300px] flex items-center justify-center">
                {variant.image_url ? <div className="relative group w-full">
                    <img src={variant.image_url} alt={`${productName} - ${formatVariantName(variant.variant_name)}`} className="w-full h-auto object-contain max-h-60 md:max-h-80 rounded cursor-pointer hover:opacity-90 transition-opacity touch-manipulation" onClick={() => onImageEnlarge?.(variant.image_url!)} />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/10 rounded pointer-events-none">
                      <Button variant="outline" size="sm" className="bg-background/90 backdrop-blur-sm pointer-events-auto touch-manipulation" onClick={e => {
                    e.stopPropagation();
                    onImageEnlarge?.(variant.image_url!);
                  }}>
                        <ZoomIn className="h-4 w-4 mr-2" />
                        Enlarge
                      </Button>
                    </div>
                  </div> : <div className="text-center text-muted-foreground">
                    <div className="text-lg mb-2">Image of {formatVariantName(variant.variant_name)}</div>
                    <p className="text-sm">No variant image available</p>
                  </div>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>;
};
export default VariantDetail;