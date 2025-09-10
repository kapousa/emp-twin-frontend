import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MessageSquare, Upload } from "lucide-react";
import QuestionForm from "@/components/forms/QuestionForm";
import TipsSection from "@/components/shared/TipsSection";

const documentOptions = [
  { value: "Business Plan", label: "Business Plan" },
  { value: "Franchise Manual", label: "Franchise Manual" },
  { value: "Staff Manual", label: "Staff Manual" },
  { value: "Quality Assurance Guideline", label: "Quality Assurance Guideline" },
  { value: "Branding Guideline", label: "Branding Guideline" },
  { value: "All other possible documents", label: "All other possible documents" },
];

const AskPanel = () => {
  const [files, setFiles] = useState([]);
  const [selectedDocuments, setSelectedDocuments] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const tips = [
    { text: "Be specific about your business context and goals" },
    { text: "Include relevant financial data or market information" },
    { text: "Mention your location and target market" },
    { text: "Upload business plans, financial statements, or market research" }
  ];

  const handleFileChange = (e) => {
    // ... your file change logic (already in your original code) ...
  };

  const handleCheckboxChange = (value) => {
    // ... your checkbox change logic (already in your original code) ...
  };

  return (
    <div className="w-full min-h-[calc(100vh-4rem)] bg-background">
      <div className="max-w-[90vw] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">Ask Faleh</h1>
          <p className="text-muted-foreground">
            Submit your business questions along with supporting documents to get AI-powered insights.
          </p>
        </div>

        <div className="flex w-full border rounded-lg shadow-lg bg-card overflow-hidden">
          {/* Main Chat Panel (Left) */}
          <div className="flex-1 flex flex-col p-4 bg-background">
            <QuestionForm
              files={files}
              selectedDocuments={selectedDocuments}
              isSubmitting={isSubmitting}
              setIsSubmitting={setIsSubmitting}
            />
          </div>

          {/* Tips and Options Panel (Right) */}
          <div className="w-80 border-l p-4 space-y-6 bg-secondary/20 overflow-y-auto">
            <h3 className="text-lg font-semibold text-foreground">Query Options</h3>
            
            <TipsSection title="Tips for Best Results:" tips={tips} />

            {/* Supporting Documents */}
            <div className="space-y-2">
              <Label htmlFor="file-upload" className="text-sm font-medium text-foreground">
                Supporting Documents (Optional)
              </Label>
              <div className="relative">
                <Input
                  id="file-upload"
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.xls,.xlsx"
                  className="bg-background border-input"
                  multiple
                />
                <div className="flex items-center space-x-2 mt-2 text-xs text-muted-foreground">
                  <Upload className="h-4 w-4" />
                  <span>Supported formats: PDF, Word, Excel</span>
                </div>
              </div>
              {files.length > 0 && (
                <Alert className="border-primary/20 bg-primary/5 mt-2">
                  <AlertDescription className="text-sm">
                    Selected files:
                    <ul className="list-disc list-inside mt-1">
                      {files.map((file, index) => (
                        <li key={index}>{file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
            </div>

            {/* Quick Action Generator */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground">
                Quick Action Generator (Optional)
              </Label>
              <div className="grid grid-cols-1 gap-4">
                {documentOptions.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <Input
                      type="checkbox"
                      id={option.value}
                      value={option.value}
                      checked={selectedDocuments.includes(option.value)}
                      onChange={() => handleCheckboxChange(option.value)}
                      className="w-4 h-4 text-primary bg-background border-input focus:ring-primary"
                    />
                    <Label htmlFor={option.value} className="text-sm cursor-pointer">
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default AskPanel;