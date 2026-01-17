import { useParams, Link } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/ProductCard';
import { getBrandBySlug } from '@/data/brands';
import { products } from '@/data/products';
import { ChevronRight, Package } from 'lucide-react';

const BrandDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const brand = getBrandBySlug(slug || '');

  const brandProducts = products.filter(p => 
    p.brand?.toLowerCase().includes(brand?.name.toLowerCase() || '') ||
    p.name.toLowerCase().includes(brand?.name.toLowerCase() || '')
  );

  if (!brand) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
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
                <img
                  src={brand.logo}
                  alt={brand.name}
                  className="max-w-full max-h-full object-contain"
                />
              </div>
              <div className="text-center md:text-left">
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
                  {brand.name}
                </h1>
                <p className="text-muted-foreground text-lg max-w-2xl">
                  {brand.description}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Products Section */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            {brandProducts.length > 0 ? (
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
                      originalPrice={product.originalPrice}
                      image={product.image}
                      rating={product.rating}
                      reviewCount={product.reviewCount || 0}
                      brand={product.brand || ''}
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
