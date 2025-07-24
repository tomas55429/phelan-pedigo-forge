import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

type Category = Tables<'categories'>;

interface CategoriesSectionProps {
  onCategorySelect?: (categoryId: string | null) => void;
  selectedCategoryId?: string | null;
}

const CategoriesSection: React.FC<CategoriesSectionProps> = ({ 
  onCategorySelect, 
  selectedCategoryId 
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Category images mapping with representative medical equipment images
  const categoryImages: Record<string, string> = {
    "IV Stands and Carts": "/lovable-uploads/a656a3c8-5c9a-4566-8b89-6f62b96847dd.png",
    "Privacy Screens": "/lovable-uploads/69adad60-90f6-402c-9c68-90066747dfcd.png",
    "Sterilization Baskets": "/lovable-uploads/af835e0e-a991-47e8-8038-f99766ebc510.png",
    "Step Stands": "/lovable-uploads/faadd25f-6d69-4809-8f13-c5c3acfaf63a.png",
    "Medical Carts": "/lovable-uploads/721bb900-7bb1-43e0-84d0-4e0b00306d8f.png",
    "Back Tables": "/lovable-uploads/40a8d9af-0ece-4e00-bd8e-cbe4ae09ace0.png",
    // Fallback mappings for existing categories in database
    "Instrument Racks and Tubing Holders": "/lovable-uploads/af835e0e-a991-47e8-8038-f99766ebc510.png",
    "Screen": "/lovable-uploads/69adad60-90f6-402c-9c68-90066747dfcd.png"
  };

  // Representative background images for categories that don't have product images
  const getCategoryRepresentativeImage = (categoryName: string): string => {
    const representativeImages: Record<string, string> = {
      "IV Stands and Carts": "https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=400&h=400&fit=crop", // Medical IV drip
      "Privacy Screens": "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=400&h=400&fit=crop", // Hospital room
      "Sterilization Baskets": "https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=400&h=400&fit=crop", // Medical instruments
      "Step Stands": "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&h=400&fit=crop", // Medical stool/step
      "Medical Carts": "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400&h=400&fit=crop", // Medical cart
      "Back Tables": "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=400&h=400&fit=crop", // Surgical table
      "Instrument Racks and Tubing Holders": "https://images.unsplash.com/photo-1582560475093-ba66f662f88f?w=400&h=400&fit=crop", // Medical instruments rack
      "Screen": "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=400&h=400&fit=crop" // Hospital privacy screen
    };

    return representativeImages[categoryName] || "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=400&fit=crop";
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching categories:', error);
      } else {
        setCategories(data || []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (categoryId: string | null) => {
    if (onCategorySelect) {
      onCategorySelect(categoryId);
    }
  };

  if (loading) {
    return (
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-muted rounded mx-auto w-48"></div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-32 bg-muted rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Product Categories
          </h2>
          <p className="text-lg text-muted-foreground">
            Browse our medical equipment by category
          </p>
        </div>

        {/* Category Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
          {/* All Categories Option */}
          <div 
            className={`text-center group cursor-pointer p-4 rounded-lg transition-all ${
              selectedCategoryId === null 
                ? 'bg-primary/10 border-2 border-primary' 
                : 'bg-background/60 border border-border hover:border-primary/50'
            }`}
            onClick={() => handleCategoryClick(null)}
          >
            <div className="mb-3 flex items-center justify-center min-h-[120px]">
              <img
                src="https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=400&fit=crop"
                alt="All Medical Equipment"
                className="w-20 h-20 object-cover rounded-full border-2 border-primary/30"
              />
            </div>
            <h3 className="text-sm md:text-base font-semibold text-foreground group-hover:text-primary transition-colors">
              All Categories
            </h3>
          </div>

          {/* Dynamic Categories from Database */}
          {categories.map((category) => {
            const categoryImage = categoryImages[category.name];
            const representativeImage = getCategoryRepresentativeImage(category.name);
            
            return (
              <div 
                key={category.id}
                className={`text-center group cursor-pointer p-4 rounded-lg transition-all relative overflow-hidden ${
                  selectedCategoryId === category.id 
                    ? 'bg-primary/10 border-2 border-primary' 
                    : 'bg-background/60 border border-border hover:border-primary/50'
                }`}
                onClick={() => handleCategoryClick(category.id)}
              >
                {/* Background representative image */}
                <div className="absolute inset-0 opacity-10">
                  <img
                    src={representativeImage}
                    alt={`${category.name} background`}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Category Product Image with transparent background */}
                <div className="mb-3 flex items-center justify-center min-h-[120px] relative z-10">
                  {categoryImage ? (
                    <img
                      src={categoryImage}
                      alt={category.name}
                      className="max-w-full max-h-[100px] object-contain hover:scale-105 transition-transform opacity-90"
                    />
                  ) : (
                    <img
                      src={representativeImage}
                      alt={category.name}
                      className="w-16 h-16 object-cover rounded-full border-2 border-primary/30"
                    />
                  )}
                </div>
                
                {/* Category Title */}
                <h3 className="text-sm md:text-base font-semibold text-foreground group-hover:text-primary transition-colors relative z-10">
                  {category.name}
                </h3>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;