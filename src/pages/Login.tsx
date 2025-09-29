import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import LoginForm from "@/components/forms/LoginForm";
import { LogIn } from "lucide-react";
import { useTranslation } from "react-i18next"; // <-- NEW IMPORT

const Login = () => {
  const { t } = useTranslation(); // <-- USE HOOK

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background flex items-center justify-center">
      <div className="w-full max-w-md px-4">
        <Card className="bg-panel border-border shadow-lg">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <LogIn className="h-8 w-8 text-primary" />
              </div>
            </div>
            {/* USE TRANSLATION KEYS */}
            <CardTitle className="text-2xl">{t("login.title")}</CardTitle>
            <CardDescription>
              {t("login.description")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm />
            <div className="mt-6 text-center">
              <p className="text-xs text-muted-foreground">
                {t("login.demo_credentials")}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;