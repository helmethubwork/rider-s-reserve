import { Link } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { brands } from '@/data/brands';
import { products } from '@/data/products';
import { ChevronRight } from 'lucide-react';

const BrandsPage = () => {
  const getProductCountForBrand = (brandName: string) => {
    return products.filter(p => 
      p.brand?.toLowerCase().includes(brandName.toLowerCase()) ||
      p.name.toLowerCase().includes(brandName.toLowerCase())
    ).length;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-20">

        {/* Hero Section */}
        <section className="bg-gradient-to-b from-primary/10 to-background py-12 md:py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Shop by Brand
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Discover premium riding gear from the world's most trusted brands. 
              Quality, safety, and style – all in one place.
            </p>
          </div>
        </section>

        {/* Brands Grid */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
              {brands.map((brand) => {
                const productCount = getProductCountForBrand(brand.name);
                
                return (
                  <Link
                    key={brand.slug}
                    to={`/brands/${brand.slug}`}
                    className="group bg-card border border-border rounded-xl p-6 hover:border-primary/50 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="aspect-square bg-white rounded-lg flex items-center justify-center p-4 mb-4 group-hover:scale-105 transition-transform duration-300">
                      <img
                        src={brand.logo}
                        alt={brand.name}
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                    <h3 className="font-semibold text-foreground text-center mb-1 group-hover:text-primary transition-colors">
                      {brand.name}
                    </h3>
                    <p className="text-sm text-muted-foreground text-center">
                      {productCount > 0 ? `${productCount} Products` : 'Coming Soon'}
                    </p>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-muted/30 py-12">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Can't find what you're looking for?
            </h2>
            <p className="text-muted-foreground mb-6">
              Contact us and we'll help you find the perfect gear for your ride.
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              Contact Us
              <ChevronRight size={18} />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default BrandsPage;
