import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Phone, X, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Product = Tables<'products'>;
type Category = Tables<'categories'>;

interface ProductWithCategory {
  product: Product;
  category: Category | null;
}

const CustomSolutionsPage = () => {
  const [customProducts, setCustomProducts] = useState<ProductWithCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null);
  const [imageZoom, setImageZoom] = useState(1);
  const [imagePan, setImagePan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Reset zoom and pan when image changes
  useEffect(() => {
    if (enlargedImage) {
      setImageZoom(1);
      setImagePan({ x: 0, y: 0 });
    }
  }, [enlargedImage]);

  // Image zoom and pan handlers
  const handleZoomIn = () => {
    setImageZoom(prev => Math.min(prev * 1.5, 5));
  };

  const handleZoomOut = () => {
    setImageZoom(prev => Math.max(prev / 1.5, 0.5));
  };

  const resetZoom = () => {
    setImageZoom(1);
    setImagePan({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (imageZoom > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - imagePan.x,
        y: e.clientY - imagePan.y
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && imageZoom > 1) {
      setImagePan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setImageZoom(prev => Math.min(Math.max(prev * delta, 0.5), 5));
  };

  useEffect(() => {
    const fetchCustomProducts = async () => {
      try {
        setLoading(true);

        // First, find the "Custom" category
        const { data: customCategory, error: categoryError } = await supabase
          .from('categories')
          .select('*')
          .ilike('name', '%custom%')
          .single();

        if (categoryError && categoryError.code !== 'PGRST116') {
          console.error('Error fetching custom category:', categoryError);
          return;
        }

        if (!customCategory) {
          console.log('No custom category found');
          setCustomProducts([]);
          return;
        }

        // Then fetch products in the custom category
        const { data: productCategories, error: pcError } = await supabase
          .from('product_categories')
          .select('product_id')
          .eq('category_id', customCategory.id);

        if (pcError) {
          console.error('Error fetching product categories:', pcError);
          return;
        }

        if (!productCategories || productCategories.length === 0) {
          setCustomProducts([]);
          return;
        }

        const productIds = productCategories.map(pc => pc.product_id);

        // Fetch the actual products
        const { data: products, error: productsError } = await supabase
          .from('products')
          .select('*')
          .in('id', productIds)
          .not('image_url', 'is', null); // Only get products with images

        if (productsError) {
          console.error('Error fetching products:', productsError);
          return;
        }

        // Combine products with category info
        const productsWithCategory = (products || []).map(product => ({
          product,
          category: customCategory
        }));

        setCustomProducts(productsWithCategory);
      } catch (error) {
        console.error('Error fetching custom solutions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomProducts();
  }, []);

  // Keyboard event handler for ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && enlargedImage) {
        setEnlargedImage(null);
      }
    };

    if (enlargedImage) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [enlargedImage]);

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-center min-h-64">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Loading custom solutions...</span>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      <div className="py-20 bg-background">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Previous Custom Solutions
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Explore our portfolio of custom medical equipment solutions. Each piece is 
              designed and manufactured to meet specific client requirements with precision and quality.
            </p>
          </div>

          {customProducts.length === 0 ? (
            <div className="text-center py-16">
              <h3 className="text-2xl font-semibold text-foreground mb-4">
                No Custom Solutions Available
              </h3>
              <p className="text-lg text-muted-foreground mb-8">
                We haven't added any custom solution examples to our gallery yet. 
                However, we've been creating custom medical equipment since 1948.
              </p>
              <Card className="bg-primary/5 border border-primary/20 max-w-2xl mx-auto">
                <CardContent className="p-8 text-center">
                  <h4 className="text-xl font-bold text-foreground mb-4">
                    Need a Custom Solution?
                  </h4>
                  <p className="text-muted-foreground mb-6">
                    Contact our specialists to discuss your unique requirements and see how we can help.
                  </p>
                  <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary-dark">
                    <Phone className="mr-2 h-5 w-5" />
                    Call 1-800-328-2358
                  </Button>
                </CardContent>
              </Card>
            </div>
          ) : (
            <>
              {/* Photo Gallery */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
                {customProducts.map(({ product }) => (
                  <Card key={product.id} className="professional-hover bg-card shadow-card overflow-hidden">
                    <div className="relative">
                      <img
                        src={product.image_url!}
                        alt={product.name}
                        className="w-full h-64 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => setEnlargedImage(product.image_url!)}
                      />
                    </div>
                    <CardContent className="p-6">
                      <h3 className="text-xl font-semibold text-foreground mb-2">
                        {product.name}
                      </h3>
                      {product.description && (
                        <p className="text-muted-foreground mb-4">
                          {product.description}
                        </p>
                      )}
                      {product.special_notes && (
                        <div className="p-3 bg-warning/10 border border-warning/20 rounded-md">
                          <p className="text-sm font-medium text-warning-foreground mb-1">
                            Special Notes:
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {product.special_notes}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Call to Action */}
              <div className="text-center">
                <Card className="bg-primary/5 border border-primary/20 max-w-2xl mx-auto">
                  <CardContent className="p-8 text-center">
                    <h3 className="text-2xl font-bold text-foreground mb-4">
                      Ready for Your Custom Solution?
                    </h3>
                    <p className="text-lg text-muted-foreground mb-6">
                      Each project starts with understanding your unique needs. 
                      Contact our team to discuss how we can create the perfect solution for you.
                    </p>
                    <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary-dark">
                      <Phone className="mr-2 h-5 w-5" />
                      Contact Our Specialists
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </div>

        {/* Image Enlargement Modal */}
        {enlargedImage && (
          <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50">
            {/* Close button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEnlargedImage(null)}
              className="absolute top-4 right-4 z-20 bg-background/95 backdrop-blur-sm hover:bg-background shadow-lg border-2"
            >
              <X className="h-4 w-4" />
            </Button>

            {/* Zoom controls */}
            <div className="absolute top-4 left-4 z-20 flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleZoomIn}
                className="bg-background/95 backdrop-blur-sm hover:bg-background shadow-lg border-2"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleZoomOut}
                className="bg-background/95 backdrop-blur-sm hover:bg-background shadow-lg border-2"
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={resetZoom}
                className="bg-background/95 backdrop-blur-sm hover:bg-background shadow-lg border-2"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>

            {/* Image container */}
            <div 
              className="relative w-full h-full flex items-center justify-center overflow-hidden cursor-move"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onWheel={handleWheel}
            >
              <img
                src={enlargedImage}
                alt="Enlarged view"
                className="max-w-none select-none"
                style={{
                  transform: `scale(${imageZoom}) translate(${imagePan.x / imageZoom}px, ${imagePan.y / imageZoom}px)`,
                  cursor: imageZoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default'
                }}
                draggable={false}
              />
            </div>

            {/* Instructions */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20">
              <div className="bg-background/95 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg border">
                <p className="text-sm text-muted-foreground text-center">
                  Click and drag to pan • Scroll to zoom • Click controls or press ESC to close
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default CustomSolutionsPage;