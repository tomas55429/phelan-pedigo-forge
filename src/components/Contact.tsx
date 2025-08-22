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
  Send,
  FileText
} from 'lucide-react';
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const Contact = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    subject: '',
    message: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase.from('contact_submissions').insert({
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        email: formData.email,
        phone: formData.phone || null,
        company: formData.company || null,
        subject: formData.subject,
        message: formData.message
      });

      if (error) throw error;

      toast({
        title: "Message sent successfully!",
        description: "Thank you for contacting us. We'll get back to you soon.",
      });

      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        company: '',
        subject: '',
        message: ''
      });
    } catch (error) {
      console.error('Error submitting contact form:', error);
      toast({
        title: "Error sending message",
        description: "Please try again or contact us directly by phone.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
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
      details: "2523 Minnehaha Avenue, Minneapolis, MN 55404",
      description: "Manufacturing facility location"
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: "Hours",
      details: "Monday to Friday 7 AM–5 PM",
      description: "Saturday & Sunday: Closed"
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
                      <div className="min-w-0 flex-1">
                        <h4 className="font-semibold text-foreground mb-1">{info.title}</h4>
                        <p className="text-primary font-medium mb-1 break-words">{info.details}</p>
                        <p className="text-sm text-muted-foreground break-words">{info.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Purchase Orders Notice */}
            <Card className="bg-green-50 border border-green-200 dark:bg-green-950/20 dark:border-green-800">
              <CardContent className="p-6 md:p-8 text-center">
                <FileText className="h-10 w-10 md:h-12 md:w-12 text-green-600 mx-auto mb-3 md:mb-4" />
                <h4 className="text-lg md:text-xl font-bold text-foreground mb-3 md:mb-4">
                  Purchase Orders Accepted
                </h4>
                <p className="text-sm md:text-base text-muted-foreground">
                  We accept Purchase Orders (P.O.) for institutional and healthcare facility orders. 
                  Contact us to discuss your procurement needs and payment terms.
                </p>
              </CardContent>
            </Card>

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
                <Button 
                  size="lg" 
                  className="bg-primary text-primary-foreground hover:bg-primary-dark w-full sm:w-auto"
                  onClick={() => window.open('tel:+18003282358', '_self')}
                >
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
              <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input 
                      id="firstName" 
                      value={formData.firstName}
                      onChange={handleInputChange}
                      placeholder="Enter your first name"
                      className="bg-background"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input 
                      id="lastName" 
                      value={formData.lastName}
                      onChange={handleInputChange}
                      placeholder="Enter your last name"
                      className="bg-background"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email address"
                    className="bg-background"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input 
                    id="phone" 
                    type="tel" 
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Enter your phone number"
                    className="bg-background"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company">Company/Hospital</Label>
                  <Input 
                    id="company" 
                    value={formData.company}
                    onChange={handleInputChange}
                    placeholder="Enter your organization name"
                    className="bg-background"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input 
                    id="subject" 
                    value={formData.subject}
                    onChange={handleInputChange}
                    placeholder="What can we help you with?"
                    className="bg-background"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea 
                    id="message" 
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Tell us about your medical equipment needs..."
                    rows={5}
                    className="bg-background"
                    required
                  />
                </div>

                <Button 
                  type="submit" 
                  size="lg" 
                  disabled={isSubmitting}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary-dark disabled:opacity-50"
                >
                  <Send className="mr-2 h-5 w-5" />
                  {isSubmitting ? 'Sending...' : 'Send Message'}
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