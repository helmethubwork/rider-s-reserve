import { lazy, Suspense } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SEOHead from "@/components/SEOHead";
import HeroSlider from "@/components/HeroSlider";
import CategoryGrid from "@/components/CategoryGrid";
import MaintenanceBanner from "@/components/MaintenanceBanner";
import { Skeleton } from "@/components/ui/skeleton";

// Lazy load below-the-fold sections
const FeaturedPromo = lazy(() => import("@/components/FeaturedPromo"));
const InstagramFeed = lazy(() => import("@/components/InstagramFeed"));
const BrandShowcase = lazy(() => import("@/components/BrandShowcase"));
const WhyHelmetHub = lazy(() => import("@/components/WhyHelmetHub"));
const ExclusiveCollections = lazy(() => import("@/components/ExclusiveCollections"));
const UnbelievableOffers = lazy(() => import("@/components/NewArrivals"));

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
      {/* Header floats transparently over the hero, turns solid on scroll */}
      <Header overlay />

      {/* Hero pulled up so it sits behind the transparent header (Vega-style overlay) */}
      <div className="-mt-[84px] sm:-mt-[96px] md:-mt-[168px]">
        <HeroSlider />
      </div>

      {/* Exclusive Collections — circular category cards */}
      <Suspense fallback={<SectionSkeleton height="h-64" />}>
        <ExclusiveCollections />
      </Suspense>

      {/* Unbelievable Offers — swipeable product carousel */}
      <Suspense fallback={<SectionSkeleton height="h-96" />}>
        <UnbelievableOffers />
      </Suspense>

      {/* Category Grid - loads immediately (important for navigation) */}
      <CategoryGrid />

      {/* Featured Product Promos */}
      <Suspense fallback={<SectionSkeleton height="h-[50vh]" />}>
        <FeaturedPromo />
      </Suspense>

      {/* Instagram Feed */}
      <Suspense fallback={<SectionSkeleton height="h-96" />}>
        <InstagramFeed />
      </Suspense>

      {/* Brand Showcase */}
      <Suspense fallback={<SectionSkeleton height="h-80" />}>
        <BrandShowcase />
      </Suspense>

      {/* Why Helmet Hub */}
      <Suspense fallback={<SectionSkeleton height="h-64" />}>
        <WhyHelmetHub />
      </Suspense>


      <Footer />

    </div>
  );
};

export default Index;
