import { Link } from "react-router-dom";
import { Instagram, Facebook, Mail, Phone, MapPin, ChevronRight } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-background border-t border-border">
      {/* Main Footer */}
      <div className="container mx-auto px-3 sm:px-4 py-10 sm:py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1 space-y-4 sm:space-y-6">
            <Link to="/" className="inline-flex items-center gap-1">
              {/* Racing stripes accent */}
              <div className="flex items-center gap-0.5 mr-1">
                <div className="w-1 h-5 sm:h-6 bg-white transform -skew-x-12" />
                <div className="w-1 h-5 sm:h-6 bg-primary transform -skew-x-12" />
              </div>
              <span 
                className="text-xl sm:text-2xl font-black text-primary tracking-tight" 
                style={{ fontStyle: 'italic' }}
              >
                HELMET
              </span>
              <span 
                className="text-xl sm:text-2xl font-black text-foreground tracking-tight" 
                style={{ fontStyle: 'italic' }}
              >
                HUB
              </span>
              {/* Racing stripes accent */}
              <div className="flex items-center gap-0.5 ml-1">
                <div className="w-1 h-5 sm:h-6 bg-primary transform -skew-x-12" />
                <div className="w-1 h-5 sm:h-6 bg-white transform -skew-x-12" />
              </div>
            </Link>
            <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
              Your trusted destination for premium motorcycle helmets and riding gear.
              Quality protection for every ride.
            </p>
            <div className="flex gap-2 sm:gap-3">
              <a 
                href="https://www.instagram.com/helmethub46" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="p-2 sm:p-2.5 bg-secondary text-foreground hover:text-primary hover:bg-primary/10 transition-all duration-300 rounded active:scale-95"
                aria-label="Instagram"
              >
                <Instagram size={16} className="sm:w-[18px] sm:h-[18px]" />
              </a>
              <a 
                href="#" 
                className="p-2 sm:p-2.5 bg-secondary text-foreground hover:text-primary hover:bg-primary/10 transition-all duration-300 rounded active:scale-95"
                aria-label="Facebook"
              >
                <Facebook size={16} className="sm:w-[18px] sm:h-[18px]" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4 sm:space-y-5">
            <h4 className="text-xs sm:text-sm font-bold text-primary tracking-wider uppercase">Quick Links</h4>
            <ul className="space-y-2 sm:space-y-3">
              {[
                { name: "Helmets", href: "/category/helmets" },
                { name: "Riding Gears", href: "/category/riding-gears" },
                { name: "Accessories", href: "/category/helmet-accessories" },
                { name: "Sale", href: "/sale" },
              ].map((link) => (
                <li key={link.name}>
                  <Link 
                    to={link.href} 
                    className="text-muted-foreground hover:text-primary active:text-primary transition-colors text-xs sm:text-sm flex items-center gap-1 group"
                  >
                    <ChevronRight size={12} className="sm:w-3.5 sm:h-3.5 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div className="space-y-4 sm:space-y-5">
            <h4 className="text-xs sm:text-sm font-bold text-primary tracking-wider uppercase">Customer Service</h4>
            <ul className="space-y-2 sm:space-y-3">
              {[
                { name: "Track Orders", href: "/track-order" },
                { name: "Contact Us", href: "/contact" },
                { name: "Shipping Policy", href: "/shipping-policy" },
                { name: "Returns", href: "/exchange-returns" },
              ].map((link) => (
                <li key={link.name}>
                  <Link 
                    to={link.href} 
                    className="text-muted-foreground hover:text-primary active:text-primary transition-colors text-xs sm:text-sm flex items-center gap-1 group"
                  >
                    <ChevronRight size={12} className="sm:w-3.5 sm:h-3.5 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="col-span-2 sm:col-span-1 space-y-4 sm:space-y-5">
            <h4 className="text-xs sm:text-sm font-bold text-primary tracking-wider uppercase">Contact Us</h4>
            <ul className="space-y-3 sm:space-y-4">
              <li className="flex items-start gap-2 sm:gap-3 text-muted-foreground text-xs sm:text-sm">
                <MapPin size={16} className="sm:w-[18px] sm:h-[18px] text-primary mt-0.5 flex-shrink-0" />
                <a 
                  href="https://maps.app.goo.gl/VWFZsQQupJ1oxvVy6" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-primary active:text-primary transition-colors leading-relaxed"
                >
                  HELMET HUB, 1st Floor, Besides Little Goa, Opp. Omega Hospital, Gachibowli, Hyd-500033
                </a>
              </li>
              <li className="flex items-start gap-2 sm:gap-3 text-muted-foreground text-xs sm:text-sm">
                <Phone size={16} className="sm:w-[18px] sm:h-[18px] text-primary flex-shrink-0 mt-0.5" />
                <div className="flex flex-col gap-1">
                  <a className="hover:text-primary active:text-primary transition-colors" href="tel:+917842646888">
                    +91 7842646888
                  </a>
                  <a className="hover:text-primary active:text-primary transition-colors" href="tel:+919063880550">
                    +91 9063880550
                  </a>
                </div>
              </li>
              <li className="flex items-center gap-2 sm:gap-3 text-muted-foreground text-xs sm:text-sm">
                <Mail size={16} className="sm:w-[18px] sm:h-[18px] text-primary flex-shrink-0" />
                <a href="mailto:support@helmethub.com" className="hover:text-primary active:text-primary transition-colors">
                  support@helmethub.com
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-border">
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
            <p className="text-muted-foreground text-[10px] sm:text-xs text-center sm:text-left">
              © 2024 Helmet Hub. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
