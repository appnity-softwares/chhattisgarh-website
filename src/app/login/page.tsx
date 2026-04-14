import { UserLoginForm } from "@/components/auth/user-login-form";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Login | Chhattisgarh Shadi",
    description: "Login to find your perfect life partner in Chhattisgarh.",
};

export default function LoginPage() {
    return <UserLoginForm />;
}
