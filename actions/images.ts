"use server";

import { revalidateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { TablesInsert, TablesUpdate } from "@/types/supabase";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STORAGE_BUCKET = "property-images";
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

type AllowedMimeType = (typeof ALLOWED_MIME_TYPES)[number];

// ---------------------------------------------------------------------------
// Action return types
// ---------------------------------------------------------------------------

type ActionResult<T> =
  | { data: T; error?: never }
  | { data?: never; error: string };

// ---------------------------------------------------------------------------
// Private helpers
// ---------------------------------------------------------------------------

type AdminCheckSuccess = {
  error: null;
  supabase: Awaited<ReturnType<typeof createClient>>;
};
type AdminCheckFailure = { error: string; supabase: null };
type AdminCheckResult = AdminCheckSuccess | AdminCheckFailure;

async function requireAdmin(): Promise<AdminCheckResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Giriş yapmanız gerekiyor", supabase: null };
  }

  const isAdmin = user.user_metadata?.role === "admin";
  if (!isAdmin) {
    return { error: "Yetkiniz yok", supabase: null };
  }

  return { error: null, supabase };
}

/**
 * Strips all characters that are not alphanumeric, dots, or hyphens from a
 * filename while preserving the file extension.
 * Example: "My Photo (1).JPG" → "my-photo-1.jpg"
 */
function sanitizeFilename(originalName: string): string {
  const lastDot = originalName.lastIndexOf(".");
  const hasExtension = lastDot > 0 && lastDot < originalName.length - 1;

  const base = hasExtension
    ? originalName.slice(0, lastDot)
    : originalName;
  const ext = hasExtension
    ? originalName.slice(lastDot + 1).toLowerCase()
    : "";

  const cleanBase = base
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return hasExtension ? `${cleanBase}.${ext}` : cleanBase;
}

function isAllowedMimeType(mime: string): mime is AllowedMimeType {
  return (ALLOWED_MIME_TYPES as readonly string[]).includes(mime);
}

// ---------------------------------------------------------------------------
// uploadMediaImage (general purpose — no property_id required)
// ---------------------------------------------------------------------------

/**
 * Uploads an image to Supabase Storage under a "media/" prefix.
 * Returns the public URL. Does NOT create a property_images DB record.
 * Use this for project covers, gallery images, logos, etc.
 *
 * FormData fields:
 *   - file {File} — the image to upload
 */
export async function uploadMediaImage(
  formData: FormData
): Promise<ActionResult<{ url: string }>> {
  const { error: authError, supabase } = await requireAdmin();
  if (authError || !supabase) {
    return { error: authError ?? "Kimlik doğrulama hatası" };
  }

  const file = formData.get("file");

  if (!(file instanceof File)) {
    return { error: "Geçerli bir dosya gönderilmedi" };
  }

  if (!isAllowedMimeType(file.type)) {
    return {
      error: `Desteklenmeyen dosya türü: ${file.type}. İzin verilenler: JPEG, PNG, WebP`,
    };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return { error: "Dosya boyutu 5 MB sınırını aşıyor" };
  }

  const safeName = sanitizeFilename(file.name);
  const storagePath = `media/${Date.now()}-${safeName}`;

  const arrayBuffer = await file.arrayBuffer();
  const { error: storageError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(storagePath, arrayBuffer, {
      contentType: file.type,
      upsert: false,
    });

  if (storageError) {
    return { error: `Depolama hatası: ${storageError.message}` };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(storagePath);

  return { data: { url: publicUrl } };
}

// ---------------------------------------------------------------------------
// uploadPropertyImage
// ---------------------------------------------------------------------------

/**
 * Uploads an image file to Supabase Storage and creates a corresponding
 * `property_images` database record.
 *
 * FormData fields:
 *   - file       {File}    — the image to upload
 *   - propertyId {string}  — UUID of the target property
 *   - isCover    {string}  — "true" | "false"
 *   - altText    {string}  — optional alternative text
 */
export async function uploadPropertyImage(
  formData: FormData
): Promise<ActionResult<{ id: string; url: string }>> {
  const { error: authError, supabase } = await requireAdmin();
  if (authError || !supabase) {
    return { error: authError ?? "Kimlik doğrulama hatası" };
  }

  // --- Extract & validate form fields ---

  const file = formData.get("file");
  const propertyId = formData.get("propertyId");
  const isCoverRaw = formData.get("isCover");
  const altText = formData.get("altText");

  if (!(file instanceof File)) {
    return { error: "Geçerli bir dosya gönderilmedi" };
  }

  if (typeof propertyId !== "string" || propertyId.trim() === "") {
    return { error: "propertyId gereklidir" };
  }

  const isCover = isCoverRaw === "true";
  const altTextValue =
    typeof altText === "string" && altText.trim() !== ""
      ? altText.trim()
      : null;

  // --- File type validation ---

  if (!isAllowedMimeType(file.type)) {
    return {
      error: `Desteklenmeyen dosya türü: ${file.type}. İzin verilenler: JPEG, PNG, WebP`,
    };
  }

  // --- File size validation ---

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return { error: "Dosya boyutu 5 MB sınırını aşıyor" };
  }

  // --- Build storage path ---

  const safeName = sanitizeFilename(file.name);
  const storagePath = `${propertyId}/${Date.now()}-${safeName}`;

  // --- Upload to Supabase Storage ---

  const arrayBuffer = await file.arrayBuffer();
  const { error: storageError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(storagePath, arrayBuffer, {
      contentType: file.type,
      upsert: false,
    });

  if (storageError) {
    return { error: `Depolama hatası: ${storageError.message}` };
  }

  // --- Retrieve public URL ---

  const {
    data: { publicUrl },
  } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(storagePath);

  // --- Unset existing covers when uploading a new cover image ---

  if (isCover) {
    const coverUpdate: TablesUpdate<"property_images"> = { is_cover: false };
    const { error: unsetError } = await supabase
      .from("property_images")
      .update(coverUpdate)
      .eq("property_id", propertyId)
      .eq("is_cover", true);

    if (unsetError) {
      // Non-fatal: log but continue so the new record is still created.
      console.error(
        "[uploadPropertyImage] Mevcut kapak görseli kaldırılamadı:",
        unsetError.message
      );
    }
  }

  // --- Determine sort_order for the new image ---

  const { data: existingImages } = await supabase
    .from("property_images")
    .select("sort_order")
    .eq("property_id", propertyId)
    .order("sort_order", { ascending: false })
    .limit(1);

  const nextSortOrder =
    existingImages && existingImages.length > 0
      ? (existingImages[0].sort_order ?? 0) + 1
      : 0;

  // --- Insert DB record ---

  const insertPayload: TablesInsert<"property_images"> = {
    property_id: propertyId,
    url: publicUrl,
    alt_text: altTextValue,
    sort_order: nextSortOrder,
    is_cover: isCover,
  };

  const { data: imageRecord, error: dbError } = await supabase
    .from("property_images")
    .insert(insertPayload)
    .select()
    .single();

  if (dbError) {
    // Attempt to clean up the orphaned storage file on DB failure.
    await supabase.storage.from(STORAGE_BUCKET).remove([storagePath]);
    return { error: `Veritabanı hatası: ${dbError.message}` };
  }

  revalidateTag("properties", {});
  return { data: { id: imageRecord.id, url: imageRecord.url } };
}

// ---------------------------------------------------------------------------
// deletePropertyImage
// ---------------------------------------------------------------------------

/**
 * Deletes a property image from both Supabase Storage and the database.
 */
export async function deletePropertyImage(
  imageId: string
): Promise<ActionResult<{ id: string }>> {
  const { error: authError, supabase } = await requireAdmin();
  if (authError || !supabase) {
    return { error: authError ?? "Kimlik doğrulama hatası" };
  }

  // --- Fetch the record to get the storage path ---

  const { data: image, error: fetchError } = await supabase
    .from("property_images")
    .select("id, url, property_id")
    .eq("id", imageId)
    .single();

  if (fetchError || !image) {
    return { error: "Görsel bulunamadı" };
  }

  // Derive the storage path from the public URL.
  // Public URLs follow the pattern:
  //   .../storage/v1/object/public/<bucket>/<path>
  // We need the <path> part that comes after the bucket name.
  const bucketPrefix = `/object/public/${STORAGE_BUCKET}/`;
  const urlObj = (() => {
    try {
      return new URL(image.url);
    } catch {
      return null;
    }
  })();

  const storagePath = urlObj
    ? urlObj.pathname.slice(
        urlObj.pathname.indexOf(bucketPrefix) + bucketPrefix.length
      )
    : null;

  // --- Remove from Storage ---

  if (storagePath) {
    const { error: storageError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove([storagePath]);

    if (storageError) {
      // Surface as a warning but proceed with DB deletion to avoid orphaned
      // DB rows pointing to already-missing Storage objects.
      console.error(
        "[deletePropertyImage] Storage silme hatası:",
        storageError.message
      );
    }
  }

  // --- Remove from DB ---

  const { error: dbError } = await supabase
    .from("property_images")
    .delete()
    .eq("id", imageId);

  if (dbError) {
    return { error: `Veritabanı hatası: ${dbError.message}` };
  }

  revalidateTag("properties", {});
  return { data: { id: imageId } };
}

// ---------------------------------------------------------------------------
// reorderPropertyImages
// ---------------------------------------------------------------------------

/**
 * Updates the `sort_order` of each image according to its position in the
 * provided `imageIds` array (index 0 → sort_order 0, index 1 → sort_order 1,
 * and so on).
 */
export async function reorderPropertyImages(
  propertyId: string,
  imageIds: string[]
): Promise<ActionResult<{ propertyId: string }>> {
  const { error: authError, supabase } = await requireAdmin();
  if (authError || !supabase) {
    return { error: authError ?? "Kimlik doğrulama hatası" };
  }

  if (imageIds.length === 0) {
    return { error: "Sıralanacak görsel listesi boş olamaz" };
  }

  // Fire all updates in parallel for performance.
  const updatePromises = imageIds.map((id, index) =>
    supabase
      .from("property_images")
      .update({ sort_order: index } satisfies TablesUpdate<"property_images">)
      .eq("id", id)
      .eq("property_id", propertyId)
  );

  const results = await Promise.all(updatePromises);

  const firstError = results.find((r) => r.error !== null);
  if (firstError?.error) {
    return { error: `Sıralama güncellenemedi: ${firstError.error.message}` };
  }

  revalidateTag("properties", {});
  return { data: { propertyId } };
}

// ---------------------------------------------------------------------------
// setCoverImage
// ---------------------------------------------------------------------------

/**
 * Marks a single image as the cover photo for a property. Any previously
 * set cover images for the same property are unset first.
 */
export async function setCoverImage(
  imageId: string,
  propertyId: string
): Promise<ActionResult<{ id: string }>> {
  const { error: authError, supabase } = await requireAdmin();
  if (authError || !supabase) {
    return { error: authError ?? "Kimlik doğrulama hatası" };
  }

  // --- Unset all existing covers for this property ---

  const { error: unsetError } = await supabase
    .from("property_images")
    .update({ is_cover: false } satisfies TablesUpdate<"property_images">)
    .eq("property_id", propertyId)
    .eq("is_cover", true);

  if (unsetError) {
    return {
      error: `Mevcut kapak görseli kaldırılamadı: ${unsetError.message}`,
    };
  }

  // --- Set the target image as cover ---

  const { error: setError } = await supabase
    .from("property_images")
    .update({ is_cover: true } satisfies TablesUpdate<"property_images">)
    .eq("id", imageId)
    .eq("property_id", propertyId);

  if (setError) {
    return { error: `Kapak görseli ayarlanamadı: ${setError.message}` };
  }

  revalidateTag("properties", {});
  return { data: { id: imageId } };
}
