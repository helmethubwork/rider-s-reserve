import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, Heart, ShoppingCart, User, Menu, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

const categories = [
  { name: "Helmets", href: "/category/helmets" },
  { name: "Riding Gears", href: "/category/riding-gears" },
  { name: "Helmet Accessories", href: "/category/helmet-accessories" },
  { name: "Motorcycle Accessories", href: "/category/motorcycle-accessories" },
];

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
          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="flex flex-col items-center">
              <span className="font-display text-2xl md:text-3xl font-bold text-primary tracking-wider">
                HELMET
              </span>
              <span className="font-display text-xl md:text-2xl font-bold text-foreground -mt-1 tracking-wider">
                HUB
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/latest-offers" className="nav-link">
              Latest Offers
            </Link>
            {categories.map((cat) => (
              <Link key={cat.name} to={cat.href} className="nav-link flex items-center gap-1">
                {cat.name}
                <ChevronDown size={14} />
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2 md:gap-4">
            <button className="p-2 text-foreground hover:text-primary transition-colors">
              <Search size={20} />
            </button>
            <Link to="/auth" className="p-2 text-foreground hover:text-primary transition-colors">
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
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
