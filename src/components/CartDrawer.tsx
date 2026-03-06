import { X, Minus, Plus } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

interface CartItem {
  id: string;
  name: string;
  image: string;
  color: string;
  size: string;
  price: number;
  quantity: number;
}

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemoveItem: (id: string) => void;
}

const CartDrawer = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
}: CartDrawerProps) => {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-md bg-card border-l border-border p-0 flex flex-col">
        <SheetHeader className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-2xl font-serif italic text-primary tracking-wide">
              CART
            </SheetTitle>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-6">
          {items.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">Your cart is empty</p>
          ) : (
            <div className="space-y-6">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4">
                  {/* Product Image */}
                  <div className="w-24 h-24 bg-white rounded overflow-hidden flex-shrink-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Product Info */}
                  <div className="flex-1">
                    <h3 className="text-primary font-medium text-sm mb-1">
                      {item.name}
                    </h3>
                    <p className="text-muted-foreground text-xs">
                      <span className="text-foreground/70">Color:</span> {item.color}
                    </p>
                    <p className="text-muted-foreground text-xs mb-3">
                      <span className="text-foreground/70">Size:</span> {item.size}
                    </p>

                    {/* Quantity Selector */}
                    <div className="flex items-center gap-0">
                      <button
                        onClick={() =>
                          item.quantity > 1
                            ? onUpdateQuantity(item.id, item.quantity - 1)
                            : onRemoveItem(item.id)
                        }
                        className="w-8 h-8 bg-primary text-primary-foreground flex items-center justify-center hover:bg-accent transition-colors"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-10 h-8 bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 bg-primary text-primary-foreground flex items-center justify-center hover:bg-accent transition-colors"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="text-right">
                    <p className="text-primary font-medium">
                      Rs. {(item.price * item.quantity).toLocaleString()}.00
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-6 border-t border-border bg-card">
            {/* Subtotal */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-foreground/70 tracking-[0.2em] text-sm uppercase">
                Subtotal
              </span>
              <span className="text-primary font-medium">
                Rs. {subtotal.toLocaleString()}.00
              </span>
            </div>

            <ul className="text-muted-foreground text-xs text-center mb-4 space-y-0.5">
              <li>Free shipping on orders above ₹2,000</li>
              <li>₹99 shipping for orders ₹1,000–₹1,999</li>
              <li>₹200 shipping for orders below ₹1,000</li>
            </ul>

            <Button
              className="w-full py-6"
              onClick={() => {
                // Handle checkout
              }}
            >
              Check Out
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CartDrawer;
