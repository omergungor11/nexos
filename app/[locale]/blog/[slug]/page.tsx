import { setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, User } from "lucide-react";
import { getBlogPostBySlug } from "@/lib/queries/content";
import { formatDate } from "@/lib/format";
import { JsonLd } from "@/components/shared/json-ld";

interface Props {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { data: post } = await getBlogPostBySlug(slug);
  if (!post) return {};

  const title = post.seo_title || post.title;
  const description = post.seo_description || post.excerpt || undefined;
  const ogSubtitle = post.excerpt || "Nexos Investment Rehber";
  const ogImageUrl = `/api/og?title=${encodeURIComponent(post.title)}&subtitle=${encodeURIComponent(ogSubtitle)}&type=blog`;

  return {
    title,
    description,
    openGraph: {
      title: post.title,
      description: description,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: post.title,
        },
        ...(post.cover_image ? [{ url: post.cover_image }] : []),
      ],
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const { data: post } = await getBlogPostBySlug(slug);

  if (!post) notFound();

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://www.nexosinvestment.com";
  const postUrl = `${siteUrl}/blog/${post.slug}`;

  const jsonLdData: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    url: postUrl,
    ...(post.excerpt && { description: post.excerpt }),
    ...(post.cover_image && { image: post.cover_image }),
    ...(post.published_at && { datePublished: post.published_at }),
    author: {
      "@type": "Person",
      name: post.author,
    },
    publisher: {
      "@type": "Organization",
      name: "Nexos Investment",
      url: siteUrl,
    },
  };

  return (
    <>
      <JsonLd data={jsonLdData} />
      <article className="container mx-auto max-w-3xl px-4 py-12">
      <Link
        href="/blog"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Rehber
      </Link>

      <h1 className="text-3xl font-bold leading-tight sm:text-4xl">
        {post.title}
      </h1>

      <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
        <span className="flex items-center gap-1">
          <User className="h-4 w-4" />
          {post.author}
        </span>
        {post.published_at && (
          <span className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {formatDate(post.published_at)}
          </span>
        )}
      </div>

      {post.cover_image && (
        <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-xl">
          <Image
            src={post.cover_image}
            alt={post.title}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 768px) 100vw, 768px"
          />
        </div>
      )}

      <div
        className="prose prose-lg mt-8 max-w-none dark:prose-invert"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />
    </article>
    </>
  );
}
