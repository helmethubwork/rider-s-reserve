import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Search, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useProducts } from "@/hooks/useProducts";
import { useBrands } from "@/hooks/useBrands";
import { useCategories } from "@/hooks/useCategories";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Pages data for search
const pages = [
  { name: "Warranty Policy", href: "/warranty-policy" },
  { name: "Shipping Policy", href: "/shipping-policy" },
  { name: "Exchange & Returns", href: "/exchange-returns" },
  { name: "Contact Us", href: "/contact" },
];

const SearchModal = ({ isOpen, onClose }: SearchModalProps) => {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Real data from D1 — this used to search src/data/products.ts, a
  // leftover pre-migration mock file, which is why searching would surface
  // products no admin ever added.
  const { data: allProducts = [] } = useProducts();
  const { data: brands = [] } = useBrands();
  const { data: categories = [] } = useCategories();

  const normalizedQuery = query.trim();
  const queryLower = normalizedQuery.toLowerCase();

  const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  const brandName = (id: string | null) => brands.find((b) => b.id === id)?.name || "";
  const categoryName = (id: string | null) => categories.find((c) => c.id === id)?.name || "";

  // Filter products
  const filteredProducts = normalizedQuery.length > 0
    ? (allProducts as any[])
        .filter((p) => p.is_active)
        .filter(
          (product) =>
            product.name.toLowerCase().includes(queryLower) ||
            categoryName(product.category_id).toLowerCase().includes(queryLower) ||
            brandName(product.brand_id).toLowerCase().includes(queryLower)
        )
        .slice(0, 4)
    : [];

  // Filter pages
  const filteredPages = normalizedQuery.length > 0
    ? pages.filter((page) => page.name.toLowerCase().includes(queryLower))
    : [];

  // Filter collections (categories)
  const filteredCollections = normalizedQuery.length > 0
    ? categories.filter((cat) => cat.name.toLowerCase().includes(queryLower))
    : [];

  // Generate search suggestions based on query
  const suggestions = normalizedQuery.length > 0
    ? [
        ...new Set([
          // Brand + query (e.g. "ls2 helmets")
          ...(allProducts as any[])
            .filter((p) => brandName(p.brand_id).toLowerCase().includes(queryLower))
            .map((p) => `${brandName(p.brand_id).toLowerCase()} ${normalizedQuery}`.trim())
            .filter(Boolean),

          // Product name prefix (first two words)
          ...(allProducts as any[])
            .filter((p) => p.name.toLowerCase().includes(queryLower))
            .map((p) => p.name.toLowerCase().split(" ").slice(0, 2).join(" ")),
        ]),
      ].slice(0, 3)
    : [];

  // Highlight matching text (safe for regex characters)
  const highlightMatch = (text: string, rawQuery: string) => {
    const q = rawQuery.trim();
    if (!q) return text;

    const safe = escapeRegExp(q);
    const parts = text.split(new RegExp(`(${safe})`, "gi"));

    return parts.map((part, i) =>
      part.toLowerCase() === q.toLowerCase() ? (
        <span key={i} className="font-bold text-foreground">
          {part}
        </span>
      ) : (
        <span key={i}>{part}</span>
      )
    );
  };

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
    if (!isOpen) {
      setQuery("");
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const hasResults = normalizedQuery.length > 0 && (
    filteredProducts.length > 0 ||
    filteredPages.length > 0 ||
    filteredCollections.length > 0 ||
    suggestions.length > 0
  );

  const modal = (
    <div className="fixed inset-0 z-[9999] animate-fade-in">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Search Container - Fixed header with scrollable results */}
      <div className="relative z-10 flex flex-col h-full">
        {/* Fixed Search Header */}
        <div className="sticky top-0 bg-background/95 backdrop-blur-md pt-4 md:pt-8 px-4 pb-4 z-10 border-b border-border shadow-lg">
          <div className="w-full max-w-3xl mx-auto">
            {/* Close Button - Top Right */}
            <div className="flex justify-end mb-4">
              <button
                onClick={onClose}
                className="p-2 text-muted-foreground hover:text-primary hover:bg-secondary rounded-full transition-all"
                aria-label="Close search"
              >
                <X size={24} />
              </button>
            </div>
            
            {/* Search Input */}
            <div className="relative">
              <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products, brands, categories..."
                className="w-full h-14 pl-12 pr-4 bg-secondary border border-border rounded-xl text-foreground text-base placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
              />
              {query.length > 0 && (
                <button
                  onClick={() => setQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Clear search"
                >
                  <X size={18} />
                </button>
              )}
            </div>
            
            {/* Quick Links */}
            {query.length === 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="text-xs text-muted-foreground">Popular:</span>
                {["Helmets", "Gloves", "Jackets", "LS2", "MT"].map((term) => (
                  <button
                    key={term}
                    onClick={() => setQuery(term)}
                    className="text-xs px-3 py-1.5 bg-secondary hover:bg-primary hover:text-primary-foreground rounded-full text-foreground transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Scrollable Results Area */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          <div className="w-full max-w-3xl mx-auto">
            {/* Search Results - Two Column Layout */}
            {hasResults && (
              <div className="mt-4 bg-card/95 border-2 border-border/70 rounded-xl overflow-hidden shadow-2xl ring-1 ring-border/40">
                <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border/60">
                  {/* Left Column - Suggestions, Pages, Collections */}
                  <div className="p-5 sm:p-6 space-y-5 bg-card/90">
                    {/* Suggestions */}
                    {suggestions.length > 0 && (
                      <div>
                        <h3 className="text-xs font-bold tracking-[0.2em] text-primary mb-3 uppercase">
                          Suggestions
                        </h3>
                        <ul className="space-y-2">
                          {suggestions.map((suggestion, idx) => (
                            <li key={idx}>
                              <button
                                onClick={() => setQuery(suggestion)}
                                className="text-foreground hover:text-primary transition-colors text-left text-sm font-medium"
                              >
                                {highlightMatch(suggestion, query)}
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Pages */}
                    {filteredPages.length > 0 && (
                      <div>
                        <h3 className="text-xs font-bold tracking-[0.2em] text-primary mb-3 uppercase">
                          Pages
                        </h3>
                        <ul className="space-y-2">
                          {filteredPages.map((page) => (
                            <li key={page.href}>
                              <Link
                                to={page.href}
                                onClick={onClose}
                                className="text-foreground hover:text-primary transition-colors text-sm font-medium"
                              >
                                {highlightMatch(page.name, query)}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Collections */}
                    {filteredCollections.length > 0 && (
                      <div>
                        <h3 className="text-xs font-bold tracking-[0.2em] text-primary mb-3 uppercase">
                          Collections
                        </h3>
                        <ul className="space-y-2">
                          {filteredCollections.map((collection) => (
                            <li key={collection.slug}>
                              <Link
                                to={`/category/${collection.slug}`}
                                onClick={onClose}
                                className="text-foreground hover:text-primary transition-colors text-sm font-medium"
                              >
                                {highlightMatch(collection.name, query)}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Right Column - Products */}
                  <div className="p-5 sm:p-6 bg-card/90">
                    {filteredProducts.length > 0 && (
                      <div>
                        <h3 className="text-xs font-bold tracking-[0.2em] text-primary mb-3 uppercase">
                          Products
                        </h3>
                        <div className="space-y-3">
                          {filteredProducts.map((product) => (
                            <Link
                              key={product.id}
                              to={`/product/${product.id}`}
                              onClick={onClose}
                              className="flex items-center gap-3 hover:bg-secondary/50 p-2 -mx-2 rounded-lg transition-colors"
                            >
                              <img
                                src={product.image_url || "/placeholder.svg"}
                                alt={product.name}
                                className="w-14 h-14 object-contain bg-secondary/50 rounded-lg"
                                loading="lazy"
                              />
                              <span className="text-foreground text-sm font-medium hover:text-primary transition-colors">
                                {product.name}
                              </span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                    {filteredProducts.length === 0 && (
                      <div className="text-foreground/70 text-sm">No products found</div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* No results message */}
            {normalizedQuery.length > 0 && !hasResults && (
              <div className="bg-card border border-border rounded-xl p-8 text-center">
                <p className="text-muted-foreground mb-2">
                  No results found for "<span className="text-foreground font-medium">{normalizedQuery}</span>"
                </p>
                <p className="text-sm text-muted-foreground">Try searching with different keywords</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  if (typeof document === "undefined") return null;
  return createPortal(modal, document.body);
};

export default SearchModal;
