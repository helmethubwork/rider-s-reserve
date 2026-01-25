import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { products, Product } from "@/data/products";
import { ChevronDown, Star, Filter, X, ArrowLeft } from "lucide-react";
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

const SalePage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addToCart } = useCart();
  const [sortBy, setSortBy] = useState("featured");
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [openFilters, setOpenFilters] = useState<string[]>([]);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Get sale products (products with originalPrice)
  const saleProducts = useMemo(() => {
    return products.filter((p) => p.originalPrice && p.originalPrice > p.price);
  }, []);

  // Get unique brands and categories
  const brands = useMemo(() => {
    const allBrands = [...new Set(products.map((p) => p.brand))];
    return allBrands;
  }, []);

  const categories = useMemo(() => {
    return [...new Set(saleProducts.map((p) => p.category))];
  }, [saleProducts]);

  const models = ["Targo", "Thunder", "Storm", "RPHA", "K5", "Pista GP", "Storm Evo"];
  const sizes = ["XS", "S", "M", "L", "XL", "XXL", "3XL"];
  const priceRanges = ["Under ₹5,000", "₹5,000 - ₹10,000", "₹10,000 - ₹20,000", "Above ₹20,000"];
  const availabilityOptions = ["In Stock", "Pre-order"];

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let result = [...saleProducts];

    if (selectedBrands.length > 0) {
      result = result.filter((p) => selectedBrands.includes(p.brand));
    }

    if (selectedCategories.length > 0) {
      result = result.filter((p) => selectedCategories.includes(p.category));
    }

    switch (sortBy) {
      case "price-low":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        result.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        result.sort((a, b) => b.rating - a.rating);
        break;
      case "discount":
        result.sort((a, b) => {
          const discountA = ((a.originalPrice! - a.price) / a.originalPrice!) * 100;
          const discountB = ((b.originalPrice! - b.price) / b.originalPrice!) * 100;
          return discountB - discountA;
        });
        break;
      default:
        break;
    }

    return result;
  }, [saleProducts, selectedBrands, selectedCategories, sortBy]);

  const toggleFilter = (filter: string) => {
    setOpenFilters((prev) =>
      prev.includes(filter) ? prev.filter((f) => f !== filter) : [...prev, filter]
    );
  };

  const toggleBrand = (brand: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  };

  const getSaleBadge = (product: Product) => {
    const discount = ((product.originalPrice! - product.price) / product.originalPrice!) * 100;
    if (discount >= 40) return "End of Season Sale";
    return "Clearance Sale";
  };

  const getEmiAmount = (price: number) => {
    return Math.round(price / 3);
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={14}
            className={
              star <= Math.floor(rating)
                ? "fill-primary text-primary"
                : star - 0.5 <= rating
                ? "fill-primary/50 text-primary"
                : "text-muted-foreground"
            }
          />
        ))}
      </div>
    );
  };

  const formatCategory = (category: string) => {
    return category
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const handleAddToCart = (product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      id: product.id,
      name: product.name,
      image: product.image,
      price: product.price,
      color: "Default",
      size: "M",
      brand: product.brand,
    });
    toast({
      title: "Added to Cart",
      description: `${product.name} added to your cart.`,
    });
  };

  const clearAllFilters = () => {
    setSelectedBrands([]);
    setSelectedCategories([]);
  };

  const activeFiltersCount = selectedBrands.length + selectedCategories.length;

  // Filter content component to reuse in both desktop and mobile
  const FilterContent = () => (
    <>
      {/* Brand Filter */}
      <Collapsible
        open={openFilters.includes("brand")}
        onOpenChange={() => toggleFilter("brand")}
      >
        <CollapsibleTrigger className="flex items-center justify-between w-full py-4 border-b border-border text-left">
          <span className="text-sm font-medium tracking-wide uppercase text-foreground">
            Brand
          </span>
          <ChevronDown
            size={18}
            className={`text-foreground transition-transform ${
              openFilters.includes("brand") ? "rotate-180" : ""
            }`}
          />
        </CollapsibleTrigger>
        <CollapsibleContent className="py-3 space-y-2">
          {brands.map((brand) => (
            <label
              key={brand}
              className="flex items-center gap-2 cursor-pointer"
            >
              <Checkbox
                checked={selectedBrands.includes(brand)}
                onCheckedChange={() => toggleBrand(brand)}
              />
              <span className="text-sm text-muted-foreground">{brand}</span>
            </label>
          ))}
        </CollapsibleContent>
      </Collapsible>

      {/* Model Filter */}
      <Collapsible
        open={openFilters.includes("model")}
        onOpenChange={() => toggleFilter("model")}
      >
        <CollapsibleTrigger className="flex items-center justify-between w-full py-4 border-b border-border text-left">
          <span className="text-sm font-medium tracking-wide uppercase text-foreground">
            Model
          </span>
          <ChevronDown
            size={18}
            className={`text-foreground transition-transform ${
              openFilters.includes("model") ? "rotate-180" : ""
            }`}
          />
        </CollapsibleTrigger>
        <CollapsibleContent className="py-3 space-y-2">
          {models.map((model) => (
            <label
              key={model}
              className="flex items-center gap-2 cursor-pointer"
            >
              <Checkbox />
              <span className="text-sm text-muted-foreground">{model}</span>
            </label>
          ))}
        </CollapsibleContent>
      </Collapsible>

      {/* Size Filter */}
      <Collapsible
        open={openFilters.includes("size")}
        onOpenChange={() => toggleFilter("size")}
      >
        <CollapsibleTrigger className="flex items-center justify-between w-full py-4 border-b border-border text-left">
          <span className="text-sm font-medium tracking-wide uppercase text-foreground">
            Size
          </span>
          <ChevronDown
            size={18}
            className={`text-foreground transition-transform ${
              openFilters.includes("size") ? "rotate-180" : ""
            }`}
          />
        </CollapsibleTrigger>
        <CollapsibleContent className="py-3 space-y-2">
          {sizes.map((size) => (
            <label
              key={size}
              className="flex items-center gap-2 cursor-pointer"
            >
              <Checkbox />
              <span className="text-sm text-muted-foreground">{size}</span>
            </label>
          ))}
        </CollapsibleContent>
      </Collapsible>

      {/* Price Filter */}
      <Collapsible
        open={openFilters.includes("price")}
        onOpenChange={() => toggleFilter("price")}
      >
        <CollapsibleTrigger className="flex items-center justify-between w-full py-4 border-b border-border text-left">
          <span className="text-sm font-medium tracking-wide uppercase text-foreground">
            Price
          </span>
          <ChevronDown
            size={18}
            className={`text-foreground transition-transform ${
              openFilters.includes("price") ? "rotate-180" : ""
            }`}
          />
        </CollapsibleTrigger>
        <CollapsibleContent className="py-3 space-y-2">
          {priceRanges.map((range) => (
            <label
              key={range}
              className="flex items-center gap-2 cursor-pointer"
            >
              <Checkbox />
              <span className="text-sm text-muted-foreground">{range}</span>
            </label>
          ))}
        </CollapsibleContent>
      </Collapsible>

      {/* Availability Filter */}
      <Collapsible
        open={openFilters.includes("availability")}
        onOpenChange={() => toggleFilter("availability")}
      >
        <CollapsibleTrigger className="flex items-center justify-between w-full py-4 border-b border-border text-left">
          <span className="text-sm font-medium tracking-wide uppercase text-foreground">
            Availability
          </span>
          <ChevronDown
            size={18}
            className={`text-foreground transition-transform ${
              openFilters.includes("availability") ? "rotate-180" : ""
            }`}
          />
        </CollapsibleTrigger>
        <CollapsibleContent className="py-3 space-y-2">
          {availabilityOptions.map((option) => (
            <label
              key={option}
              className="flex items-center gap-2 cursor-pointer"
            >
              <Checkbox />
              <span className="text-sm text-muted-foreground">{option}</span>
            </label>
          ))}
        </CollapsibleContent>
      </Collapsible>
    </>
  );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      {/* Back Button */}
      <div className="container mx-auto px-4 pt-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft size={16} />
          <span className="text-sm">Back</span>
        </Button>
      </div>

      <main className="flex-1 pt-4 pb-12">
        <div className="container mx-auto px-4">
          {/* Title */}
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-center text-foreground tracking-wide mb-4 uppercase">
            Sale
          </h1>

          {/* Subtitle */}
          <p className="text-center text-muted-foreground mb-8">
            Buy riding gear online at the best prices with our special offers.
          </p>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Desktop Filters Sidebar - Hidden on mobile */}
            <aside className="hidden lg:block lg:w-64 flex-shrink-0">
              <div className="sticky top-4">
                <div className="flex items-center justify-between pb-4 border-b border-border">
                  <h2 className="text-sm font-medium tracking-wide uppercase text-foreground">
                    Filters
                  </h2>
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

            {/* Products Section */}
            <div className="flex-1">
              {/* Mobile Filter Bar */}
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
                      <Button 
                        onClick={() => setMobileFiltersOpen(false)} 
                        className="w-full"
                      >
                        Show {filteredProducts.length} Results
                      </Button>
                    </div>
                  </SheetContent>
                </Sheet>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="flex-1 max-w-[180px] bg-card border-border">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="featured">Featured</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="rating">Best Rating</SelectItem>
                    <SelectItem value="discount">Biggest Discount</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Desktop Products Header */}
              <div className="hidden lg:flex items-center justify-between mb-6">
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">{filteredProducts.length}</span> products
                </p>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[180px] bg-card border-border">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="featured">Featured</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="rating">Best Rating</SelectItem>
                    <SelectItem value="discount">Biggest Discount</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Mobile Products Count */}
              <p className="text-sm text-muted-foreground mb-4 lg:hidden">
                <span className="font-medium text-foreground">{filteredProducts.length}</span> products
              </p>

              {/* Products Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
                {filteredProducts.map((product) => (
                  <Link
                    to={`/product/${product.id}`}
                    key={product.id}
                    className="group block bg-card rounded-lg overflow-hidden border border-border/50 hover:border-primary/50 transition-all duration-300"
                  >
                    {/* Product Image */}
                    <div className="relative aspect-square bg-secondary overflow-hidden">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {/* Sale Badge */}
                      <span className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-primary text-primary-foreground text-[10px] sm:text-xs font-medium px-1.5 sm:px-2 py-0.5 sm:py-1 rounded">
                        {getSaleBadge(product)}
                      </span>
                    </div>

                    {/* Product Info */}
                    <div className="p-3 sm:p-4">
                      <h3 className="text-xs sm:text-sm font-medium text-foreground uppercase tracking-wide mb-2 line-clamp-2 group-hover:text-primary transition-colors min-h-[2.5rem] sm:min-h-[3rem]">
                        {product.name}
                      </h3>

                      {/* Rating */}
                      <div className="flex items-center gap-1 sm:gap-2 mb-2">
                        {renderStars(product.rating)}
                        <span className="text-[10px] sm:text-xs text-muted-foreground">
                          ({product.reviewCount})
                        </span>
                      </div>

                      {/* Price */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-2">
                        <span className="text-xs text-muted-foreground line-through">
                          Rs. {product.originalPrice?.toLocaleString()}
                        </span>
                        <span className="text-sm sm:text-base text-primary font-bold">
                          Rs. {product.price.toLocaleString()}
                        </span>
                      </div>

                      {/* EMI Option - Hidden on small mobile */}
                      <div className="hidden sm:flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          or ₹{getEmiAmount(product.price).toLocaleString()}/Month
                        </span>
                        <span className="text-[10px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded">
                          EMI
                        </span>
                      </div>

                      {/* Add to Cart Button */}
                      <Button
                        onClick={(e) => handleAddToCart(product, e)}
                        className="w-full mt-3 text-xs sm:text-sm"
                        size="sm"
                      >
                        Add to Cart
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
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SalePage;
