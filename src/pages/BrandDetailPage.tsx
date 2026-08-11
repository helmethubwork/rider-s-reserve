import { useParams, Link, useNavigate } from 'react-router-dom';
import { goBack } from "@/lib/navigation";
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/ProductCard';
import { useBrand } from '@/hooks/useBrands';
import { useProductsByBrand } from '@/hooks/useProducts';
import { ChevronRight, Package, Loader2, ArrowLeft } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

const BrandDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  
  // Fetch brand from Supabase
  const { data: brand, isLoading: brandLoading } = useBrand(slug || '');
  
  // Fetch products for this brand
  const { data: brandProducts = [], isLoading: productsLoading } = useProductsByBrand(brand?.id || '');

  const isLoading = brandLoading || productsLoading;

  if (brandLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 pt-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => goBack(navigate, "/brands")}
            className="flex items-center gap-1.5 text-foreground hover:text-primary"
          >
            <ArrowLeft size={16} />
            <span className="text-sm">Back</span>
          </Button>
        </div>
        <main className="pt-20">
          <div className="bg-muted/30 border-b border-border">
            <div className="container mx-auto px-4 py-3">
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
          <section className="bg-gradient-to-b from-primary/10 to-background py-12 md:py-16">
            <div className="container mx-auto px-4">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <Skeleton className="w-32 h-32 md:w-40 md:h-40 rounded-2xl" />
                <div className="text-center md:text-left flex-1">
                  <Skeleton className="h-10 w-48 mb-4 mx-auto md:mx-0" />
                  <Skeleton className="h-6 w-full max-w-2xl" />
                </div>
              </div>
            </div>
          </section>
          <section className="py-12">
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="aspect-[3/4] rounded-xl" />
                ))}
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    );
  }

  if (!brand) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 pt-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => goBack(navigate, "/brands")}
            className="flex items-center gap-1.5 text-foreground hover:text-primary"
          >
            <ArrowLeft size={16} />
            <span className="text-sm">Back</span>
          </Button>
        </div>
        <main className="pt-20">
          <div className="container mx-auto px-4 py-16 text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Brand Not Found</h1>
            <p className="text-muted-foreground mb-6">
              The brand you're looking for doesn't exist.
            </p>
            <Link
              to="/brands"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              View All Brands
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-20">
        {/* Breadcrumb */}
        <div className="bg-muted/30 border-b border-border">
          <div className="container mx-auto px-4 py-3">
            <nav className="flex items-center gap-2 text-sm">
              <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
                Home
              </Link>
              <ChevronRight size={14} className="text-muted-foreground" />
              <Link to="/brands" className="text-muted-foreground hover:text-foreground transition-colors">
                Brands
              </Link>
              <ChevronRight size={14} className="text-muted-foreground" />
              <span className="text-foreground font-medium">{brand.name}</span>
            </nav>
          </div>
        </div>

        {/* Brand Hero */}
        <section className="bg-gradient-to-b from-primary/10 to-background py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="w-32 h-32 md:w-40 md:h-40 bg-white rounded-2xl flex items-center justify-center p-4 shadow-lg">
                {brand.logo_url ? (
                  <img
                    src={brand.logo_url}
                    alt={brand.name}
                    className="max-w-full max-h-full object-contain"
                  />
                ) : (
                  <span className="text-2xl font-bold text-gray-400">{brand.name.charAt(0)}</span>
                )}
              </div>
              <div className="text-center md:text-left">
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
                  {brand.name}
                </h1>
                <p className="text-muted-foreground text-lg max-w-2xl">
                  {brand.description || `Explore our collection of ${brand.name} products.`}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Products Section */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            {productsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : brandProducts.length > 0 ? (
              <>
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold text-foreground">
                    {brand.name} Products
                  </h2>
                  <span className="text-muted-foreground">
                    {brandProducts.length} {brandProducts.length === 1 ? 'Product' : 'Products'}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                  {brandProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      id={product.id}
                      name={product.name}
                      price={product.price}
                      image={product.image_url || '/placeholder.svg'}
                      isSoldOut={product.stock === 0}
                      colors={product.colors || []}
                    />
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                  <Package size={40} className="text-muted-foreground" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  Coming Soon
                </h2>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  We're working on adding {brand.name} products to our collection. 
                  Check back soon or contact us for special orders.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    to="/brands"
                    className="inline-flex items-center justify-center gap-2 bg-muted text-foreground px-6 py-3 rounded-lg font-medium hover:bg-muted/80 transition-colors"
                  >
                    Browse Other Brands
                  </Link>
                  <Link
                    to="/contact"
                    className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
                  >
                    Contact Us
                  </Link>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default BrandDetailPage;