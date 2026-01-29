import { Eye, Zap } from "lucide-react";
import { Link } from "react-router-dom";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  image: string;
  badge?: "Sale" | "Clearance Sale" | "Summer Special" | "New";
  isSoldOut?: boolean;
}

const ProductCard = ({
  id,
  name,
  price,
  image,
  badge,
  isSoldOut = false,
}: ProductCardProps) => {
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

  return (
    <Link 
      to={`/product/${id}`}
      className="group block bg-card rounded-lg sm:rounded-xl relative overflow-hidden border border-border/30 transition-all duration-500 hover:border-primary/40 hover:shadow-2xl hover:-translate-y-1 active:scale-[0.98]"
    >
      {/* Badge */}
      {badge && (
        <div className="absolute top-2 sm:top-4 left-2 sm:left-4 z-10">
          <span className={`text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-1 sm:py-1.5 rounded-full shadow-lg ${getBadgeStyles(badge)}`}>
            {badge}
          </span>
        </div>
      )}

      {/* Sold Out Overlay */}
      {isSoldOut && (
        <div className="absolute inset-0 bg-background/60 z-20 flex items-center justify-center">
          <span className="bg-destructive text-white px-4 py-2 rounded-lg font-bold text-sm">
            Sold Out
          </span>
        </div>
      )}

      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-secondary/30">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = "/placeholder.svg";
          }}
        />

        {/* Quick View Overlay - Desktop only */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background via-background/95 to-transparent py-3 sm:py-4 px-4 text-center transition-all duration-500 translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 hidden sm:block">
          <button className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-bold px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm hover:bg-accent transition-colors">
            <Eye size={14} className="sm:w-4 sm:h-4" />
            Quick View
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-3 sm:p-5 space-y-1.5 sm:space-y-3">
        {/* Name */}
        <h3 className="font-semibold text-foreground text-xs sm:text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors">
          {name}
        </h3>

        {/* Price */}
        <div className="flex items-center gap-2 sm:gap-3 pt-0.5 sm:pt-1">
          <span className="text-sm sm:text-lg font-bold text-primary">
            {formatPrice(price)}
          </span>
        </div>

        {/* EMI Option - Hidden on small mobile */}
        <div className="items-center gap-1.5 sm:gap-2 pt-0.5 sm:pt-1 hidden sm:flex">
          <Zap size={12} className="sm:w-3.5 sm:h-3.5 text-accent" />
          <p className="text-[10px] sm:text-xs text-muted-foreground">
            EMI from ₹{Math.round(price / 3)}/mo
          </p>
        </div>
      </div>

      {/* Bottom glow on hover */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    </Link>
  );
};

export default ProductCard;
