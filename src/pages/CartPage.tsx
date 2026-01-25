import { useNavigate, Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { ShoppingCart, Trash2, Plus, Minus, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";

const CartPage = () => {
  const navigate = useNavigate();
  const { items, updateQuantity, removeFromCart, totalPrice } = useCart();

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Back Button */}
      <div className="container mx-auto px-4 pt-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-foreground hover:text-primary"
        >
          <ArrowLeft size={16} />
          <span className="text-sm">Back</span>
        </Button>
      </div>

      <section className="py-8">
        <div className="container mx-auto px-4">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-8">
            Your Cart
          </h1>

          {items.length === 0 ? (
            <div className="text-center py-20">
              <ShoppingCart size={64} className="mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Your cart is empty
              </h2>
              <p className="text-muted-foreground mb-6">
                Add some awesome gear to get started!
              </p>
              <Button asChild>
                <Link to="/sale">Shop Sale</Link>
              </Button>
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {items.map((item) => (
                  <div
                    key={`${item.id}-${item.color}-${item.size}`}
                    className="flex gap-4 bg-card rounded-lg p-4 border border-border"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground uppercase">{item.brand}</p>
                      <h3 className="font-semibold text-foreground">{item.name}</h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        Color: {item.color} | Size: {item.size}
                      </p>
                      <p className="text-primary font-bold mt-1">
                        {formatPrice(item.price)}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <button 
                        onClick={() => removeFromCart(item.id)}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                      <div className="flex items-center gap-2 bg-secondary rounded-lg">
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-2 hover:text-primary transition-colors"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-2 hover:text-primary transition-colors"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="bg-card rounded-lg p-6 border border-border h-fit sticky top-24">
                <h3 className="font-display text-xl font-bold text-foreground mb-4">
                  Order Summary
                </h3>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span>{formatPrice(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Shipping</span>
                    <span>{totalPrice >= 5000 ? "FREE" : formatPrice(99)}</span>
                  </div>
                  <div className="border-t border-border pt-3 flex justify-between font-bold text-foreground">
                    <span>Total</span>
                    <span className="text-primary">
                      {formatPrice(totalPrice + (totalPrice >= 5000 ? 0 : 99))}
                    </span>
                  </div>
                </div>
                <Button className="w-full" size="lg" asChild>
                  <Link to="/checkout">Proceed to Checkout</Link>
                </Button>
                <p className="text-xs text-muted-foreground text-center mt-4">
                  Shipping, taxes, and discount codes calculated at checkout.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default CartPage;
