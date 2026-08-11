import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-helmet.jpg";
import { useHeroSlides } from "@/hooks/useHeroSlides";

interface Slide {
  id: string | number;
  subtitle: string;
  title: string;
  description?: string | null;
  buttonText: string;
  buttonLink: string;
  image: string;
  align: "left" | "center" | "right";
}

// Fallback slides when database is empty
const fallbackSlides: Slide[] = [
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
    subtitle: "PREMIUM ACCESSORIES FROM",
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
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const { data: dbSlides = [] } = useHeroSlides();

  // Use database slides if available, otherwise use fallback
  const slides: Slide[] = dbSlides.length > 0 
    ? dbSlides.map(s => ({
        id: s.id,
        subtitle: s.subtitle,
        title: s.title,
        description: s.description,
        buttonText: s.button_text,
        buttonLink: s.button_link,
        image: s.image_url || heroImage,
        align: s.align,
      }))
    : fallbackSlides;

  useEffect(() => {
    const timer = setInterval(() => {
      goToNextSlide();
    }, 6000);
    return () => clearInterval(timer);
  }, [currentSlide, slides.length]);

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

  // Touch handlers for swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const minSwipeDistance = 50;

    if (Math.abs(distance) > minSwipeDistance) {
      if (distance > 0) {
        goToNextSlide();
      } else {
        goToPrevSlide();
      }
    }
    setTouchStart(0);
    setTouchEnd(0);
  };

  const slide = slides[currentSlide];

  if (!slide) return null;

  return (
    <section 
      className="relative h-[calc(100svh+132px)] sm:h-[calc(100svh+150px)] md:h-[calc(100svh+168px)] min-h-[680px] max-h-[1200px] overflow-hidden bg-background"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Background Image with zoom effect */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-[2000ms] ease-out"
        style={{ 
          backgroundImage: `url(${slide.image})`,
          transform: isAnimating ? 'scale(1.1)' : 'scale(1.05)'
        }}
      >
        {/* Gradient overlays — lighter so the helmet image stays visible,
            with a left-side scrim just dark enough to keep the text readable */}
        <div className="absolute inset-0 bg-background/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/45 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />

        {/* Top scrim for header legibility — tall and soft so it fades out
            gradually instead of ending in a visible line under the nav */}
        <div className="absolute top-0 left-0 right-0 h-[340px] bg-gradient-to-b from-black/60 via-black/25 to-transparent pointer-events-none" />
      </div>

      {/* Decorative elements - hidden on mobile */}
      <div className="absolute top-20 right-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse-glow hidden lg:block" />
      <div className="absolute bottom-40 left-10 w-40 h-40 bg-primary/5 rounded-full blur-2xl hidden lg:block" />

      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 md:px-8 h-full flex items-center relative z-10 pt-[132px] sm:pt-[150px] md:pt-[168px]">
        <div className={`max-w-4xl ${slide.align === "center" ? "mx-auto text-center" : ""}`}>
          {/* Animated content */}
          <div key={slide.id} className="space-y-4 sm:space-y-6">
            {/* Subtitle with decorative line */}
            <div className="flex items-center gap-3 sm:gap-4 animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <div className="w-8 sm:w-12 h-0.5 bg-primary hidden sm:block" />
              <p className="text-[10px] sm:text-xs md:text-sm text-primary font-bold tracking-[0.3em] sm:tracking-[0.4em] uppercase">
                {slide.subtitle}
              </p>
            </div>

            {/* Main title with gradient accent */}
            <h1
              className="font-black text-foreground leading-[0.9] tracking-tightest animate-slide-up max-w-[15ch]"
              style={{
                animationDelay: '0.2s',
                // Scales fluidly with the viewport but never large enough to overflow,
                // even for long product names like "FF320 STREAM II VINTAGE WHITE BLUE"
                fontSize: 'clamp(2rem, 6.5vw, 5.5rem)',
              }}
            >
              <span className="block">{slide.title.split(' ')[0]}</span>
              {slide.title.split(' ').length > 1 && (
                <span className="block text-gradient">{slide.title.split(' ').slice(1).join(' ')}</span>
              )}
            </h1>

            {/* Description */}
            {slide.description && (
              <p 
                className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-lg animate-fade-in"
                style={{ animationDelay: '0.4s' }}
              >
                {slide.description}
              </p>
            )}

            {/* CTA Button */}
            <div className="pt-2 sm:pt-4 animate-fade-in" style={{ animationDelay: '0.5s' }}>
              <Link
                to={slide.buttonLink}
                className="group inline-flex items-center gap-3 sm:gap-4 bg-primary text-primary-foreground font-bold px-6 sm:px-10 py-3 sm:py-5 text-xs sm:text-sm tracking-[0.2em] rounded-lg hover:bg-accent transition-all duration-500 hover:gap-5 sm:hover:gap-6 glow-hover active:scale-95"
              >
                {slide.buttonText}
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Arrows - Hidden on small mobile */}
      <button
        onClick={goToPrevSlide}
        className="absolute left-2 sm:left-4 md:left-8 top-1/2 -translate-y-1/2 p-2 sm:p-4 bg-background/20 backdrop-blur-md border border-border/30 rounded-full text-foreground/60 hover:text-foreground hover:bg-background/40 hover:border-primary/50 transition-all duration-300 z-20 group hidden sm:flex items-center justify-center"
        aria-label="Previous slide"
      >
        <ChevronLeft size={24} className="sm:w-7 sm:h-7 group-hover:-translate-x-1 transition-transform" />
      </button>
      <button
        onClick={goToNextSlide}
        className="absolute right-2 sm:right-4 md:right-8 top-1/2 -translate-y-1/2 p-2 sm:p-4 bg-background/20 backdrop-blur-md border border-border/30 rounded-full text-foreground/60 hover:text-foreground hover:bg-background/40 hover:border-primary/50 transition-all duration-300 z-20 group hidden sm:flex items-center justify-center"
        aria-label="Next slide"
      >
        <ChevronRight size={24} className="sm:w-7 sm:h-7 group-hover:translate-x-1 transition-transform" />
      </button>

      {/* Slide indicators - Modern pill style */}
      <div className="absolute bottom-6 sm:bottom-10 left-1/2 -translate-x-1/2 flex gap-2 sm:gap-3 z-20">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => goToSlide(idx)}
            className={`transition-all duration-500 rounded-full ${
              idx === currentSlide 
                ? "w-8 sm:w-12 h-2 sm:h-3 bg-primary shadow-lg" 
                : "w-2 sm:w-3 h-2 sm:h-3 bg-foreground/20 hover:bg-foreground/40"
            }`}
            style={{
              boxShadow: idx === currentSlide ? '0 0 20px hsl(66 100% 50% / 0.5)' : 'none'
            }}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>

      {/* Slide counter - Hidden on mobile */}
      <div className="absolute bottom-10 right-8 z-20 hidden md:flex items-center gap-3">
        <span className="text-4xl font-black text-primary">
          {String(currentSlide + 1).padStart(2, '0')}
        </span>
        <span className="text-muted-foreground">/</span>
        <span className="text-sm text-muted-foreground">
          {String(slides.length).padStart(2, '0')}
        </span>
      </div>

      {/* Swipe hint for mobile */}
      <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-20 sm:hidden">
        <p className="text-[10px] text-muted-foreground/60 tracking-wider uppercase">
          Swipe to explore
        </p>
      </div>
    </section>
  );
};

export default HeroSlider;
