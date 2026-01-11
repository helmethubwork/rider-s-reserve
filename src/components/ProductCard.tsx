import { Heart, Star, ShoppingCart, Eye, Zap } from "lucide-react";
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
      minimumFractionDigits: 0,
    }).format(value);
  };

  const getBadgeStyles = (badgeType?: string) => {
    switch (badgeType) {
      case "Sale":
        return "bg-gradient-to-r from-primary to-accent text-primary-foreground";
      case "Clearance Sale":
        return "bg-gradient-to-r from-destructive to-red-500 text-white";
      case "Summer Special":
        return "bg-gradient-to-r from-accent to-primary text-primary-foreground";
      case "New":
        return "bg-gradient-to-r from-emerald-500 to-teal-500 text-white";
      default:
        return "bg-primary text-primary-foreground";
    }
  };

  const discountPercent = originalPrice 
    ? Math.round(((originalPrice - price) / originalPrice) * 100) 
    : 0;

  return (
    <div className="group bg-card rounded-xl relative overflow-hidden border border-border/30 transition-all duration-500 hover:border-primary/40 hover:shadow-2xl hover:-translate-y-1">
      {/* Badge */}
      {badge && (
        <div className="absolute top-4 left-4 z-10">
          <span className={`text-xs font-bold px-3 py-1.5 rounded-full shadow-lg ${getBadgeStyles(badge)}`}>
            {badge}
          </span>
        </div>
      )}

      {/* Discount badge */}
      {discountPercent > 0 && (
        <div className="absolute top-4 right-4 z-10">
          <span className="bg-destructive text-white text-xs font-bold px-2 py-1 rounded-lg">
            -{discountPercent}%
          </span>
        </div>
      )}

      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-secondary/30">
        <Link to={`/product/${id}`}>
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        </Link>

        {/* Wishlist button */}
        <button
          onClick={() => setIsWishlisted(!isWishlisted)}
          className="absolute top-4 right-4 w-10 h-10 bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-300 hover:bg-primary hover:text-primary-foreground opacity-0 group-hover:opacity-100 z-20"
        >
          <Heart size={18} className={isWishlisted ? "fill-destructive text-destructive" : ""} />
        </button>

        {/* Quick View Overlay */}
        <div
          className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-background via-background/95 to-transparent py-4 px-4 text-center transition-all duration-500 ${
            showQuickView ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
          } group-hover:translate-y-0 group-hover:opacity-100`}
          onMouseEnter={() => setShowQuickView(true)}
          onMouseLeave={() => setShowQuickView(false)}
        >
          <button className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-bold px-6 py-2.5 rounded-lg text-sm hover:bg-accent transition-colors">
            <Eye size={16} />
            Quick View
          </button>
        </div>

        {/* Color Variants */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 delay-100">
          <span className="w-5 h-5 rounded-full bg-foreground border-2 border-background cursor-pointer hover:scale-125 transition-transform shadow-lg" />
          <span className="w-5 h-5 rounded-full bg-primary border-2 border-background cursor-pointer hover:scale-125 transition-transform shadow-lg" />
        </div>
      </div>

      {/* Content */}
      <div className="p-5 space-y-3">
        {/* Brand */}
        <p className="text-xs text-primary font-bold tracking-wider uppercase">{brand}</p>

        {/* Name */}
        <h3 className="font-semibold text-foreground text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors">
          {name}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={14}
                className={
                  i < Math.floor(rating)
                    ? "text-primary fill-primary"
                    : "text-muted-foreground/40"
                }
              />
            ))}
          </div>
          <span className="text-xs text-muted-foreground">
            ({reviewCount})
          </span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-3 pt-1">
          <span className="text-lg font-bold text-primary">
            {formatPrice(price)}
          </span>
          {originalPrice && (
            <span className="text-sm text-muted-foreground line-through">
              {formatPrice(originalPrice)}
            </span>
          )}
        </div>

        {/* EMI Option */}
        <div className="flex items-center gap-2 pt-1">
          <Zap size={14} className="text-accent" />
          <p className="text-xs text-muted-foreground">
            EMI from ₹{Math.round(price / 3)}/mo
          </p>
        </div>
      </div>

      {/* Bottom glow on hover */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    </div>
  );
};

export default ProductCard;
