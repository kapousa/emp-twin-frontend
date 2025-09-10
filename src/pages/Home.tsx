import HeroSection from "@/components/home/HeroSection";
import FeatureCard from "@/components/home/FeatureCard";
import FeaturesList from "@/components/home/FeaturesList";
import { MessageSquare, Users } from "lucide-react";

const Home = () => {
  const features = [
    {
      title: "Document Upload",
      description: "Support for PDF, Word, and Excel files"
    },
    {
      title: "AI-Powered Analysis", 
      description: "Intelligent responses based on your documents"
    },
    {
      title: "Expert Support",
      description: "Professional responses from business experts"
    }
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <HeroSection 
          title="Welcome to FranchiseGPT"
          description="An AI-powered platform that helps you get intelligent answers to your business and franchise questions. Upload documents and receive expert responses backed by comprehensive research."
        />

        {/* Feature Cards */}
        <div className="grid md:grid-cols-1 gap-8 mb-12">
          <FeatureCard
            icon={MessageSquare}
            title="Ask Questions"
            description="Submit your business questions with supporting documents"
            content="Upload PDFs, Word documents, or Excel files along with your questions to get comprehensive AI-powered insights tailored to your specific business needs."
            linkTo="/ask"
            buttonText="Ask Faleh"
            variant="default"
          />

          {/*<FeatureCard
            icon={Users}
            title="Admin Responses"
            description="Provide expert responses with supporting documentation"
            content="Submit detailed responses to user questions with supporting documents, research, and expert analysis to help users make informed business decisions."
            linkTo="/admin"
            buttonText="Go to Admin Panel"
            variant="outline"
          />*/}
        </div>

        <FeaturesList features={features} />
      </div>
    </div>
  );
};

export default Home;