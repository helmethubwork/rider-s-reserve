import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import helmet1 from "@/assets/hero-helmet.jpg";
import helmet2 from "@/assets/products/helmet-2.jpg";
import jacket1 from "@/assets/products/jacket-1.jpg";
import helmet3 from "@/assets/products/helmet-3.jpg";

interface NewArrivalSlide {
  id: number;
  brand: string;
  title: string;
  subtitle?: string;
  buttonText: string;
  buttonLink: string;
  image: string;
}

const newArrivals: NewArrivalSlide[] = [
  {
    id: 1,
    brand: "Premium Riding Jeans",
    title: "BIKERATTI",
    subtitle: "Now Available",
    buttonText: "SHOP NOW",
    buttonLink: "/brands/bikeratti",
    image: helmet1,
  },
  {
    id: 2,
    brand: "Korda",
    title: "TOURMASTER",
    subtitle: "Riding Boots With D3O",
    buttonText: "SHOP NOW",
    buttonLink: "/category/riding-gears?type=boots",
    image: jacket1,
  },
  {
    id: 3,
    brand: "Korda",
    title: "EDGE 2.0",
    subtitle: "Riding Jacket",
    buttonText: "SHOP NOW",
    buttonLink: "/category/riding-gears?type=jackets",
    image: helmet2,
  },
  {
    id: 4,
    brand: "",
    title: "NHK",
    subtitle: "Motorcycle Helmets",
    buttonText: "SHOP NOW",
    buttonLink: "/brands/nhk",
    image: helmet3,
  },
];

const NewArrivalsSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      goToNextSlide();
    }, 5000);
    return () => clearInterval(timer);
  }, [currentSlide]);

  const goToNextSlide = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentSlide((prev) => (prev + 1) % newArrivals.length);
    setTimeout(() => setIsAnimating(false), 600);
  };

  const goToPrevSlide = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentSlide((prev) => (prev - 1 + newArrivals.length) % newArrivals.length);
    setTimeout(() => setIsAnimating(false), 600);
  };

  const slide = newArrivals[currentSlide];

  return (
    <section className="py-8 md:py-12 bg-background">
      <div className="container mx-auto px-4 mb-8">
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground text-center tracking-wider">
          NEW ARRIVALS
        </h2>
      </div>

      <div className="relative h-[50vh] md:h-[70vh] overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-all duration-600"
          style={{ backgroundImage: `url(${slide.image})` }}
        >
          <div className="absolute inset-0 bg-background/50" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent" />
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 h-full flex items-center relative z-10">
          <div key={slide.id} className="max-w-2xl animate-fade-in">
            {slide.brand && (
              <p className="text-xs md:text-sm text-muted-foreground tracking-[0.3em] mb-3 uppercase">
                {slide.brand}
              </p>
            )}
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-black text-foreground leading-none mb-3 tracking-tight">
              {slide.title}
            </h2>
            {slide.subtitle && (
              <p className="text-lg md:text-xl text-muted-foreground mb-8">
                {slide.subtitle}
              </p>
            )}
            <Link
              to={slide.buttonLink}
              className="inline-flex items-center gap-3 bg-primary text-primary-foreground font-bold px-8 py-3 text-sm tracking-[0.15em] hover:bg-accent transition-colors"
            >
              {slide.buttonText}
            </Link>
          </div>
        </div>

        {/* Navigation */}
        <button
          onClick={goToPrevSlide}
          className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 p-2 text-foreground/60 hover:text-foreground transition-colors z-20"
          aria-label="Previous"
        >
          <ChevronLeft size={36} />
        </button>
        <button
          onClick={goToNextSlide}
          className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 p-2 text-foreground/60 hover:text-foreground transition-colors z-20"
          aria-label="Next"
        >
          <ChevronRight size={36} />
        </button>

        {/* Dots */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {newArrivals.map((_, idx) => (
            <button
              key={idx}
              onClick={() => !isAnimating && setCurrentSlide(idx)}
              className={`transition-all duration-300 ${
                idx === currentSlide 
                  ? "w-8 h-2 bg-primary" 
                  : "w-2 h-2 bg-foreground/30"
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default NewArrivalsSlider;
