import { Link } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { 
  ChevronRight, 
  Truck, 
  RefreshCw, 
  Shield, 
  MessageCircle,
  MapPin,
  Package,
  HelpCircle
} from 'lucide-react';

const supportLinks = [
  {
    title: 'Shipping Policy',
    description: 'Learn about our shipping methods, delivery times, and charges.',
    icon: Truck,
    href: '/shipping-policy',
  },
  {
    title: 'Exchange, Returns & Cancellation',
    description: 'Understand our hassle-free return and exchange process.',
    icon: RefreshCw,
    href: '/exchange-returns',
  },
  {
    title: 'Warranty Policy',
    description: 'Know about warranty coverage and how to claim it.',
    icon: Shield,
    href: '/warranty-policy',
  },
  {
    title: 'Contact Us',
    description: 'Get in touch with our customer support team.',
    icon: MessageCircle,
    href: '/contact',
  },
  {
    title: 'Store Locator',
    description: 'Find a Helmet Hub store near you.',
    icon: MapPin,
    href: '/stores',
  },
  {
    title: 'Track Your Order',
    description: 'Check the status of your recent orders.',
    icon: Package,
    href: '/track-order',
  },
];

const faqs = [
  {
    question: 'How long does delivery take?',
    answer: 'Standard delivery takes 5-7 business days. Express delivery is available in select cities with 2-3 day delivery.',
  },
  {
    question: 'Can I return a product if it doesn\'t fit?',
    answer: 'Yes! We offer easy exchanges within 7 days of delivery. The product must be unused and in original packaging.',
  },
  {
    question: 'Are all helmets ISI certified?',
    answer: 'Yes, all helmets sold on Helmet Hub are ISI/DOT/ECE certified as per Indian road safety standards.',
  },
  {
    question: 'How do I claim warranty?',
    answer: 'Contact our support team with your order details and product photos. We\'ll guide you through the warranty claim process.',
  },
];

const SupportPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-20">
        {/* Breadcrumb */}
        <div className="bg-muted/30 border-b border-border">
          <div className="container mx-auto px-4 py-3">
            <nav className="flex items-center gap-2 text-sm">
              <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
                Home
              </Link>
              <ChevronRight size={14} className="text-muted-foreground" />
              <span className="text-foreground font-medium">Support</span>
            </nav>
          </div>
        </div>

        {/* Hero Section */}
        <section className="bg-gradient-to-b from-primary/10 to-background py-12 md:py-16">
          <div className="container mx-auto px-4 text-center">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <HelpCircle size={32} className="text-primary" />
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              How Can We Help?
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Find answers to your questions, track orders, or get in touch with our support team.
            </p>
          </div>
        </section>

        {/* Support Links Grid */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {supportLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    to={link.href}
                    className="group bg-card border border-border rounded-xl p-6 hover:border-primary/50 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                      <Icon size={24} className="text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground text-lg mb-2 group-hover:text-primary transition-colors">
                      {link.title}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      {link.description}
                    </p>
                    <div className="mt-4 flex items-center gap-1 text-primary text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      Learn more
                      <ChevronRight size={16} />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* FAQs Section */}
        <section className="bg-muted/30 py-12 md:py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-8">
              Frequently Asked Questions
            </h2>
            <div className="max-w-3xl mx-auto space-y-4">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="bg-card border border-border rounded-xl p-6"
                >
                  <h3 className="font-semibold text-foreground mb-2">
                    {faq.question}
                  </h3>
                  <p className="text-muted-foreground">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
            <div className="text-center mt-8">
              <p className="text-muted-foreground mb-4">
                Still have questions?
              </p>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                Contact Support
                <ChevronRight size={18} />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default SupportPage;
