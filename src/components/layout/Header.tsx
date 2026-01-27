import { useState, useEffect, useRef, useMemo } from "react";
import { Link } from "react-router-dom";
import { Search, ShoppingCart, User, Menu, X, ChevronDown, ChevronRight, LogOut, Package, Shield, Heart, UserCircle } from "lucide-react";
import SearchModal from "@/components/SearchModal";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigationLinks } from "@/hooks/useNavigationLinks";

// Static fallback for Support subcategories
const staticSupportSubcategories = [
  { name: "Contact Us", href: "/contact" },
  { name: "Shipping Policy", href: "/shipping-policy" },
  { name: "Exchange, Returns & Cancellation", href: "/exchange-returns" },
  { name: "Warranty Policy", href: "/warranty-policy" },
];

// Base navigation data (Support subcategories will be injected dynamically)
const baseNavigationData = [
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
  // Support item will be injected with dynamic subcategories
  { name: "Blog", href: "/blog", subcategories: [] },
];

// Logo Component - PowerSports style with racing stripes
const Logo = () => (
  <Link to="/" className="flex items-center gap-0.5 group">
    {/* Racing stripes accent - left */}
    <div className="flex items-center gap-0.5 mr-0.5">
      <div className="w-1 h-6 sm:h-8 md:h-10 lg:h-12 bg-white transform -skew-x-12" />
      <div className="w-1 h-6 sm:h-8 md:h-10 lg:h-12 bg-primary transform -skew-x-12" />
    </div>
    
    <div className="flex items-baseline">
      <span 
        className="text-lg sm:text-2xl md:text-4xl lg:text-5xl font-black text-primary tracking-tight"
        style={{ 
          fontStyle: 'italic',
          letterSpacing: '-0.02em',
        }}
      >
        HELMET
      </span>
      <span 
        className="text-lg sm:text-2xl md:text-4xl lg:text-5xl font-black text-foreground tracking-tight ml-0.5 sm:ml-1"
        style={{ 
          fontStyle: 'italic',
          letterSpacing: '-0.02em',
        }}
      >
        HUB
      </span>
    </div>
    {/* Racing stripes accent - right */}
    <div className="flex items-center gap-0.5 ml-0.5">
      <div className="w-1 h-6 sm:h-8 md:h-10 lg:h-12 bg-primary transform -skew-x-12" />
      <div className="w-1 h-6 sm:h-8 md:h-10 lg:h-12 bg-white transform -skew-x-12" />
    </div>
  </Link>
);

// Mega Menu Component
const MegaMenu = ({ columns }: { columns: typeof baseNavigationData[1]['columns'] }) => (
  <div className="absolute top-full left-1/2 -translate-x-1/2 w-screen bg-secondary border-b border-border py-10 z-50 animate-fade-in">
    <div className="container mx-auto px-8">
      <div className="grid grid-cols-4 gap-16">
        {columns?.map((column, idx) => (
          <div key={idx}>
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
  item: typeof baseNavigationData[0]; 
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
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
  const [mobileAccountDropdownOpen, setMobileAccountDropdownOpen] = useState(false);
  const { totalItems } = useCart();
  const { user, profile, isAdmin, signOut } = useAuth();
  const [searchOpen, setSearchOpen] = useState(false);
  const { data: dbSupportLinks = [] } = useNavigationLinks('support');

  const [hideOnScroll, setHideOnScroll] = useState(false);
  const lastScrollYRef = useRef(0);
  const accountDropdownRef = useRef<HTMLDivElement>(null);
  const mobileAccountDropdownRef = useRef<HTMLDivElement>(null);

  // Build dynamic navigation data with Support subcategories from DB
  const navigationData = useMemo(() => {
    const supportSubcategories = dbSupportLinks.length > 0
      ? dbSupportLinks.map(link => ({ name: link.name, href: link.href }))
      : staticSupportSubcategories;
    
    // Insert Support item before Blog
    const navWithSupport = [...baseNavigationData];
    const blogIndex = navWithSupport.findIndex(item => item.name === 'Blog');
    navWithSupport.splice(blogIndex, 0, {
      name: 'Support',
      href: '/support',
      subcategories: supportSubcategories,
    });
    return navWithSupport;
  }, [dbSupportLinks]);

  // Close account dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (accountDropdownRef.current && !accountDropdownRef.current.contains(event.target as Node)) {
        setAccountDropdownOpen(false);
      }
      if (mobileAccountDropdownRef.current && !mobileAccountDropdownRef.current.contains(event.target as Node)) {
        setMobileAccountDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleMobileCategory = (name: string) => {
    setExpandedMobileCategory(expandedMobileCategory === name ? null : name);
  };

  // Hide header when scrolling down, show when scrolling up
  useEffect(() => {
    const onScroll = () => {
      // Keep header visible while the mobile drawer is open
      if (mobileMenuOpen) {
        lastScrollYRef.current = window.scrollY;
        setHideOnScroll(false);
        return;
      }

      const current = window.scrollY;
      const last = lastScrollYRef.current;
      const delta = current - last;

      // ignore tiny scroll jitter
      if (Math.abs(delta) < 8) return;

      if (current <= 0) {
        setHideOnScroll(false);
      } else if (delta > 0) {
        // scrolling down
        setHideOnScroll(true);
      } else {
        // scrolling up
        setHideOnScroll(false);
      }

      lastScrollYRef.current = current;
    };

    lastScrollYRef.current = window.scrollY;
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [mobileMenuOpen]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  return (
    <header className={`sticky top-0 z-50 bg-background/95 backdrop-blur-md shadow-sm transition-transform duration-300 will-change-transform ${hideOnScroll ? '-translate-y-full' : 'translate-y-0'}`}>
      {/* Top bar */}
      <div className="py-3 sm:py-4 border-b border-border/50">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="flex items-center justify-between gap-2">
            {/* Left - Menu & Search */}
            <div className="flex items-center gap-1 sm:gap-4">
              {/* Mobile Menu Button */}
              <button
                className="p-2.5 text-foreground hover:text-primary hover:bg-secondary rounded-lg transition-all md:hidden active:scale-95"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
              <button 
                onClick={() => setSearchOpen(true)}
                className="p-2.5 text-foreground hover:text-primary hover:bg-secondary rounded-lg transition-all hidden md:block"
                aria-label="Search"
              >
                <Search size={22} />
              </button>
            </div>

            {/* Center - Logo */}
            <Logo />

            {/* Right - Icons */}
            <div className="flex items-center gap-1 sm:gap-2 md:gap-4">
              <button 
                onClick={() => setSearchOpen(true)}
                className="p-2.5 text-foreground hover:text-primary hover:bg-secondary rounded-lg transition-all md:hidden active:scale-95"
                aria-label="Search"
              >
                <Search size={20} />
              </button>

              {/* Mobile account/profile shortcut with dropdown (visible below sm) */}
              {user ? (
                <div ref={mobileAccountDropdownRef} className="relative sm:hidden">
                  <button
                    onClick={() => setMobileAccountDropdownOpen(!mobileAccountDropdownOpen)}
                    className="flex items-center gap-1.5 p-2 text-foreground hover:text-primary hover:bg-secondary rounded-lg transition-all active:scale-95"
                    aria-label="My profile"
                  >
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                      {profile?.full_name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <span className="text-xs font-medium max-w-[60px] truncate">
                      {profile?.full_name?.split(' ')[0] || 'Account'}
                    </span>
                    <ChevronDown size={12} className={`transition-transform ${mobileAccountDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {mobileAccountDropdownOpen && (
                    <div className="absolute right-0 top-full mt-1 bg-background border border-border rounded-lg shadow-xl z-[100] py-2 min-w-[180px]">
                      <Link 
                        to="/account" 
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-foreground hover:bg-secondary transition-colors"
                        onClick={() => setMobileAccountDropdownOpen(false)}
                      >
                        <UserCircle size={16} />
                        My Profile
                      </Link>
                      <Link 
                        to="/track-order" 
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-foreground hover:bg-secondary transition-colors"
                        onClick={() => setMobileAccountDropdownOpen(false)}
                      >
                        <Package size={16} />
                        My Orders
                      </Link>
                      {isAdmin && (
                        <>
                          <hr className="my-1 border-border" />
                          <Link 
                            to="/admin" 
                            className="flex items-center gap-2 px-4 py-2.5 text-sm text-primary font-medium hover:bg-secondary transition-colors"
                            onClick={() => setMobileAccountDropdownOpen(false)}
                          >
                            <Shield size={16} />
                            Admin Dashboard
                          </Link>
                        </>
                      )}
                      <hr className="my-1 border-border" />
                      <button 
                        onClick={() => { signOut(); setMobileAccountDropdownOpen(false); }}
                        className="flex items-center gap-2 w-full text-left px-4 py-2.5 text-sm text-destructive hover:bg-secondary transition-colors"
                      >
                        <LogOut size={16} />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to="/auth"
                  className="p-2.5 text-foreground hover:text-primary hover:bg-secondary rounded-lg transition-all sm:hidden active:scale-95"
                  aria-label="Account"
                >
                  <User size={20} />
                </Link>
              )}

              {user ? (
                <div ref={accountDropdownRef} className="relative hidden sm:block">
                  <button
                    onClick={() => setAccountDropdownOpen(!accountDropdownOpen)}
                    className="flex items-center gap-2 p-2.5 text-foreground hover:text-primary hover:bg-secondary rounded-lg transition-all"
                  >
                    <User size={22} />
                    <span className="text-sm font-medium max-w-[100px] truncate">
                      {profile?.full_name || 'Account'}
                    </span>
                    <ChevronDown size={16} className={`transition-transform ${accountDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {accountDropdownOpen && (
                    <div className="absolute right-0 top-full mt-1 bg-background border border-border rounded-lg shadow-xl z-[100] py-2 min-w-[200px]">
                      <Link 
                        to="/account" 
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-foreground hover:bg-secondary transition-colors"
                        onClick={() => setAccountDropdownOpen(false)}
                      >
                        <UserCircle size={16} />
                        My Profile
                      </Link>
                      <hr className="my-1 border-border" />
                      <Link 
                        to="/account" 
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-foreground hover:bg-secondary transition-colors"
                        onClick={() => setAccountDropdownOpen(false)}
                      >
                        <User size={16} />
                        My Account
                      </Link>
                      <Link 
                        to="/track-order" 
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-foreground hover:bg-secondary transition-colors"
                        onClick={() => setAccountDropdownOpen(false)}
                      >
                        <Package size={16} />
                        My Orders
                      </Link>
                      {isAdmin && (
                        <>
                          <hr className="my-1 border-border" />
                          <Link 
                            to="/admin" 
                            className="flex items-center gap-2 px-4 py-2.5 text-sm text-primary font-medium hover:bg-secondary transition-colors"
                            onClick={() => setAccountDropdownOpen(false)}
                          >
                            <Shield size={16} />
                            Admin Dashboard
                          </Link>
                        </>
                      )}
                      <hr className="my-1 border-border" />
                      <button 
                        onClick={() => { signOut(); setAccountDropdownOpen(false); }}
                        className="flex items-center gap-2 w-full text-left px-4 py-2.5 text-sm text-destructive hover:bg-secondary transition-colors"
                      >
                        <LogOut size={16} />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link 
                  to="/auth" 
                  className="p-2.5 text-foreground hover:text-primary hover:bg-secondary rounded-lg transition-all hidden sm:block"
                  aria-label="Account"
                >
                  <User size={22} />
                </Link>
              )}
              <Link 
                to="/cart" 
                className="p-2.5 text-foreground hover:text-primary hover:bg-secondary rounded-lg transition-all relative active:scale-95"
                aria-label="Cart"
              >
                <ShoppingCart size={22} />
                {totalItems > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-primary text-primary-foreground text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold shadow-lg">
                    {totalItems > 9 ? '9+' : totalItems}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Bar - Desktop */}
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

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Menu Drawer */}
      <div className={`fixed top-0 left-0 h-[100dvh] w-[280px] max-w-[85vw] bg-background border-r border-border z-[70] transform transition-transform duration-300 ease-out md:hidden shadow-2xl flex flex-col will-change-transform ${
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Mobile Menu Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-secondary border-b border-border">
          <span className="text-base font-bold text-primary uppercase tracking-wider">Menu</span>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-2 text-foreground hover:text-primary hover:bg-background rounded-full transition-all active:scale-95"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

          {/* Mobile Menu Content - Single scrollable area for Android compatibility */}
          <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain bg-background">
            <nav>
              <ul className="py-2">
                {navigationData.map((item) => {
                  const hasSubmenu = (item.subcategories && item.subcategories.length > 0) || ('columns' in item && item.columns);
                  const isExpanded = expandedMobileCategory === item.name;
                  
                  // For mega menu items, flatten columns into submenu items
                  const submenuItems = 'columns' in item && item.columns 
                    ? item.columns.flatMap(col => col.items)
                    : item.subcategories || [];
                  
                  if (hasSubmenu && submenuItems.length > 0) {
                    return (
                      <li key={item.name}>
                        <button
                          onClick={() => setExpandedMobileCategory(isExpanded ? null : item.name)}
                          className="w-full flex items-center justify-between px-5 py-3.5 text-primary text-sm font-bold uppercase tracking-wide border-b border-border/30 bg-secondary/30 hover:bg-secondary/50 active:bg-secondary transition-colors"
                        >
                          <span>{item.name}</span>
                          <ChevronDown 
                            size={18} 
                            className={`transition-transform duration-200 text-primary ${isExpanded ? 'rotate-180' : ''}`}
                          />
                        </button>
                        
                        <div
                          className={`overflow-hidden transition-all duration-200 bg-secondary/10 ${isExpanded ? 'max-h-[500px]' : 'max-h-0'}`}
                        >
                          <ul className="py-1">
                            {submenuItems.map((subItem) => (
                              <li key={subItem.name}>
                                <Link
                                  to={subItem.href}
                                  className="flex items-center gap-3 pl-7 pr-5 py-3 text-foreground text-sm hover:bg-secondary/50 active:bg-secondary transition-colors"
                                  onClick={() => setMobileMenuOpen(false)}
                                >
                                  <span className="w-1.5 h-1.5 rounded-full bg-primary/60" />
                                  {subItem.name}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </li>
                    );
                  }
                  
                  return (
                    <li key={item.name}>
                      <Link
                        to={item.href}
                        className="flex items-center gap-3 px-5 py-3.5 text-foreground text-sm font-medium border-b border-border/20 hover:bg-secondary/50 active:bg-secondary transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-primary/50" />
                        {item.name}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>
      </div>

      {/* Search Modal */}
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  );
};

export default Header;
