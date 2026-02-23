import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { goBack } from "@/lib/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Mail, Phone, MapPin, Clock, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSiteSettings, getSettingValue } from "@/hooks/useSiteSettings";

const ContactPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: contactSettings } = useSiteSettings('contact');
  const { data: businessSettings } = useSiteSettings('business');

  // Contact settings with fallbacks
  const primaryPhone = getSettingValue(contactSettings, 'primary_phone', '+91 7842646888');
  const secondaryPhone = getSettingValue(contactSettings, 'secondary_phone', '+91 9063880550');
  const supportEmail = getSettingValue(contactSettings, 'support_email', 'support@helmethub.in');
  const ordersEmail = getSettingValue(contactSettings, 'orders_email', 'orders@helmethub.in');
  const storeAddress = getSettingValue(contactSettings, 'store_address', '1st Branch: HELMET HUB, 1st Floor, Besides Little Goa, Opp. Omega Hospital, Telecom Nagar, Gachibowli, Hyd-500033. T.G.\n2nd Branch: HELMET HUB, 1st Floor, Above Baskin Robbins, Next to Chirec School, Sriram Nagar, Kondapur, Hyd-500084. T.G.');

  // Business settings with fallbacks
  const businessHours = getSettingValue(businessSettings, 'business_hours', '10:00 AM - 11:00 PM');

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { supabase } = await import("@/lib/supabase");
      
      const { error } = await supabase.from("contact_messages").insert({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || null,
        subject: formData.subject.trim(),
        message: formData.message.trim(),
      });

      if (error) throw error;

      toast({
        title: "Message Sent",
        description: "Thank you for contacting us. We'll get back to you soon!"
      });
      setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
    } catch (error) {
      console.error("Contact form error:", error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      {/* Back Button */}
      <div className="container mx-auto px-4 pt-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => goBack(navigate)}
          className="flex items-center gap-1.5 text-foreground hover:text-primary"
        >
          <ArrowLeft size={16} />
          <span className="text-sm">Back</span>
        </Button>
      </div>

      <main className="flex-1 pt-4 pb-4">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-serif font-normal text-center text-foreground tracking-wide mb-4 uppercase">
              Contact Us
            </h1>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
              {/* Contact Information */}
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-serif text-foreground mb-6">Get In Touch</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Have questions about our products or need assistance with your order? We're here to help! Reach out to us through any of the channels below.
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <Phone className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">Phone</h3>
                      <p className="text-muted-foreground">{primaryPhone}</p>
                      {secondaryPhone && <p className="text-muted-foreground">{secondaryPhone}</p>}
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">Email</h3>
                      <p className="text-muted-foreground">{supportEmail}</p>
                      {ordersEmail && <p className="text-muted-foreground">{ordersEmail}</p>}
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">Address</h3>
                      <p className="text-muted-foreground whitespace-pre-line">{storeAddress}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <Clock className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">Business Hours</h3>
                      <p className="text-muted-foreground">Monday - Sunday: {businessHours}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Form */}
              <div className="bg-card rounded-lg p-8 border border-border">
                <h2 className="text-2xl font-serif text-foreground mb-6">Send Us a Message</h2>
                
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-foreground">
                      Your Name <span className="text-destructive">*</span>
                    </Label>
                    <Input id="name" value={formData.name} onChange={e => handleInputChange("name", e.target.value)} required className="bg-secondary border-border text-foreground" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-foreground">
                      Email Address <span className="text-destructive">*</span>
                    </Label>
                    <Input id="email" type="email" value={formData.email} onChange={e => handleInputChange("email", e.target.value)} required className="bg-secondary border-border text-foreground" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-foreground">
                      Phone Number
                    </Label>
                    <Input id="phone" value={formData.phone} onChange={e => handleInputChange("phone", e.target.value)} className="bg-secondary border-border text-foreground" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject" className="text-foreground">
                      Subject <span className="text-destructive">*</span>
                    </Label>
                    <Input id="subject" value={formData.subject} onChange={e => handleInputChange("subject", e.target.value)} required className="bg-secondary border-border text-foreground" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-foreground">
                      Message <span className="text-destructive">*</span>
                    </Label>
                    <Textarea id="message" value={formData.message} onChange={e => handleInputChange("message", e.target.value)} required rows={5} className="bg-secondary border-border text-foreground resize-none" />
                  </div>

                  <Button type="submit" disabled={isSubmitting} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-3">
                    {isSubmitting ? "Sending..." : "Send Message"}
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* Business Information */}
      <div className="border-t border-border">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-5xl mx-auto">
            <div className="bg-card rounded-lg p-6 md:p-8 border border-border">
              <h2 className="text-xl font-serif text-foreground mb-4">Business Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-muted-foreground">
                <p><span className="text-foreground font-medium">Business Name:</span> Helmet Hub</p>
                <p><span className="text-foreground font-medium">Website:</span> <a href="https://www.helmethub.in" className="text-primary hover:underline">https://www.helmethub.in</a></p>
                <p><span className="text-foreground font-medium">Email:</span> support@helmethub.in</p>
                <p><span className="text-foreground font-medium">Phone:</span> {primaryPhone}</p>
                <p><span className="text-foreground font-medium">Business Address:</span> Hyderabad, Telangana, India</p>
                <p><span className="text-foreground font-medium">Working Hours:</span> Mon–Sat: 10 AM – 8 PM</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ContactPage;
