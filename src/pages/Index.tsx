import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HeroSlider from "@/components/HeroSlider";
import CategoryGrid from "@/components/CategoryGrid";
import FeaturedPromo from "@/components/FeaturedPromo";
import FullWidthBanner from "@/components/FullWidthBanner";
import InstagramFeed from "@/components/InstagramFeed";
import OffersCarousel from "@/components/OffersCarousel";
import BrandShowcase from "@/components/BrandShowcase";
import WhatsAppButton from "@/components/WhatsAppButton";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Slider */}
      <HeroSlider />

      {/* Category Grid - 4 columns */}
      <CategoryGrid />

      {/* Featured Product Promos - 2 columns */}
      <FeaturedPromo />

      {/* Full Width Banner */}
      <FullWidthBanner
        subtitle="HJC"
        title="RPHA 1N CARBON SERIES"
        description="The Ultimate Racing Helmet"
        buttonText="SHOP NOW"
        buttonLink="/brands/hjc"
      />

      {/* Instagram Feed */}
      <InstagramFeed />

      {/* Offers Carousel */}
      <OffersCarousel />

      {/* Brand Showcase */}
      <BrandShowcase />

      {/* WhatsApp Button */}
      <WhatsAppButton />

      <Footer />
    </div>
  );
};

export default Index;
