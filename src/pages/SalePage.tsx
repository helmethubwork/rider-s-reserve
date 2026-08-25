import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { goBack } from "@/lib/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useProducts } from "@/hooks/useProducts";
import { useBrands } from "@/hooks/useBrands";
import { useCategories } from "@/hooks/useCategories";
import { Loader2, ChevronDown, Filter, ArrowLeft, PackageOpen } from "lucide-react";
import { getSwatchBackground } from "@/lib/colorUtils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

/**
 * Sale page — shows only real products the admin has actually marked
 * `is_on_sale` in the admin panel, with the real `sale_price` and
 * `sale_badge` they set. This used to read from src/data/products.ts (a
 * leftover pre-migration mock file), which is why products no admin ever
 * added (AGV Pista GP RR, Sena 50S, etc.) showed up here with automatically
 * invented "Clearance Sale" badges and made-up MRP/price splits.
 */
const SalePage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addToCart } = useCart();
  const { data: allProducts = [], isLoading } = useProducts();
  const { data: brands = [] } = useBrands();
  const { data: categories = [] } = useCategories();

  const [sortBy, setSortBy] = useState("featured");
  const [selectedBrandIds, setSelectedBrandIds] = useState<string[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [openFilters, setOpenFilters] = useState<string[]>(["brand"]);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const brandName = (id: string | null) => brands.find((b) => b.id === id)?.name || "";
  const categoryName = (id: string | null) => categories.find((c) => c.id === id)?.name || "";

  // Only real products the admin actually put on sale, with a real discount.
  const saleProducts = useMemo(() => {
    return (allProducts as any[]).filter(
      (p) => p.is_active && p.is_on_sale && p.sale_price && p.sale_price < p.price
    );
  }, [allProducts]);

  const brandsWithSaleItems = useMemo(() => {
    const ids = new Set(saleProducts.map((p) => p.brand_id).filter(Boolean));
    return brands.filter((b) => ids.has(b.id));
  }, [saleProducts, brands]);

  const categoriesWithSaleItems = useMemo(() => {
    const ids = new Set(saleProducts.map((p) => p.category_id).filter(Boolean));
    return categories.filter((c) => ids.has(c.id));
  }, [saleProducts, categories]);

  const filteredProducts = useMemo(() => {
    let result = [...saleProducts];

    if (selectedBrandIds.length > 0) {
      result = result.filter((p) => selectedBrandIds.includes(p.brand_id));
    }
    if (selectedCategoryIds.length > 0) {
      result = result.filter((p) => selectedCategoryIds.includes(p.category_id));
    }
    if (inStockOnly) {
      result = result.filter((p) => p.stock > 0);
    }

    switch (sortBy) {
      case "price-low":
        result.sort((a, b) => a.sale_price - b.sale_price);
        break;
      case "price-high":
        result.sort((a, b) => b.sale_price - a.sale_price);
        break;
      case "discount":
        result.sort((a, b) => {
          const discountA = (a.price - a.sale_price) / a.price;
          const discountB = (b.price - b.sale_price) / b.price;
          return discountB - discountA;
        });
        break;
      default:
        result.sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
        break;
    }

    return result;
  }, [saleProducts, selectedBrandIds, selectedCategoryIds, inStockOnly, sortBy]);

  const toggleFilter = (filter: string) => {
    setOpenFilters((prev) =>
      prev.includes(filter) ? prev.filter((f) => f !== filter) : [...prev, filter]
    );
  };

  const toggleBrand = (id: string) => {
    setSelectedBrandIds((prev) =>
      prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id]
    );
  };

  const toggleCategory = (id: string) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const getEmiAmount = (price: number) => Math.round(price / 3);

  const handleAddToCart = (product: any, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      id: product.id,
      name: product.name,
      image: product.image_url || "/placeholder.svg",
      price: product.sale_price,
      color: "Default",
      size: "M",
      brand: brandName(product.brand_id),
    });
    toast({
      title: "Added to Cart",
      description: `${product.name} added to your cart.`,
    });
  };

  const clearAllFilters = () => {
    setSelectedBrandIds([]);
    setSelectedCategoryIds([]);
    setInStockOnly(false);
  };

  const activeFiltersCount =
    selectedBrandIds.length + selectedCategoryIds.length + (inStockOnly ? 1 : 0);

  const FilterContent = () => (
    <>
      {brandsWithSaleItems.length > 0 && (
        <Collapsible open={openFilters.includes("brand")} onOpenChange={() => toggleFilter("brand")}>
          <CollapsibleTrigger className="flex items-center justify-between w-full py-4 border-b border-border text-left">
            <span className="text-sm font-medium tracking-wide uppercase text-foreground">Brand</span>
            <ChevronDown
              size={18}
              className={`text-foreground transition-transform ${openFilters.includes("brand") ? "rotate-180" : ""}`}
            />
          </CollapsibleTrigger>
          <CollapsibleContent className="py-3 space-y-2">
            {brandsWithSaleItems.map((brand) => (
              <label key={brand.id} className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={selectedBrandIds.includes(brand.id)}
                  onCheckedChange={() => toggleBrand(brand.id)}
                />
                <span className="text-sm text-muted-foreground">{brand.name}</span>
              </label>
            ))}
          </CollapsibleContent>
        </Collapsible>
      )}

      {categoriesWithSaleItems.length > 0 && (
        <Collapsible open={openFilters.includes("category")} onOpenChange={() => toggleFilter("category")}>
          <CollapsibleTrigger className="flex items-center justify-between w-full py-4 border-b border-border text-left">
            <span className="text-sm font-medium tracking-wide uppercase text-foreground">Category</span>
            <ChevronDown
              size={18}
              className={`text-foreground transition-transform ${openFilters.includes("category") ? "rotate-180" : ""}`}
            />
          </CollapsibleTrigger>
          <CollapsibleContent className="py-3 space-y-2">
            {categoriesWithSaleItems.map((cat) => (
              <label key={cat.id} className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={selectedCategoryIds.includes(cat.id)}
                  onCheckedChange={() => toggleCategory(cat.id)}
                />
                <span className="text-sm text-muted-foreground">{cat.name}</span>
              </label>
            ))}
          </CollapsibleContent>
        </Collapsible>
      )}

      <Collapsible open={openFilters.includes("availability")} onOpenChange={() => toggleFilter("availability")}>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-4 border-b border-border text-left">
          <span className="text-sm font-medium tracking-wide uppercase text-foreground">Availability</span>
          <ChevronDown
            size={18}
            className={`text-foreground transition-transform ${openFilters.includes("availability") ? "rotate-180" : ""}`}
          />
        </CollapsibleTrigger>
        <CollapsibleContent className="py-3 space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <Checkbox checked={inStockOnly} onCheckedChange={(v) => setInStockOnly(!!v)} />
            <span className="text-sm text-muted-foreground">In Stock Only</span>
          </label>
        </CollapsibleContent>
      </Collapsible>
    </>
  );

  return (
    <div className="min-h-screen flex flex-col bg-background">
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

      <main className="flex-1 pt-4 pb-12">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-center text-foreground tracking-wide mb-4 uppercase">
            Sale
          </h1>
          <p className="text-center text-muted-foreground mb-8">
            Buy riding gear online at the best prices with our special offers.
          </p>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">Loading offers...</span>
            </div>
          ) : saleProducts.length === 0 ? (
            <div className="text-center py-16">
              <PackageOpen size={48} className="mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                No products are on sale right now. Check back soon!
              </p>
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row gap-8">
              <aside className="hidden lg:block lg:w-64 flex-shrink-0">
                <div className="sticky top-4">
                  <div className="flex items-center justify-between pb-4 border-b border-border">
                    <h2 className="text-sm font-medium tracking-wide uppercase text-foreground">Filters</h2>
                    {activeFiltersCount > 0 && (
                      <button
                        onClick={clearAllFilters}
                        className="text-xs text-primary hover:text-accent transition-colors"
                      >
                        Clear All
                      </button>
                    )}
                  </div>
                  <FilterContent />
                </div>
              </aside>

              <div className="flex-1">
                <div className="flex items-center justify-between gap-3 mb-6 lg:hidden">
                  <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
                    <SheetTrigger asChild>
                      <Button variant="outline" size="sm" className="flex-1 max-w-[150px]">
                        <Filter size={16} className="mr-2" />
                        Filters
                        {activeFiltersCount > 0 && (
                          <span className="ml-2 bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded-full">
                            {activeFiltersCount}
                          </span>
                        )}
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-[300px] bg-background border-border">
                      <SheetHeader className="border-b border-border pb-4">
                        <div className="flex items-center justify-between">
                          <SheetTitle className="text-foreground">Filters</SheetTitle>
                          {activeFiltersCount > 0 && (
                            <button
                              onClick={clearAllFilters}
                              className="text-xs text-primary hover:text-accent transition-colors"
                            >
                              Clear All
                            </button>
                          )}
                        </div>
                      </SheetHeader>
                      <div className="mt-4 overflow-y-auto max-h-[calc(100vh-120px)]">
                        <FilterContent />
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border bg-background">
                        <Button onClick={() => setMobileFiltersOpen(false)} className="w-full">
                          Show {filteredProducts.length} Results
                        </Button>
                      </div>
                    </SheetContent>
                  </Sheet>

                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="flex-1 max-w-[180px]">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="featured">Featured</SelectItem>
                      <SelectItem value="price-low">Price: Low to High</SelectItem>
                      <SelectItem value="price-high">Price: High to Low</SelectItem>
                      <SelectItem value="discount">Biggest Discount</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="hidden lg:flex items-center justify-between mb-6">
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">{filteredProducts.length}</span> products
                  </p>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="featured">Featured</SelectItem>
                      <SelectItem value="price-low">Price: Low to High</SelectItem>
                      <SelectItem value="price-high">Price: High to Low</SelectItem>
                      <SelectItem value="discount">Biggest Discount</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <p className="text-sm text-muted-foreground mb-4 lg:hidden">
                  <span className="font-medium text-foreground">{filteredProducts.length}</span> products
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
                  {filteredProducts.map((product) => (
                    <Link
                      to={`/product/${product.id}`}
                      key={product.id}
                      className="group block bg-card rounded-lg overflow-hidden border border-border/50 hover:border-primary/50 transition-all duration-300"
                    >
                      <div className="relative aspect-square bg-secondary overflow-hidden">
                        <img
                          src={product.image_url || "/placeholder.svg"}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {product.sale_badge && (
                          <span className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-primary text-primary-foreground text-[10px] sm:text-xs font-medium px-1.5 sm:px-2 py-0.5 sm:py-1 rounded">
                            {product.sale_badge}
                          </span>
                        )}
                        {product.stock === 0 && (
                          <div className="absolute inset-0 bg-background/70 backdrop-blur-[2px] flex items-center justify-center">
                            <span className="bg-destructive text-white px-4 py-2 rounded-lg font-bold text-xs uppercase">
                              Sold Out
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="p-3 sm:p-4">
                        <h3 className="text-xs sm:text-sm font-medium text-foreground uppercase tracking-wide mb-2 line-clamp-2 group-hover:text-primary transition-colors min-h-[2.5rem] sm:min-h-[3rem]">
                          {product.name}
                        </h3>

                        {/* Price — real MRP (price) struck through, real admin-set sale_price shown */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-2">
                          <span className="text-xs text-muted-foreground line-through">
                            Rs. {product.price.toLocaleString()}
                          </span>
                          <span className="text-sm sm:text-base text-primary font-bold">
                            Rs. {product.sale_price.toLocaleString()}
                          </span>
                        </div>

                        {product.colors && product.colors.length > 0 && (
                          <div className="flex items-center gap-2 mb-2">
                            {product.colors.slice(0, 5).map((color: string) => (
                              <span
                                key={color}
                                title={color}
                                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex-shrink-0 inline-block ring-2 ring-border ring-offset-2 ring-offset-card shadow-md"
                                style={{ background: getSwatchBackground(color) }}
                              />
                            ))}
                            {product.colors.length > 5 && (
                              <span className="text-[10px] sm:text-xs text-muted-foreground font-medium">
                                +{product.colors.length - 5}
                              </span>
                            )}
                          </div>
                        )}

                        <div className="hidden sm:flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">
                            or ₹{getEmiAmount(product.sale_price).toLocaleString()}/Month
                          </span>
                          <span className="text-[10px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded">
                            EMI
                          </span>
                        </div>

                        <Button
                          onClick={(e) => handleAddToCart(product, e)}
                          disabled={product.stock === 0}
                          className="w-full mt-3 text-xs sm:text-sm"
                          size="sm"
                        >
                          {product.stock === 0 ? "Sold Out" : "Add to Cart"}
                        </Button>
                      </div>
                    </Link>
                  ))}
                </div>

                {filteredProducts.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">No products match your filters.</p>
                    <Button variant="outline" onClick={clearAllFilters} className="mt-4">
                      Clear Filters
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SalePage;
