import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-helmet.jpg";

interface Slide {
  id: number;
  subtitle: string;
  title: string;
  description?: string;
  buttonText: string;
  buttonLink: string;
  image: string;
  align: "left" | "center" | "right";
}

const slides: Slide[] = [
  {
    id: 1,
    subtitle: "LAUNCHED",
    title: "HJC HELMETS",
    buttonText: "SHOP NOW",
    buttonLink: "/brands/hjc",
    image: heroImage,
    align: "left",
  },
  {
    id: 2,
    subtitle: "PREMIUM MOTORCYCLE ACCESSORIES FROM",
    title: "LEGENDARY CUSTOMS",
    description: "Now Available",
    buttonText: "SHOP NOW",
    buttonLink: "/category/motorcycle-accessories",
    image: heroImage,
    align: "center",
  },
  {
    id: 3,
    subtitle: "NEW ARRIVALS",
    title: "RIDING JACKETS",
    description: "Adventure Ready",
    buttonText: "EXPLORE",
    buttonLink: "/category/riding-gears?type=jackets",
    image: heroImage,
    align: "left",
  },
];

const HeroSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const goToSlide = (index: number) => setCurrentSlide(index);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);

  const slide = slides[currentSlide];

  return (
    <section className="relative h-[60vh] md:h-[80vh] lg:h-[90vh] overflow-hidden bg-background">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-all duration-700"
        style={{ backgroundImage: `url(${slide.image})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/30" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 h-full flex items-center relative z-10">
        <div className={`max-w-2xl ${slide.align === "center" ? "mx-auto text-center" : ""} animate-slide-up`}>
          <p className="text-sm md:text-base text-muted-foreground tracking-[0.3em] mb-4">
            {slide.subtitle}
          </p>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground leading-none mb-4">
            {slide.title}
          </h1>
          {slide.description && (
            <p className="text-lg md:text-xl text-muted-foreground mb-6">
              {slide.description}
            </p>
          )}
          <div className="flex items-center gap-4 w-fit mx-auto lg:mx-0">
            <Link
              to={slide.buttonLink}
              className="bg-primary text-primary-foreground font-semibold px-8 py-3 text-sm tracking-wider hover:bg-accent transition-colors"
            >
              {slide.buttonText}
            </Link>
            <div className="h-1 w-12 bg-primary" />
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 text-foreground/60 hover:text-foreground transition-colors z-20"
        aria-label="Previous slide"
      >
        <ChevronLeft size={40} />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-foreground/60 hover:text-foreground transition-colors z-20"
        aria-label="Next slide"
      >
        <ChevronRight size={40} />
      </button>

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => goToSlide(idx)}
            className={`w-2 h-2 rounded-full transition-all ${
              idx === currentSlide ? "bg-primary w-6" : "bg-foreground/40"
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroSlider;
