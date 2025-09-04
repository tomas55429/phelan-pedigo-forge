import { Button } from '@/components/ui/button';
import { Phone, ArrowRight } from 'lucide-react';
import { OptimizedImage } from '@/components/ui/optimized-image';
const heroImage = '/lovable-uploads/a632184a-6300-4625-8183-4c94d0678ede.png';
const Hero = () => {
  return <section className="relative bg-gradient-hero min-h-[90vh] flex items-center">
      {/* Background Image */}
      <div className="absolute inset-0 z-0 opacity-100">
        <OptimizedImage src={heroImage} alt="Phelan Manufacturing facility" className="w-full h-full object-cover opacity-60" priority={true} highQuality={true} loading="eager" decoding="async" sizes="100vw" />
        <div className="absolute inset-0 bg-gradient-hero opacity-50"></div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl text-center mx-auto text-white">
          <div className="animate-fade-in">
            <div className="flex justify-center mb-6">
              <OptimizedImage src="/lovable-uploads/57d70b9a-de38-4715-90d7-de1bb54d9d1c.png" alt="Phelan Manufacturing Corporation Logo" className="h-30 md:h-36 lg:h-42 w-auto" priority={true} highQuality={true} loading="eager" decoding="async" sizes="(max-width: 768px) 120px, (max-width: 1024px) 144px, 168px" />
            </div>
            <div className="text-2xl md:text-3xl font-bold mb-8 text-white drop-shadow-lg">
              Made in the <span className="text-white">U</span><span className="text-white">S</span><span className="text-blue-500">A</span>
            </div>
            <p className="text-xl md:text-2xl mb-12 text-gray-100 leading-relaxed">
              Medical equipment and hospital hardware manufacturer since 1948. 
              Quality, innovation, and a tremendous work ethic that produces great products.
            </p>
          </div>

          <div className="animate-slide-up space-y-6">
            {/* Call to Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button size="lg" className="bg-white text-primary hover:bg-gray-100 shadow-elevated font-semibold px-8 py-4 text-lg" onClick={() => window.location.href = 'tel:18003282358'}>
                <Phone className="mr-2 h-5 w-5" />
                Call 1-800-328-2358
              </Button>
              <Button variant="outline" size="lg" className="border-white bg-white/10 text-white hover:bg-white hover:text-primary shadow-medical font-semibold px-8 py-4 text-lg backdrop-blur-sm" onClick={() => window.location.href = '/products'}>
                View Products
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>

            {/* Contact Information */}
            <div className="mt-12 p-6 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
              <p className="text-lg font-medium text-white mb-2">
                Speak directly to an equipment specialist at our plant
              </p>
              <p className="text-gray-200">
                Our team is ready to help you find the perfect medical equipment solutions
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/50 rounded-full mt-2 animate-bounce"></div>
        </div>
      </div>
    </section>;
};
export default Hero;