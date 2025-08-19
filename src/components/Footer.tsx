import { Phone, Mail, MapPin } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
type Category = Tables<'categories'>;
const Footer = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const navigate = useNavigate();
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const {
          data,
          error
        } = await supabase.from('categories').select('*').eq('show_on_homepage', true).order('name');
        if (error) throw error;
        setCategories(data || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);
  const handleCategoryClick = (categoryId: string) => {
    navigate(`/products?category=${categoryId}`);
  };
  return <footer className="bg-foreground text-background py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Company Info */}
          <div className="space-y-4">
            <img src="/lovable-uploads/e88a7c69-d6d6-4e03-a1f7-c51b7f7d5fb9.png" alt="Phelan Manufacturing Corporation" className="h-16 w-auto" />
            <p className="text-background/80 leading-relaxed">
              Medical equipment and hospital hardware manufacturer since 1948. 
              Made in the USA with quality, innovation, and tremendous work ethic.
            </p>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-primary-light" />
                <span className="font-semibold">1-800-328-2358</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-primary-light" />
                <span>Richard@PhelanMfgCorp.com</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-primary-light" />
                <span>2523 Minnehaha Ave, Minneapolis, MN 55404</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-primary-light">Quick Links</h4>
            <nav className="flex flex-col space-y-2">
              <button onClick={() => navigate('/')} className="text-background/80 hover:text-primary-light transition-colors text-left">Home</button>
              <button onClick={() => navigate('/products')} className="text-background/80 hover:text-primary-light transition-colors text-left">Products</button>
              <button onClick={() => navigate('/about')} className="text-background/80 hover:text-primary-light transition-colors text-left">About</button>
              <button onClick={() => navigate('/history')} className="text-background/80 hover:text-primary-light transition-colors text-left">History</button>
              <button onClick={() => navigate('/contact')} className="text-background/80 hover:text-primary-light transition-colors text-left">Contact</button>
            </nav>
          </div>

          {/* Our Products */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-primary-light">Our Products</h4>
            <nav className="flex flex-col space-y-2 text-sm">
              {categories.map(category => <button key={category.id} onClick={() => handleCategoryClick(category.id)} className="text-background/80 hover:text-primary-light transition-colors text-left">
                  {category.name}
                </button>)}
              <button onClick={() => navigate('/custom-solutions')} className="text-background/80 hover:text-primary-light transition-colors text-left">Custom Solutions</button>
            </nav>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-background/20 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-background/60 text-sm">
              © {new Date().getFullYear()} Phelan Manufacturing Corporation. All rights reserved.
            </div>
            <div className="text-background/60 text-sm">
              Made in the USA since 1948
            </div>
          </div>
        </div>
      </div>
    </footer>;
};
export default Footer;