import { Link } from "react-router-dom";
import { Instagram, Facebook, Mail, Phone, MapPin, ChevronRight, CreditCard, Shield } from "lucide-react";
import { useSiteSettings, getSettingValue } from "@/hooks/useSiteSettings";
import { useNavigationLinks } from "@/hooks/useNavigationLinks";

// Static fallback for customer service links
const staticCustomerServiceLinks = [
  { name: "Track Orders", href: "/track-order" },
  { name: "Contact Us", href: "/contact" },
  { name: "Shipping Policy", href: "/shipping-policy" },
  { name: "Returns", href: "/exchange-returns" },
];

const Footer = () => {
  const { data: contactSettings } = useSiteSettings('contact');
  const { data: socialSettings } = useSiteSettings('social');
  const { data: dbLinks = [] } = useNavigationLinks('customer_service');

  // Use database links if available, otherwise static fallback
  const customerServiceLinks = dbLinks.length > 0
    ? dbLinks.map(link => ({ name: link.name, href: link.href }))
    : staticCustomerServiceLinks;

  // Contact settings with fallbacks
  const primaryPhone = getSettingValue(contactSettings, 'primary_phone', '+91 7842646888');
  const secondaryPhone = getSettingValue(contactSettings, 'secondary_phone', '+91 9063880550');
  const supportEmail = getSettingValue(contactSettings, 'support_email', 'support@helmethub.com');
  const storeAddress = getSettingValue(contactSettings, 'store_address', 'HELMET HUB, 1st Floor, Besides Little Goa, Opp. Omega Hospital, Gachibowli, Hyd-500033');
  const storeMapUrl = getSettingValue(contactSettings, 'store_map_url', 'https://maps.app.goo.gl/VWFZsQQupJ1oxvVy6');

  // Social settings with fallbacks
  const instagramUrl = getSettingValue(socialSettings, 'instagram_url', 'https://www.instagram.com/helmethub46');
  const facebookUrl = getSettingValue(socialSettings, 'facebook_url', '#');

  return (
    <footer className="bg-secondary/50 border-t border-border">
      {/* Main Footer */}
      <div className="container mx-auto px-3 sm:px-4 py-10 sm:py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1 space-y-4 sm:space-y-5">
            <Link to="/" className="inline-flex items-center gap-0.5">
              <div className="flex items-center gap-0.5 mr-0.5">
                <div className="w-0.5 h-5 bg-foreground transform -skew-x-12" />
                <div className="w-0.5 h-5 bg-primary transform -skew-x-12" />
              </div>
              <span className="text-xl font-black text-primary tracking-tight" style={{ fontStyle: 'italic' }}>
                HELMET
              </span>
              <span className="text-xl font-black text-foreground tracking-tight" style={{ fontStyle: 'italic' }}>
                HUB
              </span>
              <div className="flex items-center gap-0.5 ml-0.5">
                <div className="w-0.5 h-5 bg-primary transform -skew-x-12" />
                <div className="w-0.5 h-5 bg-foreground transform -skew-x-12" />
              </div>
            </Link>
            <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
              Your trusted destination for premium motorcycle helmets and riding gear.
            </p>
            <div className="flex gap-2">
              <a 
                href={instagramUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="p-2 bg-card text-foreground hover:text-primary hover:bg-primary/10 transition-all duration-300 rounded-lg active:scale-95"
                aria-label="Instagram"
              >
                <Instagram size={18} />
              </a>
              <a 
                href={facebookUrl} 
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-card text-foreground hover:text-primary hover:bg-primary/10 transition-all duration-300 rounded-lg active:scale-95"
                aria-label="Facebook"
              >
                <Facebook size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-xs sm:text-sm font-bold text-foreground tracking-wider uppercase">Quick Links</h4>
            <ul className="space-y-2 sm:space-y-2.5">
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
                    <ChevronRight size={12} className="opacity-0 -ml-3 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div className="space-y-4">
            <h4 className="text-xs sm:text-sm font-bold text-foreground tracking-wider uppercase">Customer Service</h4>
            <ul className="space-y-2 sm:space-y-2.5">
              {customerServiceLinks.map((link) => (
                <li key={link.name}>
                  <Link 
                    to={link.href} 
                    className="text-muted-foreground hover:text-primary active:text-primary transition-colors text-xs sm:text-sm flex items-center gap-1 group"
                  >
                    <ChevronRight size={12} className="opacity-0 -ml-3 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="col-span-2 sm:col-span-1 space-y-4">
            <h4 className="text-xs sm:text-sm font-bold text-foreground tracking-wider uppercase">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-muted-foreground text-xs sm:text-sm">
                <MapPin size={16} className="text-primary mt-0.5 flex-shrink-0" />
                <a 
                  href={storeMapUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-primary active:text-primary transition-colors leading-relaxed"
                >
                  {storeAddress}
                </a>
              </li>
              <li className="flex items-start gap-2 text-muted-foreground text-xs sm:text-sm">
                <Phone size={16} className="text-primary flex-shrink-0 mt-0.5" />
                <div className="flex flex-col gap-0.5">
                  <a className="hover:text-primary transition-colors" href={`tel:${primaryPhone.replace(/\s/g, '')}`}>
                    {primaryPhone}
                  </a>
                  {secondaryPhone && (
                    <a className="hover:text-primary transition-colors" href={`tel:${secondaryPhone.replace(/\s/g, '')}`}>
                      {secondaryPhone}
                    </a>
                  )}
                </div>
              </li>
              <li className="flex items-center gap-2 text-muted-foreground text-xs sm:text-sm">
                <Mail size={16} className="text-primary flex-shrink-0" />
                <a href={`mailto:${supportEmail}`} className="hover:text-primary transition-colors">
                  {supportEmail}
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-border bg-background">
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-muted-foreground text-[10px] sm:text-xs text-center sm:text-left">
              © 2024 Helmet Hub. All rights reserved.
            </p>
            
            {/* Payment & Security Icons */}
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <CreditCard size={16} className="sm:w-[18px] sm:h-[18px]" />
                <span className="text-[10px] sm:text-xs">Secure Payments</span>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Shield size={16} className="sm:w-[18px] sm:h-[18px]" />
                <span className="text-[10px] sm:text-xs">100% Authentic</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
