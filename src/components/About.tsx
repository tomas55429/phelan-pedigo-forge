import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Award, Users, Globe, Wrench } from 'lucide-react';
import operatingRoomImage from '@/assets/operating-room.jpg';

const About = () => {
  const stats = [
    {
      icon: <Award className="h-8 w-8" />,
      number: "75+",
      label: "Years in Business",
      description: "Since 1948"
    },
    {
      icon: <Users className="h-8 w-8" />,
      number: "3rd",
      label: "Generation",
      description: "Family Legacy"
    },
    {
      icon: <Globe className="h-8 w-8" />,
      number: "100%",
      label: (
        <span>
          Made in <span className="text-red-500">U</span><span className="text-white">S</span><span className="text-blue-500">A</span>
        </span>
      ),
      description: "American Quality"
    },
    {
      icon: <Wrench className="h-8 w-8" />,
      number: "1000+",
      label: "Custom Solutions",
      description: "Delivered Worldwide"
    }
  ];

  const values = [
    {
      title: "Quality First",
      description: "We pay particular attention to producing high quality, dependable products that stand up to the rigors of daily use in a hospital."
    },
    {
      title: "Customer Satisfaction",
      description: "Our focus on customer satisfaction has made us a very successful company with clients worldwide."
    },
    {
      title: "Innovation & Creativity",
      description: "We are one of the most creative and innovative custom design firms in the medical equipment field."
    },
    {
      title: "Reliability",
      description: "Our tremendous work ethic and commitment to excellence ensures we deliver products you can depend on."
    }
  ];

  return (
    <section id="about" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
          <div className="space-y-6">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground">
              Excellence in Medical Manufacturing
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Our products are used in operating suites worldwide, providing medical professionals 
              with the reliable, high-quality equipment they need to deliver exceptional patient care.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              We occupy a unique niche in the medical field, specializing in limited distribution 
              products that require the highest standards of quality and innovation.
            </p>
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary-dark">
              Learn About Our History
            </Button>
          </div>
          <div className="relative">
            <img
              src={operatingRoomImage}
              alt="Medical professionals using Phelan equipment"
              className="rounded-lg shadow-elevated w-full h-[400px] object-cover"
            />
            <div className="absolute inset-0 bg-gradient-primary opacity-10 rounded-lg"></div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
          {stats.map((stat, index) => (
            <Card key={index} className="text-center professional-hover bg-card shadow-card">
              <CardContent className="p-6">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-primary/10 rounded-full text-primary">
                    {stat.icon}
                  </div>
                </div>
                <div className="text-3xl font-bold text-primary mb-2">{stat.number}</div>
                <div className="font-semibold text-foreground mb-1">{stat.label}</div>
                <div className="text-sm text-muted-foreground">{stat.description}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Values Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Our Core Values
            </h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              The principles that have guided us for over seven decades and continue 
              to drive our commitment to excellence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="professional-hover bg-card shadow-card">
                <CardContent className="p-8">
                  <h4 className="text-xl font-bold text-foreground mb-4">{value.title}</h4>
                  <p className="text-muted-foreground leading-relaxed">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Quality Assurance */}
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-8 text-center">
          <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
            Built to Hospital Standards
          </h3>
          <p className="text-lg text-muted-foreground mb-6 max-w-3xl mx-auto">
            Every piece of equipment we manufacture meets the highest medical industry standards. 
            Our products are designed to withstand daily use in demanding hospital environments 
            while maintaining precision and reliability.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm font-medium text-primary">
            <span className="bg-primary/10 px-4 py-2 rounded-full">Autoclave Compatible</span>
            <span className="bg-primary/10 px-4 py-2 rounded-full">Corrosion Resistant</span>
            <span className="bg-primary/10 px-4 py-2 rounded-full">Easy to Clean</span>
            <span className="bg-primary/10 px-4 py-2 rounded-full">Durable Construction</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;