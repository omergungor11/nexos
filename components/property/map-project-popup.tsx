import Image from "next/image";
import Link from "next/link";
import { Building2 } from "lucide-react";
import { formatPrice } from "@/lib/format";

export interface MapProject {
  id: string;
  slug: string;
  title: string;
  cover_image: string | null;
  starting_price: number | null;
  currency: string;
  developer: string | null;
  status: string;
  lat: number;
  lng: number;
}

const STATUS_LABELS: Record<string, string> = {
  upcoming: "Yakında",
  under_construction: "İnşaat Halinde",
  completed: "Tamamlandı",
  selling: "Satışta",
};

const STATUS_COLORS: Record<string, string> = {
  upcoming: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  under_construction: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  completed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  selling: "bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-400",
};

interface MapProjectPopupProps {
  project: MapProject;
}

export function MapProjectPopup({ project }: MapProjectPopupProps) {
  const coverImage = project.cover_image ?? "/placeholder-property.svg";

  return (
    <div className="w-56">
      {/* Image */}
      <div className="relative h-32 w-full overflow-hidden rounded-t-md">
        <Image
          src={coverImage}
          alt={project.title}
          fill
          className="object-cover"
          sizes="224px"
          unoptimized
        />
        <div className="absolute top-1.5 left-1.5 flex gap-1">
          <span className="rounded bg-violet-600 px-1.5 py-0.5 text-[10px] font-medium text-white">
            Proje
          </span>
          <span
            className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${
              STATUS_COLORS[project.status] ?? "bg-gray-100 text-gray-800"
            }`}
          >
            {STATUS_LABELS[project.status] ?? project.status}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-2.5">
        <h3 className="line-clamp-2 text-xs font-semibold leading-snug text-gray-900">
          {project.title}
        </h3>

        {project.developer && (
          <div className="mt-1 flex items-center gap-1 text-[11px] text-gray-500">
            <Building2 className="h-3 w-3" />
            {project.developer}
          </div>
        )}

        {project.starting_price != null && project.starting_price > 0 && (
          <p className="mt-1 text-sm font-bold text-violet-600">
            {formatPrice(project.starting_price, project.currency)}
            <span className="ml-1 text-[10px] font-normal text-gray-500">
              başlayan
            </span>
          </p>
        )}

        <Link
          href={`/projeler/${project.slug}`}
          className="mt-2.5 block w-full rounded-md bg-violet-600 px-3 py-1.5 text-center text-[11px] font-semibold text-white transition-opacity hover:opacity-90"
          target="_blank"
          rel="noopener noreferrer"
        >
          Projeyi İncele
        </Link>
      </div>
    </div>
  );
}
