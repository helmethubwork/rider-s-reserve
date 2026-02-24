

## Diagnosis: "Failed to create order" on Checkout

The error occurs when Supabase rejects the INSERT into the `orders` table. The order creation in `useOrders.ts` does two things:
1. SELECT from `orders` to generate the next order number
2. INSERT into `orders` and `order_items`

If RLS policies don't allow these operations for authenticated/anonymous users, the insert fails silently and shows "Failed to create order".

---

## Fix: Update Supabase RLS Policies

This requires changes in your **Supabase Dashboard** (not code changes):

### Step 1: Add INSERT policy on `orders` table
Go to Supabase Dashboard > Authentication > Policies > `orders` table and add:

```text
Policy name: "Allow users to create orders"
Operation: INSERT
Target roles: authenticated, anon
WITH CHECK: true
```

This allows both logged-in and guest users to place orders.

### Step 2: Add SELECT policy on `orders` table
Needed for the order number generation query:

```text
Policy name: "Allow reading orders for number generation"  
Operation: SELECT
Target roles: authenticated, anon
USING: true
```

Or more restrictively, allow users to only read their own orders:

```text
USING: (auth.uid() = user_id) OR (user_id IS NULL)
```

### Step 3: Add INSERT policy on `order_items` table

```text
Policy name: "Allow users to create order items"
Operation: INSERT
Target roles: authenticated, anon
WITH CHECK: true
```

### Step 4 (Code improvement): Better error handling

Update `CheckoutPage.tsx` to show the actual Supabase error message in the toast instead of a generic "Failed to create order", making future debugging easier.

---

## Technical Details

The current flow in `useOrders.ts`:
1. `generateOrderNumber()` - SELECT latest order (needs SELECT policy)
2. INSERT into `orders` (needs INSERT policy)  
3. INSERT into `order_items` (needs INSERT policy)

All three operations must be permitted by RLS for checkout to work.

