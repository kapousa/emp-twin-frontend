import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthProvider";

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="bg-background border-b border-border">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo on the far left with added margin */}
          <div className="flex items-center mr-6">
            <Link to="/" className="text-xl font-bold text-primary">
              FranchiseGPT
            </Link>
          </div>

          {/* Main navigation links on the left of the far right */}
          <div className="flex items-center space-x-8">
            <Link
              to="/"
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                isActive("/") ? "text-primary" : "text-muted-foreground"
              )}
            >
              Home
            </Link>

            {isAuthenticated && (
              <>
                <Link
                  to="/ask"
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-primary",
                    isActive("/ask") ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  Ask Faleh
                </Link>
                <Link
                  to="/admin/dashboard"
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-primary",
                    isActive("/admin/dashboard") ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  Dashboard
                </Link>
              </>
            )}
          </div>

          {/* User authentication links on the far right */}
          <div className="flex items-center space-x-8 ml-auto">
            {isAuthenticated ? (
              <>
                <span className="text-sm font-medium text-muted-foreground">
                  {user?.email}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-sm font-medium transition-colors hover:text-primary text-muted-foreground"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/admin/login"
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  isActive("/admin/login") ? "text-primary" : "text-muted-foreground"
                )}
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
