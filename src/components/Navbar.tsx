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
            <div className="flex items-center"> 
              
              <LanguageSwitcher />

              {isAuthenticated ? (
                <>
                  <span className="text-sm font-medium text-muted-foreground hidden sm:block ms-8"> {/* FIX: Changed ml-8 to ms-8 */}
                    {user?.email}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="text-sm font-medium transition-colors hover:text-primary text-muted-foreground ms-6" // FIX: Changed ml-6 to ms-6
                  >
                    {t("navbar.logout_button")}
                  </button>
                </>
              ) : (
                <Link
                  to="/admin/login"
                  // FIX: Changed ml-8 to ms-8
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-primary ms-8",
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
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-12 flex items-center justify-center space-x-8">
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