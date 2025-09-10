import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import DocumentUploadForm from "@/components/forms/DocumentUploadForm";
import TipsSection from "@/components/shared/TipsSection";
import { useNavigate } from "react-router-dom";
import { Database, ArrowLeft } from "lucide-react";

const AdminPanel = () => {
  const navigate = useNavigate();

  const documentGuidelines = [
    { text: "Upload franchise guides, business plans, and market research" },
    { text: "Include industry reports and case studies" },
    { text: "Add legal documents and regulatory information" },
    { text: "Upload financial templates and analysis documents" },
    { text: "Multiple files can be selected at once" },
    { text: "Documents will be processed automatically after upload" }
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center mb-6">
          <Button 
            variant="outline" 
            onClick={() => navigate('/admin/dashboard')}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">Upload Training Documents</h1>
          <p className="text-muted-foreground">
            Upload documents to train and improve the FranchiseGPT AI model.
          </p>
        </div>

        <Card className="bg-panel border-border shadow-lg">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Database className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">AI Training Documents</CardTitle>
                <CardDescription>
                  Upload documents to enhance the AI knowledge base
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <DocumentUploadForm />
            <TipsSection title="Document guidelines:" tips={documentGuidelines} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminPanel;