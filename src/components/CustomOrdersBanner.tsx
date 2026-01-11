import { MessageCircle } from "lucide-react";

const CustomOrdersBanner = () => {
  const phoneNumber = "919876543210"; // Replace with actual number
  const message = "Hi! I'm interested in placing a custom order.";
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  return (
    <div className="bg-brand-yellow w-full py-2.5 px-4">
      <div className="container mx-auto flex items-center justify-center gap-4">
        <span className="font-bold text-black text-sm md:text-base tracking-wide">
          WE TAKE CUSTOM ORDERS
        </span>
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2"
        >
          <div className="bg-[#25D366] rounded-full p-1">
            <MessageCircle size={18} className="text-white" fill="white" />
          </div>
        </a>
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="border-2 border-black text-black font-semibold text-xs md:text-sm px-3 py-1 hover:bg-black hover:text-brand-yellow transition-colors"
        >
          TALK TO AN EXPERT
        </a>
      </div>
    </div>
  );
};

export default CustomOrdersBanner;
