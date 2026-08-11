import { useParams, Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import ProductCard from "@/components/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowLeft, PackageOpen } from "lucide-react";
import { useCollectionBySlug, useCollectionProducts } from "@/hooks/useCollections";

const CollectionPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: collection, isLoading: loadingCollection } = useCollectionBySlug(slug);
  const { data: products = [], isLoading: loadingProducts } = useCollectionProducts(collection?.id);

  const isLoading = loadingCollection || loadingProducts;

  return (
    <div className="min-h-screen bg-background page-transition">
      <Header />

      {/* Back link */}
      <div className="container mx-auto px-4 pt-5">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/" className="gap-1.5">
            <ArrowLeft size={16} />
            Back to Home
          </Link>
        </Button>
      </div>

      <section className="py-6 sm:py-10">
        <div className="container mx-auto px-4">
          {/* Title */}
          <div className="text-center mb-8 sm:mb-12">
            {loadingCollection ? (
              <Skeleton className="h-10 w-72 mx-auto" />
            ) : (
              <>
                <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-foreground tracking-tightest">
                  {collection?.name || "Collection"}
                </h1>
                {!isLoading && (
                  <p className="text-muted-foreground text-sm sm:text-base mt-3">
                    {products.length} {products.length === 1 ? "product" : "products"}
                  </p>
                )}
                <div className="w-14 h-1 bg-primary rounded-full mx-auto mt-4" />
              </>
            )}
          </div>

          {/* Products */}
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-square w-full rounded-xl" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16 sm:py-24">
              <PackageOpen size={56} className="mx-auto text-muted-foreground mb-5" />
              <h2 className="text-lg sm:text-xl font-bold text-foreground mb-2">
                No products in this collection yet
              </h2>
              <p className="text-muted-foreground text-sm mb-7 max-w-md mx-auto">
                We're adding products to this collection. Check back soon, or browse everything we
                have in the meantime.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button asChild>
                  <Link to="/category/all">Shop All Products</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/sale">View Sale</Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
              {products.map((product: any) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  price={
                    product.is_on_sale && product.sale_price ? product.sale_price : product.price
                  }
                  image={product.image_url || "/placeholder.svg"}
                  badge={product.sale_badge}
                  isSoldOut={product.stock === 0}
                  colors={product.colors || []}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default CollectionPage;
