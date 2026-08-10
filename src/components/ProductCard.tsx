import { useState } from "react";
import { ShoppingCart, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { getSwatchBackground } from "@/lib/colorUtils";
import { supabase } from "@/lib/supabase";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  image: string;
  badge?: "Sale" | "Clearance Sale" | "Summer Special" | "New";
  isSoldOut?: boolean;
  colors?: string[];
}

const ProductCard = ({
  id,
  name,
  price,
  image,
  badge,
  isSoldOut = false,
  colors = [],
}: ProductCardProps) => {
  const [displayImage, setDisplayImage] = useState(image);

  // Extract file extension from the main image URL (e.g. .jpg, .png, .webp)
  const getImageExt = () => {
    try {
      const pathname = new URL(image, window.location.origin).pathname;
      return pathname.split(".").pop() || "jpg";
    } catch {
      return "jpg";
    }
  };

  const getColorImageUrl = (colorIndex: number) => {
    const { data } = supabase.storage
      .from("product-images")
      .getPublicUrl(`products/${id}-${colorIndex}.${getImageExt()}`);
    return data.publicUrl;
  };

  const formatPrice = (value: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(value);

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
      className="group relative flex flex-col bg-card rounded-xl sm:rounded-2xl overflow-hidden border border-border/40 transition-all duration-300 ease-out hover:border-primary/50 hover:shadow-[0_16px_40px_-12px_rgba(0,0,0,0.6)] hover:-translate-y-1 active:scale-[0.99]"
    >
      {/* Badge */}
      {badge && (
        <div className="absolute top-2.5 sm:top-3.5 left-2.5 sm:left-3.5 z-20">
          <span
            className={`text-[10px] sm:text-[11px] font-bold px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full shadow-lg tracking-wide uppercase ${getBadgeStyles(
              badge
            )}`}
          >
            {badge}
          </span>
        </div>
      )}

      {/* Sold Out Overlay */}
      {isSoldOut && (
        <div className="absolute inset-0 bg-background/70 backdrop-blur-[2px] z-30 flex items-center justify-center">
          <span className="bg-destructive text-white px-5 py-2.5 rounded-lg font-bold text-sm tracking-wide uppercase shadow-xl">
            Sold Out
          </span>
        </div>
      )}

      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-secondary/20">
        <img
          src={displayImage}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.07]"
          loading="lazy"
          decoding="async"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          onError={(e) => {
            if (e.currentTarget.src !== image) {
              e.currentTarget.src = image;
            } else {
              e.currentTarget.src = "/placeholder.svg";
            }
          }}
        />
        {/* Subtle vignette for depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent pointer-events-none" />
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-3 sm:p-4 gap-2 sm:gap-2.5">
        {/* Name */}
        <h3 className="font-semibold text-foreground text-[13px] sm:text-sm leading-snug line-clamp-2 tracking-[-0.01em] group-hover:text-primary transition-colors duration-200 min-h-[2.4em]">
          {name}
        </h3>

        {/* Price */}
        <div className="flex items-baseline gap-2">
          <span className="text-base sm:text-xl font-black text-primary tracking-[-0.02em] tabular-nums">
            {formatPrice(price)}
          </span>
        </div>

        {/* Color Swatches */}
        {colors.length > 0 && (
          <div
            className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-hide -mx-0.5 px-0.5"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            {colors.map((color, colorIndex) => (
              <span
                key={color}
                title={color}
                className="w-6 h-6 sm:w-7 sm:h-7 rounded-full flex-shrink-0 inline-block ring-1 ring-white/20 ring-offset-2 ring-offset-card shadow-md cursor-pointer transition-all duration-200 hover:scale-115 hover:ring-primary"
                style={{ background: getSwatchBackground(color) }}
                onMouseEnter={() => setDisplayImage(getColorImageUrl(colorIndex))}
                onMouseLeave={() => setDisplayImage(image)}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setDisplayImage(getColorImageUrl(colorIndex));
                }}
              />
            ))}
          </div>
        )}

        {/* EMI */}
        <div className="flex items-center gap-1.5">
          <Zap size={11} className="text-accent flex-shrink-0" />
          <p className="text-[10px] sm:text-[11px] text-muted-foreground font-medium tabular-nums">
            EMI from ₹{Math.round(price / 3).toLocaleString("en-IN")}/mo
          </p>
        </div>

        {/* Add to Cart — always visible, works on mobile */}
        <div className="mt-auto pt-1.5">
          <div
            className={`w-full flex items-center justify-center gap-2 rounded-lg font-bold text-[12px] sm:text-[13px] tracking-[-0.01em] py-2.5 sm:py-3 transition-all duration-200 ${
              isSoldOut
                ? "bg-secondary text-muted-foreground"
                : "bg-primary text-primary-foreground shadow-[0_2px_8px_hsl(50_100%_50%/0.2)] group-hover:bg-accent group-hover:shadow-[0_5px_18px_hsl(50_100%_50%/0.4)]"
            }`}
          >
            <ShoppingCart size={14} strokeWidth={2.5} />
            {isSoldOut ? "Sold Out" : "Add to Cart"}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
