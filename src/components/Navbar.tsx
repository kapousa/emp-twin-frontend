import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const Navbar = () => {
  const location = useLocation();
  
  // Check if user is on admin routes
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isLoggedIn = localStorage.getItem('admin_token');

  const isActive = (path: string) => location.pathname === path;

  // Don't show navigation items if not logged in (except on home page)
  const showNavItems = isLoggedIn || location.pathname === '/';

  return (
    <nav className="bg-background border-b border-border">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-primary">
              FranchiseGPT
            </Link>
          </div>
          <div className="flex items-center space-x-8">
            {showNavItems && (
              <>
                <Link
                  to="/"
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-primary",
                    isActive("/") ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  Home
                </Link>
                <Link
                  to="/ask"
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-primary",
                    isActive("/ask") ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  Ask Faleh
                </Link>
              </>
            )}
            
            {isLoggedIn ? (
              <Link
                to="/admin/dashboard"
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  isActive("/admin/dashboard") ? "text-primary" : "text-muted-foreground"
                )}
              >
                Dashboard
              </Link>
            ) : (
              <Link
                to="/admin/login"
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  isActive("/admin/login") ? "text-primary" : "text-muted-foreground"
                )}
              >
                Admin Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;