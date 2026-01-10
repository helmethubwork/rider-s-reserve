import { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import { Link } from "react-router-dom";
import { products } from "@/data/products";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SearchModal = ({ isOpen, onClose }: SearchModalProps) => {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredProducts = query.length > 1
    ? products.filter(
        (product) =>
          product.name.toLowerCase().includes(query.toLowerCase()) ||
          product.category.toLowerCase().includes(query.toLowerCase()) ||
          product.brand.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 6)
    : [];

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
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

  return (
    <div className="fixed inset-0 z-[100] animate-fade-in">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-secondary/95"
        onClick={onClose}
      />
      
      {/* Search Container */}
      <div className="relative z-10 flex flex-col items-center pt-24 md:pt-32 px-4">
        <div className="w-full max-w-3xl">
          {/* Search Input */}
          <div className="flex items-center bg-background border border-border rounded-none">
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

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-24 md:top-32 right-4 md:right-8 lg:right-[calc(50%-400px)] p-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={24} />
          </button>

          {/* Search Results */}
          {query.length > 1 && (
            <div className="mt-4 bg-background border border-border max-h-[60vh] overflow-y-auto">
              {filteredProducts.length > 0 ? (
                <div>
                  {filteredProducts.map((product) => (
                    <Link
                      key={product.id}
                      to={`/product/${product.id}`}
                      onClick={onClose}
                      className="flex items-center gap-4 p-4 hover:bg-secondary transition-colors border-b border-border last:border-b-0"
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-16 h-16 object-cover"
                      />
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground uppercase tracking-wide">
                          {product.brand}
                        </p>
                        <h4 className="font-medium text-foreground">
                          {product.name}
                        </h4>
                        <p className="text-primary font-semibold">
                          ₹{product.price.toLocaleString()}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  No products found for "{query}"
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchModal;
