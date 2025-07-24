import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  MessageSquare,
  Send
} from 'lucide-react';

const Contact = () => {
  const contactInfo = [
    {
      icon: <Phone className="h-6 w-6" />,
      title: "Phone",
      details: "1-800-328-2358",
      description: "Speak directly to an equipment specialist"
    },
    {
      icon: <Mail className="h-6 w-6" />,
      title: "Email",
      details: "Richard@PhelanMfgCorp.com",
      description: "Send us your questions anytime"
    },
    {
      icon: <MapPin className="h-6 w-6" />,
      title: "Location",
      details: "Made in the USA",
      description: "Manufacturing facility location"
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: "Hours",
      details: "Monday - Friday",
      description: "Business hours available"
    }
  ];

  return (
    <section id="contact" className="py-12 md:py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8 md:mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 md:mb-6">
            Contact Our Specialists
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto px-4">
            Ready to discuss your medical equipment needs? Our team of specialists 
            is here to help you find the perfect solution.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-12">
          {/* Contact Information */}
          <div className="space-y-6 md:space-y-8">
            <div>
              <h3 className="text-xl md:text-2xl font-bold text-foreground mb-4 md:mb-6">
                Get in Touch
              </h3>
              <p className="text-base md:text-lg text-muted-foreground mb-6 md:mb-8">
                We're here to answer your questions and help you find the right medical equipment 
                for your facility. Contact us today to speak with one of our specialists.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:gap-6">
              {contactInfo.map((info, index) => (
                <Card key={index} className="professional-hover bg-card shadow-card">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="p-3 bg-primary/10 rounded-lg text-primary flex-shrink-0">
                        {info.icon}
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground mb-1">{info.title}</h4>
                        <p className="text-primary font-medium mb-1">{info.details}</p>
                        <p className="text-sm text-muted-foreground">{info.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Call to Action */}
            <Card className="bg-primary/5 border border-primary/20">
              <CardContent className="p-6 md:p-8 text-center">
                <MessageSquare className="h-10 w-10 md:h-12 md:w-12 text-primary mx-auto mb-3 md:mb-4" />
                <h4 className="text-lg md:text-xl font-bold text-foreground mb-3 md:mb-4">
                  Prefer to Call?
                </h4>
                <p className="text-sm md:text-base text-muted-foreground mb-4 md:mb-6">
                  Call us toll-free and speak directly to an equipment specialist at our plant. 
                  Our team is ready to discuss your specific needs and provide expert guidance.
                </p>
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary-dark w-full sm:w-auto">
                  <Phone className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                  Call 1-800-328-2358
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <Card className="bg-card shadow-card">
            <CardHeader className="pb-4 md:pb-6">
              <CardTitle className="text-xl md:text-2xl text-foreground">Send Us a Message</CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
              <form className="space-y-4 md:space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input 
                      id="firstName" 
                      placeholder="Enter your first name"
                      className="bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input 
                      id="lastName" 
                      placeholder="Enter your last name"
                      className="bg-background"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="Enter your email address"
                    className="bg-background"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input 
                    id="phone" 
                    type="tel" 
                    placeholder="Enter your phone number"
                    className="bg-background"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company">Company/Hospital</Label>
                  <Input 
                    id="company" 
                    placeholder="Enter your organization name"
                    className="bg-background"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input 
                    id="subject" 
                    placeholder="What can we help you with?"
                    className="bg-background"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea 
                    id="message" 
                    placeholder="Tell us about your medical equipment needs..."
                    rows={5}
                    className="bg-background"
                  />
                </div>

                <Button type="submit" size="lg" className="w-full bg-primary text-primary-foreground hover:bg-primary-dark">
                  <Send className="mr-2 h-5 w-5" />
                  Send Message
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default Contact;