import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Eye,
  EyeOff,
  Rocket,
  User,
  Lock,
  AlertCircle,
  Zap,
  Database,
} from "lucide-react";

interface AuthProps {
  onAuthSuccess: (token: string, username: string) => void;
}

export const Auth = ({ onAuthSuccess }: AuthProps) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    if (!username.trim()) {
      setError("Username is required");
      return false;
    }
    if (username.length < 3) {
      setError("Username must be at least 3 characters");
      return false;
    }
    if (!password) {
      setError("Password is required");
      return false;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }
    if (!isLogin && password !== confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) return;

    setLoading(true);

    try {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/signup";
      const response = await fetch(`http://localhost:3000${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Authentication failed");
      }

      // Pass token and username to parent component via callback
      onAuthSuccess(data.token, username);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError("");
    setPassword("");
    setConfirmPassword("");
  };

  return (
    <div className="min-h-screen cosmic-gradient flex items-center justify-center p-4">
      {/* Animated Particles Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="particle-field"></div>
      </div>

      <div className="w-full max-w-5xl space-y-6 animate-fade-in relative z-10">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full border-2 border-primary/30 bg-card/40 backdrop-blur-sm animate-pulse-glow">
            <img
              src="../public/planet.png"
              alt="SARMAD Research Portal"
              className="h-20 w-auto object-contain"
            />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight glow-text">
            <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
              {isLogin ? "Welcome Back, Researcher" : "Join the Discovery Team"}
            </span>
          </h1>

          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {isLogin
              ? "Access your mission control dashboard and continue exploring exoplanets"
              : "Create your account to begin your journey in exoplanet research"}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Authentication Form */}
          <Card className="p-8 bg-card/80 backdrop-blur-sm border-border/20 hover:bg-card/90 transition-stellar">
            {/* Error Alert */}
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold text-foreground">
                  {isLogin ? "Sign In" : "Create Account"}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {isLogin
                    ? "Enter your credentials to access the system"
                    : "Set up your researcher credentials"}
                </p>
              </div>

              {/* Username Field */}
              <div className="space-y-2">
                <Label
                  htmlFor="username"
                  className="text-foreground font-medium"
                >
                  Researcher Username
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-10 bg-background/50 border-border/50 focus:border-primary transition-colors"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-foreground font-medium"
                >
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 bg-background/50 border-border/50 focus:border-primary transition-colors"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password Field (Signup Only) */}
              {!isLogin && (
                <div className="space-y-2">
                  <Label
                    htmlFor="confirmPassword"
                    className="text-foreground font-medium"
                  >
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10 bg-background/50 border-border/50 focus:border-primary transition-colors"
                      disabled={loading}
                    />
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full stellar-gradient hover:scale-105 transition-stellar shadow-lg shadow-primary/50"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    {isLogin ? "Access Dashboard" : "Create Account"}
                  </span>
                )}
              </Button>

              {/* Toggle Mode */}
              <div className="text-center pt-4 border-t border-border/20">
                <p className="text-sm text-muted-foreground">
                  {isLogin ? "New to ExoQuest?" : "Already have an account?"}
                  <button
                    type="button"
                    onClick={toggleMode}
                    className="ml-2 text-primary font-medium hover:text-accent transition-colors"
                    disabled={loading}
                  >
                    {isLogin ? "Create Account" : "Sign In"}
                  </button>
                </p>
              </div>
            </form>
          </Card>

          {/* System Status & Info */}
          <div className="space-y-6">
            {/* System Status */}
            <Card className="p-6 bg-card/80 backdrop-blur-sm border-border/20">
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-foreground">
                  System Status
                </h3>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                      <div>
                        <p className="font-medium text-foreground">AI Model</p>
                        <p className="text-sm text-muted-foreground">
                          Online & Ready
                        </p>
                      </div>
                    </div>
                    <Zap className="h-5 w-5 text-accent" />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                      <div>
                        <p className="font-medium text-foreground">Database</p>
                        <p className="text-sm text-muted-foreground">
                          Connected
                        </p>
                      </div>
                    </div>
                    <Database className="h-5 w-5 text-secondary" />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                      <div>
                        <p className="font-medium text-foreground">
                          Kepler Data
                        </p>
                        <p className="text-sm text-muted-foreground">
                          2,662 Exoplanets
                        </p>
                      </div>
                    </div>
                    <Rocket className="h-5 w-5 text-primary" />
                  </div>
                </div>
              </div>
            </Card>

            {/* Quick Info */}
            <Card className="p-6 bg-card/80 backdrop-blur-sm border-border/20">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-full stellar-gradient">
                  <Rocket className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-foreground mb-2">
                    Research Access
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Get access to our AI-powered exoplanet detection system
                    trained on Kepler mission data. Analyze light curves, detect
                    transits, and contribute to the discovery of new worlds
                    beyond our solar system.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
