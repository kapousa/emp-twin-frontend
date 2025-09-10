import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { 
  FileText, 
  Calendar, 
  Trash2,
  CheckCircle,
  Clock,
  Upload
} from "lucide-react";

interface Document {
  id: string;
  filename: string;
  upload_date: string;
  file_size: number;
  status: 'processed' | 'processing' | 'failed';
}

interface DocumentsTableProps {
  documents: Document[];
  onDeleteDocument: (documentId: string) => void;
}

const DocumentsTable = ({ documents, onDeleteDocument }: DocumentsTableProps) => {
  const navigate = useNavigate();

  return (
    <Card className="bg-panel border-border">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <FileText className="h-5 w-5 text-primary" />
          <span>Training Documents</span>
        </CardTitle>
        <CardDescription>
          Documents used for AI model training
        </CardDescription>
      </CardHeader>
      <CardContent>
        {documents && documents.length > 0 ? (
          <div className="space-y-4">
            {documents.map((doc) => (
              <div 
                key={doc.id} 
                className="flex items-center justify-between p-4 bg-background rounded-lg border border-border"
              >
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-muted rounded-lg">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">{doc.filename}</h4>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span>
                        <Calendar className="inline h-3 w-3 mr-1" />
                        {new Date(doc.upload_date).toLocaleDateString()}
                      </span>
                      <span>{(doc.file_size / 1024 / 1024).toFixed(2)} MB</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Badge 
                    variant={doc.status === 'processed' ? 'default' : 'secondary'}
                    className="flex items-center space-x-1"
                  >
                    {doc.status === 'processed' && <CheckCircle className="h-3 w-3" />}
                    {doc.status === 'processing' && <Clock className="h-3 w-3" />}
                    <span>{doc.status}</span>
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDeleteDocument(doc.id)}
                    className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No documents uploaded yet</p>
            <Button 
              onClick={() => navigate('/admin/upload')}
              className="mt-4 bg-primary hover:bg-primary-hover text-primary-foreground"
            >
              <Upload className="mr-2 h-4 w-4" />
              Upload Your First Document
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DocumentsTable;