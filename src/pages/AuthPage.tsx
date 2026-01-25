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
  const { user, signIn, signUp, signInWithGoogle, isLoading } = useAuth();
  
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
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

  const handleGoogleSignIn = async () => {
    setError("");
    setGoogleLoading(true);
    
    const { error: googleError } = await signInWithGoogle();
    
    if (googleError) {
      // Handle common errors
      if (googleError.toLowerCase().includes('popup')) {
        setError('Popup was blocked. Please allow popups and try again.');
      } else if (googleError.toLowerCase().includes('cancel') || googleError.toLowerCase().includes('closed')) {
        setError('Sign in was cancelled.');
      } else {
        setError(googleError);
      }
      setGoogleLoading(false);
    }
    // Note: Success case redirects via OAuth, so no need to setGoogleLoading(false)
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
              className="flex items-center gap-1.5 text-foreground hover:text-primary mb-6"
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

            {/* Google Sign In Button */}
            <Button
              type="button"
              variant="outline"
              onClick={handleGoogleSignIn}
              disabled={loading || googleLoading}
              className="w-full h-12 md:h-14 border-2 border-border hover:border-primary/50 bg-white hover:bg-gray-50 text-gray-900 font-medium rounded-lg flex items-center justify-center gap-3 transition-all"
            >
              {googleLoading ? (
                <span className="text-sm">Connecting...</span>
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span className="text-sm md:text-base">Continue with Google</span>
                </>
              )}
            </Button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-4 text-muted-foreground tracking-widest">
                  Or continue with email
                </span>
              </div>
            </div>

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
