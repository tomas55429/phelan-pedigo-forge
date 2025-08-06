import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Phone } from 'lucide-react';
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
                        className="w-full h-64 object-cover"
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
      </div>
      <Footer />
    </div>
  );
};

export default CustomSolutionsPage;