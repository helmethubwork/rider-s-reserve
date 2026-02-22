

## Update Shipping Policy to Include Delivery Charges Section

### Problem
The Shipping Policy page loads content from the database, which was created before the "Delivery Charges" section was added. The static fallback has the section, but it's never used because the database content takes priority.

### Solution
Modify `src/pages/ShippingPolicyPage.tsx` to append the "Delivery Charges" section to the database content if it doesn't already include it. This ensures the section appears regardless of the content source.

### Technical Details

**File: `src/pages/ShippingPolicyPage.tsx`**

- Define the Delivery Charges HTML snippet as a constant
- On line 43, after resolving the content (db or static), check if the content already contains a "Delivery Charges" heading
- If not, append the Delivery Charges HTML to the end of the content
- This is a non-breaking change: if the admin later adds the section via the database, it won't be duplicated

