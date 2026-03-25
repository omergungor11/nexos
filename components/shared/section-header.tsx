import { ArrowRight, type LucideIcon } from "lucide-react";
import { Link } from "@/i18n/navigation";

interface SectionHeaderProps {
  title: string;
  description?: string;
  href?: string;
  linkLabel?: string;
  icon?: LucideIcon;
  iconColor?: string;
}

export function SectionHeader({
  title,
  description,
  href,
  linkLabel = "Tümünü Gör",
  icon: Icon,
  iconColor = "text-primary",
}: SectionHeaderProps) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        <div className="flex items-center gap-2.5">
          {Icon && <Icon className={`h-7 w-7 ${iconColor}`} />}
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {title}
          </h2>
        </div>
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
