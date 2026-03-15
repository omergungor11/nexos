import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminLayout } from "@/components/layout/admin-layout";

export const metadata = {
  title: {
    default: "Yönetim Paneli",
    template: "%s | Nexos Admin",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  // Check authentication
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/giris");
  }

  // Check admin role — try profiles table first, fallback to user_metadata
  let profileRole: string | null = null;
  let profileName: string | null = null;

  try {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, full_name")
      .eq("id", user.id)
      .single();
    profileRole = profile?.role ?? null;
    profileName = profile?.full_name ?? null;
  } catch {
    // profiles table may not exist — that's OK
  }

  const role = profileRole ?? user.user_metadata?.role;

  if (role !== "admin") {
    redirect("/giris");
  }

  const adminName =
    profileName ??
    user.user_metadata?.full_name ??
    user.email?.split("@")[0] ??
    "Admin";

  const adminEmail = user.email ?? "";

  return (
    <AdminLayout adminName={adminName} adminEmail={adminEmail}>
      {children}
    </AdminLayout>
  );
}
