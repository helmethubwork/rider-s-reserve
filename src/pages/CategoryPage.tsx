import { useParams } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/ProductCard";
import { getProductsByCategory, categories } from "@/data/products";

const CategoryPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const category = categories.find(c => c.slug === slug);
  const products = getProductsByCategory(slug || "");

  if (!category) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-3xl font-display font-bold text-foreground mb-4">
            Category Not Found
          </h1>
          <p className="text-muted-foreground">
            The category you're looking for doesn't exist.
          </p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Category Header */}
      <section className="py-12 bg-secondary border-b border-border">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-3">
            {category.name}
          </h1>
          <p className="text-muted-foreground text-lg">
            {category.description}
          </p>
          <p className="text-primary mt-4 font-medium">
            {products.length} Products Available for Preorder
          </p>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
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
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">
                No products available in this category yet. Check back soon!
              </p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default CategoryPage;
