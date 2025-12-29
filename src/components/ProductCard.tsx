import { Heart, Star, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  reviewCount: number;
  brand: string;
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
  isPreorder = true,
  isSoldOut = false,
}: ProductCardProps) => {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const discount = originalPrice
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="product-card group bg-card relative overflow-hidden">
      {/* Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
        {discount > 0 && (
          <span className="bg-destructive text-destructive-foreground text-xs font-bold px-2 py-1 rounded">
            -{discount}%
          </span>
        )}
        {isSoldOut && (
          <span className="bg-muted text-muted-foreground text-xs font-semibold px-2 py-1 rounded">
            Sold Out
          </span>
        )}
        {isPreorder && !isSoldOut && (
          <span className="badge-preorder">
            Preorder
          </span>
        )}
      </div>

      {/* Wishlist Button */}
      <button
        onClick={() => setIsWishlisted(!isWishlisted)}
        className={`absolute top-3 right-3 z-10 p-2 rounded-full transition-all ${
          isWishlisted
            ? "bg-primary text-primary-foreground"
            : "bg-background/80 text-foreground hover:bg-primary hover:text-primary-foreground"
        }`}
      >
        <Heart size={18} fill={isWishlisted ? "currentColor" : "none"} />
      </button>

      {/* Image */}
      <div className="aspect-square overflow-hidden bg-muted/30">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <p className="text-xs text-muted-foreground uppercase tracking-wide">{brand}</p>
        <h3 className="font-semibold text-foreground line-clamp-2 leading-tight min-h-[2.5rem]">
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
                    : "text-muted-foreground"
                }
              />
            ))}
          </div>
          <span className="text-xs text-muted-foreground">
            ({reviewCount} reviews)
          </span>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-2">
          <span className="font-display text-xl font-bold text-foreground">
            {formatPrice(price)}
          </span>
          {originalPrice && (
            <span className="text-sm text-muted-foreground line-through">
              {formatPrice(originalPrice)}
            </span>
          )}
        </div>

        {/* EMI */}
        <p className="text-xs text-muted-foreground">
          or {formatPrice(Math.round(price / 3))}/Month{" "}
          <span className="text-primary cursor-pointer hover:underline">
            Buy on EMI &gt;
          </span>
        </p>

        {/* Add to Cart */}
        <Button
          className="w-full mt-2"
          variant={isSoldOut ? "secondary" : "default"}
          disabled={isSoldOut}
        >
          <ShoppingCart size={16} className="mr-2" />
          {isSoldOut ? "Out of Stock" : "Add to Cart"}
        </Button>
      </div>
    </div>
  );
};

export default ProductCard;
