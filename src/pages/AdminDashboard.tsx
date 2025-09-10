import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import StatsCards from "@/components/dashboard/StatsCards";
import DocumentsTable from "@/components/dashboard/DocumentsTable";
import { RefreshCw } from "lucide-react";

interface Document {
  id: string;
  filename: string;
  upload_date: string;
  file_size: number;
  status: 'processed' | 'processing' | 'failed';
}

interface DashboardData {
  total_documents: number;
  last_training_date: string | null;
  model_version: string;
  documents: Document[];
  training_status: 'idle' | 'training' | 'completed' | 'failed';
}

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTraining, setIsTraining] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const checkAuth = () => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      navigate('/admin/login');
      return false;
    }
    return token;
  };

  const fetchDashboardData = async () => {
    const token = checkAuth();
    if (!token) return;

    try {
      const response = await fetch('/api/admin/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setDashboardData(data);
      } else if (response.status === 401) {
        localStorage.removeItem('admin_token');
        navigate('/admin/login');
      } else {
        throw new Error('Failed to fetch dashboard data');
      }
    } catch (error) {
      toast({
        title: "Error loading dashboard",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    navigate('/admin/login');
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
  };

  const handleTrainModel = async () => {
    const token = checkAuth();
    if (!token) return;

    setIsTraining(true);
    try {
      const response = await fetch('/api/admin/train-model', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: "Training started",
          description: "AI model training has been initiated. This may take several minutes.",
        });
        // Refresh dashboard data
        fetchDashboardData();
      } else {
        throw new Error(result.detail || 'Training failed');
      }
    } catch (error) {
      toast({
        title: "Training failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsTraining(false);
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    const token = checkAuth();
    if (!token) return;

    try {
      const response = await fetch(`/api/admin/documents/${documentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast({
          title: "Document deleted",
          description: "Document has been removed successfully.",
        });
        fetchDashboardData();
      } else {
        throw new Error('Failed to delete document');
      }
    } catch (error) {
      toast({
        title: "Delete failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-background flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DashboardHeader onLogout={handleLogout} />
        
        {dashboardData && (
          <>
            <StatsCards 
              data={dashboardData} 
              isTraining={isTraining}
              onTrainModel={handleTrainModel}
            />
            
            <DocumentsTable 
              documents={dashboardData.documents || []}
              onDeleteDocument={handleDeleteDocument}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;