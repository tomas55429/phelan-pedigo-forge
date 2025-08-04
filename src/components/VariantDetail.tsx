import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import Product3DViewer from './Product3DViewer';
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
  variant_id?: string;
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
  features: ProductFeature[];
  specifications: ProductSpecification[];
  onClose: () => void;
  onImageEnlarge?: (imageUrl: string) => void;
}
export const VariantDetail: React.FC<VariantDetailProps> = ({
  variant,
  productName,
  features,
  specifications,
  onClose,
  onImageEnlarge
}) => {
  // Helper function to format variant name to show only name and number
  const formatVariantName = (variantName: string) => {
    // Extract just the name and model number, removing extra descriptive text
    const name = variantName || '';
    // Look for pattern like "Name Number-Letter" or just return the first part if it follows that pattern
    const match = name.match(/^([^,]+?)(?:\s*[,-]\s*(.+))?$/);
    if (match) {
      const mainPart = match[1].trim();
      // If there's a model number pattern, include it
      const modelMatch = mainPart.match(/^(.+?)\s+([A-Z0-9-]+[A-Z])$/);
      if (modelMatch) {
        return `${modelMatch[1]} ${modelMatch[2]}`;
      }
      return mainPart;
    }
    return name;
  };
  const variantFeatures = features.filter(f => f.variant_id === variant.id);
  const variantSpecs = specifications.filter(s => s.variant_id === variant.id);
  const sizeSpecs = variantSpecs.filter(spec => spec.specification_key.toLowerCase().includes('size') || spec.specification_key.toLowerCase().includes('dimension') || spec.specification_key.toLowerCase().includes('length') || spec.specification_key.toLowerCase().includes('width') || spec.specification_key.toLowerCase().includes('height'));
  return <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-background rounded-lg p-8 max-w-7xl w-full max-h-[90vh] overflow-y-auto relative">
        {/* Floating Close Button */}
        <Button variant="outline" size="sm" onClick={onClose} className="absolute top-4 right-4 z-10 bg-background/90 backdrop-blur-sm hover:bg-background shadow-lg border-2">
          <X className="h-4 w-4" />
        </Button>
        
        {/* Variant Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">{formatVariantName(variant.variant_name)}</h1>
        </div>
        
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Left Column - Variant Details */}
          <div className="space-y-8">
            {/* Description */}
            <div>
              
              {variant.variant_description && <p className="text-muted-foreground leading-relaxed">
                  {variant.variant_description}
                </p>}
            </div>
            
            {/* Variant Features */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Variant Features</h2>
              
              {variantFeatures.length > 0 ? <ul className="space-y-2">
                  {variantFeatures.map(feature => <li key={feature.id} className="flex items-start space-x-2">
                      <span className="text-lg leading-none mt-1">-</span>
                      <span>{feature.feature}</span>
                      {feature.is_optional && <Badge variant="secondary" className="text-xs ml-2">Optional</Badge>}
                    </li>)}
                </ul> : <ul className="space-y-2 text-muted-foreground">
                  
                </ul>}
            </div>
            
            {/* Sizes */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Sizes</h2>
              <div className="border-2 border-muted rounded-lg p-6 bg-muted/10 min-h-[200px] flex items-center justify-center">
                {sizeSpecs.length > 0 ? <div className="w-full">
                    <div className="text-center mb-4 text-lg font-medium">
                      Size Chart for {formatVariantName(variant.variant_name)}
                    </div>
                    
                    <div className="space-y-3">
                      {sizeSpecs.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)).map(spec => <div key={spec.id} className="flex justify-between items-center py-2 border-b border-border last:border-b-0">
                            <span className="font-medium">{spec.specification_key}</span>
                            <span className="text-muted-foreground">{spec.specification_value}</span>
                          </div>)}
                    </div>
                  </div> : <div className="text-center text-muted-foreground">
                    <div className="text-lg mb-2">Size Chart for {formatVariantName(variant.variant_name)}</div>
                    <div className="text-sm mb-4">
                      (a cropped version of the general specs table that only includes size info for this variant)
                    </div>
                    <p className="text-sm">No size specifications available</p>
                  </div>}
              </div>
              <div className="mt-4 text-sm text-muted-foreground">
                Custom sizes are available
              </div>
            </div>
          </div>
          
          {/* Right Column - 3D Viewer and Image */}
          <div className="space-y-8">
            {/* 3D Model Viewer */}
            <div>
              <h2 className="text-xl font-semibold mb-4">3D Model Viewer</h2>
              <div className="border-2 border-muted rounded-lg p-6 bg-muted/10 min-h-[300px] flex items-center justify-center">
                {variant.model_3d_url ? <Product3DViewer modelUrl={variant.model_3d_url} imageUrl={variant.image_url} productName={`${productName} - ${formatVariantName(variant.variant_name)}`} className="w-full h-80" /> : <div className="text-center text-muted-foreground">
                    <div className="text-lg mb-2">3D model of {formatVariantName(variant.variant_name)}</div>
                    <p className="text-sm">No 3D model available</p>
                  </div>}
              </div>
            </div>
            
            {/* Product Image */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Product Image</h2>
              <div className="border-2 border-muted rounded-lg p-6 bg-muted/10 min-h-[300px] flex items-center justify-center">
                {variant.image_url ? <div className="relative group w-full">
                    <img src={variant.image_url} alt={`${productName} - ${formatVariantName(variant.variant_name)}`} className="w-full h-auto object-contain max-h-80 rounded cursor-pointer hover:opacity-90 transition-opacity" onClick={() => onImageEnlarge?.(variant.image_url!)} />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/10 rounded">
                      <Button variant="outline" size="sm" className="bg-background/90 backdrop-blur-sm">
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