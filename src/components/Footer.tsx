import { Phone, Mail, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-foreground text-background py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Company Info */}
          <div className="space-y-4">
            <img 
              src="/lovable-uploads/e88a7c69-d6d6-4e03-a1f7-c51b7f7d5fb9.png" 
              alt="Phelan Manufacturing Corporation" 
              className="h-16 w-auto"
            />
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
                <span>info@phelanmfgcorp.com</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-primary-light" />
                <span>Made in the USA</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-primary-light">Quick Links</h4>
            <nav className="flex flex-col space-y-2">
              <a href="#" className="text-background/80 hover:text-primary-light transition-colors">Home</a>
              <a href="#products" className="text-background/80 hover:text-primary-light transition-colors">Products</a>
              <a href="#about" className="text-background/80 hover:text-primary-light transition-colors">About</a>
              <a href="#history" className="text-background/80 hover:text-primary-light transition-colors">History</a>
              <a href="#contact" className="text-background/80 hover:text-primary-light transition-colors">Contact</a>
            </nav>
          </div>

          {/* Our Products */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-primary-light">Our Products</h4>
            <nav className="flex flex-col space-y-2 text-sm">
              <span className="text-background/80">IV Stands and Carts</span>
              <span className="text-background/80">Screens, Guards, Face Butlers</span>
              <span className="text-background/80">Step Stands and Working Platforms</span>
              <span className="text-background/80">Instrument Racks and Tubing Holders</span>
              <span className="text-background/80">Sterilization Baskets and Trays</span>
              <span className="text-background/80">Neurosurgical & Thoracic Tables</span>
            </nav>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-background/20 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-background/60 text-sm">
              © 2024 Phelan Manufacturing Corporation. All rights reserved.
            </div>
            <div className="text-background/60 text-sm">
              Made in the USA since 1948
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;