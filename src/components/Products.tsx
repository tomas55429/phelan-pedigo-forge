import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Stethoscope, 
  Activity, 
  Shield, 
  Settings,
  ArrowRight,
  CheckCircle,
  Phone
} from 'lucide-react';
import medicalEquipmentImage from '@/assets/medical-equipment.jpg';

const Products = () => {
  const productCategories = [
    {
      icon: <Stethoscope className="h-8 w-8" />,
      title: "IV Stands and Carts",
      description: "High-quality IV poles, infusion pump stands, and mobile carts designed for hospital environments.",
      features: ["Adjustable height", "Smooth-rolling casters", "Durable stainless steel construction"]
    },
    {
      icon: <Activity className="h-8 w-8" />,
      title: "Screens, Guards, Face Butlers",
      description: "Privacy screens and protective equipment for patient care and surgical procedures.",
      features: ["Easy to clean surfaces", "Lightweight yet sturdy", "Multiple configuration options"]
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Sterilization Baskets and Trays",
      description: "Instrument sterilization solutions that meet the highest medical standards.",
      features: ["Autoclave compatible", "Perforated for proper drainage", "Custom sizing available"]
    },
    {
      icon: <Settings className="h-8 w-8" />,
      title: "Step Stands and Working Platforms",
      description: "Safe, stable platforms for medical professionals to reach elevated work areas.",
      features: ["Non-slip surfaces", "Ergonomic design", "Easy storage"]
    },
    {
      icon: <Activity className="h-8 w-8" />,
      title: "Instrument Racks and Tubing Holders",
      description: "Organized storage solutions for medical instruments and equipment management.",
      features: ["Modular design", "Easy installation", "Corrosion resistant"]
    },
    {
      icon: <Stethoscope className="h-8 w-8" />,
      title: "Neurosurgical & Thoracic Tables",
      description: "Specialized back tables for complex surgical procedures requiring precision equipment.",
      features: ["Height adjustable", "Stable platform", "Easy to sanitize"]
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {productCategories.map((product, index) => (
            <Card key={index} className="professional-hover bg-card shadow-card">
              <CardHeader>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-3 bg-primary/10 rounded-lg text-primary">
                    {product.icon}
                  </div>
                  <CardTitle className="text-xl">{product.title}</CardTitle>
                </div>
                <CardDescription className="text-base">
                  {product.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-6">
                  {product.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center space-x-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button variant="outline" className="w-full group">
                  Learn More
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </CardContent>
            </Card>
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