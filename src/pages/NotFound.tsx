import { useLocation, useNavigate, Link } from "react-router-dom";
import { useEffect } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <div className="container mx-auto px-4 pt-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-foreground hover:text-primary"
        >
          <ArrowLeft size={16} />
          <span className="text-sm">Back</span>
        </Button>
      </div>

      <main className="flex-1 flex items-center justify-center">
        <div className="text-center px-4">
          <h1 className="mb-4 text-6xl font-bold text-primary">404</h1>
          <p className="mb-2 text-2xl font-semibold text-foreground">Page Not Found</p>
          <p className="mb-8 text-muted-foreground max-w-md mx-auto">
            Oops! The page you're looking for doesn't exist or has been moved.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="outline"
              onClick={() => navigate(-1)}
              className="flex items-center gap-2"
            >
              <ArrowLeft size={16} />
              Go Back
            </Button>
            <Button asChild>
              <Link to="/" className="flex items-center gap-2">
                <Home size={16} />
                Return to Home
              </Link>
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default NotFound;
