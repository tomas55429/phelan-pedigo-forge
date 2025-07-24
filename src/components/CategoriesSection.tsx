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

  // Static category images mapping (from the home page)
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
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
                <span className="text-2xl">🏥</span>
              </div>
            </div>
            <h3 className="text-sm md:text-base font-semibold text-foreground group-hover:text-primary transition-colors">
              All Categories
            </h3>
          </div>

          {/* Dynamic Categories from Database */}
          {categories.map((category) => {
            const categoryImage = categoryImages[category.name] || categoryImages["Medical Carts"];
            
            return (
              <div 
                key={category.id}
                className={`text-center group cursor-pointer p-4 rounded-lg transition-all ${
                  selectedCategoryId === category.id 
                    ? 'bg-primary/10 border-2 border-primary' 
                    : 'bg-background/60 border border-border hover:border-primary/50'
                }`}
                onClick={() => handleCategoryClick(category.id)}
              >
                {/* Category Image with transparent background */}
                <div className="mb-3 flex items-center justify-center min-h-[120px]">
                  <img
                    src={categoryImage}
                    alt={category.name}
                    className="max-w-full max-h-[100px] object-contain hover:scale-105 transition-transform opacity-90"
                  />
                </div>
                
                {/* Category Title */}
                <h3 className="text-sm md:text-base font-semibold text-foreground group-hover:text-primary transition-colors">
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