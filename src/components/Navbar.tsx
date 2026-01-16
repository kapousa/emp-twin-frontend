import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthProvider";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./LanguageSwitcher";
import {
  Home,
  UserCircle,
  Settings,
  LogOut,
  MessageSquare,
  Users // Added Users icon for Boardrooms
} from "lucide-react";
import CroconusLogo from "@/assets/croconus_logo.png";

const Navbar = () => {
  const { t } = useTranslation();
  const { isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate("/login");
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

        <Link
          to="/persona/list"
          className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all",
            isActive("/persona/list")
              ? "bg-[#E11D48] text-white shadow-lg shadow-red-100"
              : "text-gray-500 hover:bg-red-50 hover:text-[#E11D48]"
          )}
        >
          <UserCircle size={18} /> {t("navbar.digital_copy_link") || "Digital Copy"}
        </Link>

        {/* ⭐️ NEW: BOARDROOMS LINK */}
        <Link
          to="/room/list"
          className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all",
            isActive("/room/list") || location.pathname.startsWith("/room")
              ? "bg-[#E11D48] text-white shadow-lg shadow-red-100"
              : "text-gray-500 hover:bg-red-50 hover:text-[#E11D48]"
          )}
        >
          <Users size={18} /> {t("navbar.boardrooms_link") || "Boardrooms"}
        </Link>



      </div>

      {/* Footer Section */}
      <div className="p-4 border-t border-gray-50 space-y-4">
        <LanguageSwitcher />
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 text-sm font-bold text-gray-400 hover:text-[#E11D48] hover:bg-red-50 rounded-xl transition-all"
        >
          <LogOut size={18} /> {t("navbar.logout_button") || "Logout"}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;