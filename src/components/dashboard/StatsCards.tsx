import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Calendar, Database, RefreshCw } from "lucide-react";

interface DashboardData {
  total_documents: number;
  last_training_date: string | null;
  model_version: string;
  training_status: 'idle' | 'training' | 'completed' | 'failed';
}

interface StatsCardsProps {
  data: DashboardData;
  isTraining: boolean;
  onTrainModel: () => void;
}

const StatsCards = ({ data, isTraining, onTrainModel }: StatsCardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <Card className="bg-panel border-border">
        <CardContent className="p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Documents</p>
              <p className="text-2xl font-bold text-foreground">{data.total_documents || 0}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-panel border-border">
        <CardContent className="p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Calendar className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Last Training</p>
              <p className="text-sm font-bold text-foreground">
                {data.last_training_date 
                  ? new Date(data.last_training_date).toLocaleDateString()
                  : 'Never'
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-panel border-border">
        <CardContent className="p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Database className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Model Version</p>
              <p className="text-sm font-bold text-foreground">{data.model_version || 'v1.0'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-panel border-border">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Training Status</p>
              <Badge 
                variant={data.training_status === 'completed' ? 'default' : 'secondary'}
                className="mt-1"
              >
                {data.training_status || 'idle'}
              </Badge>
            </div>
            <Button
              onClick={onTrainModel}
              disabled={isTraining || data.training_status === 'training'}
              size="sm"
              className="bg-primary hover:bg-primary-hover text-primary-foreground"
            >
              {isTraining ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                'Train Model'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatsCards;