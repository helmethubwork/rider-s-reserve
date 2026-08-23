import { Link } from "react-router-dom";
import { Instagram, Facebook, Mail, Phone, MapPin } from "lucide-react";
import { useSiteSettings, getSettingValue } from "@/hooks/useSiteSettings";
import { useNavigationLinks } from "@/hooks/useNavigationLinks";

// Static fallback for customer service links
const staticCustomerServiceLinks = [
  { name: "Track Orders", href: "/track-order" },
  { name: "Contact Us", href: "/contact" },
  { name: "Shipping Policy", href: "/shipping-policy" },
  { name: "Returns", href: "/exchange-returns" },
];

const quickLinks = [
  { name: "Helmets", href: "/category/helmets" },
  { name: "Riding Gears", href: "/category/riding-gears" },
  { name: "Accessories", href: "/category/helmet-accessories" },
  { name: "Sale", href: "/sale" },
];

const Footer = () => {
  const { data: contactSettings } = useSiteSettings("contact");
  const { data: socialSettings } = useSiteSettings("social");
  const { data: dbLinks = [] } = useNavigationLinks("customer_service");

  const customerServiceLinks =
    dbLinks.length > 0 ? dbLinks.map((l) => ({ name: l.name, href: l.href })) : staticCustomerServiceLinks;

  const primaryPhone = getSettingValue(contactSettings, "primary_phone", "+91 7842646888");
  const secondaryPhone = getSettingValue(contactSettings, "secondary_phone", "+91 9063880550");
  const supportEmail = getSettingValue(contactSettings, "support_email", "support@helmethub.in");
  const storeAddress = getSettingValue(
    contactSettings,
    "store_address",
    "HELMET HUB, 1st Floor, Besides Little Goa, Opp. Omega Hospital, Gachibowli, Hyd-500033"
  );
  const storeMapUrl = getSettingValue(contactSettings, "store_map_url", "https://maps.app.goo.gl/VWFZsQQupJ1oxvVy6");

  const instagramUrl = getSettingValue(socialSettings, "instagram_url", "https://www.instagram.com/helmethub46");
  const facebookUrl = getSettingValue(socialSettings, "facebook_url", "#");

  const linkClass =
    "text-muted-foreground/80 hover:text-primary transition-colors duration-200 text-[13px] leading-relaxed";

  const headingClass =
    "text-[11px] font-semibold text-foreground/50 uppercase tracking-[0.14em] mb-3";

  return (
    <footer className="bg-background border-t border-border/50">
      <div className="container mx-auto px-4 py-9 sm:py-12 md:py-14">
        {/* Brand — full width on mobile, first column on desktop */}
        <div className="lg:grid lg:grid-cols-[1.4fr_1fr_1fr_1.3fr] lg:gap-10">
          <div className="mb-8 lg:mb-0">
            <Link to="/" className="inline-flex items-center gap-0.5 mb-3">
              <div className="flex items-center gap-0.5 mr-1">
                <div className="w-[3px] h-5 bg-white/90 -skew-x-12" />
                <div className="w-[3px] h-5 bg-primary -skew-x-12" />
              </div>
              <span className="text-lg font-black text-primary tracking-tight italic">HELMET</span>
              <span className="text-lg font-black text-foreground tracking-tight italic ml-0.5">HUB</span>
              <div className="flex items-center gap-0.5 ml-1">
                <div className="w-[3px] h-5 bg-primary -skew-x-12" />
                <div className="w-[3px] h-5 bg-white/90 -skew-x-12" />
              </div>
            </Link>

            <p className="text-muted-foreground/70 text-[13px] leading-relaxed max-w-xs mb-4">
              Premium motorcycle helmets and riding gear. Quality protection for every ride.
            </p>

            <div className="flex gap-2">
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-secondary/70 text-muted-foreground hover:text-primary hover:bg-secondary flex items-center justify-center transition-all duration-200 active:scale-90"
                aria-label="Instagram"
              >
                <Instagram size={16} />
              </a>
              <a
                href={facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-secondary/70 text-muted-foreground hover:text-primary hover:bg-secondary flex items-center justify-center transition-all duration-200 active:scale-90"
                aria-label="Facebook"
              >
                <Facebook size={16} />
              </a>
            </div>
          </div>

          {/* Link columns — side by side on mobile */}
          <div className="grid grid-cols-2 gap-6 mb-8 lg:mb-0 lg:contents">
            <div>
              <h4 className={headingClass}>Shop</h4>
              <ul className="space-y-2">
                {quickLinks.map((link) => (
                  <li key={link.name}>
                    <Link to={link.href} className={linkClass}>
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className={headingClass}>Support</h4>
              <ul className="space-y-2">
                {customerServiceLinks.map((link) => (
                  <li key={link.name}>
                    <Link to={link.href} className={linkClass}>
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className={headingClass}>Get In Touch</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5">
                <MapPin size={15} className="text-primary/70 mt-[3px] flex-shrink-0" />
                <a
                  href={storeMapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={linkClass}
                >
                  {storeAddress}
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <Phone size={15} className="text-primary/70 mt-[3px] flex-shrink-0" />
                <div className="flex flex-col">
                  <a href={`tel:${primaryPhone.replace(/\s/g, "")}`} className={linkClass}>
                    {primaryPhone}
                  </a>
                  {secondaryPhone && (
                    <a href={`tel:${secondaryPhone.replace(/\s/g, "")}`} className={linkClass}>
                      {secondaryPhone}
                    </a>
                  )}
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <Mail size={15} className="text-primary/70 mt-[3px] flex-shrink-0" />
                <a href={`mailto:${supportEmail}`} className={`${linkClass} break-all`}>
                  {supportEmail}
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-border/40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5">
            <p className="text-muted-foreground/60 text-[11px] order-2 sm:order-1">
              © {new Date().getFullYear()} Helmet Hub. All rights reserved.
            </p>
            <div className="flex items-center gap-3 text-[11px] text-muted-foreground/60 order-1 sm:order-2">
              <span>Secure Payments</span>
              <span className="w-px h-3 bg-border" />
              <Link to="/shipping-policy" className="hover:text-primary transition-colors">
                Shipping
              </Link>
              <span className="w-px h-3 bg-border" />
              <Link to="/exchange-returns" className="hover:text-primary transition-colors">
                Returns
              </Link>
            </div>
          </div>
          <p className="text-center text-muted-foreground/50 text-[11px] mt-3">
            Designed &amp; Developed by Zoptavi
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
