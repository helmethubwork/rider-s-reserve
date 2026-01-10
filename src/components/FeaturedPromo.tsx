import { Link } from "react-router-dom";
import helmet2 from "@/assets/products/helmet-2.jpg";
import helmet3 from "@/assets/products/helmet-3.jpg";
import heroImage from "@/assets/hero-helmet.jpg";

interface PromoCard {
  brand: string;
  title: string;
  subtitle: string;
  buttonText: string;
  buttonLink: string;
  image: string;
}

const promos: PromoCard[] = [
  {
    brand: "KORDA",
    title: "TOURMASTER WITH D3O",
    subtitle: "Just Launched",
    buttonText: "SHOP NOW",
    buttonLink: "/category/riding-gears?type=boots",
    image: helmet2,
  },
  {
    brand: "MT TARGO",
    title: "SUMMER SPECIAL OFFER",
    subtitle: "Now available at just Rs. 3,999!",
    buttonText: "SHOP TARGO",
    buttonLink: "/brands/mt",
    image: helmet3,
  },
];

const FeaturedPromo = () => {
  return (
    <section className="py-0">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-border">
        {promos.map((promo, idx) => (
          <div key={idx} className="relative h-[45vh] md:h-[60vh] overflow-hidden group">
            {/* Background Image */}
            <img
              src={promo.image}
              alt={promo.title}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-background/60" />
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />

            {/* Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
              <p className="text-xs md:text-sm tracking-[0.3em] text-muted-foreground mb-2 uppercase">
                {promo.brand}
              </p>
              <h2 className="text-2xl md:text-4xl lg:text-5xl font-black text-foreground mb-3 tracking-tight">
                {promo.title}
              </h2>
              <p className="text-sm md:text-base text-muted-foreground mb-6">
                {promo.subtitle}
              </p>
              <Link
                to={promo.buttonLink}
                className="inline-flex items-center gap-2 border-2 border-foreground text-foreground font-bold px-8 py-3 text-sm tracking-[0.15em] hover:bg-foreground hover:text-background transition-all duration-300"
              >
                {promo.buttonText}
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FeaturedPromo;
