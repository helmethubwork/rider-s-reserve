import { lazy, Suspense } from "react";

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
import { Skeleton } from "@/components/ui/skeleton";

// Lazy load all non-homepage routes
const CategoryPage = lazy(() => import("./pages/CategoryPage"));
const CartPage = lazy(() => import("./pages/CartPage"));
const CheckoutPage = lazy(() => import("./pages/CheckoutPage"));
const OrderConfirmationPage = lazy(() => import("./pages/OrderConfirmationPage"));
const AuthPage = lazy(() => import("./pages/AuthPage"));
const AccountPage = lazy(() => import("./pages/AccountPage"));
const NotFound = lazy(() => import("./pages/NotFound"));
const ShippingPolicyPage = lazy(() => import("./pages/ShippingPolicyPage"));
const WarrantyPolicyPage = lazy(() => import("./pages/WarrantyPolicyPage"));
const ExchangeReturnsPage = lazy(() => import("./pages/ExchangeReturnsPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const StoreLocatorPage = lazy(() => import("./pages/StoreLocatorPage"));
const BlogPage = lazy(() => import("./pages/BlogPage"));
const BlogPostPage = lazy(() => import("./pages/BlogPostPage"));
const TrackOrdersPage = lazy(() => import("./pages/TrackOrdersPage"));
const SalePage = lazy(() => import("./pages/SalePage"));
const ProductDetailPage = lazy(() => import("./pages/ProductDetailPage"));
const BrandsPage = lazy(() => import("./pages/BrandsPage"));
const BrandDetailPage = lazy(() => import("./pages/BrandDetailPage"));
const SupportPage = lazy(() => import("./pages/SupportPage"));
const PaymentSuccess = lazy(() => import("./pages/PaymentSuccess"));
const PaymentFailed = lazy(() => import("./pages/PaymentFailed"));
const PaymentStatus = lazy(() => import("./pages/PaymentStatus"));
const MyOrdersPage = lazy(() => import("./pages/MyOrdersPage"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminProducts = lazy(() => import("./pages/admin/AdminProducts"));
const AdminAddProduct = lazy(() => import("./pages/admin/AdminAddProduct"));
const AdminOrders = lazy(() => import("./pages/admin/AdminOrders"));
const AdminMessages = lazy(() => import("./pages/admin/AdminMessages"));
const AdminReturnRequests = lazy(() => import("./pages/admin/AdminReturnRequests"));
const AdminBrands = lazy(() => import("./pages/admin/AdminBrands"));
const AdminCategories = lazy(() => import("./pages/admin/AdminCategories"));
const AdminHeroSlider = lazy(() => import("./pages/admin/AdminHeroSlider"));
const AdminFeaturedPromos = lazy(() => import("./pages/admin/AdminFeaturedPromos"));
const AdminSiteSettings = lazy(() => import("./pages/admin/AdminSiteSettings"));
const AdminStoreLocations = lazy(() => import("./pages/admin/AdminStoreLocations"));
const AdminInstagramPosts = lazy(() => import("./pages/admin/AdminInstagramPosts"));
const AdminBlog = lazy(() => import("./pages/admin/AdminBlog"));
const AdminFaqs = lazy(() => import("./pages/admin/AdminFaqs"));
const AdminNavigationLinks = lazy(() => import("./pages/admin/AdminNavigationLinks"));
const AdminContentPages = lazy(() => import("./pages/admin/AdminContentPages"));

const PageLoader = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="w-full max-w-md space-y-4 p-8">
      <Skeleton className="h-8 w-3/4 mx-auto" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-64 w-full rounded-xl" />
    </div>
  </div>
);

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
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/category/:slug" element={<CategoryPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/order-confirmation/:orderNumber" element={<OrderConfirmationPage />} />
                
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/account" element={<ProtectedRoute><AccountPage /></ProtectedRoute>} />
                <Route path="/my-orders" element={<ProtectedRoute><MyOrdersPage /></ProtectedRoute>} />
                <Route path="/latest-offers" element={<CategoryPage />} />
                <Route path="/shipping-policy" element={<ShippingPolicyPage />} />
                <Route path="/warranty-policy" element={<WarrantyPolicyPage />} />
                <Route path="/exchange-returns" element={<ExchangeReturnsPage />} />
                <Route path="/warranty" element={<WarrantyPolicyPage />} />
                <Route path="/returns" element={<ExchangeReturnsPage />} />
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
                <Route path="/payment-success" element={<PaymentSuccess />} />
                <Route path="/payment-failed" element={<PaymentFailed />} />
                <Route path="/payment-status" element={<PaymentStatus />} />
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
                <Route path="/admin/site-settings" element={<ProtectedRoute requireAdmin><AdminSiteSettings /></ProtectedRoute>} />
                <Route path="/admin/store-locations" element={<ProtectedRoute requireAdmin><AdminStoreLocations /></ProtectedRoute>} />
                <Route path="/admin/instagram" element={<ProtectedRoute requireAdmin><AdminInstagramPosts /></ProtectedRoute>} />
                <Route path="/admin/blog" element={<ProtectedRoute requireAdmin><AdminBlog /></ProtectedRoute>} />
                <Route path="/admin/faqs" element={<ProtectedRoute requireAdmin><AdminFaqs /></ProtectedRoute>} />
                <Route path="/admin/content-pages" element={<ProtectedRoute requireAdmin><AdminContentPages /></ProtectedRoute>} />
                <Route path="/admin/navigation-links" element={<ProtectedRoute requireAdmin><AdminNavigationLinks /></ProtectedRoute>} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </CartProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
