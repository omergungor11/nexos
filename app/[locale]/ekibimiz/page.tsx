import { setRequestLocale, getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { Phone, Mail } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { getAgents } from "@/lib/queries/content";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "team" });
  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function EkibimizPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "team" });
  const { data: agents } = await getAgents();

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-12 text-center">
        <h1 className="text-3xl font-bold">{t("title")}</h1>
        <p className="mt-2 text-muted-foreground">
          {t("description")}
        </p>
      </div>

      {agents && agents.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {agents.map((agent) => (
            <Link
              key={agent.id}
              href={`/ekibimiz/${agent.slug}` as never}
              className="group"
            >
              <Card className="overflow-hidden transition-shadow group-hover:shadow-lg">
                <CardContent className="flex flex-col items-center p-6 text-center">
                  <Avatar className="h-24 w-24 transition-transform group-hover:scale-105">
                    <AvatarImage src={agent.photo_url ?? undefined} />
                    <AvatarFallback className="text-lg">
                      {agent.name
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <h2 className="mt-4 text-lg font-semibold group-hover:text-primary transition-colors">
                    {agent.name}
                  </h2>
                  {agent.title && (
                    <p className="text-sm text-muted-foreground">{agent.title}</p>
                  )}
                  {agent.bio && (
                    <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">
                      {agent.bio}
                    </p>
                  )}
                  <div className="mt-4 flex gap-2">
                    {agent.phone && (
                      <span
                        className="inline-flex h-7 items-center gap-1 rounded-lg border border-input bg-background px-2.5 text-[0.8rem] font-medium group-hover:bg-muted"
                      >
                        <Phone className="mr-1 h-3.5 w-3.5" />
                        {t("call")}
                      </span>
                    )}
                    {agent.email && (
                      <span
                        className="inline-flex h-7 items-center gap-1 rounded-lg border border-input bg-background px-2.5 text-[0.8rem] font-medium group-hover:bg-muted"
                      >
                        <Mail className="mr-1 h-3.5 w-3.5" />
                        {t("email")}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="py-16 text-center text-muted-foreground">
          {t("noMembers")}
        </div>
      )}
    </div>
  );
}
