import { LoginForm } from "@/components/auth/login-form";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Login | Chhattisgarh Shaadi",
    description: "Login to your Chhattisgarh Shaadi account.",
};

export default function LoginPage() {
    return <LoginForm />;
}
