import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/HeroSection";
import ProductCard from "@/components/ProductCard";
import CategoryCard from "@/components/CategoryCard";
import BrandShowcase from "@/components/BrandShowcase";
import InstagramSection from "@/components/InstagramSection";
import { getBestsellers, categories } from "@/data/products";
import helmet1 from "@/assets/products/helmet-1.jpg";
import jacket1 from "@/assets/products/jacket-1.jpg";
import visor1 from "@/assets/products/visor-1.jpg";
import intercom1 from "@/assets/products/intercom-1.jpg";

const categoryImages: Record<string, string> = {
  helmets: helmet1,
  "riding-gears": jacket1,
  "helmet-accessories": visor1,
  "motorcycle-accessories": intercom1,
};

const Index = () => {
  const bestsellers = getBestsellers();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <HeroSection />

      {/* Bestsellers Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="section-title mb-10">Our Bestsellers</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {bestsellers.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                price={product.price}
                originalPrice={product.originalPrice}
                image={product.image}
                rating={product.rating}
                reviewCount={product.reviewCount}
                brand={product.brand}
                isPreorder={product.isPreorder}
                isSoldOut={product.isSoldOut}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Brand Showcase */}
      <BrandShowcase />

      {/* Categories Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="section-title mb-10">Shop By Category</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category) => (
              <CategoryCard
                key={category.slug}
                name={category.name}
                image={categoryImages[category.slug]}
                href={`/category/${category.slug}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Preorder Banner */}
      <section className="py-16 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-r from-primary/20 via-primary/10 to-accent/20 rounded-2xl p-8 md:p-12 text-center border border-primary/30">
            <span className="badge-preorder mb-4 inline-block">
              ⚡ Limited Time
            </span>
            <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4">
              Preorder & Save Big
            </h2>
            <p className="text-muted-foreground text-lg mb-6 max-w-2xl mx-auto">
              Get exclusive discounts on preorders. Reserve your gear now and be the first to receive when stock arrives.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <div className="bg-card/50 rounded-lg px-6 py-4 border border-border">
                <p className="text-3xl font-display font-bold text-primary">10%</p>
                <p className="text-sm text-muted-foreground">First Order Discount</p>
              </div>
              <div className="bg-card/50 rounded-lg px-6 py-4 border border-border">
                <p className="text-3xl font-display font-bold text-primary">Free</p>
                <p className="text-sm text-muted-foreground">Shipping Over ₹5000</p>
              </div>
              <div className="bg-card/50 rounded-lg px-6 py-4 border border-border">
                <p className="text-3xl font-display font-bold text-primary">EMI</p>
                <p className="text-sm text-muted-foreground">Easy Installments</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Instagram Section */}
      <InstagramSection />

      <Footer />
    </div>
  );
};

export default Index;
