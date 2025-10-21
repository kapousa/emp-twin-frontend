import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthProvider";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./LanguageSwitcher";

// Import your logo image
import CroconusLogo from "@/assets/croconus_logo.png"; // Adjust the path as needed

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
      {/* Top Navbar */}
      <nav className="bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16 justify-between">
            {/* Logo and Text */}
            <div className="flex-shrink-0">
              <Link to="/" className="flex items-center space-x-2"> {/* Use flex to align image and text, add spacing */}
                <img
                  src={CroconusLogo}
                  alt="Croconus Logo"
                  className="h-8 w-auto" // Adjust height (h-8) as needed
                />
                <span className="text-xl font-bold text-foreground"> {/* Use text-foreground for default web color, or text-primary */}
                  Croconus
                </span>
              </Link>
            </div>

            {/* Auth section and Language Switcher */}
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
                    isActive("/admin/login")
                      ? "text-primary"
                      : "text-muted-foreground"
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
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-12 flex items-center justify-between">
            {/* 1. Placeholder (Far Left) */}
            <div className="w-[60px]" />

            {/* 2. Main Navigation Links (Centered) */}
            <div className="flex items-center gap-8 absolute left-1/2 transform -translate-x-1/2">
              <Link
                to="/"
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  isActive("/") ? "text-primary" : "text-muted-foreground"
                )}
              >
                {t("navbar.home")}
              </Link>
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
                to="/admin/dashboard"
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  isActive("/admin/dashboard")
                    ? "text-primary"
                    : "text-muted-foreground"
                )}
              >
                {t("navbar.resources_link")}
              </Link>

              {/* --- ADDED DIGITAL COPY LINK HERE --- */}
              <Link
                to="/persona/list" // <-- Define the route for your new page
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  isActive("/persona/list")
                    ? "text-primary"
                    : "text-muted-foreground"
                )}
              >
                {t("navbar.digital_copy_link")} {/* <-- New translation key */}
              </Link>

              <Link
                to="/controlpanel"
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  isActive("/controlpanel")
                    ? "text-primary"
                    : "text-muted-foreground"
                )}
              >
                {t("navbar.control_panel_link")}
              </Link>
            </div>

            {/* 3. Ask Croconus Link (Far Right) - NOW ALWAYS text-primary */}
            <Link
              to="/ask"
              // Removed cn() and conditional logic
              className="text-sm font-bold transition-colors text-primary hover:opacity-80"
            >
              {t("navbar.ask_faleh_link")}
            </Link>
          </div>
        </nav>
      )}
    </>
  );
};

export default Navbar;