import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, Heart, ShoppingCart, User, Menu, X, ChevronDown } from "lucide-react";

const categories = [
  { name: "Helmets", href: "/category/helmets" },
  { name: "Riding Gears", href: "/category/riding-gears" },
  { name: "Helmet Accessories", href: "/category/helmet-accessories" },
  { name: "Motorcycle Accessories", href: "/category/motorcycle-accessories" },
];

// Logo component with helmet icon
const Logo = () => (
  <Link to="/" className="flex items-center gap-2">
    {/* Helmet Icon */}
    <div className="relative w-10 h-10 md:w-12 md:h-12">
      <svg viewBox="0 0 48 48" className="w-full h-full" fill="none">
        {/* Helmet outline */}
        <path
          d="M8 28C8 18 14 10 24 10C34 10 40 18 40 28C40 32 38 36 36 38H12C10 36 8 32 8 28Z"
          stroke="hsl(45 93% 58%)"
          strokeWidth="2.5"
          fill="none"
        />
        {/* Visor */}
        <path
          d="M12 24C12 20 17 16 24 16C31 16 36 20 36 24"
          stroke="hsl(45 93% 58%)"
          strokeWidth="2"
          fill="none"
        />
        {/* Bottom accent */}
        <path
          d="M14 38H34"
          stroke="hsl(45 93% 58%)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>
    </div>
    {/* Text */}
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

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartCount] = useState(0);
  const [wishlistCount] = useState(0);

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
          {/* Left Actions (Mobile Menu + Search) */}
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
            <Link to="/latest-offers" className="nav-link">
              Latest Offers
            </Link>
            {categories.slice(0, 2).map((cat) => (
              <Link key={cat.name} to={cat.href} className="nav-link flex items-center gap-1">
                {cat.name}
                <ChevronDown size={14} />
              </Link>
            ))}
          </nav>

          {/* Center Logo */}
          <div className="flex-shrink-0">
            <Logo />
          </div>

          {/* Desktop Right Nav */}
          <nav className="hidden md:flex items-center gap-4 flex-1 justify-end">
            {categories.slice(2).map((cat) => (
              <Link key={cat.name} to={cat.href} className="nav-link flex items-center gap-1">
                {cat.name}
                <ChevronDown size={14} />
              </Link>
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
        <div className="md:hidden bg-background border-t border-border">
          <nav className="container mx-auto px-4 py-4 flex flex-col gap-4">
            <Link
              to="/latest-offers"
              className="nav-link py-2 border-b border-border"
              onClick={() => setMobileMenuOpen(false)}
            >
              Latest Offers
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.name}
                to={cat.href}
                className="nav-link py-2 border-b border-border"
                onClick={() => setMobileMenuOpen(false)}
              >
                {cat.name}
              </Link>
            ))}
            <Link
              to="/auth"
              className="nav-link py-2 border-b border-border"
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
