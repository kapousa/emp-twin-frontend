interface HeroSectionProps {
  title: string;
  description: string;
}

const HeroSection = ({ title, description }: HeroSectionProps) => {
  return (
    <div className="text-center mb-16">
      <h1 className="text-4xl font-bold text-foreground mb-4">
        {title}
      </h1>
      <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
        {description}
      </p>
    </div>
  );
};

export default HeroSection;