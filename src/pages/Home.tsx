import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthProvider";
import HeroSection from "@/components/home/HeroSection";
import FeaturesList from "@/components/home/FeaturesList";
import { LogIn, LayoutDashboard, ArrowRight, UserPlus } from "lucide-react";

const Home = () => {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();

  // Set dynamic page title
  useEffect(() => {
    document.title = t("homeTitle") || "Croconus AI";
  }, [t]);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">

        {/* Existing Hero Section */}
        <HeroSection
          title={t("hero.title")}
          description={t("hero.description")}
        />

        {/* DYNAMIC BUTTON SECTION */}
        <div className="mt-12 flex flex-wrap justify-center gap-4 animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-200">
          {!isAuthenticated ? (
            <>
              {/* SIGN UP BUTTON - Primary Red Style */}
              <Link
                to="/signup"
                className="group flex items-center gap-3 px-8 py-4 bg-[#E11D48] text-white text-lg font-black rounded-2xl shadow-xl shadow-red-100 hover:scale-105 transition-all"
              >
                <UserPlus size={20} />
                {t("login.signup_link") || "Create Account"}
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>

              {/* SIGN IN BUTTON - Secondary Style */}
              <Link
                to="/login"
                className="group flex items-center gap-3 px-8 py-4 bg-white text-gray-900 border-2 border-gray-100 text-lg font-black rounded-2xl hover:border-[#E11D48] hover:text-[#E11D48] transition-all shadow-sm"
              >
                <LogIn size={20} />
                {t("login.title") || "Sign In"}
              </Link>
            </>
          ) : (
            /* DASHBOARD BUTTON - For logged in users */
            <Link
              to="/persona/list"
              className="group flex items-center gap-3 px-8 py-4 bg-gray-900 text-white text-lg font-black rounded-2xl shadow-xl shadow-gray-200 hover:scale-105 transition-all"
            >
              <LayoutDashboard size={20} />
              {t("navbar.digital_copy_link") || "Go to Dashboard"}
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          )}
        </div>

        {/* Features Section */}
        <div className="mt-24">
          <div className="text-center mb-12">
            <h2 className="text-sm font-black text-[#E11D48] uppercase tracking-[0.2em] mb-3">
              Core Capabilities
            </h2>
            <p className="text-gray-400 font-medium">Everything you need to manage your digital twin.</p>
          </div>

          <FeaturesList features={[
            {
              title: t("features.documentUpload.title"),
              description: t("features.documentUpload.description"),
            },
            {
              title: t("features.aiAnalysis.title"),
              description: t("features.aiAnalysis.description"),
            },
            {
              title: t("features.expertSupport.title"),
              description: t("features.expertSupport.description"),
            },
          ]} />
        </div>
      </div>
    </div>
  );
};

export default Home;