import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { goBack } from "@/lib/navigation";
import SEOHead from "@/components/SEOHead";
import Header from "@/components/layout/Header";
import { ArrowLeft, Search, SlidersHorizontal, PackageOpen, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/ProductCard";
import { useProductsByCategory } from "@/hooks/useProducts";
import { categories } from "@/data/products";

type SortValue = "featured" | "price-asc" | "price-desc" | "name";

const SORT_OPTIONS: { value: SortValue; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price ↑" },
  { value: "price-desc", label: "Price ↓" },
  { value: "name", label: "A–Z" },
];

const CategoryPage = () => {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();

  // "/category/all" is a virtual catch-all category showing the whole catalogue
  const isAll = slug === "all";
  const category = isAll
    ? { slug: "all", name: "All Products", description: "Browse our complete range of helmets, riding gear and accessories." }
    : categories.find((c) => c.slug === slug);

  // Fetch products from Supabase database
  const { data: products = [], isLoading, error } = useProductsByCategory(slug || "");

  // Search + filter + sort state
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortValue>("featured");
  const [inStockOnly, setInStockOnly] = useState(false);

  const visibleProducts = useMemo(() => {
    const effectivePrice = (p: any) =>
      p.is_on_sale && p.sale_price ? p.sale_price : p.price;

    let list = [...products];

    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter((p) => p.name?.toLowerCase().includes(q));
    }

    if (inStockOnly) {
      list = list.filter((p) => (p.stock ?? 0) > 0);
    }

    switch (sort) {
      case "price-asc":
        list.sort((a, b) => effectivePrice(a) - effectivePrice(b));
        break;
      case "price-desc":
        list.sort((a, b) => effectivePrice(b) - effectivePrice(a));
        break;
      case "name":
        list.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
        break;
      default:
        list.sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
    }

    return list;
  }, [products, query, sort, inStockOnly]);

  if (!category) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 pt-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => goBack(navigate)}
            className="flex items-center gap-1.5 text-foreground hover:text-primary"
          >
            <ArrowLeft size={16} />
            <span className="text-sm">Back</span>
          </Button>
        </div>
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
      <SEOHead
        title={category.name}
        description={`Shop ${category.name} at Helmet Hub Hyderabad. Browse premium motorcycle ${category.name.toLowerCase()} from top brands.`}
        path={`/category/${slug}`}
      />
      <Header />
      
      {/* Back Button */}
      <div className="container mx-auto px-4 pt-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => goBack(navigate)}
          className="flex items-center gap-1.5 text-foreground hover:text-primary"
        >
          <ArrowLeft size={16} />
          <span className="text-sm">Back</span>
        </Button>
      </div>

      {/* Category Header */}
      <section className="py-8 sm:py-12 bg-secondary/40 border-b border-border">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-foreground mb-2 tracking-tightest">
            {category.name}
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base max-w-xl mx-auto">
            {category.description}
          </p>
        </div>
      </section>

      {/* Search + Filters */}
      {/* Search + filters stay put at the top of the list — they do not follow
          the user down the page */}
      <section className="bg-background border-b border-border/60 py-3">
        <div className="container mx-auto px-4 space-y-3">
          {/* Search */}
          <div className="relative">
            <Search
              size={17}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search in this category…"
              className="w-full h-11 pl-10 pr-4 rounded-lg bg-secondary/60 border border-border/60 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/60 focus:bg-secondary transition-colors"
            />
          </div>

          {/* Filter row */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
            <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex-shrink-0 pr-1">
              <SlidersHorizontal size={13} />
              Sort
            </span>

            {SORT_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => setSort(option.value)}
                className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 active:scale-95 ${
                  sort === option.value
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-transparent text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
                }`}
              >
                {option.label}
              </button>
            ))}

            <div className="w-px h-5 bg-border flex-shrink-0 mx-1" />

            <button
              onClick={() => setInStockOnly((v) => !v)}
              className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 active:scale-95 ${
                inStockOnly
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-transparent text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
              }`}
            >
              In Stock
            </button>
          </div>

          {/* Result count */}
          <p className="text-xs text-muted-foreground">
            {visibleProducts.length}{" "}
            {visibleProducts.length === 1 ? "product" : "products"}
            {query && ` matching "${query}"`}
          </p>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-6 sm:py-10">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">Loading products...</span>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-destructive text-lg">
                Error loading products. Please try again later.
              </p>
            </div>
          ) : visibleProducts.length > 0 ? (
            /* 2 columns on mobile, 3 on tablet, 4 on desktop — Flipkart/Amazon style */
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5">
              {visibleProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  price={product.is_on_sale && product.sale_price ? product.sale_price : product.price}
                  image={product.image_url || "/placeholder.svg"}
                  badge={product.sale_badge as any}
                  isSoldOut={product.stock === 0}
                  colors={product.colors || []}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <PackageOpen size={48} className="mx-auto text-muted-foreground mb-4" />
              <p className="text-foreground font-semibold mb-1">
                {query || inStockOnly ? "No matching products" : "Nothing here yet"}
              </p>
              <p className="text-muted-foreground text-sm mb-6">
                {query || inStockOnly
                  ? "Try a different search or clear your filters."
                  : "We're adding products to this category. Check back soon!"}
              </p>
              {(query || inStockOnly) && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setQuery("");
                    setInStockOnly(false);
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default CategoryPage;
