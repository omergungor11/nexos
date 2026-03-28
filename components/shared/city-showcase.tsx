import Image from "next/image";
import { Link } from "@/i18n/navigation";

interface CityShowcaseProps {
  typeCounts: { type: string; label: string; count: number }[];
  cities: { name: string; slug: string; count: number; image: string }[];
}

export function CityShowcase({ typeCounts, cities }: CityShowcaseProps) {
  return (
    <section className="bg-background">
      <div className="container mx-auto px-4 py-14">
        <h2 className="mb-8 text-center text-2xl font-bold tracking-tight sm:text-3xl">Şehirler</h2>
        {/* Property Type Filter Pills */}
        {typeCounts.length > 0 && (
          <div className="mb-12 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
            {typeCounts.map((item) => (
              <Link
                key={item.type}
                href={`/emlak?tip=${item.type}` as never}
                className="group flex items-baseline gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                {item.label}
                <span className="relative -top-0.5 text-xs text-muted-foreground/60 group-hover:text-primary/60">
                  ({item.count})
                </span>
              </Link>
            ))}
          </div>
        )}

        {/* City Circles */}
        {cities.length > 0 && (
          <div className="flex flex-wrap items-start justify-center gap-8 sm:gap-10">
            {cities.map((city) => (
              <Link
                key={city.slug}
                href={`/emlak?sehir=${city.slug}` as never}
                className="group flex flex-col items-center"
              >
                <div
                  className={[
                    "relative overflow-hidden rounded-full",
                    "h-[120px] w-[120px] lg:h-[160px] lg:w-[160px]",
                    "ring-2 ring-primary/30 transition-all",
                    "hover:shadow-lg hover:ring-primary",
                  ].join(" ")}
                >
                  <Image
                    src={city.image}
                    alt={city.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 1024px) 120px, 160px"
                  />
                </div>
                <p className="mt-3 text-center text-sm font-semibold">
                  {city.name}
                </p>
                <p className="text-center text-xs text-muted-foreground">
                  {city.count} ilan
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
