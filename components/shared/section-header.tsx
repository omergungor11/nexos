import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";

interface SectionHeaderProps {
  title: string;
  description?: string;
  href?: string;
  linkLabel?: string;
}

export function SectionHeader({
  title,
  description,
  href,
  linkLabel = "Tümünü Gör",
}: SectionHeaderProps) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
          {title}
        </h2>
        {description && (
          <p className="mt-1 text-muted-foreground">{description}</p>
        )}
      </div>
      {href && (
        <Link
          href={href as never}
          className="hidden items-center gap-1 text-sm font-medium text-primary hover:underline sm:flex"
        >
          {linkLabel}
          <ArrowRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}
