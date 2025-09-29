import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import HeroSection from "@/components/home/HeroSection";
import FeatureCard from "@/components/home/FeatureCard";
import FeaturesList from "@/components/home/FeaturesList";
import { MessageSquare, Users } from "lucide-react";

const Home = () => {
  const { t } = useTranslation();

  // Features with translation keys
  const features = [
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
  ];

  // Set dynamic page title
  useEffect(() => {
    document.title = t("homeTitle");
  }, [t]);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <HeroSection
          title={t("hero.title")}
          description={t("hero.description")}
        />

        {/* Feature Cards */}
        <div className="grid md:grid-cols-1 gap-8 mb-12">
          <FeatureCard
            icon={MessageSquare}
            title={t("featureCards.askQuestions.title")}
            description={t("featureCards.askQuestions.description")}
            content={t("featureCards.askQuestions.content")}
            linkTo="/ask"
            buttonText={t("featureCards.askQuestions.buttonText")}
            variant="default"
          />

          {/* Uncomment if needed */}
          {/*
          <FeatureCard
            icon={Users}
            title={t("featureCards.adminResponses.title")}
            description={t("featureCards.adminResponses.description")}
            content={t("featureCards.adminResponses.content")}
            linkTo="/admin"
            buttonText={t("featureCards.adminResponses.buttonText")}
            variant="outline"
          />
          */}
        </div>

        <FeaturesList features={features} />
      </div>
    </div>
  );
};

export default Home;
  