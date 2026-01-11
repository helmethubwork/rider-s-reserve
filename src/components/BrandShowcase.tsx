import { Link } from "react-router-dom";

const brands = [
  { name: "AXOR", slug: "axor" },
  { name: "LS2", slug: "ls2" },
  { name: "KORDA", slug: "korda" },
  { name: "MT HELMETS", slug: "mt-helmets" },
  { name: "MORE BRANDS", slug: "brands" },
];

const BrandShowcase = () => {
  return (
    <section className="py-16 md:py-20 bg-secondary">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground tracking-wider mb-3">
            BRANDS WE DEAL IN
          </h2>
          <p className="text-muted-foreground text-sm md:text-base">
            Trusted brands for quality products
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {brands.map((brand) => (
            <Link
              key={brand.name}
              to={`/brands/${brand.slug}`}
              className="flex items-center justify-center py-6 px-4 bg-card border border-border hover:border-primary hover:bg-primary/5 transition-all duration-300 group"
            >
              <span className="text-xs md:text-sm font-bold text-muted-foreground group-hover:text-primary transition-colors tracking-wider">
                {brand.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BrandShowcase;
