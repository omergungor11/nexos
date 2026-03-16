import { setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { getBlogPosts, getBlogCategories } from "@/lib/queries/content";
import { formatRelativeDate } from "@/lib/format";

export const metadata: Metadata = {
  title: "Rehber",
  description:
    "Kuzey Kıbrıs gayrimenkul rehberi — yatırım ipuçları, tapu bilgileri ve emlak trendleri.",
};

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function BlogPage({ params, searchParams }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const sp = await searchParams;
  const page = Number(sp.sayfa) || 1;
  const categorySlug = typeof sp.kategori === "string" ? sp.kategori : undefined;

  const [{ data: posts }, categories] = await Promise.all([
    getBlogPosts(page, 12, categorySlug),
    getBlogCategories(),
  ]);

  const activeCategory = categories.find((c) => c.slug === categorySlug);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold">Rehber</h1>
        <p className="mt-2 text-muted-foreground">
          Kuzey Kıbrıs gayrimenkul dünyasından rehberler ve yatırım ipuçları
        </p>
      </div>

      {/* Category filter */}
      {categories.length > 0 && (
        <div className="mb-8 flex flex-wrap justify-center gap-2">
          <Link
            href="/blog"
            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
              !categorySlug
                ? "border-primary bg-primary text-white"
                : "border-input hover:bg-muted"
            }`}
          >
            Tümü
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/blog?kategori=${cat.slug}` as never}
              className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                categorySlug === cat.slug
                  ? "border-primary bg-primary text-white"
                  : "border-input hover:bg-muted"
              }`}
            >
              {cat.name}
            </Link>
          ))}
        </div>
      )}

      {activeCategory && (
        <p className="mb-6 text-center text-sm text-muted-foreground">
          &ldquo;{activeCategory.name}&rdquo; kategorisindeki yazılar
        </p>
      )}

      {posts && posts.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Link key={post.id} href={{ pathname: "/blog/[slug]", params: { slug: post.slug } }}>
              <Card className="group h-full gap-0 overflow-hidden py-0 transition-shadow hover:shadow-lg">
                {post.cover_image && (
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <Image
                      src={post.cover_image}
                      alt={post.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  </div>
                )}
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{post.author}</span>
                    <span>·</span>
                    {post.published_at && (
                      <span>{formatRelativeDate(post.published_at)}</span>
                    )}
                  </div>
                  <h2 className="mt-2 line-clamp-2 font-semibold group-hover:text-primary">
                    {post.title}
                  </h2>
                  {post.excerpt && (
                    <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                      {post.excerpt}
                    </p>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="py-16 text-center text-muted-foreground">
          {categorySlug
            ? "Bu kategoride henüz yazı yayınlanmamış."
            : "Henüz rehber yazısı yayınlanmamış."}
        </div>
      )}
    </div>
  );
}
