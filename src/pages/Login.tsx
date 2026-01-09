import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Mail, Eye, EyeOff, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import ParticleCanvas from '@/components/ParticleCanvas';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);
    
    // Mock login - simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setSuccess(true);
      
      // Navigate to dashboard after brief success message
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    }, 1000);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4">
      {/* Background */}
      <ParticleCanvas />
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background pointer-events-none" />

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="bg-card border border-border rounded-xl p-8 sm:p-10 shadow-2xl backdrop-blur-hero">
          {/* Logo */}
          <div className="text-center mb-8">
            <h1 className="font-display text-2xl font-bold text-foreground">
              de<span className="text-primary">KAOS</span>
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Developer Portal</p>
          </div>

          {success ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8"
            >
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="font-display text-xl font-bold text-foreground mb-2">
                Welcome back!
              </h2>
              <p className="text-muted-foreground text-sm">
                Redirecting to your dashboard...
              </p>
            </motion.div>
          ) : (
            <>
              {/* Heading */}
              <h2 className="font-display text-xl font-bold text-foreground text-center mb-6">
                Sign in to deKAOS
              </h2>

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3 p-3 mb-6 rounded-lg bg-destructive/10 border border-destructive/20"
                >
                  <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0" />
                  <p className="text-sm text-destructive">{error}</p>
                </motion.div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-foreground">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="developer@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 bg-muted/50 border-border focus:border-primary focus:ring-primary"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-foreground">
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pr-10 bg-muted/50 border-border focus:border-primary focus:ring-primary"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-primary hover:opacity-90 text-primary-foreground font-semibold h-11"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Signing in...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </Button>

                {/* Magic Link Alternative */}
                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-primary/30 text-primary hover:bg-primary/10 h-11"
                  onClick={() => {
                    if (email && email.includes('@')) {
                      setIsLoading(true);
                      setTimeout(() => {
                        setIsLoading(false);
                        setSuccess(true);
                        setTimeout(() => navigate('/dashboard'), 1500);
                      }, 1000);
                    } else {
                      setError('Please enter a valid email address.');
                    }
                  }}
                >
                  Sign in with Magic Link
                </Button>
              </form>

              {/* Footer */}
              <div className="mt-8 text-center space-y-3">
                <p className="text-sm text-muted-foreground">
                  Don't have an account?{' '}
                  <button className="text-primary hover:underline font-medium">
                    Sign up here
                  </button>
                </p>
                <p className="text-xs text-muted-foreground/70">
                  By signing in, you agree to our{' '}
                  <button className="text-primary hover:underline">Terms</button>
                  {' & '}
                  <button className="text-primary hover:underline">Privacy Policy</button>
                </p>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
