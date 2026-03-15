import type { Metadata } from "next";
import { Users } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import {
  UserManagementTable,
  type UserRow,
} from "@/components/admin/user-management-table";

export const metadata: Metadata = {
  title: "Kullanıcılar",
};

export default async function AdminKullanicilarPage() {
  const supabase = await createClient();

  // Fetch agents (which are the primary portal users with profile data)
  const { data: agents } = await supabase
    .from("agents")
    .select("id, user_id, name, title, email, phone, photo_url, is_active, created_at")
    .order("name");

  // Fetch profiles to get role and last sign in metadata
  // profiles table stores role + maps to auth.users via id
  type ProfileRow = {
    id: string;
    role: string | null;
    full_name: string | null;
    last_sign_in_at: string | null;
  };

  const { data: profilesRaw } = await supabase
    .from("profiles")
    .select("id, role, full_name, last_sign_in_at");

  const profiles: ProfileRow[] = ((profilesRaw ?? []) as unknown[]).map((p) => {
    const row = p as Record<string, unknown>;
    return {
      id: row.id as string,
      role: (row.role as string) ?? null,
      full_name: (row.full_name as string) ?? null,
      last_sign_in_at: (row.last_sign_in_at as string) ?? null,
    };
  });

  const profileMap = new Map(profiles.map((p) => [p.id, p]));

  // Build unified user rows
  const rows: UserRow[] = ((agents ?? []) as unknown[]).map((item) => {
    const a = item as Record<string, unknown>;
    const userId = a.user_id as string | null;
    const profile = userId ? profileMap.get(userId) : undefined;

    const roleRaw = profile?.role ?? null;
    const role: UserRow["role"] =
      roleRaw === "admin" ? "admin" : roleRaw === "agent" ? "agent" : "agent";

    return {
      id: a.id as string,
      name: a.name as string,
      email: (a.email as string) ?? null,
      phone: (a.phone as string) ?? null,
      title: (a.title as string) ?? null,
      photo_url: (a.photo_url as string) ?? null,
      is_active: a.is_active as boolean,
      role,
      last_sign_in: profile?.last_sign_in_at ?? null,
      created_at: a.created_at as string,
    };
  });

  // Also include any profile-only admins not in agents table
  const agentUserIds = new Set(
    ((agents ?? []) as unknown[]).map(
      (a) => (a as Record<string, unknown>).user_id as string | null
    ).filter(Boolean)
  );

  const adminOnlyProfiles = profiles.filter(
    (p) => p.role === "admin" && !agentUserIds.has(p.id)
  );

  for (const p of adminOnlyProfiles) {
    rows.push({
      id: p.id,
      name: p.full_name ?? "Admin Kullanıcı",
      email: null,
      phone: null,
      title: null,
      photo_url: null,
      is_active: true,
      role: "admin",
      last_sign_in: p.last_sign_in_at,
      created_at: new Date().toISOString(),
    });
  }

  return (
    <div className="space-y-6">
      {/* Page heading */}
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-600">
          <Users className="size-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Kullanıcılar</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Portal kullanıcıları ve admin hesapları
          </p>
        </div>
      </div>

      <UserManagementTable data={rows} />
    </div>
  );
}
