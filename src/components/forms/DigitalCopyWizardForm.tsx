import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Zap, Brain, CheckCircle, ArrowRight, ArrowLeft, Mail, Twitter, FileText, Image as ImageIcon, XCircle } from "lucide-react";
import { useTranslation } from "react-i18next"; // Import useTranslation

// ====================================================================
// --- STEP COMPONENTS ---
// ====================================================================

// Define prop types for better type safety in TypeScript
interface StepProps {
  formData: any; // You might want to define a more specific type for formData
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => void;
  isSubmitting: boolean;
  t: (key: string, options?: any) => string; // `t` function from i18n
}

interface Step1IdentityProps extends StepProps {
  handleRemoveAvatar: () => void;
  avatarPreviewUrl: string | null;
}

// Updated Step1Identity to accept `t` prop
const Step1Identity = ({ formData, handleInputChange, handleFileChange, handleRemoveAvatar, avatarPreviewUrl, isSubmitting, t }: Step1IdentityProps) => (
    <div className="space-y-6">
        <div className="flex items-center space-x-3 text-lg font-semibold text-primary">
            <Zap className="h-6 w-6" />
            <h2>{t("digital_copy_wizard.step1.title")}</h2>
        </div>

        {/* === AVATAR UPLOAD === */}
        <div className="space-y-4 p-4 border rounded-lg">
            <h3 className="flex items-center text-md font-semibold text-gray-700 dark:text-gray-300">
                <ImageIcon className="h-5 w-5 mr-2" /> {t("digital_copy_wizard.step1.avatar_section_title")}
            </h3>

            <p className="text-sm text-muted-foreground pt-1">
                {t("digital_copy_wizard.step1.avatar_upload_description")}
            </p>

            {/* Conditionally render preview or input */}
            {avatarPreviewUrl ? (
                <div className="flex items-center space-x-4">
                    <img
                        src={avatarPreviewUrl}
                        alt="Avatar Preview"
                        className="w-20 h-20 rounded-full object-cover border-2 border-primary"
                    />
                    <div className="flex flex-col">
                        <p className="text-sm font-medium">{formData.avatarFile?.name}</p>
                        <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={handleRemoveAvatar}
                            disabled={isSubmitting}
                            className="mt-2 text-xs"
                        >
                            <XCircle className="h-4 w-4 mr-1" /> {t("digital_copy_wizard.step1.remove_avatar_button")}
                        </Button>
                    </div>
                </div>
            ) : (
                <Input
                    id="avatarFile"
                    type="file"
                    accept="image/png, image/jpeg, image/webp"
                    onChange={(e) => handleFileChange(e, 'avatarFile')}
                    className="cursor-pointer"
                    disabled={isSubmitting}
                />
            )}
        </div>

        <div className="space-y-4">
            <Label htmlFor="personaName">{t("digital_copy_wizard.step1.persona_name_label")}</Label>
            <Input
                id="personaName"
                placeholder={t("digital_copy_wizard.step1.persona_name_placeholder")}
                value={formData.personaName}
                onChange={handleInputChange}
                disabled={isSubmitting}
            />
        </div>
        <div className="space-y-4">
            <Label htmlFor="personaRole">{t("digital_copy_wizard.step1.persona_role_label")}</Label>
            <Input
                id="personaRole"
                placeholder={t("digital_copy_wizard.step1.persona_role_placeholder")}
                value={formData.personaRole}
                onChange={handleInputChange}
                disabled={isSubmitting}
            />
        </div>
        <div className="space-y-4">
            <Label htmlFor="personaTone">{t("digital_copy_wizard.step1.persona_tone_label")}</Label>
            <select
                id="personaTone"
                value={formData.personaTone}
                onChange={handleInputChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                disabled={isSubmitting}
            >
                <option value="professional">{t("digital_copy_wizard.step1.tone_professional")}</option>
                <option value="friendly">{t("digital_copy_wizard.step1.tone_friendly")}</option>
                <option value="expert">{t("digital_copy_wizard.step1.tone_expert")}</option>
                <option value="concise">{t("digital_copy_wizard.step1.tone_concise")}</option>
            </select>
        </div>
    </div>
);


// Updated Step2Knowledge to accept `t` prop
const Step2Knowledge = ({ formData, handleInputChange, handleFileChange, isSubmitting, t }: StepProps) => (
    <div className="space-y-8">
        <div className="flex items-center space-x-3 text-lg font-semibold text-primary">
            <Brain className="h-6 w-6" />
            <h2>{t("digital_copy_wizard.step2.title")}</h2>
        </div>
        <p className="text-sm text-muted-foreground">
            {t("digital_copy_wizard.step2.description")}
        </p>

        {/* Source Block 1: Text Input */}
        <div className="space-y-4 p-4 border rounded-lg">
            <h3 className="flex items-center text-md font-semibold text-gray-700 dark:text-gray-300">
                <FileText className="h-5 w-5 mr-2" /> {t("digital_copy_wizard.step2.text_input_title")}
            </h3>
            <Textarea
                id="knowledgeText"
                placeholder={t("digital_copy_wizard.step2.text_input_placeholder")}
                value={formData.knowledgeText}
                onChange={handleInputChange}
                rows={6}
                disabled={isSubmitting}
            />
        </div>

        {/* Source Block 2: File Upload */}
        <div className="space-y-4 p-4 border rounded-lg">
            <h3 className="flex items-center text-md font-semibold text-gray-700 dark:text-gray-300">
                <Input className="h-5 w-5 mr-2" /> {t("digital_copy_wizard.step2.file_upload_title")}
            </h3>
            <Input
                id="knowledgeFiles"
                type="file"
                multiple
                accept=".txt,.pdf,.md"
                onChange={(e) => handleFileChange(e, 'knowledgeFiles')}
                className="cursor-pointer"
                disabled={isSubmitting}
            />
            {formData.knowledgeFiles && formData.knowledgeFiles.length > 0 && (
                <p className="text-xs text-green-600">
                    {t("digital_copy_wizard.step2.files_selected", { count: formData.knowledgeFiles.length })}
                </p>
            )}
        </div>

        {/* Source Block 3: Integration (Mock) */}
        <div className="space-y-4 p-4 border rounded-lg bg-yellow-50/50 dark:bg-gray-800">
            <h3 className="flex items-center text-md font-semibold text-gray-700 dark:text-gray-300">
                <Zap className="h-5 w-5 mr-2" /> {t("digital_copy_wizard.step2.external_sources_title")}
            </h3>

            <Button variant="outline" className="w-full justify-start text-left text-gray-500 hover:text-gray-800" disabled>
                <Mail className="h-5 w-5 mr-2 text-red-500" /> {t("digital_copy_wizard.step2.email_integration")}
            </Button>
            <Button variant="outline" className="w-full justify-start text-left text-gray-500 hover:text-gray-800" disabled>
                <Twitter className="h-5 w-5 mr-2 text-blue-400" /> {t("digital_copy_wizard.step2.twitter_integration")}
            </Button>
            <p className="text-xs text-muted-foreground pt-2">
                {t("digital_copy_wizard.step2.external_sources_note")}
            </p>
        </div>
    </div>
);

// Updated Step3Confirm to accept `t` prop
const Step3Confirm = ({ formData, t }: StepProps) => (
    <div className="space-y-6">
        <div className="flex items-center space-x-3 text-lg font-semibold text-primary">
            <CheckCircle className="h-6 w-6" />
            <h2>{t("digital_copy_wizard.step3.title")}</h2>
        </div>

        <div className="space-y-3 p-4 border rounded-lg bg-secondary/20">
            <h3 className="font-bold">{t("digital_copy_wizard.step3.summary_header")}</h3>
            <p>
                <strong>{t("digital_copy_wizard.step3.avatar_selected")}</strong>{" "}
                {formData.avatarFile ? t("digital_copy_wizard.step3.avatar_yes", { name: formData.avatarFile.name }) : t("digital_copy_wizard.step3.avatar_no")}
            </p>
            <p><strong>{t("digital_copy_wizard.step3.persona_name")}</strong> {formData.personaName || t("digital_copy_wizard.step3.not_set")}</p>
            <p><strong>{t("digital_copy_wizard.step3.role_expertise")}</strong> {formData.personaRole || t("digital_copy_wizard.step3.not_set")}</p>
            <p><strong>{t("digital_copy_wizard.step3.conversational_tone")}</strong> {
                t(`digital_copy_wizard.step1.tone_${formData.personaTone}`) // Translate tone directly
            }</p>
            <p>
                <strong>{t("digital_copy_wizard.step3.knowledge_files")}</strong>{" "}
                {formData.knowledgeFiles && formData.knowledgeFiles.length > 0
                    ? t("digital_copy_wizard.step3.files_uploaded", { count: formData.knowledgeFiles.length })
                    : t("digital_copy_wizard.step3.none")
                }
            </p>
            <p>
                <strong>{t("digital_copy_wizard.step3.knowledge_text")}</strong>{" "}
                {formData.knowledgeText.trim()
                    ? t("digital_copy_wizard.step3.text_input_summary", { count: formData.knowledgeText.length })
                    : t("digital_copy_wizard.step3.none")
                }
            </p>
        </div>

        <p className="text-sm text-red-500">
            {t("digital_copy_wizard.step3.warning_message")}
        </p>
    </div>
);

// ====================================================================
// --- Component Definition (DigitalCopyWizard) ---
// ====================================================================

// Define a type for the formData state
interface WizardFormData {
  personaName: string;
  personaRole: string;
  personaTone: string;
  knowledgeText: string;
  knowledgeFiles: File[];
  avatarFile: File | null;
}

interface DigitalCopyWizardProps {
  onBuildSubmit: (formData: FormData) => Promise<any>;
}

const DigitalCopyWizard = ({ onBuildSubmit }: DigitalCopyWizardProps) => {
  const { t } = useTranslation(); // Initialize useTranslation here

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<WizardFormData>({
    personaName: "",
    personaRole: "",
    personaTone: "professional",
    knowledgeText: "",
    knowledgeFiles: [],
    avatarFile: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (avatarPreviewUrl) {
        URL.revokeObjectURL(avatarPreviewUrl);
      }
    };
  }, [avatarPreviewUrl]);


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const files = e.target.files;

    if (fieldName === 'avatarFile') {
        if (files && files[0]) {
            if (avatarPreviewUrl) {
                URL.revokeObjectURL(avatarPreviewUrl);
            }
            const newUrl = URL.createObjectURL(files[0]);
            setAvatarPreviewUrl(newUrl);
            setFormData((prev) => ({ ...prev, [fieldName]: files[0] }));
        } else {
            if (avatarPreviewUrl) {
                URL.revokeObjectURL(avatarPreviewUrl);
            }
            setAvatarPreviewUrl(null);
            setFormData((prev) => ({ ...prev, [fieldName]: null }));
        }
    } else if (fieldName === 'knowledgeFiles') {
        setFormData((prev) => ({ ...prev, [fieldName]: files ? Array.from(files) : [] }));
    }
  };

  const handleRemoveAvatar = () => {
    if (avatarPreviewUrl) {
        URL.revokeObjectURL(avatarPreviewUrl);
    }
    setAvatarPreviewUrl(null);
    setFormData((prev) => ({ ...prev, avatarFile: null }));
  };


  const handleNext = () => {
    setError(null);

    if (step === 1) {
      if (!formData.personaName.trim() || !formData.personaRole.trim()) {
        setError(t("digital_copy_wizard.errors.name_role_required")); // Use translation key
        return;
      }
    }
    setStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setError(null);
    setStep((prev) => prev - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const data = new FormData();

    data.append('personaName', formData.personaName);
    data.append('personaRole', formData.personaRole);
    data.append('personaTone', formData.personaTone);
    if (formData.knowledgeText.trim()) {
        data.append('knowledgeText', formData.knowledgeText);
    }

    if (formData.avatarFile) {
        data.append('avatarFile', formData.avatarFile, formData.avatarFile.name);
    }

    if (formData.knowledgeFiles && formData.knowledgeFiles.length > 0) {
        formData.knowledgeFiles.forEach((file) => {
            data.append('knowledgeFiles[]', file, file.name);
        });
    }

    try {
        await onBuildSubmit(data);
    } catch (apiError: any) {
        setError(t("digital_copy_wizard.errors.build_initiation_error", { message: apiError.message || t("digital_copy_wizard.errors.unknown_network_error") }));
    } finally {
        setIsSubmitting(false);
    }
  };


  // --- Render Logic ---
  const renderStep = () => {
    // Pass 't' down to step components
    const commonProps = { formData, handleInputChange, handleFileChange, isSubmitting, t };

    switch (step) {
      case 1:
        return <Step1Identity {...commonProps}
                    avatarPreviewUrl={avatarPreviewUrl}
                    handleRemoveAvatar={handleRemoveAvatar}
                />;
      case 2:
        return <Step2Knowledge {...commonProps} />;
      case 3:
        return <Step3Confirm {...commonProps} />;
      default:
        return <Step1Identity {...commonProps} />;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full">

      {/* ERROR MESSAGE DISPLAY */}
      {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mx-6 mb-4 flex justify-between items-center" role="alert">
              <span className="block sm:inline">{error}</span>
              <button
                  type="button"
                  onClick={() => setError(null)}
                  className="font-bold text-red-700 hover:text-red-900 ml-4"
              >
                  &times;
              </button>
          </div>
      )}

      {/* STEP CONTENT */}
      <div className="flex-1 overflow-y-auto px-6 pb-6">
        <div key={step}>
          {renderStep()}
        </div>
      </div>

      {/* NAVIGATION FOOTER */}
      <div className="flex items-center justify-between pt-4 border-t px-6">
        <Button
          type="button"
          onClick={handleBack}
          disabled={step === 1 || isSubmitting}
          variant="outline"
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> {t("digital_copy_wizard.navigation.back_button")}
        </Button>

        <div className="text-sm font-medium">
          {t("digital_copy_wizard.navigation.step_indicator", { current: step, total: 3 })}
        </div>

        {step < 3 ? (
          <Button
            type="button"
            onClick={handleNext}
            disabled={isSubmitting}
            className="bg-primary hover:bg-primary-hover"
          >
            {t("digital_copy_wizard.navigation.next_button")} <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button
            type="submit"
            // Disable if submitting, or if NO knowledge source is provided
            // Now correctly uses formData.knowledgeFiles from state
            disabled={isSubmitting || (
                !formData.knowledgeText.trim() &&
                !(formData.knowledgeFiles && formData.knowledgeFiles.length > 0)
            )}
            className="h-10 px-4 bg-green-600 hover:bg-green-700 text-primary-foreground"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Zap className="h-4 w-4 mr-2" />
            )}
            {isSubmitting ? t("digital_copy_wizard.navigation.building_button") : t("digital_copy_wizard.navigation.build_button")}
          </Button>
        )}
      </div>
    </form>
  );
};

export default DigitalCopyWizard;