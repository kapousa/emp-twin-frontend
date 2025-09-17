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
    <>
      {/* Top Navbar: Always visible, contains Logo and Auth status */}
      <nav className="bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16 justify-between">
            {/* Logo on the far left */}
            <div className="flex-shrink-0">
              <Link to="/" className="text-xl font-bold text-primary">
                FranchiseGPT
              </Link>
            </div>

            {/* Auth section on the far right */}
            <div className="flex items-center space-x-8">
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

      {/* Conditionally rendered Bottom Navbar: Only for authenticated users */}
      {isAuthenticated && (
        <nav className="bg-muted border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-12 flex items-center justify-center space-x-8">
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
              Resorces
            </Link>

            <Link
              to="/ask"
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                isActive("/controlpanel") ? "text-primary" : "text-muted-foreground"
              )}
            >
              Control Panel
            </Link>
          </div>
        </nav>
      )}
    </>
  );
};

export default Navbar;