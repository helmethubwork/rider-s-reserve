import { Heart, Star, ShoppingCart, Eye } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  reviewCount: number;
  brand: string;
  badge?: "Sale" | "Clearance Sale" | "Summer Special" | "New";
  isPreorder?: boolean;
  isSoldOut?: boolean;
}

const ProductCard = ({
  id,
  name,
  price,
  originalPrice,
  image,
  rating,
  reviewCount,
  brand,
  badge,
  isPreorder = false,
  isSoldOut = false,
}: ProductCardProps) => {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showQuickView, setShowQuickView] = useState(false);

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(value);
  };

  const getBadgeStyles = (badgeType?: string) => {
    switch (badgeType) {
      case "Sale":
        return "bg-primary text-primary-foreground";
      case "Clearance Sale":
        return "bg-destructive text-destructive-foreground";
      case "Summer Special":
        return "bg-primary text-primary-foreground";
      case "New":
        return "bg-accent text-accent-foreground";
      default:
        return "bg-primary text-primary-foreground";
    }
  };

  return (
    <div className="group bg-card relative overflow-hidden">
      {/* Badge */}
      {badge && (
        <div className="absolute top-4 right-4 z-10">
          <span className={`text-xs font-semibold px-3 py-1 rounded-sm ${getBadgeStyles(badge)}`}>
            {badge}
          </span>
        </div>
      )}

      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-muted/30">
        <Link to={`/product/${id}`}>
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </Link>

        {/* Quick View Overlay */}
        <div
          className={`absolute inset-x-0 bottom-0 bg-foreground/80 text-background py-3 text-center text-sm font-medium tracking-wide transition-all duration-300 cursor-pointer ${
            showQuickView ? "translate-y-0" : "translate-y-full"
          } group-hover:translate-y-0`}
          onMouseEnter={() => setShowQuickView(true)}
          onMouseLeave={() => setShowQuickView(false)}
        >
          <span className="flex items-center justify-center gap-2">
            <Eye size={16} />
            Quick view
          </span>
        </div>

        {/* Color Variants */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="w-4 h-4 rounded-full bg-destructive border-2 border-background cursor-pointer" />
          <span className="w-4 h-4 rounded-full bg-primary border-2 border-background cursor-pointer" />
        </div>
      </div>

      {/* Content */}
      <div className="p-4 text-center space-y-2">
        <h3 className="font-medium text-foreground text-sm tracking-wide uppercase">
          {name}
        </h3>

        {/* Rating */}
        <div className="flex items-center justify-center gap-1">
          <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={12}
                className={
                  i < Math.floor(rating)
                    ? "text-primary fill-primary"
                    : "text-muted-foreground"
                }
              />
            ))}
          </div>
          <span className="text-xs text-muted-foreground">
            {reviewCount} reviews
          </span>
        </div>

        {/* Price */}
        <div className="flex items-center justify-center gap-2">
          {originalPrice && (
            <span className="text-sm text-destructive line-through">
              {formatPrice(originalPrice)}
            </span>
          )}
          <span className="text-base font-semibold text-primary">
            {formatPrice(price)}
          </span>
        </div>

        {/* EMI Option */}
        <p className="text-xs text-muted-foreground">
          or ₹{Math.round(price / 3)}/Month{" "}
          <span className="border border-border px-2 py-0.5 rounded text-foreground cursor-pointer hover:bg-secondary transition-colors">
            Buy on EMI &gt;
          </span>
        </p>
      </div>
    </div>
  );
};

export default ProductCard;
