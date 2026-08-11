/**
 * MobileBottomNav
 *
 * Fixed bottom navigation bar shown only on mobile. Hides itself while the
 * user scrolls down (to free up screen) and slides back in on scroll up.
 */

import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, Store, Search, ShoppingCart, User } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import SearchModal from "@/components/SearchModal";

const MobileBottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { totalItems } = useCart();
  const { user } = useAuth();

  const [searchOpen, setSearchOpen] = useState(false);

  const isActive = (path: string) =>
    path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

  const navItems = [
    { label: "Home", icon: Home, path: "/", action: () => navigate("/") },
    {
      label: "Account",
      icon: User,
      path: user ? "/account" : "/auth",
      action: () => navigate(user ? "/account" : "/auth"),
    },
    { label: "Shop", icon: Store, path: "/category/all", action: () => navigate("/category/all") },
    { label: "Search", icon: Search, path: "__search", action: () => setSearchOpen(true) },
    {
      label: "Cart",
      icon: ShoppingCart,
      path: "/cart",
      action: () => navigate("/cart"),
      badge: totalItems,
    },
  ];

  return (
    <>
      {/* Always pinned to the bottom — never hides on scroll */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50"
        aria-label="Mobile navigation"
      >
        <div className="bg-card/95 backdrop-blur-xl border-t border-border/60 shadow-[0_-4px_24px_rgba(0,0,0,0.4)]">
          <div className="grid grid-cols-5 pb-[env(safe-area-inset-bottom)]">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = item.path !== "__search" && isActive(item.path);

              return (
                <button
                  key={item.label}
                  onClick={item.action}
                  className="relative flex flex-col items-center justify-center gap-1 py-2.5 active:scale-90 transition-transform duration-150"
                  aria-label={item.label}
                  aria-current={active ? "page" : undefined}
                >
                  <div className="relative">
                    <Icon
                      size={21}
                      strokeWidth={active ? 2.5 : 2}
                      className={`transition-colors duration-200 ${
                        active ? "text-primary" : "text-muted-foreground"
                      }`}
                    />

                    {/* Cart count badge */}
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className="absolute -top-1.5 -right-2 min-w-[17px] h-[17px] px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center tabular-nums shadow-md">
                        {item.badge > 99 ? "99+" : item.badge}
                      </span>
                    )}
                  </div>

                  <span
                    className={`text-[10px] font-semibold tracking-[-0.01em] transition-colors duration-200 ${
                      active ? "text-primary" : "text-muted-foreground"
                    }`}
                  >
                    {item.label}
                  </span>

                  {/* Active indicator dot */}
                  {active && (
                    <span className="absolute top-0.5 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-primary" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Spacer so page content is never hidden behind the bar */}
      <div className="md:hidden h-[68px]" aria-hidden="true" />

      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
};

export default MobileBottomNav;
