import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check } from 'lucide-react';

interface ProductFeature {
  id: string;
  product_id: string;
  variant_id: string | null;
  feature: string;
  is_optional?: boolean;
  image_url?: string;
}

interface ProductFeaturesProps {
  productId: string;
  className?: string;
}

export const ProductFeatures: React.FC<ProductFeaturesProps> = ({ 
  productId, 
  className = "" 
}) => {
  const [features, setFeatures] = useState<ProductFeature[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeatures();
  }, [productId]);

  const fetchFeatures = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('product_features')
        .select('*')
        .eq('product_id', productId)
        .is('variant_id', null) // Only get product-level features (not variant-specific)
        .order('is_optional', { ascending: true })
        .order('feature', { ascending: true });

      if (error) throw error;
      setFeatures(data || []);
    } catch (error) {
      console.error('Error fetching product features:', error);
    } finally {
      setLoading(false);
    }
  };

  // Don't render anything if there are no features
  if (loading || features.length === 0) {
    return null;
  }

  const standardFeatures = features.filter(f => !f.is_optional);
  const optionalFeatures = features.filter(f => f.is_optional);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Standard Features */}
      {standardFeatures.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {standardFeatures.map((feature) => (
                <div key={feature.id} className="flex items-start space-x-3">
                  <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{feature.feature}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Optional Features/Accessories */}
      {optionalFeatures.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Optional Features & Accessories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {optionalFeatures.map((feature) => (
                <div key={feature.id} className="flex items-start space-x-3 p-3 border rounded-lg bg-blue-50/50">
                  <Check className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <span className="text-sm font-medium">{feature.feature}</span>
                    {feature.image_url && (
                      <div className="mt-2">
                        <img 
                          src={feature.image_url} 
                          alt={feature.feature}
                          className="w-full h-24 object-cover rounded border"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};