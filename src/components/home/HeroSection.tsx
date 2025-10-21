import React from 'react'; // Often good practice to import React
// 1. Import your logo image directly into HeroSection
import CroconusLogo from "@/assets/croconus_logo.png"; // Adjust path as needed

interface HeroSectionProps {
  title: string;
  description: string;
}

const HeroSection = ({ title, description }: HeroSectionProps) => {
  return (
    <div className="text-center mb-16 py-12"> {/* Added py-12 for vertical padding */}
          {/* --- RENDER THE LOGO DIRECTLY HERE --- */}
      <div className="flex justify-center mt-4"> {/* Flexbox for centering, mt-4 for space */}
        <img
          src={CroconusLogo}
          alt="Croconus App Logo" // Descriptive alt text
          className="h-28 w-auto object-contain" // Adjust height (e.g., h-28 for larger) as needed
        />
      </div>
      {/* --- END LOGO --- */}
      <h1 className="text-4xl font-bold text-foreground mb-4">
        {title}
      </h1>
      <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed"> {/* Added mb-8 for space below description */}
        {description}
      </p>
    </div>
  );
};

export default HeroSection;