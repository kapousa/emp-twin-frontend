import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthProvider";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./LanguageSwitcher";
import { Home, UserCircle, Settings, LogOut, MessageSquare } from "lucide-react";
import CroconusLogo from "@/assets/croconus_logo.png";

const Navbar = () => {
  const { t } = useTranslation();
  const { isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate(); // For redirecting after logout

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    logout(); // Clears the token/auth state
    navigate("/login"); // Forces the browser to the login page
  };

  if (!isAuthenticated) return null;

  return (
    <nav className="w-64 h-screen bg-white border-r border-gray-100 flex flex-col shrink-0 shadow-sm sticky top-0">
      {/* Logo Section */}
      <div className="p-6 mb-4">
        <Link to="/" className="flex items-center space-x-3">
          <img src={CroconusLogo} alt="Logo" className="h-9 w-auto" />
          <span className="text-xl font-black tracking-tighter text-gray-900">Croconus</span>
        </Link>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 px-4 space-y-2">
        {/* HOME LINK - Red Theme */}
        <Link
          to="/"
          className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all",
            isActive("/")
              ? "bg-[#E11D48] text-white shadow-lg shadow-red-100"
              : "text-gray-500 hover:bg-red-50 hover:text-[#E11D48]"
          )}
        >
          <Home size={18} /> {t("navbar.home") || "Home"}
        </Link>

        {/* DIGITAL COPY LINK - Red Theme */}
        <Link
          to="/persona/list"
          className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all",
            isActive("/persona/list")
              ? "bg-[#E11D48] text-white shadow-lg shadow-red-100"
              : "text-gray-500 hover:bg-red-50 hover:text-[#E11D48]"
          )}
        >
          <UserCircle size={18} /> {t("navbar.digital_copy_link")}
        </Link>

        {/* CONTROL PANEL LINK - Red Theme */}
        <Link
          to="/controlpanel"
          className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all",
            isActive("/controlpanel")
              ? "bg-[#E11D48] text-white shadow-lg shadow-red-100"
              : "text-gray-500 hover:bg-red-50 hover:text-[#E11D48]"
          )}
        >
          <Settings size={18} /> {t("navbar.control_panel_link")}
        </Link>

        <div className="pt-4 mt-4 border-t border-gray-50">
          <Link
            to="/ask"
            className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-black transition-all",
                isActive("/ask")
                ? "bg-[#E11D48] text-white"
                : "text-[#E11D48] bg-red-50 hover:bg-red-100"
            )}
          >
            <MessageSquare size={18} /> {t("navbar.ask_faleh_link")}
          </Link>
        </div>
      </div>

      {/* Footer Section */}
      <div className="p-4 border-t border-gray-50 space-y-4">
        <LanguageSwitcher />
        <button
          onClick={handleLogout} // Updated handler
          className="flex items-center gap-3 w-full px-4 py-3 text-sm font-bold text-gray-400 hover:text-[#E11D48] hover:bg-red-50 rounded-xl transition-all"
        >
          <LogOut size={18} /> {t("navbar.logout_button")}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;