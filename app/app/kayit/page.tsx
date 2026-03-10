import type { Metadata } from "next";
import { RegisterForm } from "./register-form";

export const metadata: Metadata = {
  title: "Kayıt Ol",
  description:
    "Nexos Emlak'a ücretsiz kayıt olun. Favori ilanlarınızı kaydedin, danışmanlarımızla iletişime geçin.",
};

export default function KayitPage() {
  return <RegisterForm />;
}
