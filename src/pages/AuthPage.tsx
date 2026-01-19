import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { z } from "zod";
import { ArrowLeft } from "lucide-react";

// Validation schemas
const emailSchema = z.string().trim().email("Please enter a valid email");
const passwordSchema = z.string().min(6, "Password must be at least 6 characters");

const AuthPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signIn, signUp, isLoading } = useAuth();
  
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Redirect if already logged in
  useEffect(() => {
    if (user && !isLoading) {
      const from = (location.state as any)?.from?.pathname || "/";
      navigate(from, { replace: true });
    }
  }, [user, isLoading, navigate, location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validate inputs
    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      setError(emailResult.error.errors[0].message);
      setLoading(false);
      return;
    }

    const passwordResult = passwordSchema.safeParse(password);
    if (!passwordResult.success) {
      setError(passwordResult.error.errors[0].message);
      setLoading(false);
      return;
    }

    if (isLogin) {
      const { error: signInError } = await signIn(email, password);
      if (signInError) setError(signInError);
    } else {
      if (!name.trim()) {
        setError("Please enter your name");
        setLoading(false);
        return;
      }
      const { error: signUpError } = await signUp(email, password, name);
      if (signUpError) setError(signUpError);
    }

    setLoading(false);
  };

  const fromPath = (location.state as any)?.from?.pathname;

  const handleBack = () => {
    navigate(fromPath || "/");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <section className="py-8 md:py-24 px-4">
        <div className="container mx-auto">
          <div className="max-w-md mx-auto">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground mb-6"
            >
              <ArrowLeft size={16} />
              <span className="text-sm">Back</span>
            </Button>

            <h1 className="text-center text-2xl md:text-4xl font-bold text-foreground tracking-wide mb-8 md:mb-12">
              {isLogin ? "LOGIN" : "CREATE ACCOUNT"}
            </h1>

            {error && (
              <div className="bg-destructive/10 border border-destructive/30 text-destructive rounded-lg p-3 md:p-4 mb-4 md:mb-6 text-sm md:text-base">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
              {!isLogin && (
                <div className="space-y-2">
                  <label htmlFor="name" className="block text-xs font-medium tracking-[0.2em] text-muted-foreground">
                    FULL NAME
                  </label>
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required={!isLogin}
                    className="h-12 md:h-14 border-2 border-white/30 focus:border-primary rounded-lg bg-white text-gray-900 placeholder:text-gray-500"
                    placeholder="Enter your full name"
                  />
                </div>
              )}

              <div className="space-y-2">
                <label htmlFor="email" className="block text-xs font-medium tracking-[0.2em] text-muted-foreground">
                  EMAIL
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 md:h-14 border-2 border-white/30 focus:border-primary rounded-lg bg-white text-gray-900 placeholder:text-gray-500"
                  placeholder="Enter your email"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="block text-xs font-medium tracking-[0.2em] text-muted-foreground">
                  PASSWORD
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="h-12 md:h-14 border-2 border-white/30 focus:border-primary rounded-lg bg-white text-gray-900 placeholder:text-gray-500"
                  placeholder="Enter your password"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 md:h-14 bg-brand-yellow hover:bg-brand-yellow/90 text-black font-semibold tracking-[0.15em] rounded-lg mt-6 md:mt-8 text-sm md:text-base active:scale-[0.98] transition-transform touch-manipulation" 
                disabled={loading}
              >
                {loading ? "PLEASE WAIT..." : isLogin ? "SIGN IN" : "CREATE ACCOUNT"}
              </Button>
            </form>

            <div className="mt-6 md:mt-8 text-center">
              <button
                type="button"
                onClick={() => { setIsLogin(!isLogin); setError(""); }}
                className="text-muted-foreground hover:text-foreground transition-colors text-sm md:text-base py-2 touch-manipulation"
              >
                {isLogin ? "Create account" : "Already have an account? Sign in"}
              </button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AuthPage;
