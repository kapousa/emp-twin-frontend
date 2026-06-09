import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import LoginForm from "@/components/forms/LoginForm";
import {LogIn, ArrowLeft} from "lucide-react";
import {useTranslation} from "react-i18next";
import {Link} from "react-router-dom";
import CroconusLogo from "@/assets/croconus_logo.png"; // Import branding

const Login = () => {
    const {t} = useTranslation();

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            {/* Branding Logo above the card */}
            <div className="mb-8 flex flex-col items-center animate-in fade-in slide-in-from-top-4 duration-700">
                <img
                    src={CroconusLogo}
                    alt="Croconus"
                    className="h-16 w-auto mb-4 drop-shadow-sm"
                />
                <h1 className="text-3xl font-black tracking-tighter text-gray-900">Croconus</h1>
            </div>

            <div className="w-full max-w-md px-4">
                <Card className="bg-white border-gray-100 shadow-2xl rounded-[32px] overflow-hidden">
                    <CardHeader className="text-center pt-10">
                        <div className="flex justify-center mb-6">
                            {/* Icon using your brand's Red color */}
                            <div className="p-4 bg-violet-500-50 rounded-2xl">
                                <LogIn className="h-8 w-8 text-[#7c80f3]"/>
                            </div>
                        </div>

                        <CardTitle className="text-2xl font-bold text-gray-900">
                            {t("login.title")}
                        </CardTitle>
                        <CardDescription className="text-violet-400-400 font-medium mt-2">
                            {t("login.description")}
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="pb-10 px-8">
                        {/* Note: Ensure your LoginForm component uses the same red color
                for its "Sign In" button (bg-[#E11D48])
            */}
                        <LoginForm/>

                        {/* ISign Up */}
                        <div className="mt-6 text-center">
                            <p className="text-sm text-gray-500 font-medium">
                                {t("login.no_account") || "Don't have an account?"}{" "}
                                <Link
                                    to="/signup"
                                    className="text-[#7c80f3] font-black hover:underline"
                                >
                                    {t("login.signup_link") || "Create an account"}
                                </Link>
                            </p>
                        </div>

                        <div className="mt-8 text-center space-y-4">
                            <p className="text-[11px] font-bold text-gray-300 uppercase tracking-widest leading-relaxed">
                                {t("login.demo_credentials")}
                            </p>

                            <div className="pt-6 border-t border-gray-50">
                                <Link
                                    to="/"
                                    className="inline-flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-[#7c80f3] transition-colors"
                                >
                                    <ArrowLeft size={16}/>
                                    {t("common.back_home") || "Back to Website"}
                                </Link>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Subtle Footer */}
            <p className="mt-8 text-xs text-gray-400 font-medium uppercase tracking-widest">
                &copy; {new Date().getFullYear()} Croconus AI. All rights reserved.
            </p>
        </div>
    );
};

export default Login;