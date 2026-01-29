import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HeroSlider from "@/components/HeroSlider";
import TrustBadges from "@/components/TrustBadges";
import CategoryGrid from "@/components/CategoryGrid";
import FeaturedPromo from "@/components/FeaturedPromo";
import InstagramFeed from "@/components/InstagramFeed";
import OffersCarousel from "@/components/OffersCarousel";
import BrandShowcase from "@/components/BrandShowcase";
import WhatsAppButton from "@/components/WhatsAppButton";
import MaintenanceBanner from "@/components/MaintenanceBanner";

const Index = () => {
  return (
    <div className="min-h-screen bg-background page-transition">
      <MaintenanceBanner />
      <Header />
      
      {/* Hero Slider */}
      <HeroSlider />

      {/* Trust Badges Strip */}
      <TrustBadges />

      {/* Category Grid */}
      <CategoryGrid />

      {/* Offers Carousel - Best Sellers */}
      <OffersCarousel />

      {/* Featured Product Promos */}
      <FeaturedPromo />

      {/* Brand Showcase */}
      <BrandShowcase />

      {/* Instagram Feed */}
      <InstagramFeed />

      {/* WhatsApp Button */}
      <WhatsAppButton />

      <Footer />
    </div>
  );
};

export default Index;
