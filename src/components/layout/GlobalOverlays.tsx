/**
 * GlobalOverlays
 *
 * Renders the floating UI that should exist on every storefront page:
 * the mobile bottom navigation and the WhatsApp chat button.
 * Mounted once in App.tsx so individual pages never have to include them.
 * Hidden on admin routes.
 */

import { useLocation } from "react-router-dom";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import WhatsAppButton from "@/components/WhatsAppButton";

const GlobalOverlays = () => {
  const { pathname } = useLocation();

  // Admin panel has its own chrome — no storefront overlays there
  if (pathname.startsWith("/admin")) return null;

  return (
    <>
      <WhatsAppButton />
      <MobileBottomNav />
    </>
  );
};

export default GlobalOverlays;
