import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { products } from "@/data/products";
import { Star, Truck, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";

const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { addToCart } = useCart();
  const product = products.find((p) => p.id === id);

  const [selectedColor, setSelectedColor] = useState("Fluorescent Yellow");
  const [selectedSize, setSelectedSize] = useState("M");
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

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
    addToCart({
      id: product.id,
      name: product.name,
      image: product.image,
      price: product.price,
      color: selectedColor,
      size: selectedSize,
      brand: product.brand,
    });
  };

  // Demo thumbnails (using same image)
  const thumbnails = [product.image, product.image, product.image, product.image];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="flex-1 pt-0 pb-12">
        <div className="container mx-auto px-4">
          {/* Breadcrumb */}
          <Link
            to="/sale"
            className="inline-flex items-center text-sm text-gray-600 hover:text-primary mb-6 transition-colors"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Sale
          </Link>

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
                  <span className="bg-[#c8e621] text-black text-xs font-bold px-2 py-0.5 rounded">
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
                  variant="outline"
                  className="bg-[#c8e621] hover:bg-[#b5d11e] text-black border-0 font-medium text-xs"
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
                          ? "border-primary bg-primary text-white"
                          : "border-gray-300 hover:border-gray-400 text-gray-700"
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

              {/* Free Shipping */}
              <div className="flex items-center gap-2 text-sm text-gray-700 mb-6">
                <Truck size={18} />
                <span>Free Shipping Across India</span>
              </div>

              {/* Add to Cart Button */}
              <Button
                onClick={handleAddToCart}
                className="w-full bg-[#c8e621] hover:bg-[#b5d11e] text-black font-medium tracking-[0.15em] uppercase py-6 text-base"
              >
                Add to Cart
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
