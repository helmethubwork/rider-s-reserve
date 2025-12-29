import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, Heart, ShoppingCart, User, Menu, X, ChevronDown } from "lucide-react";

// Category data with subcategories
const navigationData = [
  {
    name: "Helmets",
    href: "/category/helmets",
    subcategories: [
      { name: "Full Face Helmets", href: "/category/helmets?type=full-face" },
      { name: "Half Face Helmets", href: "/category/helmets?type=half-face" },
      { name: "Modular Helmets", href: "/category/helmets?type=modular" },
      { name: "Off-Road Helmets", href: "/category/helmets?type=off-road" },
      { name: "Open Face Helmets", href: "/category/helmets?type=open-face" },
    ],
  },
  {
    name: "Riding Gears",
    href: "/category/riding-gears",
    subcategories: [
      { name: "Jackets", href: "/category/riding-gears?type=jackets" },
      { name: "Riding Pants", href: "/category/riding-gears?type=pants" },
      { name: "Knee & Elbow Guards", href: "/category/riding-gears?type=guards" },
      { name: "Gloves", href: "/category/riding-gears?type=gloves" },
      { name: "Face Mask", href: "/category/riding-gears?type=face-mask" },
      { name: "Arm Sleeves", href: "/category/riding-gears?type=arm-sleeves" },
      { name: "Bagpacks", href: "/category/riding-gears?type=bagpacks" },
      { name: "Boots", href: "/category/riding-gears?type=boots" },
    ],
  },
  {
    name: "Helmet Accessories",
    href: "/category/helmet-accessories",
    subcategories: [
      { name: "Visors", href: "/category/helmet-accessories?type=visors" },
      { name: "Bluetooth Intercoms", href: "/category/helmet-accessories?type=intercoms" },
      { name: "Helmet Locks", href: "/category/helmet-accessories?type=locks" },
      { name: "Helmet Bags", href: "/category/helmet-accessories?type=bags" },
      { name: "Anti-Fog Inserts", href: "/category/helmet-accessories?type=anti-fog" },
    ],
  },
  {
    name: "Motorcycle Accessories",
    href: "/category/motorcycle-accessories",
    subcategories: [
      { name: "Phone Mounts", href: "/category/motorcycle-accessories?type=phone-mounts" },
      { name: "Action Cameras", href: "/category/motorcycle-accessories?type=cameras" },
      { name: "Tank Bags", href: "/category/motorcycle-accessories?type=tank-bags" },
      { name: "Saddle Bags", href: "/category/motorcycle-accessories?type=saddle-bags" },
      { name: "Bike Covers", href: "/category/motorcycle-accessories?type=covers" },
    ],
  },
];

// Logo component with helmet icon
const Logo = () => (
  <Link to="/" className="flex items-center gap-2">
    {/* Helmet Icon */}
    <div className="relative w-10 h-10 md:w-12 md:h-12">
      <svg viewBox="0 0 48 48" className="w-full h-full" fill="none">
        <path
          d="M8 28C8 18 14 10 24 10C34 10 40 18 40 28C40 32 38 36 36 38H12C10 36 8 32 8 28Z"
          stroke="hsl(45 93% 58%)"
          strokeWidth="2.5"
          fill="none"
        />
        <path
          d="M12 24C12 20 17 16 24 16C31 16 36 20 36 24"
          stroke="hsl(45 93% 58%)"
          strokeWidth="2"
          fill="none"
        />
        <path
          d="M14 38H34"
          stroke="hsl(45 93% 58%)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>
    </div>
    <div className="flex flex-col items-start leading-none">
      <span className="text-lg md:text-xl font-bold text-foreground tracking-wider">
        HELMET HUB
      </span>
      <span className="text-xs md:text-sm font-semibold text-primary tracking-widest">
        AND GEARS
      </span>
    </div>
  </Link>
);

// Dropdown Menu Component
const NavDropdown = ({ item }: { item: typeof navigationData[0] }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <Link
        to={item.href}
        className="nav-link flex items-center gap-1 py-4"
      >
        {item.name}
        <ChevronDown
          size={14}
          className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </Link>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 min-w-[220px] bg-card border border-border rounded-lg shadow-lg z-50 py-2 animate-fade-in">
          {item.subcategories.map((sub) => (
            <Link
              key={sub.name}
              to={sub.href}
              className="block px-4 py-2.5 text-sm text-foreground hover:bg-secondary hover:text-primary transition-colors"
            >
              {sub.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedMobileCategory, setExpandedMobileCategory] = useState<string | null>(null);
  const [cartCount] = useState(0);
  const [wishlistCount] = useState(0);

  const toggleMobileCategory = (name: string) => {
    setExpandedMobileCategory(expandedMobileCategory === name ? null : name);
  };

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      {/* Top Banner */}
      <div className="bg-primary py-2 px-4 text-center">
        <p className="text-primary-foreground text-sm font-medium">
          🏍️ Preorder Now & Get 10% Off Your First Order!
        </p>
      </div>

      {/* Main Header */}
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Left Actions (Mobile Menu) */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              className="p-2 text-foreground"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Desktop Left Nav */}
          <nav className="hidden md:flex items-center gap-4 flex-1">
            <Link to="/latest-offers" className="nav-link py-4">
              Latest Offers
            </Link>
            {navigationData.slice(0, 2).map((item) => (
              <NavDropdown key={item.name} item={item} />
            ))}
          </nav>

          {/* Center Logo */}
          <div className="flex-shrink-0">
            <Logo />
          </div>

          {/* Desktop Right Nav */}
          <nav className="hidden md:flex items-center gap-4 flex-1 justify-end">
            {navigationData.slice(2).map((item) => (
              <NavDropdown key={item.name} item={item} />
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-1 md:gap-3 md:ml-4">
            <button className="p-2 text-foreground hover:text-primary transition-colors">
              <Search size={20} />
            </button>
            <Link to="/auth" className="p-2 text-foreground hover:text-primary transition-colors hidden md:block">
              <User size={20} />
            </Link>
            <Link to="/wishlist" className="p-2 text-foreground hover:text-primary transition-colors relative">
              <Heart size={20} />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center font-semibold">
                  {wishlistCount}
                </span>
              )}
            </Link>
            <Link to="/cart" className="p-2 text-foreground hover:text-primary transition-colors relative">
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center font-semibold">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-background border-t border-border max-h-[70vh] overflow-y-auto">
          <nav className="container mx-auto px-4 py-4 flex flex-col">
            <Link
              to="/latest-offers"
              className="nav-link py-3 border-b border-border"
              onClick={() => setMobileMenuOpen(false)}
            >
              Latest Offers
            </Link>
            
            {navigationData.map((item) => (
              <div key={item.name} className="border-b border-border">
                <button
                  onClick={() => toggleMobileCategory(item.name)}
                  className="w-full flex items-center justify-between py-3 nav-link"
                >
                  {item.name}
                  <ChevronDown
                    size={16}
                    className={`transition-transform duration-200 ${
                      expandedMobileCategory === item.name ? "rotate-180" : ""
                    }`}
                  />
                </button>
                
                {expandedMobileCategory === item.name && (
                  <div className="pb-3 pl-4 space-y-2">
                    {item.subcategories.map((sub) => (
                      <Link
                        key={sub.name}
                        to={sub.href}
                        className="block py-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {sub.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            
            <Link
              to="/auth"
              className="nav-link py-3 border-b border-border"
              onClick={() => setMobileMenuOpen(false)}
            >
              Login / Sign Up
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
