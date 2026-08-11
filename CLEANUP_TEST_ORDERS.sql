-- ============================================================
--  HELMET HUB — Clear Test Orders & Reset Order Counter
-- ============================================================
--  Run this in: Supabase Dashboard → SQL Editor
--
--  ⚠️  THIS PERMANENTLY DELETES DATA. Read each step first.
--  ⚠️  Run STEP 1 alone first to see what will be deleted.
-- ============================================================


-- ------------------------------------------------------------
-- STEP 1 — PREVIEW (safe, deletes nothing)
-- Run this FIRST and check the list is only test orders.
-- ------------------------------------------------------------
SELECT
  order_number,
  customer_name,
  customer_email,
  total_amount,
  payment_status,
  order_status,
  created_at
FROM orders
ORDER BY created_at DESC;


-- ------------------------------------------------------------
-- STEP 2 — COUNT (safe, deletes nothing)
-- How many orders and order items exist right now.
-- ------------------------------------------------------------
SELECT
  (SELECT COUNT(*) FROM orders)      AS total_orders,
  (SELECT COUNT(*) FROM order_items) AS total_order_items;


-- ------------------------------------------------------------
-- STEP 3 — BACKUP (recommended before deleting)
-- Copies every order into a backup table you can restore from.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS orders_backup_pre_launch AS
  SELECT * FROM orders;

CREATE TABLE IF NOT EXISTS order_items_backup_pre_launch AS
  SELECT * FROM order_items;

-- Verify the backup worked before continuing:
SELECT
  (SELECT COUNT(*) FROM orders_backup_pre_launch)      AS backed_up_orders,
  (SELECT COUNT(*) FROM order_items_backup_pre_launch) AS backed_up_items;


-- ------------------------------------------------------------
-- STEP 4 — DELETE ALL TEST ORDERS
-- ⚠️  DESTRUCTIVE. Only run after Steps 1–3 look correct.
-- order_items must be deleted first (foreign key constraint).
-- ------------------------------------------------------------
DELETE FROM order_items;
DELETE FROM orders;

-- Confirm both tables are now empty:
SELECT
  (SELECT COUNT(*) FROM orders)      AS remaining_orders,
  (SELECT COUNT(*) FROM order_items) AS remaining_items;


-- ------------------------------------------------------------
-- STEP 5 — RESET THE ORDER NUMBER COUNTER
-- Real orders will start from HH1001.
-- ------------------------------------------------------------

-- First, see how the counter is currently stored:
SELECT prosrc
FROM pg_proc
WHERE proname = 'next_order_number';

-- The counter is almost certainly a Postgres SEQUENCE.
-- List all sequences to find its exact name:
SELECT sequence_name
FROM information_schema.sequences
WHERE sequence_schema = 'public';

-- Then reset it (replace <sequence_name> with what you found above,
-- it is likely 'order_number_seq'):
--
--   ALTER SEQUENCE order_number_seq RESTART WITH 1001;
--
-- Uncomment and run the line below once you've confirmed the name:

-- ALTER SEQUENCE order_number_seq RESTART WITH 1001;


-- ------------------------------------------------------------
-- STEP 6 — VERIFY
-- Generates the next order number without creating an order.
-- Should return something like HH1001.
-- ------------------------------------------------------------
SELECT next_order_number();


-- ------------------------------------------------------------
-- STEP 7 — (LATER) DROP THE BACKUP
-- Only run this weeks later, once real orders are flowing
-- and you are certain you do not need the test data back.
-- ------------------------------------------------------------
-- DROP TABLE IF EXISTS orders_backup_pre_launch;
-- DROP TABLE IF EXISTS order_items_backup_pre_launch;
