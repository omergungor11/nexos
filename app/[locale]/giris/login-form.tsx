"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export function LoginForm() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (authError) {
      switch (authError.message) {
        case "Invalid login credentials":
          setError("E-posta adresi veya şifre hatalı. Lütfen tekrar deneyin.");
          break;
        case "Email not confirmed":
          setError(
            "E-posta adresiniz henüz doğrulanmamış. Lütfen gelen kutunuzu kontrol edin."
          );
          break;
        case "Too many requests":
          setError(
            "Çok fazla hatalı giriş denemesi. Lütfen bir süre bekleyip tekrar deneyin."
          );
          break;
        default:
          setError("Giriş yapılırken bir hata oluştu. Lütfen tekrar deneyin.");
      }
      return;
    }

    // Admin kullanıcıları admin paneline, diğerlerini anasayfaya yönlendir
    const userMeta = data.user?.user_metadata;
    const isAdmin = userMeta?.role === "admin";
    if (isAdmin) {
      window.location.href = "/admin";
    } else {
      router.push("/");
      router.refresh();
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Giriş Yap</CardTitle>
            <CardDescription>
              Nexos Investment hesabınıza giriş yapın
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="email" className="text-sm font-medium">
                  E-posta
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="ornek@eposta.com"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="password" className="text-sm font-medium">
                  Şifre
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
              </div>

              {error && (
                <p
                  role="alert"
                  className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive"
                >
                  {error}
                </p>
              )}

              <Button
                type="submit"
                size="lg"
                className="mt-2 w-full"
                disabled={loading}
              >
                {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Hesabınız yok mu?{" "}
              <Link
                href="/kayit"
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                Kayıt olun
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
