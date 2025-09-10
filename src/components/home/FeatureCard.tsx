import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  content: string;
  linkTo: string;
  buttonText: string;
  variant?: "default" | "outline";
}

const FeatureCard = ({ 
  icon: Icon, 
  title, 
  description, 
  content, 
  linkTo, 
  buttonText, 
  variant = "default" 
}: FeatureCardProps) => {
  return (
    <Card className="bg-panel border-border shadow-sm hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Icon className="h-6 w-6 text-primary" />
          </div>
          <div>
            <CardTitle className="text-xl">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4">{content}</p>
        <Link to={linkTo}>
          <Button 
            variant={variant}
            className={
              variant === "default" 
                ? "w-full bg-primary hover:bg-primary-hover text-primary-foreground"
                : "w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground"
            }
          >
            {buttonText}
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
};

export default FeatureCard;