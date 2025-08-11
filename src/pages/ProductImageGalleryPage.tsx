import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, ZoomIn, Star, FileText } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

type Product = Tables<'products'>;
type Category = Tables<'categories'>;

interface ProductWithCategory {
  product: Product;
  categories: Category[];
}

const ProductImageGalleryPage = () => {
  const [productsWithDetails, setProductsWithDetails] = useState<ProductWithCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch all data in parallel
        const [productsRes, categoriesRes, productCategoriesRes] = await Promise.all([
          supabase.from('products').select('*').order('name'),
          supabase.from('categories').select('*'),
          supabase.from('product_categories').select('*')
        ]);

        if (productsRes.error) throw productsRes.error;
        if (categoriesRes.error) throw categoriesRes.error;
        if (productCategoriesRes.error) throw productCategoriesRes.error;

        const products = productsRes.data || [];
        const categoriesData = categoriesRes.data || [];
        const productCategories = productCategoriesRes.data || [];

        // Filter for custom categories
        const customCategories = categoriesData.filter(cat => 
          cat.name?.toLowerCase().includes('custom')
        );
        const customCategoryIds = customCategories.map(cat => cat.id);

        // Group data by product and filter for custom category products only
        const productsWithDetailsData: ProductWithCategory[] = products
          .map(product => {
            // Get categories for this product
            const productCategoryIds = productCategories
              .filter(pc => pc.product_id === product.id)
              .map(pc => pc.category_id);
            const productCategoriesData = categoriesData.filter(cat => 
              productCategoryIds.includes(cat.id)
            );

            return {
              product,
              categories: productCategoriesData,
            };
          })
          .filter(item => 
            // Only include products that have at least one custom category
            item.categories.some(cat => customCategoryIds.includes(cat.id)) &&
            // Only include products with images
            item.product.image_url
          );

        setProductsWithDetails(productsWithDetailsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredProducts = productsWithDetails.filter(({ product }) => {
    const searchLower = searchTerm.toLowerCase();
    const nameMatch = product.name?.toLowerCase().includes(searchLower);
    const descriptionMatch = product.description?.toLowerCase().includes(searchLower);
    return !searchTerm || nameMatch || descriptionMatch;
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-20">
        <div className="container mx-auto px-4 py-12">
          {/* Header Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Custom Product Gallery
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Explore our custom medical equipment solutions - each piece designed and manufactured 
              to meet specific healthcare requirements.
            </p>
            
            {/* Search Bar */}
            <div className="max-w-md mx-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search custom products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, index) => (
                <Card key={index} className="overflow-hidden">
                  <div className="aspect-square bg-muted animate-pulse" />
                  <CardContent className="p-4">
                    <div className="h-4 bg-muted rounded animate-pulse mb-2" />
                    <div className="h-3 bg-muted rounded animate-pulse w-3/4" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <>
              {/* Products Count */}
              <div className="mb-6">
                <p className="text-sm text-muted-foreground">
                  Showing {filteredProducts.length} custom products
                </p>
              </div>

              {/* Products Grid */}
              {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {filteredProducts.map(({ product, categories }) => (
                    <Card 
                      key={product.id} 
                      className="group overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-300"
                      onClick={() => setEnlargedImage(product.image_url)}
                    >
                      <div className="relative aspect-square overflow-hidden">
                        <img
                          src={product.image_url!}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                          decoding="async"
                          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        />
                        
                        {/* Overlay */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                          <ZoomIn className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>
                        
                        {/* Featured Badge */}
                        {product.featured && (
                          <Badge className="absolute top-2 right-2 bg-primary text-primary-foreground">
                            <Star className="h-3 w-3 mr-1" />
                            Featured
                          </Badge>
                        )}
                      </div>
                      
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-foreground mb-2 line-clamp-2">
                          {product.name}
                        </h3>
                        
                        {/* Categories */}
                        <div className="flex flex-wrap gap-1 mb-2">
                          {categories.map(category => (
                            <Badge key={category.id} variant="outline" className="text-xs">
                              {category.name}
                            </Badge>
                          ))}
                        </div>
                        
                        {/* Description */}
                        {product.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {product.description}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    No custom products found
                  </h3>
                  <p className="text-muted-foreground">
                    {searchTerm 
                      ? "Try adjusting your search terms to find what you're looking for."
                      : "No custom products are currently available in the gallery."
                    }
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Image Enlargement Dialog */}
      <Dialog open={!!enlargedImage} onOpenChange={() => setEnlargedImage(null)}>
        <DialogContent className="max-w-4xl w-full p-2">
          {enlargedImage && (
            <div className="relative">
              <img
                src={enlargedImage}
                alt="Enlarged product view"
                className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default ProductImageGalleryPage;