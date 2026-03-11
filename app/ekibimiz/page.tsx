import type { Metadata } from "next";
import { Phone, Mail } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
// inline link styles (can't use buttonVariants in server components)
import { getAgents } from "@/lib/queries/content";

export const metadata: Metadata = {
  title: "Ekibimiz",
  description:
    "NexOS Emlak uzman kadrosu. Deneyimli gayrimenkul danışmanlarımızla tanışın.",
};

export default async function EkibimizPage() {
  const { data: agents } = await getAgents();

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-12 text-center">
        <h1 className="text-3xl font-bold">Ekibimiz</h1>
        <p className="mt-2 text-muted-foreground">
          Alanında uzman gayrimenkul danışmanlarımız ile tanışın.
        </p>
      </div>

      {agents && agents.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {agents.map((agent) => (
            <Card key={agent.id} className="overflow-hidden">
              <CardContent className="flex flex-col items-center p-6 text-center">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={agent.photo_url ?? undefined} />
                  <AvatarFallback className="text-lg">
                    {agent.name
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <h2 className="mt-4 text-lg font-semibold">{agent.name}</h2>
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
                    <a
                      href={`tel:${agent.phone}`}
                      className="inline-flex h-7 items-center gap-1 rounded-lg border border-input bg-background px-2.5 text-[0.8rem] font-medium hover:bg-muted"
                    >
                      <Phone className="mr-1 h-3.5 w-3.5" />
                      Ara
                    </a>
                  )}
                  {agent.email && (
                    <a
                      href={`mailto:${agent.email}`}
                      className="inline-flex h-7 items-center gap-1 rounded-lg border border-input bg-background px-2.5 text-[0.8rem] font-medium hover:bg-muted"
                    >
                      <Mail className="mr-1 h-3.5 w-3.5" />
                      E-posta
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="py-16 text-center text-muted-foreground">
          Henüz ekip üyesi eklenmemiş.
        </div>
      )}
    </div>
  );
}
