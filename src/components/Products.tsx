import { Button } from '@/components/ui/button';
import { Phone } from 'lucide-react';
import medicalEquipmentImage from '@/assets/medical-equipment.jpg';

const Products = () => {
  const productCategories = [
    {
      title: "IV Stands and Carts",
      image: "/lovable-uploads/bee7aa89-8d50-49af-867f-7cbdd9c2792f.png"
    },
    {
      title: "Privacy Screens",
      image: "/lovable-uploads/cd28c6a2-9f50-475f-9208-389d15ccadd8.png"
    },
    {
      title: "Sterilization Baskets",
      image: "/lovable-uploads/72be7c9a-2668-4d3c-ac69-7ab9f8696a50.png"
    },
    {
      title: "Step Stands",
      image: "/lovable-uploads/aa47f9a4-8429-46f0-a4f8-5faca2f08cc9.png"
    },
    {
      title: "Medical Carts",
      image: "/lovable-uploads/df0b7c5a-6081-4dd8-93f1-bfad03e1543c.png"
    },
    {
      title: "Back Tables",
      image: "/lovable-uploads/7c3b22d1-fad7-488b-85b5-20d47a7c10bd.png"
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