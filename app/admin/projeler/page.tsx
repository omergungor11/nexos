import { createClient } from "@/lib/supabase/server";
import {
  ProjectDataTable,
  type AdminProjectRow,
} from "@/components/admin/project-data-table";

export const metadata = {
  title: "Projeler — Admin",
};

export default async function AdminProjelerPage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("projects")
    .select(
      `
      id, title, slug, cover_image,
      starting_price, currency, total_units, status,
      is_featured, is_active, created_at,
      city:cities(name),
      district:districts(name)
    `
    )
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="p-6">
        <p className="text-destructive">Veriler yüklenemedi: {error.message}</p>
      </div>
    );
  }

  const projects = (data ?? []) as unknown as AdminProjectRow[];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Projeler</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Bölgedeki projeleri yönetin.
        </p>
      </div>

      <ProjectDataTable initialData={projects} />
    </div>
  );
}
