import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { getCities } from "@/lib/queries/locations";
import { ProjectForm } from "@/components/admin/project-form";

export const metadata = {
  title: "Proje Düzenle — Admin",
};

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AdminProjectEditPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: project, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !project) {
    notFound();
  }

  const cities = await getCities();

  return (
    <div className="p-6 space-y-6">
      <Link
        href="/admin/projeler"
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ChevronLeft className="size-4" />
        Projeler
      </Link>
      <h1 className="text-xl font-semibold">Proje Düzenle</h1>
      <ProjectForm mode="edit" project={project} cities={cities} />
    </div>
  );
}
