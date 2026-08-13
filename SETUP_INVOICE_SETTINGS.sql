-- ============================================================
--  HELMET HUB — Invoice Settings
-- ============================================================
--  Run in: Supabase Dashboard → SQL Editor
--  Safe: only inserts new settings rows, changes nothing existing.
--
--  After running, edit these from Admin → Settings → Invoice.
-- ============================================================

INSERT INTO site_settings (setting_key, setting_value, category, label, description, display_order)
VALUES
  ('invoice_business_name', 'HELMET HUB', 'invoice',
   'Business Name', 'Printed at the top of every invoice', 1),

  ('invoice_address',
   'HELMET HUB, 1st Floor, Besides Little Goa, Opp. Omega Hospital, Gachibowli, Hyderabad - 500033',
   'invoice', 'Business Address', 'Full address shown on the invoice', 2),

  ('invoice_state', 'Telangana', 'invoice',
   'State', 'State name shown under the address', 3),

  ('invoice_phone', '+91 7842646888', 'invoice',
   'Contact Phone', 'Phone number printed on the invoice', 4),

  ('invoice_email', 'support@helmethub.in', 'invoice',
   'Contact Email', 'Email printed on the invoice', 5),

  ('invoice_gstin', '', 'invoice',
   'Company GSTIN', 'Leave blank until GST registration is approved. Hidden on the invoice when empty.', 6),

  ('invoice_prefix', 'HH', 'invoice',
   'Invoice Number Prefix', 'Prefix before the invoice reference number', 7),

  ('invoice_terms',
   'Goods once sold will not be returned. Only replacement within 48 hours. Invoice and tags are compulsory for replacement. Exchange applies to size issues only and excludes sale items, luggage and accessories.',
   'invoice', 'Terms & Conditions', 'Printed at the bottom of every invoice', 8),

  ('invoice_footer_note', 'Thank you for shopping with Helmet Hub. Ride safe.', 'invoice',
   'Footer Note', 'Friendly closing line on the invoice', 9)
ON CONFLICT (setting_key) DO NOTHING;


-- Verify
SELECT setting_key, setting_value, label
FROM site_settings
WHERE category = 'invoice'
ORDER BY display_order;
