"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { Copy, Share2, Globe, Search } from "lucide-react";
import { SocialMediaImageGenerator } from "@/components/admin/social-media-image-generator";

import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  generateInstagramPost,
  generateFacebookPost,
  generateHashtags,
  INSTAGRAM_CHAR_LIMIT,
  FACEBOOK_CHAR_LIMIT,
  type PropertyForSocial,
} from "@/lib/social-media-templates";

interface PropertyOption {
  id: string;
  title: string;
  price: number;
  currency: string;
  type: string;
  transaction_type: string;
  area_sqm: number | null;
  rooms: number | null;
  living_rooms: number | null;
  city_name: string;
  district_name: string | null;
  cover_image: string | null;
  extra_images: string[];
}

interface SocialMediaGeneratorProps {
  properties: PropertyOption[];
}

type Platform = "instagram" | "facebook";

function getCharLimit(platform: Platform): number {
  return platform === "instagram" ? INSTAGRAM_CHAR_LIMIT : FACEBOOK_CHAR_LIMIT;
}

function generatePostForPlatform(
  platform: Platform,
  property: PropertyForSocial
): string {
  return platform === "instagram"
    ? generateInstagramPost(property)
    : generateFacebookPost(property);
}

function getCharCountColor(count: number, limit: number): string {
  const ratio = count / limit;
  if (ratio > 1) return "text-destructive font-semibold";
  if (ratio >= 0.8) return "text-yellow-600 dark:text-yellow-400";
  return "text-green-600 dark:text-green-400";
}

export function SocialMediaGenerator({ properties }: SocialMediaGeneratorProps) {
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(
    null
  );
  const [platform, setPlatform] = useState<Platform>("instagram");
  const [postText, setPostText] = useState("");
  const [activeHashtags, setActiveHashtags] = useState<Set<string>>(new Set());
  const [allHashtags, setAllHashtags] = useState<string[]>([]);

  const [propertySearch, setPropertySearch] = useState("");
  const selectedProperty = properties.find((p) => p.id === selectedPropertyId) ?? null;

  const filteredProperties = useMemo(() => {
    if (!propertySearch.trim()) return properties;
    const q = propertySearch.toLowerCase();
    return properties.filter((p) => p.title.toLowerCase().includes(q) || p.city_name.toLowerCase().includes(q));
  }, [properties, propertySearch]);
  const charLimit = getCharLimit(platform);
  const charCount = postText.length;

  // Regenerate post when property or platform changes
  useEffect(() => {
    if (!selectedProperty) {
      setPostText("");
      setAllHashtags([]);
      setActiveHashtags(new Set());
      return;
    }

    const tags = generateHashtags(selectedProperty);
    setAllHashtags(tags);
    setActiveHashtags(new Set(tags));

    const generated = generatePostForPlatform(platform, selectedProperty);
    setPostText(generated);
  }, [selectedProperty, platform]);

  const handlePropertyChange = useCallback((value: string | null) => {
    if (value) setSelectedPropertyId(value);
  }, []);

  const handlePlatformChange = useCallback((value: string | null) => {
    if (value === "instagram" || value === "facebook") {
      setPlatform(value);
    }
  }, []);

  const toggleHashtag = useCallback(
    (tag: string) => {
      if (!selectedProperty) return;

      setActiveHashtags((prev) => {
        const next = new Set(prev);
        if (next.has(tag)) {
          next.delete(tag);
        } else {
          next.add(tag);
        }
        return next;
      });

      // Update post text by removing or adding the hashtag
      setPostText((prev) => {
        const hashtagStr = `#${tag}`;
        if (prev.includes(hashtagStr)) {
          // Remove the hashtag from text
          return prev
            .replace(new RegExp(`\\s*#${escapeRegex(tag)}\\b`, "g"), "")
            .trim();
        } else {
          // Append to end of text
          return `${prev.trim()} ${hashtagStr}`;
        }
      });
    },
    [selectedProperty]
  );

  const handleCopy = useCallback(async () => {
    if (!postText) return;
    try {
      await navigator.clipboard.writeText(postText);
      toast.success("Metin panoya kopyalandı!");
    } catch {
      toast.error("Kopyalama başarısız oldu.");
    }
  }, [postText]);

  return (
    <div className="space-y-6">
      {/* Property selector with search */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium">İlan Seçin</label>
        <Select
          value={selectedPropertyId ?? undefined}
          onValueChange={handlePropertyChange}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="İlan seçmek için tıklayın..." />
          </SelectTrigger>
          <SelectContent>
            <div className="sticky top-0 bg-popover p-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={propertySearch}
                  onChange={(e) => setPropertySearch(e.target.value)}
                  placeholder="İlan ara..."
                  className="flex h-8 w-full rounded-md border border-input bg-background pl-8 pr-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  onKeyDown={(e) => e.stopPropagation()}
                />
              </div>
            </div>
            {filteredProperties.length === 0 ? (
              <div className="px-3 py-4 text-center text-sm text-muted-foreground">
                Sonuç bulunamadı
              </div>
            ) : (
              filteredProperties.map((property) => (
                <SelectItem key={property.id} value={property.id}>
                  {property.title} — {property.city_name}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>

      {selectedProperty && (
        <Tabs value={platform} onValueChange={handlePlatformChange}>
          {/* Platform tabs */}
          <TabsList className="w-full">
            <TabsTrigger value="instagram" className="flex-1 gap-1.5">
              <Share2 className="size-3.5" />
              Instagram
            </TabsTrigger>
            <TabsTrigger value="facebook" className="flex-1 gap-1.5">
              <Globe className="size-3.5" />
              Facebook
            </TabsTrigger>
          </TabsList>

          {/* Instagram panel */}
          <TabsContent value="instagram" className="mt-4 space-y-4">
            <PostEditor
              text={postText}
              onTextChange={setPostText}
              charCount={charCount}
              charLimit={charLimit}
              onCopy={handleCopy}
            />
          </TabsContent>

          {/* Facebook panel */}
          <TabsContent value="facebook" className="mt-4 space-y-4">
            <PostEditor
              text={postText}
              onTextChange={setPostText}
              charCount={charCount}
              charLimit={charLimit}
              onCopy={handleCopy}
            />
          </TabsContent>
        </Tabs>
      )}

      {/* Hashtag chips — shown below tabs so they persist across platforms */}
      {selectedProperty && allHashtags.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">
            Hashtagler
            <span className="ml-1.5 text-xs font-normal">
              (etkinleştirmek veya devre dışı bırakmak için tıklayın)
            </span>
          </p>
          <div className="flex flex-wrap gap-2">
            {allHashtags.map((tag) => {
              const isActive = activeHashtags.has(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleHashtag(tag)}
                  className={[
                    "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
                    isActive
                      ? "border-primary/30 bg-primary/10 text-primary hover:bg-primary/20"
                      : "border-border bg-muted/50 text-muted-foreground hover:bg-muted",
                  ].join(" ")}
                >
                  #{tag}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Instagram image generator */}
      <SocialMediaImageGenerator property={selectedProperty} />

      {!selectedProperty && (
        <div className="flex min-h-40 items-center justify-center rounded-lg border border-dashed border-border bg-muted/30">
          <p className="text-sm text-muted-foreground">
            Sosyal medya gönderi metni oluşturmak için bir ilan seçin.
          </p>
        </div>
      )}
    </div>
  );
}

interface PostEditorProps {
  text: string;
  onTextChange: (value: string) => void;
  charCount: number;
  charLimit: number;
  onCopy: () => void;
}

function PostEditor({
  text,
  onTextChange,
  charCount,
  charLimit,
  onCopy,
}: PostEditorProps) {
  const colorClass = getCharCountColor(charCount, charLimit);

  return (
    <div className="space-y-2">
      <Textarea
        value={text}
        onChange={(e) => onTextChange(e.target.value)}
        className="min-h-48 resize-y font-mono text-sm leading-relaxed"
        placeholder="Gönderi metni burada görünecek..."
      />
      <div className="flex items-center justify-between">
        <span className={`text-xs tabular-nums ${colorClass}`}>
          {charCount.toLocaleString("tr-TR")} / {charLimit.toLocaleString("tr-TR")} karakter
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={onCopy}
          disabled={!text}
          className="gap-1.5"
        >
          <Copy className="size-3.5" />
          Panoya Kopyala
        </Button>
      </div>
    </div>
  );
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
