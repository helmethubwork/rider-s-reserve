import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, Heart, ShoppingCart, User, Menu, X, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";

// Category data with subcategories
const navigationData = [
  {
    name: "Latest Offers",
    href: "/latest-offers",
    subcategories: [],
  },
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
  {
    name: "All Brands",
    href: "/brands",
    subcategories: [
      { name: "AGV", href: "/brands/agv" },
      { name: "HJC", href: "/brands/hjc" },
      { name: "Shoei", href: "/brands/shoei" },
      { name: "LS2", href: "/brands/ls2" },
      { name: "MT Helmets", href: "/brands/mt" },
      { name: "Studds", href: "/brands/studds" },
    ],
  },
  {
    name: "Contact",
    href: "/contact",
    subcategories: [],
  },
];

// Dropdown Menu Component
const NavDropdown = ({ item }: { item: typeof navigationData[0] }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (item.subcategories.length === 0) {
    return (
      <Link to={item.href} className="nav-link py-3">
        {item.name}
      </Link>
    );
  }

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <Link
        to={item.href}
        className="nav-link flex items-center gap-1 py-3"
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
    <header className="sticky top-0 z-50 bg-background border-b border-border">
      {/* Top Banner with arrows */}
      <div className="bg-background py-2 px-4">
        <div className="flex items-center justify-center gap-4">
          <button className="text-muted-foreground hover:text-primary transition-colors">
            <ChevronLeft size={18} />
          </button>
          <p className="text-primary text-sm font-medium">
            Get Assured Flat Discount on your First Order
          </p>
          <button className="text-muted-foreground hover:text-primary transition-colors">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Main Header - Logo centered with icons */}
      <div className="bg-background py-4 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            {/* Left - Search */}
            <div className="flex items-center">
              <button className="p-2 text-foreground hover:text-primary transition-colors md:block hidden">
                <Search size={22} />
              </button>
              {/* Mobile Menu Button */}
              <button
                className="p-2 text-foreground md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>

            {/* Center - Logo */}
            <Link to="/" className="flex flex-col items-center">
              {/* Helmet Icon with brand name */}
              <div className="flex items-center gap-1">
                {/* Helmet SVG Icon */}
                <svg viewBox="0 0 40 40" className="w-8 h-8 md:w-10 md:h-10" fill="none">
                  <path
                    d="M6 22C6 14 11 8 20 8C29 8 34 14 34 22C34 26 32 30 30 32H10C8 30 6 26 6 22Z"
                    stroke="hsl(45 93% 58%)"
                    strokeWidth="2"
                    fill="none"
                  />
                  <path
                    d="M10 20C10 16 14 12 20 12C26 12 30 16 30 20"
                    stroke="hsl(45 93% 58%)"
                    strokeWidth="1.5"
                    fill="none"
                  />
                  <path
                    d="M12 32H28"
                    stroke="hsl(45 93% 58%)"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="flex flex-col items-start leading-none">
                  <span className="text-2xl md:text-3xl font-bold text-primary tracking-wide" style={{ fontStyle: 'italic' }}>
                    HELMET
                  </span>
                  <span className="text-xl md:text-2xl font-bold text-foreground tracking-wide -mt-1" style={{ fontStyle: 'italic' }}>
                    HUB
                  </span>
                </div>
              </div>
              <span className="text-[10px] md:text-xs text-primary tracking-widest mt-1">
                #COMPLETERIDINGSOLUTION
              </span>
            </Link>

            {/* Right - Icons */}
            <div className="flex items-center gap-1 md:gap-3">
              <button className="p-2 text-foreground hover:text-primary transition-colors md:hidden">
                <Search size={20} />
              </button>
              <Link to="/auth" className="p-2 text-foreground hover:text-primary transition-colors">
                <User size={22} />
              </Link>
              <Link to="/wishlist" className="p-2 text-foreground hover:text-primary transition-colors relative">
                <Heart size={22} />
                <span className="absolute -top-0.5 -right-0.5 bg-background text-foreground text-[10px] font-medium">
                  {wishlistCount}
                </span>
              </Link>
              <Link to="/cart" className="p-2 text-foreground hover:text-primary transition-colors relative">
                <ShoppingCart size={22} />
                <span className="absolute -top-0.5 -right-0.5 bg-background text-foreground text-[10px] font-medium">
                  {cartCount}
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Bar */}
      <nav className="hidden md:block bg-background border-t border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-6 lg:gap-8">
            {navigationData.map((item) => (
              <NavDropdown key={item.name} item={item} />
            ))}
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-background border-t border-border max-h-[70vh] overflow-y-auto">
          <nav className="container mx-auto px-4 py-4 flex flex-col">
            {navigationData.map((item) => (
              <div key={item.name} className="border-b border-border">
                {item.subcategories.length === 0 ? (
                  <Link
                    to={item.href}
                    className="block py-3 nav-link"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ) : (
                  <>
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
                  </>
                )}
              </div>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
