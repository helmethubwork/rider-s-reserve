

## Fix Guest Checkout for Cashfree Payment

### Problem
Guest (non-logged-in) users cannot complete checkout because:
1. **Invalid `customer_id`** — Cashfree requires alphanumeric-only `customer_id`, but guest checkout passes raw email (contains `@`, `.`)
2. **Possible RLS blocking** — Supabase may block anonymous order creation if policies are missing for the `anon` role

### Changes

#### 1. Sanitize `customerId` in CheckoutPage (`src/pages/CheckoutPage.tsx`, line 130)
Replace:
```typescript
customerId: user?.id || formData.email,
```
With:
```typescript
customerId: user?.id || `guest_${formData.email.replace(/[^a-zA-Z0-9]/g, '_')}`,
```

#### 2. Improve error logging (same file, lines 136-141)
Add full response logging before throwing:
```typescript
const data = await res.json();

if (!res.ok) {
  console.error('Cashfree API error — status:', res.status, 'body:', JSON.stringify(data));
  throw new Error(data.error || data.message || 'Failed to initiate payment');
}
```

#### 3. Supabase RLS Policies (migration)
Based on the memory note, these policies may already exist. The plan will verify and add if missing:

```sql
-- Allow guest and authenticated users to insert orders
CREATE POLICY "Allow anon insert orders" ON public.orders
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow authenticated insert orders" ON public.orders
  FOR INSERT TO authenticated WITH CHECK (true);

-- Allow select for order number generation
CREATE POLICY "Allow anon select orders" ON public.orders
  FOR SELECT TO anon USING (true);

CREATE POLICY "Allow authenticated select orders" ON public.orders
  FOR SELECT TO authenticated USING (true);

-- Order items
CREATE POLICY "Allow anon insert order_items" ON public.order_items
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow authenticated insert order_items" ON public.order_items
  FOR INSERT TO authenticated WITH CHECK (true);
```

Note: Per the memory (`checkout-architecture`), these policies should already exist. The migration will use `IF NOT EXISTS` or be skipped if already present — will verify during implementation.

#### 4. No other file changes needed
The `useOrders.ts` hook and `api/create-cashfree-order.ts` are correct as-is.

