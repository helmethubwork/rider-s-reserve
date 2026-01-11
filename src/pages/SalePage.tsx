import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { products, Product } from "@/data/products";
import { ChevronDown, Star } from "lucide-react";
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

const SalePage = () => {
  const { toast } = useToast();
  const { addToCart } = useCart();
  const [sortBy, setSortBy] = useState("featured");
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [openFilters, setOpenFilters] = useState<string[]>([]);

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
                ? "fill-yellow-400 text-yellow-400"
                : star - 0.5 <= rating
                ? "fill-yellow-400/50 text-yellow-400"
                : "text-gray-300"
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

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="flex-1 pt-0 pb-12">
        <div className="container mx-auto px-4">
          {/* Title */}
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-serif font-normal text-center text-navy-900 tracking-wide mb-4 uppercase">
            Sale
          </h1>

          {/* Subtitle */}
          <p className="text-center text-gray-600 mb-8">
            Buy riding gear online at the best prices with our special offers.
          </p>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filters Sidebar */}
            <aside className="lg:w-64 flex-shrink-0">
              <h2 className="text-sm font-medium tracking-[0.15em] uppercase text-gray-900 pb-4 border-b border-gray-200">
                Filters
              </h2>
              {/* Brand Filter */}
              <Collapsible
                open={openFilters.includes("brand")}
                onOpenChange={() => toggleFilter("brand")}
              >
                <CollapsibleTrigger className="flex items-center justify-between w-full py-4 border-b border-gray-200 text-left">
                  <span className="text-sm font-medium tracking-[0.15em] uppercase text-black">
                    Brand
                  </span>
                  <ChevronDown
                    size={18}
                    className={`text-black transition-transform ${
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
                      <span className="text-sm text-gray-700">{brand}</span>
                    </label>
                  ))}
                </CollapsibleContent>
              </Collapsible>

              {/* Model Filter */}
              <Collapsible
                open={openFilters.includes("model")}
                onOpenChange={() => toggleFilter("model")}
              >
                <CollapsibleTrigger className="flex items-center justify-between w-full py-4 border-b border-gray-200 text-left">
                  <span className="text-sm font-medium tracking-[0.15em] uppercase text-black">
                    Model
                  </span>
                  <ChevronDown
                    size={18}
                    className={`text-black transition-transform ${
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
                      <span className="text-sm text-gray-700">{model}</span>
                    </label>
                  ))}
                </CollapsibleContent>
              </Collapsible>

              {/* Size Filter */}
              <Collapsible
                open={openFilters.includes("size")}
                onOpenChange={() => toggleFilter("size")}
              >
                <CollapsibleTrigger className="flex items-center justify-between w-full py-4 border-b border-gray-200 text-left">
                  <span className="text-sm font-medium tracking-[0.15em] uppercase text-black">
                    Size
                  </span>
                  <ChevronDown
                    size={18}
                    className={`text-black transition-transform ${
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
                      <span className="text-sm text-gray-700">{size}</span>
                    </label>
                  ))}
                </CollapsibleContent>
              </Collapsible>

              {/* Price Filter */}
              <Collapsible
                open={openFilters.includes("price")}
                onOpenChange={() => toggleFilter("price")}
              >
                <CollapsibleTrigger className="flex items-center justify-between w-full py-4 border-b border-gray-200 text-left">
                  <span className="text-sm font-medium tracking-[0.15em] uppercase text-black">
                    Price
                  </span>
                  <ChevronDown
                    size={18}
                    className={`text-black transition-transform ${
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
                      <span className="text-sm text-gray-700">{range}</span>
                    </label>
                  ))}
                </CollapsibleContent>
              </Collapsible>

              {/* Availability Filter */}
              <Collapsible
                open={openFilters.includes("availability")}
                onOpenChange={() => toggleFilter("availability")}
              >
                <CollapsibleTrigger className="flex items-center justify-between w-full py-4 border-b border-gray-200 text-left">
                  <span className="text-sm font-medium tracking-[0.15em] uppercase text-black">
                    Availability
                  </span>
                  <ChevronDown
                    size={18}
                    className={`text-black transition-transform ${
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
                      <span className="text-sm text-gray-700">{option}</span>
                    </label>
                  ))}
                </CollapsibleContent>
              </Collapsible>
            </aside>

            {/* Products Section */}
            <div className="flex-1">
              {/* Products Header */}
              <div className="flex items-center justify-between mb-6">
                <p className="text-sm text-gray-700">
                  <span className="font-medium">{filteredProducts.length}</span> products
                </p>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="featured">Featured</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="rating">Best Rating</SelectItem>
                    <SelectItem value="discount">Biggest Discount</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Products Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <Link
                    to={`/product/${product.id}`}
                    key={product.id}
                    className="group block"
                  >
                    {/* Product Image */}
                    <div className="relative aspect-square bg-gray-50 rounded-lg overflow-hidden mb-3">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {/* Sale Badge */}
                      <span className="absolute top-3 right-3 bg-[#c8e621] text-black text-xs font-medium px-2 py-1 rounded">
                        {getSaleBadge(product)}
                      </span>
                    </div>

                    {/* Product Info */}
                    <div className="text-center">
                      <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wide mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                        {product.name}
                      </h3>

                      {/* Rating */}
                      <div className="flex items-center justify-center gap-2 mb-2">
                        {renderStars(product.rating)}
                        <span className="text-xs text-gray-500">
                          {product.reviewCount} reviews
                        </span>
                      </div>

                      {/* Price */}
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <span className="text-sm text-gray-400 line-through">
                          Rs. {product.originalPrice?.toLocaleString()}.00
                        </span>
                        <span className="text-sm text-destructive font-medium">
                          Rs. {product.price.toLocaleString()}.00
                        </span>
                      </div>

                      {/* EMI Option */}
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-xs text-gray-700">
                          or ₹{getEmiAmount(product.price).toLocaleString()}/Month
                        </span>
                        <span className="text-xs bg-[#c8e621] text-black px-2 py-0.5 rounded">
                          Buy on EMI &gt;
                        </span>
                      </div>
                    </div>

                    {/* Add to Cart Button */}
                    <button
                      onClick={(e) => handleAddToCart(product, e)}
                      className="w-full mt-4 bg-[#c8e621] hover:bg-[#b5d11e] text-black font-medium py-2 rounded transition-colors"
                    >
                      Add to Cart
                    </button>
                  </Link>
                ))}
              </div>

              {filteredProducts.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500">No products match your filters.</p>
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
