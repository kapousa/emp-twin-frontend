import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Upload, Loader2 } from "lucide-react";

const DocumentUploadForm = () => {
  const [files, setFiles] = useState<FileList | null>(null);
  const [isUploading, setIsUploading] = useState(false);
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain'
      ];
      
      const invalidFiles = Array.from(selectedFiles).filter(file => 
        !allowedTypes.includes(file.type)
      );

      if (invalidFiles.length > 0) {
        toast({
          title: "Invalid file type",
          description: "Please upload PDF, Word, Excel, or text files only.",
          variant: "destructive",
        });
        return;
      }

      setFiles(selectedFiles);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const token = checkAuth();
    if (!token) return;

    if (!files || files.length === 0) {
      toast({
        title: "Files required",
        description: "Please select at least one file to upload.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      Array.from(files).forEach((file) => {
        formData.append(`files`, file);
      });

      const response = await fetch('/api/admin/upload-documents', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: "Documents uploaded successfully!",
          description: `${files.length} document(s) uploaded for AI training.`,
        });
        
        // Reset form
        setFiles(null);
        const fileInput = document.getElementById('file-upload') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
        
        // Navigate to dashboard after successful upload
        navigate('/admin/dashboard');
      } else {
        throw new Error(result.detail || 'Upload failed');
      }
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="file-upload" className="text-sm font-medium text-foreground">
          Training Documents *
        </Label>
        <div className="relative">
          <Input
            id="file-upload"
            type="file"
            onChange={handleFileChange}
            accept=".pdf,.doc,.docx,.xls,.xlsx,.txt"
            multiple
            className="bg-background border-input"
            required
          />
          <div className="flex items-center space-x-2 mt-2">
            <Upload className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              Supported formats: PDF, Word (.doc/.docx), Excel (.xls/.xlsx), Text (.txt)
            </span>
          </div>
        </div>
        
        {files && files.length > 0 && (
          <Alert className="border-primary/20 bg-primary/5">
            <AlertDescription className="text-sm">
              Selected files: {Array.from(files).map(f => f.name).join(', ')}
              <br />
              Total size: {(Array.from(files).reduce((sum, f) => sum + f.size, 0) / 1024 / 1024).toFixed(2)} MB
            </AlertDescription>
          </Alert>
        )}
      </div>

      <Button 
        type="submit" 
        disabled={isUploading}
        className="w-full bg-primary hover:bg-primary-hover text-primary-foreground h-12"
      >
        {isUploading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Uploading Documents...
          </>
        ) : (
          <>
            <Upload className="mr-2 h-4 w-4" />
            Upload for AI Training
          </>
        )}
      </Button>
    </form>
  );
};

export default DocumentUploadForm;