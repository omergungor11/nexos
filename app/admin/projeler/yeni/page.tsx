import { getCities } from "@/lib/queries/locations";
import { ProjectForm } from "@/components/admin/project-form";

export const metadata = {
  title: "Yeni Proje — Admin",
};

export default async function YeniProjePage() {
  const cities = await getCities();

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-xl font-semibold">Yeni Proje</h1>
      <ProjectForm mode="create" cities={cities} />
    </div>
  );
}
