import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { categories } from "@/data/products";
import { useProduct } from "@/hooks/useProducts";
import { Star, Truck, Minus, Plus, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";

const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toast } = useToast();
  
  // All hooks must be called before any conditional returns
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  // Fetch product from Supabase
  const { data: product, isLoading, error } = useProduct(id || "");

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!product || error) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">
              Product Not Found
            </h1>
            <Link to="/sale" className="text-primary hover:underline">
              Back to Sale
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Get colors and sizes from product data
  const colors = product.colors || [];
  const sizes = product.sizes || [];

  const getEmiAmount = (price: number) => Math.round(price / 3);

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
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

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart({
        id: product.id,
        name: product.name,
        image: product.image_url || "/placeholder.svg",
        price: product.price,
        color: selectedColor,
        size: selectedSize,
        brand: product.category || "",
      });
    }
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate("/cart");
  };

  const incrementQuantity = () => {
    if (quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  // Product image
  const productImage = product.image_url || "/placeholder.svg";
  const thumbnails = [productImage];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 pb-12">
        {/* Breadcrumb Bar */}
        <div className="bg-secondary py-3 mb-8">
          <div className="container mx-auto px-4">
            <nav className="flex items-center gap-2 text-sm">
              <Link to="/" className="text-muted-foreground hover:text-primary transition-colors">
                Home
              </Link>
              <span className="text-muted-foreground">/</span>
              <Link 
                to={`/category/${product.category}`} 
                className="text-muted-foreground hover:text-primary transition-colors uppercase"
              >
                {categories.find(c => c.slug === product.category)?.name || product.category}
              </Link>
              <span className="text-muted-foreground">/</span>
              <span className="text-foreground font-medium uppercase truncate max-w-[200px] sm:max-w-none">
                {product.name}
              </span>
            </nav>
          </div>
        </div>

        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Left: Image Gallery */}
            <div className="flex flex-col-reverse sm:flex-row gap-4">
              {/* Thumbnails */}
              <div className="flex sm:flex-col gap-3 overflow-x-auto sm:overflow-visible pb-2 sm:pb-0">
                {thumbnails.map((thumb, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 border-2 rounded-lg overflow-hidden transition-all ${
                      selectedImageIndex === index
                        ? "border-primary ring-2 ring-primary/30"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <img
                      src={thumb}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>

              {/* Main Image */}
              <div className="flex-1 aspect-square bg-card rounded-xl overflow-hidden border border-border">
                <img
                  src={thumbnails[selectedImageIndex]}
                  alt={product.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>

            {/* Right: Product Info */}
            <div className="space-y-6">
              {/* Category Badge */}
              {product.category && (
                <span className="inline-block text-xs font-bold text-primary tracking-widest uppercase">
                  {product.category}
                </span>
              )}

              {/* Product Name */}
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground tracking-tight uppercase leading-tight">
                {product.name}
              </h1>

              {/* Price */}
              <div className="flex items-baseline gap-3">
                <span className="text-2xl md:text-3xl text-primary font-bold">
                  Rs. {product.price.toLocaleString()}.00
                </span>
              </div>

              <p className="text-sm text-muted-foreground">
                Tax included. Free Shipping
              </p>

              {/* EMI Box */}
              <div className="bg-card border border-border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded">
                    EMI
                  </span>
                  <div>
                    <p className="text-sm text-foreground">
                      Pay{" "}
                      <span className="text-primary font-bold">
                        ₹{getEmiAmount(product.price).toLocaleString()}
                      </span>{" "}
                      now, rest later
                    </p>
                    <p className="text-xs text-muted-foreground">
                      0% EMI on UPI via PAY LATER
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  BUY ON EMI
                </Button>
              </div>

              {/* Color Selector */}
              {colors.length > 0 && (
                <div>
                  <p className="text-sm font-medium tracking-wide uppercase mb-3 text-foreground">
                    Color <span className="font-normal text-muted-foreground">— {selectedColor || colors[0]}</span>
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`px-4 py-2 border-2 rounded-lg font-medium transition-all capitalize ${
                          (selectedColor || colors[0]) === color
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border hover:border-primary text-foreground"
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Size Selector */}
              {sizes.length > 0 && (
                <div>
                  <p className="text-sm font-medium tracking-wide uppercase mb-3 text-foreground">
                    Size
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`px-4 py-2 border-2 rounded-lg font-medium transition-all uppercase ${
                          (selectedSize || sizes[0]) === size
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border hover:border-primary text-foreground"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Size Chart Link */}
              <button className="text-sm font-medium tracking-wide uppercase flex items-center gap-2 text-primary hover:text-accent transition-colors">
                📏 Size Chart
              </button>

              {/* Shipping */}
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Truck size={20} className="text-primary" />
                <span>Worldwide Shipping Available</span>
              </div>

              {/* Stock Urgency */}
              {product.stock > 0 && product.stock <= 10 && (
                <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3">
                  <p className="text-destructive text-sm font-medium mb-2">
                    🔥 Hurry, only {product.stock} item(s) left in stock!
                  </p>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-destructive via-primary to-accent rounded-full transition-all"
                      style={{ width: `${Math.min((product.stock / 10) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Quantity Selector and Add to Cart */}
              <div className="flex gap-3">
                {/* Quantity Selector */}
                <div className="flex items-center border-2 border-border rounded-lg bg-card">
                  <button
                    onClick={decrementQuantity}
                    disabled={quantity <= 1}
                    className="w-12 h-14 flex items-center justify-center text-foreground hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed rounded-l-lg"
                  >
                    <Minus size={18} />
                  </button>
                  <span className="w-12 text-center font-bold text-foreground text-lg">{quantity}</span>
                  <button
                    onClick={incrementQuantity}
                    disabled={quantity >= product.stock}
                    className="w-12 h-14 flex items-center justify-center text-foreground hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed rounded-r-lg"
                  >
                    <Plus size={18} />
                  </button>
                </div>

                {/* Add to Cart Button */}
                <Button
                  onClick={handleAddToCart}
                  className={`flex-1 h-14 text-sm sm:text-base font-bold transition-all whitespace-nowrap min-w-0 ${isAdded ? 'bg-green-600 hover:bg-green-600' : ''}`}
                  size="lg"
                  disabled={product.stock === 0}
                >
                  {isAdded ? (
                    <>
                      <Check size={18} className="mr-1 sm:mr-2 flex-shrink-0" />
                      <span className="truncate">Added</span>
                    </>
                  ) : (
                    'Add To Cart'
                  )}
                </Button>
              </div>

              {/* Buy Now Button */}
              <Button
                onClick={handleBuyNow}
                variant="outline"
                className="w-full h-14 text-base font-bold"
                size="lg"
                disabled={product.stock === 0}
              >
                Buy Now
              </Button>

              {/* Product Description */}
              <div className="pt-6 border-t border-border">
                <h3 className="text-sm font-bold tracking-wide uppercase mb-3 text-foreground">
                  Description
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {product.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProductDetailPage;
