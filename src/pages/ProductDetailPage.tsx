import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { products, categories } from "@/data/products";
import { Star, Truck, Minus, Plus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";

const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const product = products.find((p) => p.id === id);

  const [selectedColor, setSelectedColor] = useState("Fluorescent Yellow");
  const [selectedSize, setSelectedSize] = useState("M");
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  // Demo colors and sizes
  const colors = [
    { name: "Fluorescent Yellow", hex: "#e8ff00" },
    { name: "Matte Black", hex: "#1a1a1a" },
    { name: "Gloss White", hex: "#ffffff" },
  ];

  const sizes = ["S", "M", "L", "XL", "XXL"];

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
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

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart({
        id: product.id,
        name: product.name,
        image: product.image,
        price: product.price,
        color: selectedColor,
        size: selectedSize,
        brand: product.brand,
      });
    }
    setIsAdded(true);
    toast({
      title: "Added to Cart",
      description: `${quantity} x ${product.name} added to your cart.`,
    });
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

  // Demo thumbnails (using same image)
  const thumbnails = [product.image, product.image, product.image, product.image];

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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Left: Image Gallery */}
            <div className="flex gap-4">
              {/* Thumbnails */}
              <div className="flex flex-col gap-3">
                {thumbnails.map((thumb, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`w-16 h-16 border-2 rounded overflow-hidden transition-colors ${
                      selectedImageIndex === index
                        ? "border-primary"
                        : "border-gray-200 hover:border-gray-300"
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
              <div className="flex-1 aspect-square bg-gray-50 rounded-lg overflow-hidden">
                <img
                  src={thumbnails[selectedImageIndex]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Right: Product Info */}
            <div>
              <h1 className="text-2xl md:text-3xl font-serif font-normal text-navy-900 tracking-wide uppercase mb-4">
                {product.name}
              </h1>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-4">
                {renderStars(product.rating)}
                <span className="text-sm text-gray-500">
                  {product.reviewCount} reviews
                </span>
              </div>

              {/* Price */}
              <div className="flex items-center gap-3 mb-2">
                {product.originalPrice && (
                  <span className="text-lg text-gray-400 line-through">
                    Rs. {product.originalPrice.toLocaleString()}.00
                  </span>
                )}
                <span className="text-xl text-destructive font-medium">
                  Rs. {product.price.toLocaleString()}.00
                </span>
              </div>

              <p className="text-sm text-gray-600 mb-6">
                Tax included. Free Shipping
              </p>

              {/* EMI Box */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="bg-primary text-primary-foreground text-xs font-bold px-2 py-0.5 rounded">
                    NEW
                  </span>
                  <div>
                    <p className="text-sm">
                      or Pay{" "}
                      <span className="text-destructive font-medium">
                        ₹{getEmiAmount(product.price).toLocaleString()}
                      </span>{" "}
                      now, & rest later at
                    </p>
                    <p className="text-xs text-gray-500">
                      <span className="font-medium">0% EMI</span> on UPI via PAY LATER
                    </p>
                  </div>
                </div>
                <Button
                  variant="default"
                  className="font-medium text-xs"
                >
                  BUY ON EMI
                </Button>
              </div>

              {/* Color Selector */}
              <div className="mb-6">
                <p className="text-sm font-medium tracking-[0.15em] uppercase mb-3">
                  Color <span className="font-normal text-gray-500">— {selectedColor}</span>
                </p>
                <div className="flex gap-2">
                  {colors.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => setSelectedColor(color.name)}
                      className={`w-10 h-10 rounded-full border-2 transition-all ${
                        selectedColor === color.name
                          ? "border-primary ring-2 ring-primary ring-offset-2"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                      style={{ backgroundColor: color.hex }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>

              {/* Size Selector */}
              <div className="mb-6">
                <p className="text-sm font-medium tracking-[0.15em] uppercase mb-3">
                  Size
                </p>
                <div className="flex gap-2">
                  {sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`w-12 h-12 border rounded font-medium transition-colors ${
                        selectedSize === size
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-gray-300 hover:border-primary text-gray-700"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Size Chart Link */}
              <button className="text-sm font-medium tracking-[0.1em] uppercase mb-6 flex items-center gap-2 hover:text-primary transition-colors">
                Size Chart
                <span className="text-lg">📏</span>
              </button>

              {/* Shipping */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                <Truck size={18} />
                <span>Worldwide Shipping Available</span>
              </div>

              {/* Stock Urgency */}
              {product.stock > 0 && product.stock <= 10 && (
                <div className="mb-4">
                  <p className="text-destructive text-sm font-medium">
                    Hurry, {product.stock} item(s) left in stock!
                  </p>
                  <div className="h-1.5 bg-secondary rounded-full mt-2 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-destructive via-primary to-accent rounded-full"
                      style={{ width: `${Math.min((product.stock / 10) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Quantity Selector and Add to Cart */}
              <div className="flex gap-3 mb-3">
                {/* Quantity Selector */}
                <div className="flex items-center border border-border rounded-lg">
                  <button
                    onClick={decrementQuantity}
                    disabled={quantity <= 1}
                    className="w-12 h-12 flex items-center justify-center text-foreground hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Minus size={18} />
                  </button>
                  <span className="w-12 text-center font-medium text-foreground">{quantity}</span>
                  <button
                    onClick={incrementQuantity}
                    disabled={quantity >= product.stock}
                    className="w-12 h-12 flex items-center justify-center text-foreground hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus size={18} />
                  </button>
                </div>

                {/* Add to Cart Button */}
                <Button
                  onClick={handleAddToCart}
                  className={`flex-1 py-6 text-base transition-all ${isAdded ? 'bg-green-600 hover:bg-green-600' : ''}`}
                  size="lg"
                  disabled={product.stock === 0}
                >
                  {isAdded ? (
                    <>
                      <Check size={20} className="mr-2" />
                      Added
                    </>
                  ) : (
                    'Add To Cart'
                  )}
                </Button>
              </div>

              {/* Buy Now Button */}
              <Button
                onClick={handleBuyNow}
                variant="secondary"
                className="w-full py-6 text-base bg-secondary hover:bg-secondary/80"
                size="lg"
                disabled={product.stock === 0}
              >
                Buy Now
              </Button>

              {/* Product Description */}
              <div className="mt-8 pt-8 border-t border-gray-200">
                <h3 className="text-sm font-medium tracking-[0.15em] uppercase mb-3">
                  Description
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
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
