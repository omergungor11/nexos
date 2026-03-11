import type { Metadata } from "next";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Giriş Yap",
  description: "Nexos Emlak hesabınıza giriş yapın.",
};

export default function GirisPage() {
  return <LoginForm />;
}
