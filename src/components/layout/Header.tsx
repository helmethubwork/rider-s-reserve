import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, ShoppingCart, User, Menu, X, ChevronDown } from "lucide-react";

// Navigation data with mega menu structure
const navigationData = [
  { name: "Home", href: "/", subcategories: [] },
  {
    name: "Products",
    href: "/category/all",
    megaMenu: true,
    columns: [
      {
        title: "HELMETS",
        items: [
          { name: "Full-Face", href: "/category/helmets?type=full-face" },
          { name: "Open-Face", href: "/category/helmets?type=open-face" },
          { name: "Modular", href: "/category/helmets?type=modular" },
          { name: "Dual Sport & Motocross", href: "/category/helmets?type=motocross" },
        ],
      },
      {
        title: "JACKETS",
        items: [
          { name: "Urban", href: "/category/riding-gears?type=jackets-urban" },
          { name: "Sports", href: "/category/riding-gears?type=jackets-sports" },
          { name: "Adventure/Touring", href: "/category/riding-gears?type=jackets-touring" },
        ],
      },
      {
        title: "RIDING GEAR",
        isPlain: true,
        items: [
          { name: "GLOVES", href: "/category/riding-gears?type=gloves" },
          { name: "PANTS", href: "/category/riding-gears?type=pants" },
          { name: "BOOTS", href: "/category/riding-gears?type=boots" },
          { name: "INTERCOM", href: "/category/helmet-accessories?type=intercoms" },
          { name: "LUGGAGE", href: "/category/motorcycle-accessories?type=luggage" },
        ],
      },
      {
        title: "ACCESSORIES",
        items: [
          { name: "Helmet Accessories", href: "/category/helmet-accessories" },
          { name: "Riding Accessories", href: "/category/riding-gears" },
          { name: "Bike Accessories", href: "/category/motorcycle-accessories" },
        ],
      },
    ],
  },
  {
    name: "Brands",
    href: "/brands",
    subcategories: [
      { name: "AXOR", href: "/brands/axor" },
      { name: "HJC", href: "/brands/hjc" },
      { name: "Shoei", href: "/brands/shoei" },
      { name: "LS2", href: "/brands/ls2" },
      { name: "MT Helmets", href: "/brands/mt" },
      { name: "Studds", href: "/brands/studds" },
    ],
  },
  { name: "Sale", href: "/sale", subcategories: [] },
  {
    name: "Store Locator",
    href: "/stores",
    subcategories: [
      { name: "Mumbai", href: "/stores?city=mumbai" },
      { name: "Delhi", href: "/stores?city=delhi" },
      { name: "Bangalore", href: "/stores?city=bangalore" },
    ],
  },
  { name: "Track Orders", href: "/track-order", subcategories: [] },
  {
    name: "Support",
    href: "/support",
    subcategories: [
      { name: "Contact Us", href: "/contact" },
      { name: "FAQs", href: "/faq" },
      { name: "Size Guide", href: "/size-guide" },
      { name: "Returns", href: "/returns" },
    ],
  },
  { name: "Blog", href: "/blog", subcategories: [] },
];

// Helmet Icon SVG - Matching reference logo design
const HelmetIcon = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 48 44" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Helmet main shell curve - gray */}
    <path 
      d="M14 30 Q10 26 10 20 Q10 12 16 8 Q20 5 26 5"
      stroke="hsl(var(--muted-foreground))"
      strokeWidth="2"
      strokeLinecap="round"
      fill="none"
    />
    {/* Visor frame left - gray */}
    <path 
      d="M10 20 Q8 24 8 28 Q8 32 10 35 L14 38"
      stroke="hsl(var(--muted-foreground))"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    {/* Visor horizontal line - gray */}
    <path 
      d="M9 29 L17 27"
      stroke="hsl(var(--muted-foreground))"
      strokeWidth="1.5"
      strokeLinecap="round"
      fill="none"
    />
    {/* Visor vertical line - gray */}
    <path 
      d="M12 22 L11 33"
      stroke="hsl(var(--muted-foreground))"
      strokeWidth="1.5"
      strokeLinecap="round"
      fill="none"
    />
    {/* Top aerodynamic curve - yellow PRIMARY */}
    <path 
      d="M16 6 Q22 2 32 3 Q40 5 44 12 Q46 18 46 24"
      stroke="hsl(var(--primary))"
      strokeWidth="2.5"
      strokeLinecap="round"
      fill="none"
    />
    {/* Chin spoiler swoosh - yellow PRIMARY */}
    <path 
      d="M14 38 Q22 42 32 40 Q40 36 46 28 L50 22"
      stroke="hsl(var(--primary))"
      strokeWidth="2.5"
      strokeLinecap="round"
      fill="none"
    />
  </svg>
);

// Logo Component  
const Logo = () => (
  <Link to="/" className="flex items-center group">
    <div className="relative -mr-2">
      <HelmetIcon className="w-12 h-12 md:w-16 md:h-16 transition-transform group-hover:scale-105" />
    </div>
    <div className="flex items-baseline">
      <span 
        className="text-xl md:text-2xl lg:text-3xl font-black text-primary tracking-tight"
        style={{ fontStyle: 'italic' }}
      >
        HELMET
      </span>
      <span 
        className="text-xl md:text-2xl lg:text-3xl font-black text-foreground tracking-tight ml-1"
        style={{ fontStyle: 'italic' }}
      >
        HUB
      </span>
    </div>
  </Link>
);

// Mega Menu Component
const MegaMenu = ({ columns }: { columns: typeof navigationData[1]['columns'] }) => (
  <div className="mega-menu animate-fade-in">
    <div className="container mx-auto px-4">
      <div className="grid grid-cols-4 gap-8">
        {columns?.map((column, idx) => (
          <div key={idx}>
            <h3 className="text-primary font-bold text-sm tracking-wider mb-4">{column.title}</h3>
            <ul className="space-y-2">
              {column.items.map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    className={`text-sm transition-colors ${column.isPlain ? 'text-muted-foreground font-semibold tracking-wide hover:text-primary' : 'text-muted-foreground hover:text-primary'}`}
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Dropdown Component
const NavDropdown = ({ item, isOpen, onMouseEnter, onMouseLeave }: { 
  item: typeof navigationData[0]; 
  isOpen: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}) => {
  const hasSubcategories = item.subcategories && item.subcategories.length > 0;
  const hasMegaMenu = 'megaMenu' in item && item.megaMenu;

  return (
    <div
      className="relative"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <Link
        to={item.href}
        className={`nav-link flex items-center gap-1 py-4 ${isOpen ? 'text-primary border-b-2 border-primary' : ''}`}
      >
        {item.name}
        {(hasSubcategories || hasMegaMenu) && (
          <ChevronDown
            size={14}
            className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          />
        )}
      </Link>

      {/* Simple Dropdown */}
      {isOpen && hasSubcategories && !hasMegaMenu && (
        <div className="absolute top-full left-0 min-w-[200px] bg-card border border-border rounded-lg shadow-lg z-50 py-2 animate-fade-in">
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

      {/* Mega Menu */}
      {isOpen && hasMegaMenu && 'columns' in item && item.columns && (
        <MegaMenu columns={item.columns} />
      )}
    </div>
  );
};

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [expandedMobileCategory, setExpandedMobileCategory] = useState<string | null>(null);
  const [cartCount] = useState(0);

  const toggleMobileCategory = (name: string) => {
    setExpandedMobileCategory(expandedMobileCategory === name ? null : name);
  };

  return (
    <header className="sticky top-0 z-50">
      {/* Main Header */}
      <div className="bg-background py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            {/* Left - Search */}
            <div className="flex items-center gap-4">
              <button className="p-2 text-foreground hover:text-primary transition-colors hidden md:block">
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
            <Logo />

            {/* Right - Icons */}
            <div className="flex items-center gap-2 md:gap-4">
              <button className="p-2 text-foreground hover:text-primary transition-colors md:hidden">
                <Search size={20} />
              </button>
              <Link to="/auth" className="p-2 text-foreground hover:text-primary transition-colors">
                <User size={22} />
              </Link>
              <Link to="/cart" className="p-2 text-foreground hover:text-primary transition-colors relative">
                <ShoppingCart size={22} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center font-semibold">
                    {cartCount}
                  </span>
                )}
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
              <NavDropdown
                key={item.name}
                item={item}
                isOpen={openDropdown === item.name}
                onMouseEnter={() => setOpenDropdown(item.name)}
                onMouseLeave={() => setOpenDropdown(null)}
              />
            ))}
          </div>
        </div>
      </nav>

      {/* Promo Banner */}
      <div className="promo-banner">
        FREE SHIPPING ON ALL ORDERS!
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-background border-t border-border max-h-[70vh] overflow-y-auto">
          <nav className="container mx-auto px-4 py-4 flex flex-col">
            {navigationData.map((item) => {
              const hasSubmenu = (item.subcategories && item.subcategories.length > 0) || ('megaMenu' in item && item.megaMenu);
              
              return (
                <div key={item.name} className="border-b border-border">
                  {!hasSubmenu ? (
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
                          {'megaMenu' in item && item.megaMenu && 'columns' in item && item.columns ? (
                            item.columns.map((col, idx) => (
                              <div key={idx} className="mb-4">
                                <p className="text-primary text-xs font-bold tracking-wide mb-2">{col.title}</p>
                                {col.items.map((subItem) => (
                                  <Link
                                    key={subItem.name}
                                    to={subItem.href}
                                    className="block py-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
                                    onClick={() => setMobileMenuOpen(false)}
                                  >
                                    {subItem.name}
                                  </Link>
                                ))}
                              </div>
                            ))
                          ) : (
                            item.subcategories?.map((sub) => (
                              <Link
                                key={sub.name}
                                to={sub.href}
                                className="block py-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                                onClick={() => setMobileMenuOpen(false)}
                              >
                                {sub.name}
                              </Link>
                            ))
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
