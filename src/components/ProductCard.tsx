import { ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  badge?: "Sale" | "Clearance Sale" | "Summer Special" | "New";
  isSoldOut?: boolean;
  stock?: number;
}

const ProductCard = ({
  id,
  name,
  price,
  originalPrice,
  image,
  badge,
  isSoldOut = false,
  stock,
}: ProductCardProps) => {
  const formatPrice = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const discount = originalPrice && originalPrice > price 
    ? Math.round(((originalPrice - price) / originalPrice) * 100) 
    : null;

  const showLowStock = stock !== undefined && stock > 0 && stock <= 5;

  return (
    <Link 
      to={`/product/${id}`}
      className="group block bg-card rounded-xl overflow-hidden border border-border/30 transition-all duration-300 hover:border-primary/40 hover:shadow-xl active:scale-[0.98]"
    >
      {/* Image Container - 16:18 aspect ratio */}
      <div className="relative aspect-[16/18] overflow-hidden bg-secondary/20">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = "/placeholder.svg";
          }}
        />

        {/* Badge - Top Left */}
        {badge && (
          <div className="absolute top-3 left-3 z-10">
            <span className={`text-[10px] sm:text-xs font-bold px-2.5 py-1 rounded-md shadow-md ${
              badge === "Sale" || badge === "Clearance Sale" 
                ? "bg-destructive text-white" 
                : badge === "New" 
                  ? "bg-primary text-primary-foreground"
                  : "bg-accent text-accent-foreground"
            }`}>
              {discount ? `-${discount}%` : badge}
            </span>
          </div>
        )}

        {/* Sold Out Overlay */}
        {isSoldOut && (
          <div className="absolute inset-0 bg-background/70 z-20 flex items-center justify-center">
            <span className="bg-muted text-foreground px-4 py-2 rounded-lg font-bold text-sm">
              Sold Out
            </span>
          </div>
        )}

        {/* Quick Add Button - Desktop hover, always visible on mobile */}
        {!isSoldOut && (
          <div className="absolute bottom-3 left-3 right-3 z-10 sm:opacity-0 sm:translate-y-2 sm:group-hover:opacity-100 sm:group-hover:translate-y-0 transition-all duration-300">
            <button 
              className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-semibold py-2.5 rounded-lg text-xs sm:text-sm hover:bg-accent transition-colors active:scale-[0.98]"
              onClick={(e) => {
                e.preventDefault();
                // Add to cart logic here
              }}
            >
              <ShoppingCart size={14} className="sm:w-4 sm:h-4" />
              <span>Add to Cart</span>
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3 sm:p-4 space-y-2">
        {/* Product Name */}
        <h3 className="font-medium text-foreground text-sm leading-tight line-clamp-2 min-h-[2.5rem] group-hover:text-primary transition-colors">
          {name}
        </h3>

        {/* Price Row */}
        <div className="flex items-baseline gap-2">
          <span className="text-base sm:text-lg font-bold text-primary">
            {formatPrice(price)}
          </span>
          {originalPrice && originalPrice > price && (
            <span className="text-xs sm:text-sm text-muted-foreground line-through">
              {formatPrice(originalPrice)}
            </span>
          )}
        </div>

        {/* Low Stock Indicator */}
        {showLowStock && (
          <p className="text-xs text-destructive font-medium">
            Only {stock} left!
          </p>
        )}
      </div>
    </Link>
  );
};

export default ProductCard;
