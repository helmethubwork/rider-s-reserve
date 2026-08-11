import { useState, useEffect } from "react";
import { MessageCircle } from "lucide-react";
import { useSiteSettings, getSettingValue } from "@/hooks/useSiteSettings";

const WhatsAppButton = () => {
  const { data: contactSettings } = useSiteSettings('contact');

  const phoneNumber = getSettingValue(contactSettings, 'whatsapp_number', '917842646888');
  const message = getSettingValue(contactSettings, 'whatsapp_message', "Hi! I'm interested in your motorcycle gear.");

  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  // Track whether the mobile bottom nav is showing, so the button can sit
  // just above it instead of overlapping
  const [navVisible, setNavVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setNavVisible(window.scrollY > 120);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`whatsapp-button ${navVisible ? "whatsapp-button--raised" : ""}`}
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle size={20} strokeWidth={2} className="text-white" />
    </a>
  );
};

export default WhatsAppButton;
