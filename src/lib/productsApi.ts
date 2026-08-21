/**
 * Admin write access to the product catalog (Cloudflare D1, via /api/products).
 *
 * Every write requires the current admin's Supabase session token — the API
 * verifies it server-side (same pattern as uploadImage.ts / upload-url.ts).
 * Orders, profiles, and auth are unaffected; only products live in D1.
 */

import { supabase } from '@/lib/supabase';
import type { SupabaseProduct } from '@/hooks/useProducts';

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

export interface ProductInput {
  id?: string;
  name: string;
  price: number;
  stock?: number;
  image_url?: string | null;
  category?: string | null;
  category_id?: string | null;
  brand_id?: string | null;
  sizes?: string[];
  colors?: string[];
  description?: string | null;
  is_featured?: boolean;
  is_on_sale?: boolean;
  sale_price?: number | null;
  sale_badge?: string | null;
  display_order?: number;
}

export async function createProductD1(input: ProductInput): Promise<SupabaseProduct> {
  const res = await fetch('/api/products', {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify(input),
  });
  return parseOrThrow(res);
}

export async function updateProductD1(id: string, input: ProductInput): Promise<SupabaseProduct> {
  const res = await fetch(`/api/products?id=${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: await authHeaders(),
    body: JSON.stringify(input),
  });
  return parseOrThrow(res);
}

export async function patchProductD1(
  id: string,
  patch: { is_active?: boolean; image_url?: string | null }
): Promise<SupabaseProduct> {
  const res = await fetch(`/api/products?id=${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: await authHeaders(),
    body: JSON.stringify(patch),
  });
  return parseOrThrow(res);
}

export async function deleteProductD1(id: string): Promise<void> {
  const res = await fetch(`/api/products?id=${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: await authHeaders(),
  });
  await parseOrThrow(res);
}

// Fetch every product regardless of is_active, for the admin list view.
export async function fetchAllProductsD1(): Promise<SupabaseProduct[]> {
  const res = await fetch('/api/products?active=all');
  return parseOrThrow(res);
}
