import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "./contexts/CartContext";
import { AuthProvider } from "./contexts/AuthContext";
import ScrollToTop from "./components/ScrollToTop";
import ProtectedRoute from "./components/ProtectedRoute";
import Index from "./pages/Index";
import CategoryPage from "./pages/CategoryPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrderConfirmationPage from "./pages/OrderConfirmationPage";
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
import BrandsPage from "./pages/BrandsPage";
import BrandDetailPage from "./pages/BrandDetailPage";
import SupportPage from "./pages/SupportPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminAddProduct from "./pages/admin/AdminAddProduct";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminMessages from "./pages/admin/AdminMessages";
import AdminReturnRequests from "./pages/admin/AdminReturnRequests";
import AdminBrands from "./pages/admin/AdminBrands";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminHeroSlider from "./pages/admin/AdminHeroSlider";
import AdminFeaturedPromos from "./pages/admin/AdminFeaturedPromos";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CartProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ScrollToTop />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/category/:slug" element={<CategoryPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/order-confirmation/:orderNumber" element={<OrderConfirmationPage />} />
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
              <Route path="/brands" element={<BrandsPage />} />
              <Route path="/brands/:slug" element={<BrandDetailPage />} />
              <Route path="/support" element={<SupportPage />} />
              {/* Admin Routes - Protected */}
              <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminDashboard /></ProtectedRoute>} />
              <Route path="/admin/products" element={<ProtectedRoute requireAdmin><AdminProducts /></ProtectedRoute>} />
              <Route path="/admin/products/add" element={<ProtectedRoute requireAdmin><AdminAddProduct /></ProtectedRoute>} />
              <Route path="/admin/orders" element={<ProtectedRoute requireAdmin><AdminOrders /></ProtectedRoute>} />
              <Route path="/admin/messages" element={<ProtectedRoute requireAdmin><AdminMessages /></ProtectedRoute>} />
              <Route path="/admin/return-requests" element={<ProtectedRoute requireAdmin><AdminReturnRequests /></ProtectedRoute>} />
              <Route path="/admin/brands" element={<ProtectedRoute requireAdmin><AdminBrands /></ProtectedRoute>} />
              <Route path="/admin/categories" element={<ProtectedRoute requireAdmin><AdminCategories /></ProtectedRoute>} />
              <Route path="/admin/hero-slider" element={<ProtectedRoute requireAdmin><AdminHeroSlider /></ProtectedRoute>} />
              <Route path="/admin/featured-promos" element={<ProtectedRoute requireAdmin><AdminFeaturedPromos /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </CartProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
