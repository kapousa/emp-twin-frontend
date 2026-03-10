import { useState } from "react";
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
  Users,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import CroconusLogo from "@/assets/croconus_logo.png";

const Navbar = () => {
  const { t } = useTranslation();
  const { isAuthenticated, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false); // New state
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (!isAuthenticated) return null;

  return (
    <nav
      className={cn(
        "h-screen bg-slate-950 border-r border-white/5 flex flex-col shrink-0 sticky top-0 transition-all duration-300 ease-in-out relative z-50",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      {/* Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-12 bg-primary text-white rounded-full p-1 border-2 border-slate-950 hover:scale-110 transition-transform z-[60] shadow-lg shadow-primary/20"
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* Logo Section */}
      <div className={cn("p-6 mb-4 flex items-center", isCollapsed ? "justify-center" : "justify-start")}>
        <Link to="/" className="flex items-center space-x-3">
          <img src={CroconusLogo} alt="Logo" className="h-8 w-auto min-w-[32px]" />
          {!isCollapsed && (
            <span className="text-xl font-black tracking-tighter text-white animate-in fade-in duration-500">
              Croconus
            </span>
          )}
        </Link>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 px-3 space-y-2">
        <NavItem
          to="/"
          icon={<Home size={20} />}
          label={t("navbar.home") || "Home"}
          isActive={isActive("/")}
          isCollapsed={isCollapsed}
        />

        <NavItem
          to="/persona/list"
          icon={<UserCircle size={20} />}
          label={t("navbar.digital_copy_link") || "Digital Copy"}
          isActive={isActive("/persona/list")}
          isCollapsed={isCollapsed}
        />

        <NavItem
          to="/room/list"
          icon={<Users size={20} />}
          label={t("navbar.boardrooms_link") || "Boardrooms"}
          isActive={isActive("/room/list") || location.pathname.startsWith("/room")}
          isCollapsed={isCollapsed}
        />
      </div>

      {/* Footer Section */}
      <div className={cn("p-4 border-t border-white/5 space-y-4", isCollapsed ? "flex flex-col items-center" : "")}>
        {!isCollapsed && <LanguageSwitcher />}

        <button
          onClick={handleLogout}
          className={cn(
            "flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-bold transition-all text-slate-400 hover:bg-primary/10 hover:text-primary",
            isCollapsed ? "justify-center px-0" : ""
          )}
          title={isCollapsed ? "Logout" : ""}
        >
          <LogOut size={20} />
          {!isCollapsed && <span>{t("navbar.logout_button") || "Logout"}</span>}
        </button>
      </div>
    </nav>
  );
};

// Helper sub-component for nav items
const NavItem = ({ to, icon, label, isActive, isCollapsed }: any) => (
  <Link
    to={to}
    title={isCollapsed ? label : ""}
    className={cn(
      "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all relative group",
      isActive
        ? "bg-primary text-white shadow-lg shadow-primary/20"
        : "text-slate-400 hover:bg-white/5 hover:text-slate-100",
      isCollapsed ? "justify-center px-0 mx-2" : ""
    )}
  >
    <div className="shrink-0">{icon}</div>
    {!isCollapsed && <span className="truncate animate-in slide-in-from-left-2 duration-300">{label}</span>}

    {/* Simple hover tooltip for collapsed state */}
    {isCollapsed && (
      <div className="absolute left-16 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-xl">
        {label}
      </div>
    )}
  </Link>
);

export default Navbar;