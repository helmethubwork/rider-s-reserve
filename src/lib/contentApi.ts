/**
 * Generic client for the content tables that live in Cloudflare D1
 * (brands, categories, hero_slides, featured_promos, site_settings,
 * store_locations, instagram_reels, blog_posts, faqs, navigation_links,
 * content_pages, collections, product_collections) — see api/products.ts's
 * handleContentTable() for the server side. Reached via /api/products?table=.
 *
 * Public reads need no auth. Writes attach the current admin's Supabase
 * session token, verified server-side (same pattern as productsApi.ts).
 */
import { supabase } from '@/lib/supabase';

export type ContentTable =
  | 'brands'
  | 'categories'
  | 'hero_slides'
  | 'featured_promos'
  | 'store_locations'
  | 'instagram_reels'
  | 'blog_posts'
  | 'faqs'
  | 'navigation_links'
  | 'content_pages'
  | 'collections';

async function authHeaders(): Promise<Record<string, string>> {
  const { data: { session } } = await supabase.auth.getSession();
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${session?.access_token ?? ''}`,
  };
}

async function parseOrThrow(res: Response) {
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error || `Request failed (HTTP ${res.status})`);
  return body;
}

export async function fetchContentList<T = any>(table: ContentTable, params: Record<string, string> = {}): Promise<T[]> {
  const qs = new URLSearchParams({ table, ...params }).toString();
  const res = await fetch(`/api/products?${qs}`);
  return parseOrThrow(res);
}

export async function fetchContentById<T = any>(table: ContentTable, id: string): Promise<T | null> {
  const res = await fetch(`/api/products?table=${table}&id=${encodeURIComponent(id)}`);
  if (res.status === 404) return null;
  return parseOrThrow(res);
}

export async function fetchContentBySlug<T = any>(table: ContentTable, slug: string): Promise<T | null> {
  const res = await fetch(`/api/products?table=${table}&slug=${encodeURIComponent(slug)}`);
  if (res.status === 404) return null;
  return parseOrThrow(res);
}

export async function createContentRow<T = any>(table: ContentTable, input: Record<string, unknown>): Promise<T> {
  const res = await fetch(`/api/products?table=${table}`, {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify(input),
  });
  return parseOrThrow(res);
}

export async function updateContentRow<T = any>(table: ContentTable, id: string, input: Record<string, unknown>): Promise<T> {
  const res = await fetch(`/api/products?table=${table}&id=${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: await authHeaders(),
    body: JSON.stringify(input),
  });
  return parseOrThrow(res);
}

export async function patchContentRow<T = any>(table: ContentTable, id: string, patch: Record<string, unknown>): Promise<T> {
  const res = await fetch(`/api/products?table=${table}&id=${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: await authHeaders(),
    body: JSON.stringify(patch),
  });
  return parseOrThrow(res);
}

export async function deleteContentRow(table: ContentTable, id: string): Promise<void> {
  const res = await fetch(`/api/products?table=${table}&id=${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: await authHeaders(),
  });
  await parseOrThrow(res);
}

// site_settings is keyed by setting_key, not id — separate helpers.
export async function fetchAllSettings<T = any>(): Promise<T[]> {
  const res = await fetch('/api/products?table=site_settings');
  return parseOrThrow(res);
}

export async function fetchSetting<T = any>(key: string): Promise<T | null> {
  const res = await fetch(`/api/products?table=site_settings&key=${encodeURIComponent(key)}`);
  if (res.status === 404) return null;
  return parseOrThrow(res);
}

export async function updateSetting<T = any>(key: string, setting_value: string): Promise<T> {
  const res = await fetch(`/api/products?table=site_settings&key=${encodeURIComponent(key)}`, {
    method: 'PUT',
    headers: await authHeaders(),
    body: JSON.stringify({ setting_value }),
  });
  return parseOrThrow(res);
}

// product_collections junction table — keyed by (product_id, collection_id).
export async function fetchCollectionsForProduct(productId: string): Promise<string[]> {
  const res = await fetch(`/api/products?table=product_collections&product_id=${encodeURIComponent(productId)}`);
  return parseOrThrow(res);
}

export async function fetchProductsForCollection(collectionId: string): Promise<string[]> {
  const res = await fetch(`/api/products?table=product_collections&collection_id=${encodeURIComponent(collectionId)}`);
  return parseOrThrow(res);
}

export async function addProductToCollection(productId: string, collectionId: string): Promise<void> {
  const res = await fetch('/api/products?table=product_collections', {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify({ product_id: productId, collection_id: collectionId }),
  });
  await parseOrThrow(res);
}

export async function removeProductFromCollection(productId: string, collectionId?: string): Promise<void> {
  const qs = new URLSearchParams({ table: 'product_collections', product_id: productId });
  if (collectionId) qs.set('collection_id', collectionId);
  const res = await fetch(`/api/products?${qs.toString()}`, {
    method: 'DELETE',
    headers: await authHeaders(),
  });
  await parseOrThrow(res);
}
