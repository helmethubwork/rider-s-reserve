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
    subtitle: "NOW AVAILABLE",
    title: "ICON",
    description: "Premium Protection",
    buttonText: "SHOP NOW",
    buttonLink: "/category/helmets",
    image: heroImage,
    align: "left",
  },
  {
    id: 3,
    subtitle: "KORDA",
    title: "PATHFINDER",
    description: "All-in-One Boot",
    buttonText: "SHOP NOW",
    buttonLink: "/category/riding-gears?type=boots",
    image: heroImage,
    align: "left",
  },
  {
    id: 4,
    subtitle: "PREMIUM MOTORCYCLE ACCESSORIES FROM",
    title: "LEGENDARY CUSTOMS",
    description: "Now Available",
    buttonText: "SHOP NOW",
    buttonLink: "/category/motorcycle-accessories",
    image: heroImage,
    align: "left",
  },
];

const HeroSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      goToNextSlide();
    }, 6000);
    return () => clearInterval(timer);
  }, [currentSlide]);

  const goToNextSlide = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentSlide((prev) => (prev + 1) % slides.length);
    setTimeout(() => setIsAnimating(false), 700);
  };

  const goToPrevSlide = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    setTimeout(() => setIsAnimating(false), 700);
  };

  const goToSlide = (index: number) => {
    if (isAnimating || index === currentSlide) return;
    setIsAnimating(true);
    setCurrentSlide(index);
    setTimeout(() => setIsAnimating(false), 700);
  };

  const slide = slides[currentSlide];

  return (
    <section className="relative h-[70vh] md:h-[85vh] lg:h-screen overflow-hidden bg-background">
      {/* Background Image with parallax effect */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-all duration-700 scale-105"
        style={{ backgroundImage: `url(${slide.image})` }}
      >
        {/* Dark overlays for better text readability */}
        <div className="absolute inset-0 bg-background/40" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/20" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 md:px-8 h-full flex items-center relative z-10">
        <div className={`max-w-3xl ${slide.align === "center" ? "mx-auto text-center" : ""}`}>
          {/* Animated content */}
          <div key={slide.id} className="animate-slide-up">
            <p className="text-xs md:text-sm text-muted-foreground tracking-[0.4em] mb-4 md:mb-6 uppercase">
              {slide.subtitle}
            </p>
            <h1 className="text-5xl md:text-7xl lg:text-8xl xl:text-9xl font-black text-foreground leading-[0.9] mb-4 md:mb-6 tracking-tight">
              {slide.title}
            </h1>
            {slide.description && (
              <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground mb-8 md:mb-10">
                {slide.description}
              </p>
            )}
            <Link
              to={slide.buttonLink}
              className="inline-flex items-center gap-3 bg-primary text-primary-foreground font-bold px-8 md:px-10 py-3 md:py-4 text-sm tracking-[0.2em] hover:bg-accent transition-all duration-300 hover:gap-4"
            >
              {slide.buttonText}
              <span className="w-6 h-[2px] bg-primary-foreground" />
            </Link>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={goToPrevSlide}
        className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 p-3 text-foreground/60 hover:text-foreground transition-colors z-20 group"
        aria-label="Previous slide"
      >
        <ChevronLeft size={48} className="group-hover:-translate-x-1 transition-transform" />
      </button>
      <button
        onClick={goToNextSlide}
        className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 p-3 text-foreground/60 hover:text-foreground transition-colors z-20 group"
        aria-label="Next slide"
      >
        <ChevronRight size={48} className="group-hover:translate-x-1 transition-transform" />
      </button>

      {/* Slide indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-20">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => goToSlide(idx)}
            className={`transition-all duration-300 ${
              idx === currentSlide 
                ? "w-10 h-2 bg-primary" 
                : "w-2 h-2 bg-foreground/30 hover:bg-foreground/50"
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>

      {/* Slideshow controls */}
      <div className="absolute bottom-8 right-8 z-20 hidden md:flex items-center gap-4">
        <span className="text-xs text-muted-foreground tracking-wider">
          {String(currentSlide + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}
        </span>
      </div>
    </section>
  );
};

export default HeroSlider;
