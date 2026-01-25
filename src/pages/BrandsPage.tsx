import { Link, useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useBrands } from '@/hooks/useBrands';
import { useProducts } from '@/hooks/useProducts';
import { ChevronRight, ArrowLeft } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

const BrandsPage = () => {
  const navigate = useNavigate();
  const { data: brands = [], isLoading: brandsLoading } = useBrands();
  const { data: products = [], isLoading: productsLoading } = useProducts();

  const getProductCountForBrand = (brandId: string) => {
    return products.filter(p => p.brand_id === brandId).length;
  };

  const isLoading = brandsLoading || productsLoading;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Back Button */}
      <div className="container mx-auto px-4 pt-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-foreground hover:text-primary"
        >
          <ArrowLeft size={16} />
          <span className="text-sm">Back</span>
        </Button>
      </div>

      <main className="pt-4">

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
              {isLoading ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="bg-card border border-border rounded-xl p-6">
                    <Skeleton className="aspect-square rounded-lg mb-4" />
                    <Skeleton className="h-5 w-3/4 mx-auto mb-2" />
                    <Skeleton className="h-4 w-1/2 mx-auto" />
                  </div>
                ))
              ) : (
                brands.map((brand) => {
                  const productCount = getProductCountForBrand(brand.id);
                  
                  return (
                    <Link
                      key={brand.slug}
                      to={`/brands/${brand.slug}`}
                      className="group bg-card border border-border rounded-xl p-6 hover:border-primary/50 hover:shadow-lg transition-all duration-300"
                    >
                      <div className="aspect-square bg-white rounded-lg flex items-center justify-center p-4 mb-4 group-hover:scale-105 transition-transform duration-300">
                        {brand.logo_url ? (
                          <img
                            src={brand.logo_url}
                            alt={brand.name}
                            className="max-w-full max-h-full object-contain"
                          />
                        ) : (
                          <span className="text-2xl font-bold text-gray-400">
                            {brand.name.charAt(0)}
                          </span>
                        )}
                      </div>
                      <h3 className="font-semibold text-foreground text-center mb-1 group-hover:text-primary transition-colors">
                        {brand.name}
                      </h3>
                      <p className="text-sm text-muted-foreground text-center">
                        {productCount > 0 ? `${productCount} Products` : 'Coming Soon'}
                      </p>
                    </Link>
                  );
                })
              )}
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
