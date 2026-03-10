"use client";

import { Heart } from "lucide-react";
import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { addFavorite, removeFavorite } from "@/actions/favorites";
import { cn } from "@/lib/utils";

interface FavoriteButtonProps {
  propertyId: string;
  initialFavorited?: boolean;
  size?: "sm" | "lg";
  className?: string;
}

export function FavoriteButton({
  propertyId,
  initialFavorited = false,
  size = "sm",
  className,
}: FavoriteButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [favorited, setFavorited] = useState(initialFavorited);

  function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    e.stopPropagation();

    const previousState = favorited;

    // Optimistic update
    setFavorited(!favorited);

    startTransition(async () => {
      if (previousState) {
        const result = await removeFavorite(propertyId);
        if (result.error) {
          // Revert on error
          setFavorited(previousState);
          if (result.error === "Giriş yapmanız gerekiyor") {
            router.push("/giris");
          }
        }
      } else {
        const result = await addFavorite(propertyId);
        if (result.error) {
          // Revert on error
          setFavorited(previousState);
          if (result.error === "Giriş yapmanız gerekiyor") {
            router.push("/giris");
          }
        }
      }
    });
  }

  const isSmall = size === "sm";

  return (
    <button
      type="button"
      aria-label={favorited ? "Favorilerden çıkar" : "Favorilere ekle"}
      aria-pressed={favorited}
      disabled={isPending}
      onClick={handleClick}
      className={cn(
        "flex items-center justify-center rounded-full transition-all",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-60",
        isSmall
          ? "size-8 bg-white/80 shadow-sm hover:bg-white"
          : "size-11 bg-white shadow-md hover:bg-white/90",
        className
      )}
    >
      <Heart
        className={cn(
          "transition-colors",
          isSmall ? "size-4" : "size-5",
          favorited
            ? "fill-red-500 text-red-500"
            : "fill-transparent text-muted-foreground hover:text-red-400"
        )}
      />
    </button>
  );
}
