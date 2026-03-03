import { lazy, Suspense, Component, ReactNode } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SEOHead from "@/components/SEOHead";
import HeroSlider from "@/components/HeroSlider";
import CategoryGrid from "@/components/CategoryGrid";
import WhatsAppButton from "@/components/WhatsAppButton";
import MaintenanceBanner from "@/components/MaintenanceBanner";
import { Skeleton } from "@/components/ui/skeleton";

// Retry wrapper for lazy imports to handle transient fetch failures
function lazyRetry(fn: () => Promise<any>, retries = 3): ReturnType<typeof lazy> {
  return lazy(() =>
    fn().catch((err) => {
      if (retries > 0) {
        return new Promise<void>((resolve) => setTimeout(resolve, 1000)).then(() =>
          lazyRetry(fn, retries - 1) as any
        );
      }
      throw err;
    })
  );
}

// Lazy load below-the-fold sections with retry
const FeaturedPromo = lazyRetry(() => import("@/components/FeaturedPromo"));
const InstagramFeed = lazyRetry(() => import("@/components/InstagramFeed"));
const OffersCarousel = lazyRetry(() => import("@/components/OffersCarousel"));
const BrandShowcase = lazyRetry(() => import("@/components/BrandShowcase"));
const WhyHelmetHub = lazyRetry(() => import("@/components/WhyHelmetHub"));

// Error boundary for individual lazy sections so one failure doesn't crash the page
class SectionErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: Error) {
    console.error('[SectionErrorBoundary]', error.message);
  }
  render() {
    if (this.state.hasError) return null; // silently skip failed section
    return this.props.children;
  }
}

const SectionSkeleton = ({ height = "h-64" }: { height?: string }) => (
  <div className={`${height} w-full`}>
    <Skeleton className="w-full h-full" />
  </div>
);

const Index = () => {
  return (
    <div className="min-h-screen bg-background page-transition">
      <SEOHead path="/" />
      <MaintenanceBanner />
      <Header />
      
      {/* Hero Slider - loads immediately */}
      <HeroSlider />

      {/* Offers Carousel */}
      <SectionErrorBoundary>
        <Suspense fallback={<SectionSkeleton height="h-48" />}>
          <OffersCarousel />
        </Suspense>
      </SectionErrorBoundary>

      {/* Category Grid - loads immediately (important for navigation) */}
      <CategoryGrid />

      {/* Featured Product Promos */}
      <SectionErrorBoundary>
        <Suspense fallback={<SectionSkeleton height="h-[50vh]" />}>
          <FeaturedPromo />
        </Suspense>
      </SectionErrorBoundary>

      {/* Instagram Feed */}
      <SectionErrorBoundary>
        <Suspense fallback={<SectionSkeleton height="h-96" />}>
          <InstagramFeed />
        </Suspense>
      </SectionErrorBoundary>

      {/* Brand Showcase */}
      <SectionErrorBoundary>
        <Suspense fallback={<SectionSkeleton height="h-80" />}>
          <BrandShowcase />
        </Suspense>
      </SectionErrorBoundary>

      {/* Why Helmet Hub */}
      <SectionErrorBoundary>
        <Suspense fallback={<SectionSkeleton height="h-64" />}>
          <WhyHelmetHub />
        </Suspense>
      </SectionErrorBoundary>

      {/* WhatsApp Button */}
      <WhatsAppButton />

      <Footer />
    </div>
  );
};

export default Index;
