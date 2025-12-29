import { Link } from "react-router-dom";
import { Instagram, Facebook, Twitter, Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-secondary border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex flex-col">
              <span className="font-display text-2xl font-bold text-primary tracking-wider">
                HELMET
              </span>
              <span className="font-display text-xl font-bold text-foreground -mt-1 tracking-wider">
                HUB
              </span>
            </div>
            <p className="text-muted-foreground text-sm">
              Your trusted destination for premium motorcycle helmets and riding gear.
              Quality protection for every ride.
            </p>
            <div className="flex gap-4">
              <a
                href="https://www.instagram.com/helmethub46"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-card rounded-full text-foreground hover:text-primary hover:bg-primary/10 transition-all"
              >
                <Instagram size={20} />
              </a>
              <a
                href="#"
                className="p-2 bg-card rounded-full text-foreground hover:text-primary hover:bg-primary/10 transition-all"
              >
                <Facebook size={20} />
              </a>
              <a
                href="#"
                className="p-2 bg-card rounded-full text-foreground hover:text-primary hover:bg-primary/10 transition-all"
              >
                <Twitter size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-display text-lg font-semibold text-foreground">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/category/helmets" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Helmets
                </Link>
              </li>
              <li>
                <Link to="/category/riding-gears" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Riding Gears
                </Link>
              </li>
              <li>
                <Link to="/category/helmet-accessories" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Helmet Accessories
                </Link>
              </li>
              <li>
                <Link to="/category/motorcycle-accessories" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Motorcycle Accessories
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div className="space-y-4">
            <h4 className="font-display text-lg font-semibold text-foreground">Customer Service</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/shipping" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Shipping Policy
                </Link>
              </li>
              <li>
                <Link to="/returns" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Returns & Refunds
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  FAQs
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="font-display text-lg font-semibold text-foreground">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-muted-foreground text-sm">
                <MapPin size={18} className="text-primary mt-0.5 flex-shrink-0" />
                <span>123 Biker Street, Motorcycle City, MC 12345</span>
              </li>
              <li className="flex items-center gap-3 text-muted-foreground text-sm">
                <Phone size={18} className="text-primary flex-shrink-0" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center gap-3 text-muted-foreground text-sm">
                <Mail size={18} className="text-primary flex-shrink-0" />
                <span>support@helmethub.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-muted-foreground text-sm text-center md:text-left">
            © 2024 Helmet Hub. All rights reserved. Preorders Only.
          </p>
          <div className="flex gap-6">
            <Link to="/privacy" className="text-muted-foreground hover:text-primary transition-colors text-sm">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-muted-foreground hover:text-primary transition-colors text-sm">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
