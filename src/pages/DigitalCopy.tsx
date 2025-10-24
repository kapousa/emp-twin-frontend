import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot } from "lucide-react";
import { useTranslation } from "react-i18next";
import DigitalCopyWizard from "@/components/forms/DigitalCopyWizardForm";
import { PERSONA_BUILD_ENDPOINT } from "@/configurations/api";

const PERSONA_BUILD_ENDPOINT_URL = `${PERSONA_BUILD_ENDPOINT}`;

const DigitalCopyPage = () => {
  const { t } = useTranslation();

  // Define handleBuildSubmit INSIDE the component
  const handleBuildSubmit = async (formData: FormData) => {
    console.log("Submitting Digital Copy Build Request to:", PERSONA_BUILD_ENDPOINT_URL);

    const authToken = localStorage.getItem('authToken');

    if (!authToken) {
      console.error("Authentication token not found in localStorage. Please log in.");
      // Use translation key for the error message
      throw new Error(t("digital_copy.auth_error"));
    }

    const headers = {
      'Authorization': `Bearer ${authToken}`,
      // IMPORTANT: When sending FormData, DO NOT manually set 'Content-Type': 'multipart/form-data'.
      // The browser automatically sets it with the correct boundary for file uploads.
    };

    try {
      const response = await fetch(PERSONA_BUILD_ENDPOINT_URL, {
        method: 'POST',
        headers: headers,
        body: formData,
      });

      // Check if the response status is 2xx (Success)
      if (!response.ok) {
        // Attempt to parse error details, but catch if response is not JSON
        const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
        console.error("API Error Response:", errorData);

        // Use translation key for the error message
        const errorMessage = errorData.detail || `${t("digital_copy.build_fail_prefix")} ${response.status}${t("digital_copy.build_fail_suffix")}`;
        // Throw a specific error for the wizard to catch and display
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log("Persona build successfully queued:", result);

      return result; // Return the success message/ID

    } catch (error: any) {
      console.error("Network/Submission Error:", error);

      // Re-throw the error so the DigitalCopyWizard can handle the submission failure state
      throw new Error(error.message || t("digital_copy.unknown_build_error")); // Use translation key for generic error if caught here
    }
  };


  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background flex items-center justify-center py-8">

      <div className="w-full max-w-4xl px-4">
        <Card className="bg-panel border-border shadow-2xl">

          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <Bot className="h-8 w-8 text-primary" />
              </div>
            </div>

            <CardTitle className="text-2xl">
              {t("digital_copy.title")} {/* Use translation key */}
            </CardTitle>
            <CardDescription>
              {t("digital_copy.description")} {/* Use translation key */}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <DigitalCopyWizard
              onBuildSubmit={handleBuildSubmit} // Pass the inner function
            />
          </CardContent>

          <div className="p-6 pt-0 text-center">
            <p className="text-xs text-muted-foreground">
              {t("digital_copy.note")} {/* Use translation key */}
            </p>
          </div>

        </Card>
      </div>
    </div>
  );
};

export default DigitalCopyPage;