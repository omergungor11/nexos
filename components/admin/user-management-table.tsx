"use client";

import { useState } from "react";
import Image from "next/image";
import { Search, UserIcon, ShieldCheck, ShieldOff } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type UserRow = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  title: string | null;
  photo_url: string | null;
  is_active: boolean;
  role: "admin" | "agent" | "user";
  last_sign_in: string | null;
  created_at: string;
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(dateString: string | null): string {
  if (!dateString) return "—";
  return new Intl.DateTimeFormat("tr-TR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateString));
}

function RoleBadge({ role }: { role: UserRow["role"] }) {
  const config: Record<UserRow["role"], { label: string; className: string; Icon: React.ElementType }> = {
    admin: {
      label: "Admin",
      className: "bg-red-100 text-red-700",
      Icon: ShieldCheck,
    },
    agent: {
      label: "Danışman",
      className: "bg-blue-100 text-blue-700",
      Icon: UserIcon,
    },
    user: {
      label: "Kullanıcı",
      className: "bg-muted text-muted-foreground",
      Icon: UserIcon,
    },
  };

  const { label, className, Icon } = config[role] ?? config.user;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${className}`}
    >
      <Icon className="size-3" />
      {label}
    </span>
  );
}

function StatusDot({ active }: { active: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs">
      <span
        className={`size-2 rounded-full ${active ? "bg-emerald-500" : "bg-slate-300"}`}
      />
      {active ? "Aktif" : "Pasif"}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function UserManagementTable({ data }: { data: UserRow[] }) {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  const filtered = data.filter((row) => {
    if (roleFilter !== "all" && row.role !== roleFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        row.name.toLowerCase().includes(q) ||
        (row.email?.toLowerCase().includes(q) ?? false) ||
        (row.phone?.includes(q) ?? false)
      );
    }
    return true;
  });

  const thClass =
    "px-3 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground whitespace-nowrap";

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <CardTitle>Kullanıcı Listesi</CardTitle>
            <CardDescription>
              {filtered.length} kullanıcı
              {filtered.length !== data.length && ` (toplam ${data.length})`}
            </CardDescription>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Role filter tabs */}
            <div className="flex rounded-lg border overflow-hidden">
              {[
                { label: "Tümü", value: "all" },
                { label: "Admin", value: "admin" },
                { label: "Danışman", value: "agent" },
                { label: "Kullanıcı", value: "user" },
              ].map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setRoleFilter(tab.value)}
                  className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                    roleFilter === tab.value
                      ? "bg-primary text-primary-foreground"
                      : "bg-background text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Ara..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-8 w-44 pl-8 text-sm"
              />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border text-sm">
            <thead className="bg-muted/40">
              <tr>
                <th className={thClass}>Kullanıcı</th>
                <th className={thClass}>Rol</th>
                <th className={thClass}>E-posta</th>
                <th className={thClass}>Telefon</th>
                <th className={thClass}>Durum</th>
                <th className={thClass}>Son Giriş</th>
                <th className={thClass}>Kayıt Tarihi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-background">
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-3 py-10 text-center text-muted-foreground"
                  >
                    Kullanıcı bulunamadı.
                  </td>
                </tr>
              ) : (
                filtered.map((row) => (
                  <tr key={row.id} className="hover:bg-muted/30 transition-colors">
                    {/* User */}
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-3">
                        <div className="size-9 shrink-0 overflow-hidden rounded-full bg-muted flex items-center justify-center">
                          {row.photo_url ? (
                            <Image
                              src={row.photo_url}
                              alt={row.name}
                              width={36}
                              height={36}
                              className="size-9 object-cover"
                            />
                          ) : (
                            <UserIcon className="size-4 text-muted-foreground" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-foreground">{row.name}</p>
                          {row.title && (
                            <p className="text-xs text-muted-foreground">{row.title}</p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="px-3 py-3">
                      <RoleBadge role={row.role} />
                    </td>

                    {/* Email */}
                    <td className="px-3 py-3 text-muted-foreground">
                      {row.email ? (
                        <a
                          href={`mailto:${row.email}`}
                          className="hover:text-foreground hover:underline"
                        >
                          {row.email}
                        </a>
                      ) : (
                        "—"
                      )}
                    </td>

                    {/* Phone */}
                    <td className="px-3 py-3 whitespace-nowrap text-muted-foreground">
                      {row.phone ? (
                        <a
                          href={`tel:${row.phone}`}
                          className="hover:text-foreground hover:underline"
                        >
                          {row.phone}
                        </a>
                      ) : (
                        "—"
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-3 py-3">
                      <StatusDot active={row.is_active} />
                    </td>

                    {/* Last sign in */}
                    <td className="px-3 py-3 whitespace-nowrap text-xs text-muted-foreground">
                      {formatDate(row.last_sign_in)}
                    </td>

                    {/* Created at */}
                    <td className="px-3 py-3 whitespace-nowrap text-xs text-muted-foreground">
                      {formatDate(row.created_at)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Summary footer */}
        <div className="border-t px-4 py-3">
          <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
            <span>
              <span className="font-medium text-red-700">
                {data.filter((u) => u.role === "admin").length}
              </span>{" "}
              admin
            </span>
            <span>
              <span className="font-medium text-blue-700">
                {data.filter((u) => u.role === "agent").length}
              </span>{" "}
              danışman
            </span>
            <span>
              <span className="font-medium text-foreground">
                {data.filter((u) => u.is_active).length}
              </span>{" "}
              aktif
            </span>
            <ShieldOff className="ml-auto size-3.5 opacity-0" aria-hidden />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
