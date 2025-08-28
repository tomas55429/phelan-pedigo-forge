import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Header from '@/components/Header';
import Footer from '@/components/Footer';
const ServicesPage = () => {
  return <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-12 space-y-12">
        {/* Page Title */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-primary mb-4">Our Services</h1>
          <p className="text-xl text-muted-foreground">66 Years of Quality Manufacturing Excellence</p>
        </div>
        {/* Who We Are Section */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-primary">
              Who We Are
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-lg leading-relaxed">
              Phelan Manufacturing has helped businesses and manufacturers in greater Minneapolis and the US engineer and build custom parts and equipment for their machines for the past <strong>66 years</strong>. We have engineering and design services including full-service welding, machining and repair that can help your business continue same day production and build for the future.
            </p>
            <p className="text-lg leading-relaxed">
              Our business was founded to manufacture hospital related items– primarily medical mechanical hardware. 
              We are now in our <strong>3rd generation</strong> of employees that are carrying forward the legacy of 
              quality and innovation and a tremendous work ethic that produces great products.
            </p>
            <div className="bg-green-50 border-l-4 border-l-green-500 p-4 rounded">
              <p className="text-lg leading-relaxed font-medium text-green-800">
                Since 2020 Phelan MFG has been powering its machines with Solar power from roof mounted solar arrays. 
                We take pride in being self-sustaining and green in all ways that we can.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Engineering and Design Section */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-primary flex items-center">
              <span className="mr-3">⚙️</span>
              Engineering and Design
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Badge variant="secondary" className="text-base px-4 py-2">
                  Fusion 360 Design Software
                </Badge>
                <Badge variant="secondary" className="text-base px-4 py-2">
                  3-D Modeling
                </Badge>
              </div>
              
            </div>
          </CardContent>
        </Card>

        {/* Welding and Fabrication Section */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-primary flex items-center">
              <span className="mr-3">🔥</span>
              Welding and Fabrication
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-semibold text-lg mb-2">Miller Synchro Wave Welder</h4>
              </div>
              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-semibold text-lg mb-2">Gas Tungsten Arc Welding/TIG Welding</h4>
              </div>
              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-semibold text-lg mb-2">Materials: Stainless Steel, Aluminum, Mild Steel from 26ga. Up</h4>
              </div>
              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-semibold text-lg mb-2">Food Grade Welding and Polishing</h4>
              </div>
              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-semibold text-lg mb-2">Bead Blasting – Bad Boy XLD Bead Blaster</h4>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Equipment Section */}
        <div className="space-y-8">
          <h2 className="text-3xl font-bold text-primary text-center">Our Equipment</h2>
          
          {/* Lathes */}
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold text-primary flex items-center">
                <span className="mr-3">🔧</span>
                Lathes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-semibold text-lg mb-2">Haas TL-2 10HP CNC Lathe</h4>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">3.5" Bar Capacity</Badge>
                    <Badge variant="outline">8" Chuck Capacity</Badge>
                  </div>
                </div>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-semibold text-lg">South Bend Toolroom Series Lathe</h4>
                  <Badge variant="outline" className="mt-2">16" x 60"</Badge>
                </div>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-semibold text-lg">Ganesh GT1640 Lathe</h4>
                  <Badge variant="outline" className="mt-2">16" x 40"</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Mills */}
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold text-primary flex items-center">
                <span className="mr-3">⚒️</span>
                Mills
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-semibold text-lg mb-2">Haas TM-1P 7.5HP CNC Mill</h4>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">40 Taper</Badge>
                    <Badge variant="outline">30" x 16" x 16" Table Travel</Badge>
                  </div>
                </div>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-semibold text-lg">Bridgeport J-Head Mill</h4>
                  <Badge variant="outline" className="mt-2">w/ Digital Read Out</Badge>
                </div>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-semibold text-lg">Enco Knee Mill</h4>
                  <Badge variant="outline" className="mt-2">w/ Digital Read Out</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Shear & Forming */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="text-2xl font-semibold text-primary flex items-center">
                  <span className="mr-3">✂️</span>
                  Shear
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <Badge variant="outline" className="text-base">14 ga. Stainless and Smaller</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="text-2xl font-semibold text-primary flex items-center">
                  <span className="mr-3">🔨</span>
                  Forming
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-semibold">Accurpress 7607 CNC Press Brake</h4>
                  <Badge variant="outline" className="mt-2">60 Ton</Badge>
                </div>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-semibold">Chicago Press Brake</h4>
                  <Badge variant="outline" className="mt-2">25 Ton</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* More Manual Machines */}
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold text-primary flex items-center">
                <span className="mr-3">🔩</span>
                More Manual Machines
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-semibold text-lg">Boyar-Shultz Surface Grinder</h4>
                  <Badge variant="outline" className="mt-2">6" x 12"</Badge>
                </div>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-semibold text-lg">Do-All Automatic Precision Saw</h4>
                  <Badge variant="outline" className="mt-2">10" x 10" Capacity</Badge>
                </div>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-semibold text-lg">Rockwell/Delta Drill Press</h4>
                  <Badge variant="outline" className="mt-2">4 Units</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action Section */}
        <Card className="shadow-lg bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="text-center py-12">
            <h3 className="text-3xl font-bold text-primary mb-4">Ready to Work With Us?</h3>
            <p className="text-xl text-muted-foreground mb-6">
              Contact us today to discuss your manufacturing needs and discover how our 66 years of experience can help your business.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/contact" className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground px-8 py-3 text-lg font-medium hover:bg-primary/90 transition-colors">
                Get In Touch
              </a>
              <a href="/products" className="inline-flex items-center justify-center rounded-md border border-primary text-primary px-8 py-3 text-lg font-medium hover:bg-primary/10 transition-colors">
                View Our Products
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Footer />
    </div>;
};
export default ServicesPage;