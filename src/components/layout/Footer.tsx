import { Link } from "react-router-dom";
import { Instagram, Facebook, Youtube, Mail, Phone, MapPin, Twitter, ChevronRight } from "lucide-react";
import helmetHubLogo from "@/assets/helmet-hub-logo.png";
const Footer = () => {
  return (
    <footer className="bg-background border-t border-border">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="space-y-6">
            <Link to="/" className="inline-block">
              <img 
                src={helmetHubLogo} 
                alt="Helmet Hub" 
                className="h-10 w-auto object-contain"
              />
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Your trusted destination for premium motorcycle helmets and riding gear.
              Quality protection for every ride.
            </p>
            <div className="flex gap-3">
              <a
                href="https://www.instagram.com/helmethub46"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 bg-secondary text-foreground hover:text-primary hover:bg-primary/10 transition-all duration-300 rounded"
              >
                <Instagram size={18} />
              </a>
              <a
                href="#"
                className="p-2.5 bg-secondary text-foreground hover:text-primary hover:bg-primary/10 transition-all duration-300 rounded"
              >
                <Facebook size={18} />
              </a>
              <a
                href="#"
                className="p-2.5 bg-secondary text-foreground hover:text-primary hover:bg-primary/10 transition-all duration-300 rounded"
              >
                <Twitter size={18} />
              </a>
              <a
                href="#"
                className="p-2.5 bg-secondary text-foreground hover:text-primary hover:bg-primary/10 transition-all duration-300 rounded"
              >
                <Youtube size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-5">
            <h4 className="text-sm font-bold text-primary tracking-wider uppercase">Quick Links</h4>
            <ul className="space-y-3">
              {[
                { name: "Helmets", href: "/category/helmets" },
                { name: "Riding Gears", href: "/category/riding-gears" },
                { name: "Helmet Accessories", href: "/category/helmet-accessories" },
                { name: "Motorcycle Accessories", href: "/category/motorcycle-accessories" },
                { name: "Sale", href: "/sale" },
              ].map((link) => (
                <li key={link.name}>
                  <Link 
                    to={link.href} 
                    className="text-muted-foreground hover:text-primary transition-colors text-sm flex items-center gap-1 group"
                  >
                    <ChevronRight size={14} className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div className="space-y-5">
            <h4 className="text-sm font-bold text-primary tracking-wider uppercase">Customer Service</h4>
            <ul className="space-y-3">
              {[
                { name: "Track Orders", href: "/track-order" },
                { name: "Contact Us", href: "/contact" },
                { name: "Shipping Policy", href: "/shipping" },
                { name: "Returns & Refunds", href: "/returns" },
                { name: "FAQs", href: "/faq" },
                { name: "Size Guide", href: "/size-guide" },
              ].map((link) => (
                <li key={link.name}>
                  <Link 
                    to={link.href} 
                    className="text-muted-foreground hover:text-primary transition-colors text-sm flex items-center gap-1 group"
                  >
                    <ChevronRight size={14} className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-5">
            <h4 className="text-sm font-bold text-primary tracking-wider uppercase">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-muted-foreground text-sm">
                <MapPin size={18} className="text-primary mt-0.5 flex-shrink-0" />
                <span>123 Biker Street, Motorcycle City, MC 12345</span>
              </li>
              <li className="flex items-center gap-3 text-muted-foreground text-sm">
                <Phone size={18} className="text-primary flex-shrink-0" />
                <a href="tel:+919876543210" className="hover:text-primary transition-colors">
                  +91 98765 43210
                </a>
              </li>
              <li className="flex items-center gap-3 text-muted-foreground text-sm">
                <Mail size={18} className="text-primary flex-shrink-0" />
                <a href="mailto:support@helmethub.com" className="hover:text-primary transition-colors">
                  support@helmethub.com
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-border">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-muted-foreground text-xs text-center md:text-left">
              © 2024 Helmet Hub. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link to="/privacy" className="text-muted-foreground hover:text-primary transition-colors text-xs">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-muted-foreground hover:text-primary transition-colors text-xs">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
