import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Upload, LogOut } from "lucide-react";

interface DashboardHeaderProps {
  onLogout: () => void;
}

const DashboardHeader = ({ onLogout }: DashboardHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className="flex justify-between items-center mb-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage documents and AI model training</p>
      </div>
      <div className="flex space-x-3">
        <Button 
          onClick={() => navigate('/admin/upload')} 
          className="bg-primary hover:bg-primary-hover text-primary-foreground"
        >
          <Upload className="mr-2 h-4 w-4" />
          Upload Documents
        </Button>
        <Button 
          variant="outline" 
          onClick={onLogout}
          className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
};

export default DashboardHeader;