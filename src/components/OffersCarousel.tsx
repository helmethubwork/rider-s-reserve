import { Link } from "react-router-dom";
import ProductCard from "./ProductCard";
import { getBestsellers } from "@/data/products";

interface OffersCarouselProps {
  title?: string;
}

const OffersCarousel = ({ title = "UNBELIEVABLE OFFERS, JUST FOR YOU!" }: OffersCarouselProps) => {
  const products = getBestsellers().map((product, index) => ({
    ...product,
    badge: index === 0 ? "Sale" as const : index === 1 ? "Clearance Sale" as const : "Summer Special" as const,
  }));

  return (
    <section className="py-16 md:py-20 bg-foreground">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-background text-center mb-12 tracking-tight" style={{ fontStyle: 'italic' }}>
          {title}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              name={product.name}
              price={product.price}
              originalPrice={product.originalPrice}
              image={product.image}
              rating={product.rating}
              reviewCount={product.reviewCount}
              brand={product.brand}
              badge={product.badge}
              isPreorder={product.isPreorder}
              isSoldOut={product.isSoldOut}
            />
          ))}
        </div>

        <div className="flex justify-center mt-12">
          <Link
            to="/sale"
            className="inline-flex items-center gap-2 border-2 border-background text-background font-bold px-8 py-3 text-sm tracking-[0.15em] hover:bg-background hover:text-foreground transition-all duration-300"
          >
            VIEW ALL
          </Link>
        </div>
      </div>
    </section>
  );
};

export default OffersCarousel;
