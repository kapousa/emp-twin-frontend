import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import axios from "axios";
import { USER_LOGIN_ENDPOINT } from "@/configurations/api";
import { useAuth } from "@/contexts/AuthProvider";
import { useTranslation } from "react-i18next"; // <-- NEW IMPORT

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { login } = useAuth();
  const { t } = useTranslation(); // <-- USE HOOK

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: t("toast.missing_credentials.title"), // Translated
        description: t("toast.missing_credentials.description"), // Translated
        variant: "destructive",
      });
      return;
    }
    setIsLoading(true);
    try {
      const response = await axios.post(
        USER_LOGIN_ENDPOINT,
        new URLSearchParams({
          username: email,
          password: password,
        }),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );
      if (response.status === 200) {
        const { access_token } = response.data;
        login(access_token);
        toast({
          title: t("toast.login_success.title"), // Translated
          description: t("toast.login_success.description"), // Translated
        });
        navigate('/ask');
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        toast({
          title: t("toast.login_failed.title"), // Translated
          description: error.response.data.detail || t("toast.login_failed.description"), // Fallback translated
          variant: "destructive",
        });
      } else {
        toast({
          title: t("toast.login_failed.title"), // Translated
          description: t("toast.unexpected_error"), // Translated
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">{t("login.email_label")}</Label>
        <Input
          id="email"
          type="email"
          placeholder={t("login.email_placeholder")}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="bg-background border-input"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">{t("login.password_label")}</Label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="bg-background border-input"
          required
        />
      </div>
      <Button 
        type="submit" 
        disabled={isLoading}
        className="w-full bg-primary hover:bg-primary-hover text-primary-foreground h-11"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {t("login.signing_in")} {/* Translated */}
          </>
        ) : (
          t("login.sign_in") /* Translated */
        )}
      </Button>
    </form>
  );
};

export default LoginForm; 