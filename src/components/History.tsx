import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Users, Award, Building } from 'lucide-react';

const History = () => {
  const timeline = [
    {
      year: "1948",
      title: "Company Founded",
      description: "Jack and Loraine Phelan founded Phelan Manufacturing Corporation to assist doctors and healthcare professionals.",
      icon: <Building className="h-6 w-6" />
    },
    {
      year: "1952",
      title: "Official Incorporation",
      description: "The company was officially incorporated, establishing our formal business structure and commitment to quality.",
      icon: <Award className="h-6 w-6" />
    },
    {
      year: "1970s-1990s",
      title: "Loraine's Leadership",
      description: "After Jack's passing, Loraine continued leading the business with exceptional dedication until she was 100 years old.",
      icon: <Users className="h-6 w-6" />
    },
    {
      year: "Present",
      title: "Third Generation Excellence",
      description: "Now in our 3rd generation of employees, we continue the legacy of quality, innovation, and tremendous work ethic.",
      icon: <Calendar className="h-6 w-6" />
    }
  ];

  return (
    <section id="history" className="py-20 bg-secondary">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Our Rich History
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            A legacy of quality and innovation spanning over seven decades, 
            built on the foundation of exceptional service to the medical community.
          </p>
        </div>

        {/* Founder's Story */}
        <div className="mb-16">
          <Card className="bg-card shadow-card">
            <CardContent className="p-8 md:p-12">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div>
                  <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-6">
                    A Remarkable Legacy
                  </h3>
                  <div className="space-y-4 text-muted-foreground">
                    <p className="text-lg leading-relaxed">
                      Phelan Manufacturing Corporation was founded in 1948 and incorporated in 1952 by 
                      <strong className="text-foreground"> Jack and Loraine Phelan</strong>. Their vision was to assist 
                      doctors and healthcare professionals by manufacturing hospital-related items that would be useful 
                      in their work.
                    </p>
                    <p className="text-lg leading-relaxed">
                      After Jack died, Loraine continued in the business until she was 100 years old. 
                      She was the <strong className="text-foreground">oldest living alumnus of the University of Minnesota</strong> 
                      until her death at the remarkable age of 106 years.
                    </p>
                    <p className="text-lg leading-relaxed">
                      Today, we are proud to be in our <strong className="text-foreground">3rd generation of employees</strong> 
                      who are carrying forward the legacy of quality, innovation, and tremendous work ethic that 
                      produces great products.
                    </p>
                  </div>
                </div>
                <div className="bg-primary/5 p-8 rounded-lg border border-primary/20">
                  <blockquote className="text-lg italic text-muted-foreground mb-4">
                    "Our business was founded to assist doctors and others in the health care field by 
                    manufacturing hospital related items which would be useful in their work – primarily 
                    medical mechanical hardware."
                  </blockquote>
                  <cite className="text-primary font-semibold">
                    - Todd W. Buelow, President
                  </cite>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Timeline */}
        <div className="mb-16">
          <h3 className="text-3xl font-bold text-center text-foreground mb-12">
            Our Journey Through Time
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {timeline.map((event, index) => (
              <Card key={index} className="professional-hover bg-card shadow-card relative">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                      {event.icon}
                    </div>
                    <div className="text-2xl font-bold text-primary">{event.year}</div>
                  </div>
                  <h4 className="text-lg font-bold text-foreground mb-3">{event.title}</h4>
                  <p className="text-muted-foreground text-sm leading-relaxed">{event.description}</p>
                </CardContent>
                {index < timeline.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-0.5 bg-primary/30"></div>
                )}
              </Card>
            ))}
          </div>
        </div>

        {/* Company Philosophy */}
        <div className="bg-gradient-primary text-white rounded-lg p-8 md:p-12 text-center">
          <h3 className="text-2xl md:text-3xl font-bold mb-6">
            Our Niche in Medical Manufacturing
          </h3>
          <div className="max-w-4xl mx-auto space-y-4 text-lg">
            <p className="leading-relaxed">
              It is the nature of our business to occupy in the medical field a niche of limited distribution 
              even though we sell worldwide. We pay particular attention to producing high quality, 
              dependable products.
            </p>
            <p className="leading-relaxed">
              Our focus on customer satisfaction has made us a very successful company. Our company 
              prides itself in producing high quality products that stand up to the rigors of daily use 
              in a hospital.
            </p>
            <p className="leading-relaxed font-semibold">
              We are one of the most creative and innovative custom design firms in the field. 
              We can help you when perhaps no one else can.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default History;