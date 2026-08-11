import { lazy, Suspense } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SEOHead from "@/components/SEOHead";
import HeroSlider from "@/components/HeroSlider";
import CategoryGrid from "@/components/CategoryGrid";
import WhatsAppButton from "@/components/WhatsAppButton";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import MaintenanceBanner from "@/components/MaintenanceBanner";
import { Skeleton } from "@/components/ui/skeleton";

// Lazy load below-the-fold sections
const FeaturedPromo = lazy(() => import("@/components/FeaturedPromo"));
const InstagramFeed = lazy(() => import("@/components/InstagramFeed"));
const BrandShowcase = lazy(() => import("@/components/BrandShowcase"));
const WhyHelmetHub = lazy(() => import("@/components/WhyHelmetHub"));
const ExclusiveCollections = lazy(() => import("@/components/ExclusiveCollections"));
const SafetyMarquee = lazy(() => import("@/components/SafetyMarquee"));

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

      {/* Exclusive Collections — circular category cards */}
      <Suspense fallback={<SectionSkeleton height="h-64" />}>
        <ExclusiveCollections />
      </Suspense>

      {/* Scrolling road-safety quotes */}
      <Suspense fallback={<div className="h-16" />}>
        <SafetyMarquee />
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

      {/* WhatsApp Button */}
      <WhatsAppButton />

      <Footer />

      {/* Mobile bottom navigation */}
      <MobileBottomNav />
    </div>
  );
};

export default Index;
