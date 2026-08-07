import { Link } from "react-router-dom";
import { Instagram, Facebook, Mail, Phone, MapPin, ChevronRight } from "lucide-react";
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
  const supportEmail = getSettingValue(contactSettings, 'support_email', 'support@helmethub.in');
  const storeAddress = getSettingValue(contactSettings, 'store_address', 'HELMET HUB, 1st Floor, Besides Little Goa, Opp. Omega Hospital, Gachibowli, Hyd-500033');
  const storeMapUrl = getSettingValue(contactSettings, 'store_map_url', 'https://maps.app.goo.gl/VWFZsQQupJ1oxvVy6');

  // Social settings with fallbacks
  const instagramUrl = getSettingValue(socialSettings, 'instagram_url', 'https://www.instagram.com/helmethub46');
  const facebookUrl = getSettingValue(socialSettings, 'facebook_url', '#');

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
                href={instagramUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="p-2 sm:p-2.5 bg-secondary text-foreground hover:text-primary hover:bg-primary/10 transition-all duration-300 rounded active:scale-95"
                aria-label="Instagram"
              >
                <Instagram size={16} className="sm:w-[18px] sm:h-[18px]" />
              </a>
              <a 
                href={facebookUrl} 
                target="_blank"
                rel="noopener noreferrer"
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
              {customerServiceLinks.map((link) => (
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
                  href={storeMapUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-primary active:text-primary transition-colors leading-relaxed"
                >
                  {storeAddress}
                </a>
              </li>
              <li className="flex items-start gap-2 sm:gap-3 text-muted-foreground text-xs sm:text-sm">
                <Phone size={16} className="sm:w-[18px] sm:h-[18px] text-primary flex-shrink-0 mt-0.5" />
                <div className="flex flex-col gap-1">
                  <a className="hover:text-primary active:text-primary transition-colors" href={`tel:${primaryPhone.replace(/\s/g, '')}`}>
                    {primaryPhone}
                  </a>
                  {secondaryPhone && (
                    <a className="hover:text-primary active:text-primary transition-colors" href={`tel:${secondaryPhone.replace(/\s/g, '')}`}>
                      {secondaryPhone}
                    </a>
                  )}
                </div>
              </li>
              <li className="flex items-center gap-2 sm:gap-3 text-muted-foreground text-xs sm:text-sm">
                <Mail size={16} className="sm:w-[18px] sm:h-[18px] text-primary flex-shrink-0" />
                <a href={`mailto:${supportEmail}`} className="hover:text-primary active:text-primary transition-colors">
                  {supportEmail}
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-border">
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4">
            <p className="text-muted-foreground text-[10px] sm:text-xs text-center sm:text-left">
              © {new Date().getFullYear()} Helmet Hub. All rights reserved.
            </p>
            <div className="flex items-center gap-3 sm:gap-4 text-[10px] sm:text-xs text-muted-foreground">
              <span className="flex items-center gap-1">🔒 Secure Payments</span>
              <span className="hidden sm:inline text-border">|</span>
              <Link to="/shipping-policy" className="hover:text-primary transition-colors">Shipping Policy</Link>
              <span className="text-border">|</span>
              <Link to="/exchange-returns" className="hover:text-primary transition-colors">Returns</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
