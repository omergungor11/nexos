import Link from "next/link";
import { MessageSquare, Building2, ArrowRight } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ActivityContact {
  id: string;
  name: string;
  status: string;
  created_at: string;
  property: { title: string; slug: string }[] | null;
}

export interface ActivityProperty {
  id: string;
  title: string;
  slug: string;
  is_active: boolean;
  created_at: string;
}

type ActivityItem =
  | { kind: "contact"; data: ActivityContact }
  | { kind: "property"; data: ActivityProperty };

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatShortDate(dateString: string) {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateString));
}

const CONTACT_STATUS_LABELS: Record<string, string> = {
  new: "Yeni talep",
  contacted: "İletişimde",
  closed: "Kapandı",
  cancelled: "İptal edildi",
};

const CONTACT_STATUS_COLORS: Record<string, string> = {
  new: "bg-blue-100 text-blue-700",
  contacted: "bg-amber-100 text-amber-700",
  closed: "bg-green-100 text-green-700",
  cancelled: "bg-muted text-muted-foreground",
};

// ─── Component ────────────────────────────────────────────────────────────────

interface DashboardActivityFeedProps {
  contacts: ActivityContact[];
  properties: ActivityProperty[];
}

export function DashboardActivityFeed({
  contacts,
  properties,
}: DashboardActivityFeedProps) {
  // Merge and sort by created_at descending
  const items: ActivityItem[] = [
    ...contacts.map((c): ActivityItem => ({ kind: "contact", data: c })),
    ...properties.map((p): ActivityItem => ({ kind: "property", data: p })),
  ].sort(
    (a, b) =>
      new Date(b.data.created_at).getTime() -
      new Date(a.data.created_at).getTime()
  );

  return (
    <Card>
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Son Aktiviteler</CardTitle>
            <CardDescription>Talepler ve ilanların zaman çizelgesi</CardDescription>
          </div>
          <Link
            href="/admin/talepler"
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary"
          >
            Tüm talepler <ArrowRight className="size-3" />
          </Link>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {items.length === 0 ? (
          <p className="p-4 text-center text-sm text-muted-foreground">
            Henüz aktivite bulunmuyor.
          </p>
        ) : (
          <ol className="relative divide-y">
            {items.map((item) =>
              item.kind === "contact" ? (
                <ContactItem key={`contact-${item.data.id}`} contact={item.data} />
              ) : (
                <PropertyItem
                  key={`property-${item.data.id}`}
                  property={item.data}
                />
              )
            )}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Contact row ──────────────────────────────────────────────────────────────

function ContactItem({ contact }: { contact: ActivityContact }) {
  const statusLabel =
    CONTACT_STATUS_LABELS[contact.status] ?? contact.status;
  const statusColor =
    CONTACT_STATUS_COLORS[contact.status] ?? "bg-muted text-muted-foreground";

  return (
    <li>
      <Link
        href="/admin/talepler"
        className="flex items-start gap-3 px-4 py-3 hover:bg-muted/50 transition-colors"
      >
        <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-amber-100">
          <MessageSquare className="size-3.5 text-amber-600" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-foreground">
            {contact.name}
            <span
              className={`ml-2 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusColor}`}
            >
              {statusLabel}
            </span>
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {contact.property?.[0] ? contact.property[0].title : "Genel talep"}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {formatShortDate(contact.created_at)}
          </p>
        </div>
        <ArrowRight className="mt-2 size-3.5 shrink-0 text-muted-foreground/50" />
      </Link>
    </li>
  );
}

// ─── Property row ─────────────────────────────────────────────────────────────

function PropertyItem({ property }: { property: ActivityProperty }) {
  return (
    <li>
      <Link
        href={`/admin/ilanlar/${property.id}/duzenle`}
        className="flex items-start gap-3 px-4 py-3 hover:bg-muted/50 transition-colors"
      >
        <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-blue-100">
          <Building2 className="size-3.5 text-blue-600" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-foreground">
            {property.title}
            <span
              className={`ml-2 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                property.is_active
                  ? "bg-green-100 text-green-700"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {property.is_active ? "Aktif" : "Pasif"}
            </span>
          </p>
          <p className="text-xs text-muted-foreground">Yeni ilan eklendi</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {formatShortDate(property.created_at)}
          </p>
        </div>
        <ArrowRight className="mt-2 size-3.5 shrink-0 text-muted-foreground/50" />
      </Link>
    </li>
  );
}
