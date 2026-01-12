import { MessageCircle } from "lucide-react";

const WhatsAppButton = () => {
  const phoneNumber = "917842646888";
  const message = "Hi! I'm interested in your motorcycle gear.";
  
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="whatsapp-button"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle size={28} className="text-white" fill="white" />
    </a>
  );
};

export default WhatsAppButton;
