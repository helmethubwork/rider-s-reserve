

## Fix: "Could not find 'customer_email' column" Error

The `orders` table in your Supabase database is missing several columns that the checkout code tries to insert into. The table needs to be updated to match what the code expects.

### What's Wrong

The code in `useOrders.ts` tries to insert these fields into the `orders` table, but they don't exist in the database:
- `customer_email`
- `customer_name`
- `customer_phone`
- `shipping_address`

### Fix: Add Missing Columns via Migration

Create a Supabase migration to add the missing columns to the `orders` table:

```sql
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS customer_email text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS customer_name text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS customer_phone text,
  ADD COLUMN IF NOT EXISTS shipping_address text NOT NULL DEFAULT '';
```

This single migration will add all four columns the checkout flow needs.

### Also Needed: RLS Policies

As discussed in the previous plan, the following RLS policies are still required if not already added:

1. INSERT policy on `orders` for `authenticated` and `anon`
2. SELECT policy on `orders` for `authenticated` and `anon`
3. INSERT policy on `order_items` for `authenticated` and `anon`

### No Code Changes Needed

The existing `useOrders.ts` and `CheckoutPage.tsx` code is correct -- only the database schema needs to be updated.
