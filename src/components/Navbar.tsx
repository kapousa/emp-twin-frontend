import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthProvider";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./LanguageSwitcher";

const Navbar = () => {
  const { t } = useTranslation();
  
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    logout();
  };

  return (
    <>
      <nav className="bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16 justify-between">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link to="/" className="text-xl font-bold text-primary">
                {t("navbar.logo_title")}
              </Link>
            </div>

            {/* Auth section and Language Switcher */}
            {/* FIX: Use gap-4 for consistent LTR/RTL spacing between Language Switcher and Auth/User links */}
            <div className="flex items-center gap-4"> 
              
              <LanguageSwitcher />

              {isAuthenticated ? (
                <>
                  <span className="text-sm font-medium text-muted-foreground hidden sm:block">
                    {user?.email}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="text-sm font-medium transition-colors hover:text-primary text-muted-foreground"
                  >
                    {t("navbar.logout_button")}
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
                  {t("navbar.login_link")}
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Conditionally rendered Bottom Navbar */}
      {isAuthenticated && (
        <nav className="bg-muted border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-12 flex items-center justify-center gap-8">
            <Link
              to="/clients"
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                isActive("/clients") ? "text-primary" : "text-muted-foreground"
              )}
            >
              {t("navbar.clients_link")}
            </Link>
            <Link
              to="/ask"
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                isActive("/ask") ? "text-primary" : "text-muted-foreground"
              )}
            >
              {t("navbar.ask_faleh_link")}
            </Link>
            <Link
              to="/admin/dashboard"
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                isActive("/admin/dashboard") ? "text-primary" : "text-muted-foreground"
              )}
            >
              {t("navbar.resources_link")}
            </Link>
            <Link
              to="/ask"
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                isActive("/controlpanel") ? "text-primary" : "text-muted-foreground"
              )}
            >
              {t("navbar.control_panel_link")}
            </Link>
          </div>
        </nav>
      )}
    </>
  );
};

export default Navbar;