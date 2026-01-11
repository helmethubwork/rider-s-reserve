import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
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
    setTimeout(() => setIsAnimating(false), 800);
  };

  const goToPrevSlide = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    setTimeout(() => setIsAnimating(false), 800);
  };

  const goToSlide = (index: number) => {
    if (isAnimating || index === currentSlide) return;
    setIsAnimating(true);
    setCurrentSlide(index);
    setTimeout(() => setIsAnimating(false), 800);
  };

  const slide = slides[currentSlide];

  return (
    <section className="relative h-[75vh] md:h-[85vh] lg:h-screen overflow-hidden bg-background">
      {/* Background Image with zoom effect */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-[2000ms] ease-out"
        style={{ 
          backgroundImage: `url(${slide.image})`,
          transform: isAnimating ? 'scale(1.1)' : 'scale(1.05)'
        }}
      >
        {/* Multi-layer gradient overlays */}
        <div className="absolute inset-0 bg-background/50" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/30" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />
      </div>

      {/* Decorative elements */}
      <div className="absolute top-20 right-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse-glow hidden lg:block" />
      <div className="absolute bottom-40 left-10 w-40 h-40 bg-primary/5 rounded-full blur-2xl hidden lg:block" />

      {/* Content */}
      <div className="container mx-auto px-4 md:px-8 h-full flex items-center relative z-10">
        <div className={`max-w-4xl ${slide.align === "center" ? "mx-auto text-center" : ""}`}>
          {/* Animated content */}
          <div key={slide.id} className="space-y-6">
            {/* Subtitle with decorative line */}
            <div className="flex items-center gap-4 animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <div className="w-12 h-0.5 bg-primary hidden md:block" />
              <p className="text-xs md:text-sm text-primary font-bold tracking-[0.4em] uppercase">
                {slide.subtitle}
              </p>
            </div>

            {/* Main title with gradient accent */}
            <h1 
              className="text-5xl md:text-7xl lg:text-8xl xl:text-9xl font-black text-foreground leading-[0.85] tracking-tighter animate-slide-up"
              style={{ animationDelay: '0.2s' }}
            >
              <span className="block">{slide.title.split(' ')[0]}</span>
              {slide.title.split(' ').length > 1 && (
                <span className="block text-gradient">{slide.title.split(' ').slice(1).join(' ')}</span>
              )}
            </h1>

            {/* Description */}
            {slide.description && (
              <p 
                className="text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-lg animate-fade-in"
                style={{ animationDelay: '0.4s' }}
              >
                {slide.description}
              </p>
            )}

            {/* CTA Button */}
            <div className="pt-4 animate-fade-in" style={{ animationDelay: '0.5s' }}>
              <Link
                to={slide.buttonLink}
                className="group inline-flex items-center gap-4 bg-primary text-primary-foreground font-bold px-10 py-5 text-sm tracking-[0.2em] rounded-lg hover:bg-accent transition-all duration-500 hover:gap-6 glow-hover"
              >
                {slide.buttonText}
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Arrows - Glass style */}
      <button
        onClick={goToPrevSlide}
        className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 p-4 bg-background/20 backdrop-blur-md border border-border/30 rounded-full text-foreground/60 hover:text-foreground hover:bg-background/40 hover:border-primary/50 transition-all duration-300 z-20 group"
        aria-label="Previous slide"
      >
        <ChevronLeft size={28} className="group-hover:-translate-x-1 transition-transform" />
      </button>
      <button
        onClick={goToNextSlide}
        className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 p-4 bg-background/20 backdrop-blur-md border border-border/30 rounded-full text-foreground/60 hover:text-foreground hover:bg-background/40 hover:border-primary/50 transition-all duration-300 z-20 group"
        aria-label="Next slide"
      >
        <ChevronRight size={28} className="group-hover:translate-x-1 transition-transform" />
      </button>

      {/* Slide indicators - Modern pill style */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-3 z-20">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => goToSlide(idx)}
            className={`transition-all duration-500 rounded-full ${
              idx === currentSlide 
                ? "w-12 h-3 bg-primary shadow-lg" 
                : "w-3 h-3 bg-foreground/20 hover:bg-foreground/40"
            }`}
            style={{
              boxShadow: idx === currentSlide ? '0 0 20px hsl(52 100% 50% / 0.5)' : 'none'
            }}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>

      {/* Slide counter */}
      <div className="absolute bottom-10 right-8 z-20 hidden md:flex items-center gap-3">
        <span className="text-4xl font-black text-primary">
          {String(currentSlide + 1).padStart(2, '0')}
        </span>
        <span className="text-muted-foreground">/</span>
        <span className="text-sm text-muted-foreground">
          {String(slides.length).padStart(2, '0')}
        </span>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-10 left-8 z-20 hidden lg:flex flex-col items-center gap-2">
        <div className="w-px h-16 bg-gradient-to-b from-transparent via-primary to-transparent" />
        <span className="text-xs text-muted-foreground tracking-widest uppercase rotate-90 origin-center translate-y-8">
          Scroll
        </span>
      </div>
    </section>
  );
};

export default HeroSlider;
