import { LoginForm } from "@/components/auth/login-form";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Login | Chhattisgarh Shadi",
    description: "Login to your Chhattisgarh Shadi account.",
};

export default function LoginPage() {
    return <LoginForm />;
}
