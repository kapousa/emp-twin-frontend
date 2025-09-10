import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Missing credentials",
        description: "Please enter both email and password.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Check for demo credentials first
      if (email === "admin@demo.com" && password === "demo123") {
        const demoToken = "demo_token_" + Date.now();
        localStorage.setItem('admin_token', demoToken);
        
        toast({
          title: "Login successful (Demo Mode)",
          description: "Welcome to the FranchiseGPT demo!",
        });
        
        navigate('/admin/dashboard');
        return;
      }

      // Try actual API call for production
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.access_token) {
          localStorage.setItem('admin_token', result.access_token);
          
          toast({
            title: "Login successful",
            description: "Welcome back, admin!",
          });
          
          navigate('/admin/dashboard');
          return;
        }
      }
      
      throw new Error('Invalid credentials or server unavailable');
      
    } catch (error) {
      if (error instanceof TypeError || error.message.includes('Failed to fetch')) {
        toast({
          title: "API Unavailable - Demo Mode",
          description: "Use demo credentials: admin@demo.com / demo123",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Login failed",
          description: "Please check your credentials and try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="admin@franchisegpt.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="bg-background border-input"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="bg-background border-input"
          required
        />
      </div>

      <Button 
        type="submit" 
        disabled={isLoading}
        className="w-full bg-primary hover:bg-primary-hover text-primary-foreground h-11"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Signing in...
          </>
        ) : (
          'Sign In'
        )}
      </Button>
    </form>
  );
};

export default LoginForm;