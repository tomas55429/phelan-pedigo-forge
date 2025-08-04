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
  const variantFeatures = features.filter(f => f.variant_id === variant.id);
  const variantSpecs = specifications.filter(s => s.variant_id === variant.id);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-background rounded-lg p-6 max-w-6xl w-full max-h-[90vh] overflow-y-auto relative">
        {/* Floating Close Button */}
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onClose}
          className="fixed top-[50px] right-[40px] z-10 bg-background/90 backdrop-blur-sm hover:bg-background shadow-lg border-2"
        >
          <X className="h-4 w-4" />
        </Button>
        
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-3xl font-bold">{productName}</h2>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline" className="text-lg px-3 py-1">
                {variant.variant_name}
              </Badge>
            </div>
            {variant.variant_description && (
              <p className="text-muted-foreground text-lg mt-2">{variant.variant_description}</p>
            )}
          </div>
        </div>
        
        <div className="grid lg:grid-cols-2 gap-8 mb-6">
          {/* Left Column - 3D Viewer and Traditional Image */}
          <div className="space-y-4">
            {/* 3D Product Viewer */}
            {variant.model_3d_url && (
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-3">3D Variant View</h3>
                <Product3DViewer 
                  modelUrl={variant.model_3d_url} 
                  imageUrl={variant.image_url} 
                  productName={`${productName} - ${variant.variant_name}`} 
                  className="w-full h-96 sm:h-80 md:h-96 lg:h-[28rem]" 
                />
              </div>
            )}
            
            {/* Traditional Variant Image */}
            {variant.image_url && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Variant Image</h3>
                <div className="relative group">
                  <img 
                    src={variant.image_url} 
                    alt={`${productName} - ${variant.variant_name}`} 
                    className="w-full h-80 sm:h-72 md:h-80 lg:h-96 object-cover rounded-lg border border-border cursor-pointer hover:opacity-90 transition-opacity" 
                    onClick={() => onImageEnlarge?.(variant.image_url!)}
                  />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 rounded-lg">
                    <Button variant="outline" size="sm" className="bg-background/90 backdrop-blur-sm">
                      <ZoomIn className="h-4 w-4 mr-2" />
                      Enlarge
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Right Column - Variant Details */}
          <div className="space-y-6">
            {/* Variant Features */}
            {variantFeatures.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Variant Features</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {variantFeatures.map((feature) => (
                      <li key={feature.id} className="flex items-center space-x-2">
                        <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></span>
                        <span className="text-sm">{feature.feature}</span>
                        {feature.is_optional && (
                          <Badge variant="secondary" className="text-xs">Optional</Badge>
                        )}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
            
            {/* Variant Specifications */}
            {variantSpecs.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Variant Specifications</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {variantSpecs
                      .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
                      .map((spec) => (
                        <div key={spec.id} className="flex justify-between items-center py-2 border-b border-border last:border-b-0">
                          <span className="font-medium text-sm">{spec.specification_key}</span>
                          <span className="text-sm text-muted-foreground">{spec.specification_value}</span>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VariantDetail;