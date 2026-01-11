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
      <SheetContent className="w-full sm:max-w-md bg-[#1a1a2e] border-l border-gray-700 p-0 flex flex-col">
        <SheetHeader className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-2xl font-serif italic text-[#c8e621] tracking-wide">
              CART
            </SheetTitle>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-6">
          {items.length === 0 ? (
            <p className="text-gray-400 text-center py-8">Your cart is empty</p>
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
                    <h3 className="text-[#c8e621] font-medium text-sm mb-1">
                      {item.name}
                    </h3>
                    <p className="text-gray-400 text-xs">
                      <span className="text-gray-300">Color:</span> {item.color}
                    </p>
                    <p className="text-gray-400 text-xs mb-3">
                      <span className="text-gray-300">Size:</span> {item.size}
                    </p>

                    {/* Quantity Selector */}
                    <div className="flex items-center gap-0">
                      <button
                        onClick={() =>
                          item.quantity > 1
                            ? onUpdateQuantity(item.id, item.quantity - 1)
                            : onRemoveItem(item.id)
                        }
                        className="w-8 h-8 bg-[#c8e621] text-black flex items-center justify-center hover:bg-[#b5d11e] transition-colors"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-10 h-8 bg-[#c8e621] text-black flex items-center justify-center text-sm font-medium">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 bg-[#c8e621] text-black flex items-center justify-center hover:bg-[#b5d11e] transition-colors"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="text-right">
                    <p className="text-[#c8e621] font-medium">
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
          <div className="p-6 border-t border-gray-700 bg-[#1a1a2e]">
            {/* Subtotal */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-300 tracking-[0.2em] text-sm uppercase">
                Subtotal
              </span>
              <span className="text-[#c8e621] font-medium">
                Rs. {subtotal.toLocaleString()}.00
              </span>
            </div>

            <p className="text-gray-400 text-xs text-center mb-4">
              Shipping, taxes, and discount codes calculated at checkout.
            </p>

            <Button
              className="w-full bg-[#c8e621] hover:bg-[#b5d11e] text-black font-medium tracking-[0.15em] uppercase py-6"
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
