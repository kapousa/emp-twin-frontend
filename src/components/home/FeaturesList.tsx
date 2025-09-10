import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";

interface Feature {
  title: string;
  description: string;
}

interface FeaturesListProps {
  features: Feature[];
}

const FeaturesList = ({ features }: FeaturesListProps) => {
  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <FileText className="h-6 w-6 text-primary" />
          </div>
          <div>
            <CardTitle className="text-xl">Platform Features</CardTitle>
            <CardDescription>
              Everything you need for intelligent business insights
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div key={index} className="text-center">
              <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default FeaturesList;