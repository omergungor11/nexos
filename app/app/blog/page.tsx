import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { getBlogPosts } from "@/lib/queries/content";
import { formatRelativeDate } from "@/lib/format";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Gayrimenkul sektörü haberleri, yatırım ipuçları ve emlak trendleri.",
};

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function BlogPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = Number(params.sayfa) || 1;
  const { data: posts } = await getBlogPosts(page);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-12 text-center">
        <h1 className="text-3xl font-bold">Blog</h1>
        <p className="mt-2 text-muted-foreground">
          Gayrimenkul dünyasından son haberler ve yatırım ipuçları
        </p>
      </div>

      {posts && posts.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Link key={post.id} href={`/blog/${post.slug}`}>
              <Card className="group h-full overflow-hidden transition-shadow hover:shadow-lg">
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
          Henüz blog yazısı yayınlanmamış.
        </div>
      )}
    </div>
  );
}
