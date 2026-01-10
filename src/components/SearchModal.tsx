import { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import { Link } from "react-router-dom";
import { products, categories } from "@/data/products";

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

  const queryLower = query.toLowerCase();

  // Filter products
  const filteredProducts = query.length > 1
    ? products.filter(
        (product) =>
          product.name.toLowerCase().includes(queryLower) ||
          product.category.toLowerCase().includes(queryLower) ||
          product.brand.toLowerCase().includes(queryLower)
      ).slice(0, 4)
    : [];

  // Filter pages
  const filteredPages = query.length > 1
    ? pages.filter((page) => page.name.toLowerCase().includes(queryLower))
    : [];

  // Filter collections (categories)
  const filteredCollections = query.length > 1
    ? categories.filter((cat) => cat.name.toLowerCase().includes(queryLower))
    : [];

  // Generate search suggestions based on query
  const suggestions = query.length > 1
    ? [
        ...new Set([
          ...products
            .filter((p) => p.brand.toLowerCase().includes(queryLower))
            .map((p) => p.brand.toLowerCase() + " " + query),
          ...products
            .filter((p) => p.name.toLowerCase().includes(queryLower))
            .map((p) => p.name.toLowerCase().split(" ").slice(0, 2).join(" ")),
          query,
        ]),
      ].slice(0, 3)
    : [];

  // Highlight matching text
  const highlightMatch = (text: string, query: string) => {
    if (!query) return text;
    const parts = text.split(new RegExp(`(${query})`, "gi"));
    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <span key={i} className="font-bold text-foreground">{part}</span>
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

  const hasResults = query.length > 1 && (
    filteredProducts.length > 0 ||
    filteredPages.length > 0 ||
    filteredCollections.length > 0 ||
    suggestions.length > 0
  );

  return (
    <div className="fixed inset-0 z-[100] animate-fade-in">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-muted/90"
        onClick={onClose}
      />
      
      {/* Search Container - Fixed header with scrollable results */}
      <div className="relative z-10 flex flex-col h-full">
        {/* Fixed Search Header */}
        <div className="sticky top-0 bg-muted/90 pt-12 md:pt-16 px-4 pb-0 z-10">
          <div className="w-full max-w-4xl mx-auto">
            {/* Search Input with Close Button */}
            <div className="flex items-center gap-4">
              <div className="flex items-center flex-1 bg-background border border-border">
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search"
                  className="flex-1 h-14 px-5 bg-transparent text-foreground text-base placeholder:text-muted-foreground focus:outline-none"
                />
                <button className="px-5 text-muted-foreground hover:text-foreground transition-colors">
                  <Search size={22} />
                </button>
              </div>

              {/* Close Button - Primary colored like reference */}
              <button
                onClick={onClose}
                className="p-2 text-primary hover:text-primary/80 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
          </div>
        </div>

        {/* Scrollable Results Area */}
        <div className="flex-1 overflow-y-auto px-4">
          <div className="w-full max-w-4xl mx-auto">
            {/* Search Results - Two Column Layout */}
            {hasResults && (
              <div className="bg-background border border-t-0 border-border">
                <div className="grid grid-cols-1 md:grid-cols-2 divide-x divide-border">
                  {/* Left Column - Suggestions, Pages, Collections */}
                  <div className="p-6 space-y-6">
                    {/* Suggestions */}
                    {suggestions.length > 0 && (
                      <div>
                        <h3 className="text-xs font-semibold tracking-[0.2em] text-muted-foreground mb-4">
                          SUGGESTIONS
                        </h3>
                        <ul className="space-y-3">
                          {suggestions.map((suggestion, idx) => (
                            <li key={idx}>
                              <button
                                onClick={() => setQuery(suggestion)}
                                className="text-muted-foreground hover:text-foreground transition-colors text-left"
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
                        <h3 className="text-xs font-semibold tracking-[0.2em] text-muted-foreground mb-4">
                          PAGES
                        </h3>
                        <ul className="space-y-3">
                          {filteredPages.map((page) => (
                            <li key={page.href}>
                              <Link
                                to={page.href}
                                onClick={onClose}
                                className="text-muted-foreground hover:text-foreground transition-colors"
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
                        <h3 className="text-xs font-semibold tracking-[0.2em] text-muted-foreground mb-4">
                          COLLECTIONS
                        </h3>
                        <ul className="space-y-3">
                          {filteredCollections.map((collection) => (
                            <li key={collection.slug}>
                              <Link
                                to={`/category/${collection.slug}`}
                                onClick={onClose}
                                className="text-muted-foreground hover:text-foreground transition-colors"
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
                  <div className="p-6">
                    {filteredProducts.length > 0 && (
                      <div>
                        <h3 className="text-xs font-semibold tracking-[0.2em] text-muted-foreground mb-4">
                          PRODUCTS
                        </h3>
                        <div className="space-y-4">
                          {filteredProducts.map((product) => (
                            <Link
                              key={product.id}
                              to={`/product/${product.id}`}
                              onClick={onClose}
                              className="flex items-center gap-4 hover:bg-secondary/50 p-2 -mx-2 transition-colors"
                            >
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-16 h-16 object-contain bg-secondary/30"
                              />
                              <span className="text-foreground hover:text-primary transition-colors">
                                {product.name}
                              </span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                    {filteredProducts.length === 0 && (
                      <div className="text-muted-foreground text-sm">
                        No products found
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* No results message */}
            {query.length > 1 && !hasResults && (
              <div className="bg-background border border-t-0 border-border p-8 text-center text-muted-foreground">
                No results found for "{query}"
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchModal;
