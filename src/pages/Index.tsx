import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HeroSlider from "@/components/HeroSlider";
import CategoryGrid from "@/components/CategoryGrid";
import FeaturedPromo from "@/components/FeaturedPromo";
import InstagramFeed from "@/components/InstagramFeed";
import OffersCarousel from "@/components/OffersCarousel";
import BrandShowcase from "@/components/BrandShowcase";
import WhyHelmetHub from "@/components/WhyHelmetHub";
import WhatsAppButton from "@/components/WhatsAppButton";
import MaintenanceBanner from "@/components/MaintenanceBanner";

const Index = () => {
  return (
    <div className="min-h-screen bg-background page-transition">
      <MaintenanceBanner />
      <Header />
      
      {/* Hero Slider */}
      <HeroSlider />

      {/* Offers Carousel */}
      <OffersCarousel />

      {/* Category Grid - Enhanced big banners */}
      <CategoryGrid />

      {/* Featured Product Promos - 2 columns */}
      <FeaturedPromo />

      {/* Instagram Feed */}
      <InstagramFeed />

      {/* Brand Showcase */}
      <BrandShowcase />

      {/* Why Helmet Hub */}
      <WhyHelmetHub />

      {/* WhatsApp Button */}
      <WhatsAppButton />

      <Footer />
    </div>
  );
};

export default Index;
