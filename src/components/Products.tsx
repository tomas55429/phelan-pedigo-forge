import { Button } from '@/components/ui/button';
import { Phone } from 'lucide-react';
import medicalEquipmentImage from '@/assets/medical-equipment.jpg';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

type Category = Tables<'categories'>;

const Products = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const handleCategoryClick = (categoryId: string) => {
    navigate(`/products?category=${categoryId}`);
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .order('name');

        if (error) throw error;
        setCategories(data || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <section id="products" className="py-20 bg-secondary relative">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src={medicalEquipmentImage}
          alt="Medical equipment background"
          className="w-full h-full object-cover opacity-5"
        />
        <div className="absolute inset-0 bg-secondary/95"></div>
      </div>
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Our Medical Equipment
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            We specialize in manufacturing high-quality medical mechanical hardware 
            that assists doctors and healthcare professionals in their daily work.
          </p>
        </div>

        {/* Featured Product Image */}
        <div className="mb-16">
          <div className="relative rounded-lg overflow-hidden shadow-elevated">
            <img
              src={medicalEquipmentImage}
              alt="Phelan Manufacturing medical equipment"
              className="w-full h-[400px] object-cover"
            />
            <div className="absolute inset-0 bg-gradient-primary opacity-10"></div>
            <div className="absolute bottom-6 left-6 text-white">
              <h3 className="text-2xl font-bold mb-2">Professional Medical Equipment</h3>
              <p className="text-lg">Built to withstand the rigors of daily hospital use</p>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {loading ? (
            // Loading skeleton
            Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="text-center group cursor-pointer">
                <div className="mb-4 flex items-center justify-center min-h-[180px]">
                  <div className="w-32 h-32 bg-muted rounded animate-pulse"></div>
                </div>
                <div className="h-4 bg-muted rounded animate-pulse"></div>
              </div>
            ))
          ) : (
            categories.map((category) => (
              <div 
                key={category.id} 
                className="text-center group cursor-pointer"
                onClick={() => handleCategoryClick(category.id)}
              >
                {/* Category Image */}
                <div className="mb-4 flex items-center justify-center min-h-[180px]">
                  {category.image_url ? (
                    <img
                      src={category.image_url}
                      alt={category.name}
                      className="max-w-full max-h-[140px] object-contain hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-32 h-32 bg-muted rounded flex items-center justify-center">
                      <span className="text-xs text-muted-foreground">No Image</span>
                    </div>
                  )}
                </div>
                
                {/* Category Title */}
                <h3 className="text-sm md:text-base font-semibold text-foreground group-hover:text-primary transition-colors">
                  {category.name}
                </h3>
              </div>
            ))
          )}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-8">
            <h3 className="text-2xl font-bold text-foreground mb-4">
              Need Custom Medical Equipment?
            </h3>
            <p className="text-lg text-muted-foreground mb-6">
              We are one of the most creative and innovative custom design firms in the field. 
              We can help you when perhaps no one else can.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary-dark">
                <Phone className="mr-2 h-5 w-5" />
                Contact Our Specialists
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                onClick={() => navigate('/custom-solutions')}
              >
                See Our Previous Custom Solutions
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Products;