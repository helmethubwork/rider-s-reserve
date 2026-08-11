-- ============================================================
--  HELMET HUB — Exclusive Collections Setup
-- ============================================================
--  Run this in: Supabase Dashboard → SQL Editor
--  Safe to run — only creates new tables, touches nothing existing.
-- ============================================================


-- ------------------------------------------------------------
-- 1. COLLECTIONS TABLE
--    The circular category cards on the homepage.
--    Admin can rename, reorder, hide, or change images anytime.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS collections (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name          text NOT NULL,
  slug          text NOT NULL UNIQUE,
  image_url     text,
  display_order integer NOT NULL DEFAULT 0,
  is_active     boolean NOT NULL DEFAULT true,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS collections_active_order_idx
  ON collections (is_active, display_order);


-- ------------------------------------------------------------
-- 2. PRODUCT ↔ COLLECTION JOIN TABLE
--    Lets one product belong to several collections
--    (e.g. a ₹900 helmet is both "Under 1000" and "ECE 23.06").
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS product_collections (
  product_id    uuid NOT NULL REFERENCES products(id)    ON DELETE CASCADE,
  collection_id uuid NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  created_at    timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (product_id, collection_id)
);

CREATE INDEX IF NOT EXISTS product_collections_collection_idx
  ON product_collections (collection_id);


-- ------------------------------------------------------------
-- 3. SEED THE FOUR STARTING COLLECTIONS
--    Admin can rename these later from the admin panel.
-- ------------------------------------------------------------
INSERT INTO collections (name, slug, display_order) VALUES
  ('Under 1000',        'under-1000',   1),
  ('Under 2000',        'under-2000',   2),
  ('ECE 23.06 Certified','ece-2306',    3),
  ('Accessories',       'accessories',  4)
ON CONFLICT (slug) DO NOTHING;


-- ------------------------------------------------------------
-- 4. ROW LEVEL SECURITY
--    Public can READ active collections (needed for the homepage).
--    Only admins can INSERT / UPDATE / DELETE.
-- ------------------------------------------------------------
ALTER TABLE collections         ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_collections ENABLE ROW LEVEL SECURITY;

-- Public read access to collections
DROP POLICY IF EXISTS "collections_public_read" ON collections;
CREATE POLICY "collections_public_read"
  ON collections FOR SELECT
  USING (true);

-- Admin full control over collections
DROP POLICY IF EXISTS "collections_admin_all" ON collections;
CREATE POLICY "collections_admin_all"
  ON collections FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  );

-- Public read access to the join table
DROP POLICY IF EXISTS "product_collections_public_read" ON product_collections;
CREATE POLICY "product_collections_public_read"
  ON product_collections FOR SELECT
  USING (true);

-- Admin full control over the join table
DROP POLICY IF EXISTS "product_collections_admin_all" ON product_collections;
CREATE POLICY "product_collections_admin_all"
  ON product_collections FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  );


-- ------------------------------------------------------------
-- 5. AUTO-UPDATE updated_at ON EDIT
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_collections_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS collections_updated_at ON collections;
CREATE TRIGGER collections_updated_at
  BEFORE UPDATE ON collections
  FOR EACH ROW EXECUTE FUNCTION set_collections_updated_at();


-- ------------------------------------------------------------
-- 6. VERIFY
-- ------------------------------------------------------------
SELECT name, slug, display_order, is_active
FROM collections
ORDER BY display_order;
