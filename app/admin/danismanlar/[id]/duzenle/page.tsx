import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { AgentForm } from "@/components/admin/agent-form";

export const metadata: Metadata = {
  title: "Danışman Düzenle — Admin",
};

type Props = {
  params: Promise<{ id: string }>;
};

export default async function AdminAgentEditPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: agent, error } = await supabase
    .from("agents")
    .select("id, name, title, phone, email, bio, photo_url, is_active, slug, created_at")
    .eq("id", id)
    .single();

  if (error || !agent) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/danismanlar"
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="size-4" />
          Danışmanlar
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-foreground">Danışman Düzenle</h1>
        <p className="mt-1 text-sm text-muted-foreground">{agent.name}</p>
      </div>

      <AgentForm mode="edit" agent={agent} />
    </div>
  );
}
