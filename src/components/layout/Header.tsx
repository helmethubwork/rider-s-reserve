import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, ShoppingCart, User, Menu, X, ChevronDown } from "lucide-react";
import SearchModal from "@/components/SearchModal";

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
      { name: "Axor", href: "/brands/axor" },
      { name: "LS2", href: "/brands/ls2" },
      { name: "Korda", href: "/brands/korda" },
      { name: "MT Helmets", href: "/brands/mt" },
      { name: "More Brands", href: "/brands" },
    ],
  },
  { name: "Sale", href: "/sale", subcategories: [] },
  {
    name: "Store Locator",
    href: "/stores",
    subcategories: [
      { name: "Telangana", href: "/stores" },
    ],
  },
  { name: "Track Orders", href: "/track-order", subcategories: [] },
  {
    name: "Support",
    href: "/support",
    subcategories: [
      { name: "Contact Us", href: "/contact" },
      { name: "Shipping Policy", href: "/shipping-policy" },
      { name: "Exchange, Returns & Cancellation", href: "/exchange-returns" },
      { name: "Warranty Policy", href: "/warranty-policy" },
    ],
  },
  { name: "Blog", href: "/blog", subcategories: [] },
];

// Helmet Icon Component
const HelmetIcon = ({ className = "" }: { className?: string }) => (
  <svg 
    viewBox="0 0 40 32" 
    className={className}
    fill="currentColor"
  >
    {/* Modern racing helmet silhouette */}
    <path d="M38 16c0-8.8-7.2-14-16-14C13 2 6 6.5 4 13c-1 3.2-1 6.5 0 9.5C5.5 27 10 30 16 30h18c2.2 0 4-1.8 4-4v-6c0-1.5 0-2.8 0-4z" />
    {/* Visor cutout */}
    <path 
      d="M8 14c0-4 4-8 10-8 4 0 8 2 10 5l-2 1c-1.5-2-4-3.5-7-3.5-4 0-7 2.5-7 5.5 0 1.5.5 2.5 1.5 3.5L12 19c-2.5-1.5-4-3-4-5z"
      className="fill-background"
    />
    {/* Vent detail */}
    <rect x="28" y="20" width="6" height="2" rx="1" className="fill-background/50" />
  </svg>
);

// Logo Component - PowerSports style with racing stripes and helmet
const Logo = () => (
  <Link to="/" className="flex items-center gap-2 group">
    {/* Racing stripes accent */}
    <div className="hidden md:flex items-center gap-0.5 mr-1">
      <div className="w-1 h-8 bg-primary transform -skew-x-12" />
      <div className="w-1 h-8 bg-primary/60 transform -skew-x-12" />
    </div>
    
    {/* Helmet Icon */}
    <HelmetIcon className="w-8 h-8 md:w-10 md:h-10 text-primary mr-1" />
    
    <div className="flex items-baseline">
      <span 
        className="text-2xl md:text-3xl lg:text-4xl font-black text-primary tracking-tight"
        style={{ 
          fontStyle: 'italic',
          letterSpacing: '-0.02em',
        }}
      >
        HELMET
      </span>
      <span 
        className="text-2xl md:text-3xl lg:text-4xl font-black text-foreground tracking-tight ml-1"
        style={{ 
          fontStyle: 'italic',
          letterSpacing: '-0.02em',
        }}
      >
        HUB
      </span>
    </div>
    {/* Racing stripes accent */}
    <div className="hidden md:flex items-center gap-0.5 ml-1">
      <div className="w-1 h-8 bg-primary/60 transform -skew-x-12" />
      <div className="w-1 h-8 bg-primary transform -skew-x-12" />
    </div>
  </Link>
);

// Mega Menu Component
const MegaMenu = ({ columns }: { columns: typeof navigationData[1]['columns'] }) => (
  <div className="absolute top-full left-1/2 -translate-x-1/2 w-screen bg-secondary border-b border-border py-10 z-50 animate-fade-in">
    <div className="container mx-auto px-8">
      <div className="grid grid-cols-4 gap-16">
        {columns?.map((column, idx) => (
          <div key={idx}>
            {/* Show title only for non-plain columns */}
            {!column.isPlain && (
              <h3 className="text-primary font-bold text-xs tracking-[0.2em] mb-5 uppercase">
                {column.title}
              </h3>
            )}
            <ul className={column.isPlain ? "space-y-4" : "space-y-3"}>
              {column.items.map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    className={`block transition-colors ${
                      column.isPlain 
                        ? 'text-foreground font-bold text-xs tracking-[0.15em] uppercase hover:text-primary' 
                        : 'text-muted-foreground text-sm hover:text-primary'
                    }`}
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
const NavDropdown = ({ item, isOpen, onMouseEnter, onMouseLeave, onClick }: { 
  item: typeof navigationData[0]; 
  isOpen: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onClick: () => void;
}) => {
  const hasSubcategories = item.subcategories && item.subcategories.length > 0;
  const hasMegaMenu = 'megaMenu' in item && item.megaMenu;
  const hasDropdown = hasSubcategories || hasMegaMenu;

  const handleClick = (e: React.MouseEvent) => {
    if (hasDropdown) {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <div
      className="relative"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {hasDropdown ? (
        <button
          onClick={handleClick}
          className={`nav-link flex items-center gap-2 py-6 text-base font-semibold ${isOpen ? 'text-primary' : ''}`}
        >
          {item.name}
          <ChevronDown
            size={18}
            className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          />
        </button>
      ) : (
        <Link
          to={item.href}
          className="nav-link flex items-center gap-2 py-6 text-base font-semibold"
        >
          {item.name}
        </Link>
      )}

      {/* Simple Dropdown */}
      {isOpen && hasSubcategories && !hasMegaMenu && (
        <div className="absolute top-full left-0 min-w-[220px] bg-background border border-border rounded-lg shadow-xl z-[100] py-2 animate-fade-in">
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
  const [searchOpen, setSearchOpen] = useState(false);

  const toggleMobileCategory = (name: string) => {
    setExpandedMobileCategory(expandedMobileCategory === name ? null : name);
  };

  return (
    <header className="relative z-50 bg-background shadow-sm transition-all duration-300">
      {/* Main Header */}
      <div className="py-4 border-b border-border/50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            {/* Left - Search */}
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setSearchOpen(true)}
                className="p-2 text-foreground hover:text-primary transition-colors hidden md:block"
              >
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
              <button 
                onClick={() => setSearchOpen(true)}
                className="p-2 text-foreground hover:text-primary transition-colors md:hidden"
              >
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
      <nav className="hidden md:block bg-background border-b border-border/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-8 lg:gap-10">
            {navigationData.map((item) => (
              <NavDropdown
                key={item.name}
                item={item}
                isOpen={openDropdown === item.name}
                onMouseEnter={() => setOpenDropdown(item.name)}
                onMouseLeave={() => setOpenDropdown(null)}
                onClick={() => setOpenDropdown(openDropdown === item.name ? null : item.name)}
              />
            ))}
          </div>
        </div>
      </nav>


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

      {/* Search Modal */}
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  );
};

export default Header;
