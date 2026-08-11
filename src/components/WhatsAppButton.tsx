import { MessageCircle } from "lucide-react";
import { useSiteSettings, getSettingValue } from "@/hooks/useSiteSettings";

const WhatsAppButton = () => {
  const { data: contactSettings } = useSiteSettings('contact');
  
  const phoneNumber = getSettingValue(contactSettings, 'whatsapp_number', '917842646888');
  const message = getSettingValue(contactSettings, 'whatsapp_message', "Hi! I'm interested in your motorcycle gear.");
  
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="whatsapp-button"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle size={20} strokeWidth={2} className="text-white" />
    </a>
  );
};

export default WhatsAppButton;
