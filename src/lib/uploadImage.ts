/**
 * Image upload helper.
 *
 * Uploads to Cloudflare R2 when it is configured, and falls back to Supabase
 * Storage when it is not — so the site keeps working before and after the R2
 * switch, and while credentials are being added.
 *
 * Why R2: Supabase charges for egress, and images are almost all of a shop's
 * bandwidth. R2 serves files for free, which keeps hosting near zero as the
 * catalogue grows.
 *
 * Existing images are untouched. The database stores absolute URLs, so anything
 * already on Supabase keeps loading exactly as before.
 */

import { supabase } from '@/lib/supabase';

export type UploadFolder =
  | 'products'
  | 'categories'
  | 'brands'
  | 'collections'
  | 'hero'
  | 'promos';

/** Base URL for reading R2 objects, e.g. https://cdn.helmethub.in */
export const R2_PUBLIC_URL: string = import.meta.env.VITE_R2_PUBLIC_URL || '';

export const isR2Enabled = () => Boolean(R2_PUBLIC_URL);

/** Build a stable, collision-resistant object name. */
const buildFilename = (file: File, explicitName?: string): string => {
  if (explicitName) return explicitName;
  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext}`;
};

/**
 * Upload an image and return its public URL.
 *
 * @param file          The image to upload
 * @param folder        Logical folder — products, categories, brands, …
 * @param explicitName  Optional exact filename. Used where the app derives URLs
 *                      by convention, such as product colour variants
 *                      (`<productId>-<index>.<ext>`).
 */
export async function uploadImage(
  file: File,
  folder: UploadFolder,
  explicitName?: string
): Promise<string> {
  const filename = buildFilename(file, explicitName);

  // ---------- Preferred path: Cloudflare R2 ----------
  if (isR2Enabled()) {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      const signRes = await fetch('/api/upload-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token ?? ''}`,
        },
        body: JSON.stringify({
          folder,
          filename,
          contentType: file.type,
          size: file.size,
        }),
      });

      const signed = await signRes.json();

      if (signRes.ok && signed.uploadUrl) {
        // Browser uploads straight to R2 — no Vercel bandwidth, no size limit
        const putRes = await fetch(signed.uploadUrl, {
          method: 'PUT',
          headers: { 'Content-Type': file.type },
          body: file,
        });

        if (!putRes.ok) {
          throw new Error(`R2 rejected the upload (HTTP ${putRes.status})`);
        }
        return signed.publicUrl as string;
      }

      // 501 means R2 env vars are missing — drop through to Supabase
      if (!signed?.fallback) {
        throw new Error(signed?.error || 'Could not prepare upload');
      }
    } catch (err) {
      console.warn('R2 upload failed, falling back to Supabase Storage:', err);
    }
  }

  // ---------- Fallback: Supabase Storage ----------
  const path = `${folder}/${filename}`;
  const { error } = await supabase.storage
    .from('product-images')
    .upload(path, file, { cacheControl: '31536000', upsert: true });

  if (error) throw new Error(error.message || 'Failed to upload image');

  const { data } = supabase.storage.from('product-images').getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Public URL for an image that is addressed by convention rather than stored,
 * such as a product's colour-variant images.
 */
export function publicImageUrl(folder: UploadFolder, filename: string): string {
  if (isR2Enabled()) {
    return `${R2_PUBLIC_URL.replace(/\/$/, '')}/${folder}/${filename}`;
  }
  const { data } = supabase.storage
    .from('product-images')
    .getPublicUrl(`${folder}/${filename}`);
  return data.publicUrl;
}

/** Delete an uploaded image. Best-effort — never blocks the caller. */
export async function deleteImage(url: string): Promise<void> {
  try {
    if (isR2Enabled() && url.startsWith(R2_PUBLIC_URL)) {
      const { data: { session } } = await supabase.auth.getSession();
      // Same endpoint as uploads — DELETE verb removes the object.
      // Kept in one function to stay within Vercel's 12-function Hobby limit.
      await fetch('/api/upload-url', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token ?? ''}`,
        },
        body: JSON.stringify({ url }),
      });
      return;
    }

    const marker = '/product-images/';
    const idx = url.indexOf(marker);
    if (idx !== -1) {
      const path = url.slice(idx + marker.length).split('?')[0];
      await supabase.storage.from('product-images').remove([path]);
    }
  } catch (err) {
    console.warn('Image delete failed (non-fatal):', err);
  }
}
