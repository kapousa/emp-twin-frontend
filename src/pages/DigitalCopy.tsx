import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot } from "lucide-react";
import { useTranslation } from "react-i18next";
import DigitalCopyWizard from "@/components/forms/DigitalCopyWizardForm";
import { PERSONA_BUILD_ENDPOINT } from "@/configurations/api";

const PERSONA_BUILD_ENDPOINT_URL = `${PERSONA_BUILD_ENDPOINT}`;

const handleBuildSubmit = async (formData: FormData) => { // Added FormData type for clarity
  console.log("Submitting Digital Copy Build Request to:", PERSONA_BUILD_ENDPOINT_URL);
  const { t } = useTranslation(); // Use t for translations within handleBuildSubmit

  const authToken = localStorage.getItem('authToken');

  if (!authToken) {
    console.error("Authentication token not found in localStorage. Please log in.");
    // Use translation key for the error message
    throw new Error(t("digital_copy.auth_error"));
  }

  const headers = {
    'Authorization': `Bearer ${authToken}`,
  };

  try {
    const response = await fetch(PERSONA_BUILD_ENDPOINT_URL, {
      method: 'POST',
      headers: headers,
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
      console.error("API Error Response:", errorData);

      // Use translation key for the error message
      const errorMessage = errorData.detail || `${t("digital_copy.build_fail_prefix")} ${response.status}${t("digital_copy.build_fail_suffix")}`;
      throw new Error(errorMessage);
    }

    const result = await response.json();
    console.log("Persona build successfully queued:", result);

    return result;

  } catch (error: any) { // Added any type for clarity
    console.error("Network/Submission Error:", error);
    // Use translation key for generic error if caught here
    throw new Error(error.message || t("digital_copy.unknown_build_error"));
  }
};


const DigitalCopyPage = () => {
  const { t } = useTranslation();

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
              onBuildSubmit={handleBuildSubmit}
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