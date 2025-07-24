import { Button } from '@/components/ui/button';
import { Phone } from 'lucide-react';
import medicalEquipmentImage from '@/assets/medical-equipment.jpg';

const Products = () => {
  const productCategories = [
    {
      title: "IV Stands and Carts",
      image: "/lovable-uploads/a656a3c8-5c9a-4566-8b89-6f62b96847dd.png"
    },
    {
      title: "Privacy Screens",
      image: "/lovable-uploads/69adad60-90f6-402c-9c68-90066747dfcd.png"
    },
    {
      title: "Sterilization Baskets",
      image: "/lovable-uploads/af835e0e-a991-47e8-8038-f99766ebc510.png"
    },
    {
      title: "Step Stands",
      image: "/lovable-uploads/faadd25f-6d69-4809-8f13-c5c3acfaf63a.png"
    },
    {
      title: "Medical Carts",
      image: "/lovable-uploads/721bb900-7bb1-43e0-84d0-4e0b00306d8f.png"
    },
    {
      title: "Back Tables",
      image: "/lovable-uploads/40a8d9af-0ece-4e00-bd8e-cbe4ae09ace0.png"
    }
  ];

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
          {productCategories.map((product, index) => (
            <div key={index} className="text-center group cursor-pointer">
              {/* Product Image */}
              <div className="mb-4 bg-white rounded-lg p-6 flex items-center justify-center min-h-[180px] shadow-sm hover:shadow-md transition-shadow">
                <img
                  src={product.image}
                  alt={product.title}
                  className="max-w-full max-h-[140px] object-contain"
                />
              </div>
              
              {/* Product Title */}
              <h3 className="text-sm md:text-base font-semibold text-foreground group-hover:text-primary transition-colors">
                {product.title}
              </h3>
            </div>
          ))}
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
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary-dark">
              <Phone className="mr-2 h-5 w-5" />
              Contact Our Specialists
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Products;