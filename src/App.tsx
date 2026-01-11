import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import CategoryPage from "./pages/CategoryPage";
import CartPage from "./pages/CartPage";
import WishlistPage from "./pages/WishlistPage";
import AuthPage from "./pages/AuthPage";
import NotFound from "./pages/NotFound";
import ShippingPolicyPage from "./pages/ShippingPolicyPage";
import WarrantyPolicyPage from "./pages/WarrantyPolicyPage";
import ExchangeReturnsPage from "./pages/ExchangeReturnsPage";
import ContactPage from "./pages/ContactPage";
import StoreLocatorPage from "./pages/StoreLocatorPage";
import BlogPage from "./pages/BlogPage";
import BlogPostPage from "./pages/BlogPostPage";
import TrackOrdersPage from "./pages/TrackOrdersPage";
import SalePage from "./pages/SalePage";
import ProductDetailPage from "./pages/ProductDetailPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/category/:slug" element={<CategoryPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/latest-offers" element={<CategoryPage />} />
          <Route path="/shipping-policy" element={<ShippingPolicyPage />} />
          <Route path="/warranty-policy" element={<WarrantyPolicyPage />} />
          <Route path="/exchange-returns" element={<ExchangeReturnsPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/stores" element={<StoreLocatorPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/:slug" element={<BlogPostPage />} />
          <Route path="/track-order" element={<TrackOrdersPage />} />
          <Route path="/sale" element={<SalePage />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
