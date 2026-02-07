

## Plan: Update SEO Structured Data with Correct Helmet Hub Logo

### Problem
The current `og:image` and structured data logo may be showing an incorrect image (possibly AXOR branding instead of Helmet Hub). The user wants to ensure:
1. One consistent primary logo is used across all SEO tags
2. Social links include Instagram, Facebook, and Google Maps

---

### Current State

| Element | Current Value | Issue |
|---------|---------------|-------|
| `og:image` | `/og-image.png` | May be showing AXOR logo instead of Helmet Hub |
| `twitter:image` | `/og-image.png` | Same issue |
| Structured Data logo | `https://www.helmethub.in/og-image.png` | Same issue |
| `sameAs` | Instagram, Twitter | Missing Facebook and Google Maps |

---

### Solution

#### Step 1: You Need to Provide the Correct Logo

Before making code changes, you need to upload or confirm which image should be the primary Helmet Hub logo for social sharing.

**Options:**
1. **Upload a new OG image** - Provide a new image (recommended size: 1200×630 pixels) that shows the Helmet Hub branding clearly
2. **Use existing logo file** - The project has `src/assets/helmet-hub-logo.png` which could be copied to `public/og-image.png`

**Recommended specifications for OG image:**
- Size: 1200 × 630 pixels (or at least 1200 × 627)
- Format: PNG or JPG
- Show the Helmet Hub logo prominently
- Add tagline or brand colors for recognition

---

#### Step 2: Code Changes to `index.html`

Once the correct logo is in place at `public/og-image.png`, update the structured data:

**Update `sameAs` to include:**
```json
"sameAs": [
  "https://www.instagram.com/helmethub46",
  "https://www.facebook.com/helmethub46",
  "https://maps.app.goo.gl/VWFZsQQupJ1oxvVy6"
]
```

**Ensure absolute URLs for images:**
```html
<meta property="og:image" content="https://www.helmethub.in/og-image.png" />
<meta name="twitter:image" content="https://www.helmethub.in/og-image.png" />
```

---

### Files to Modify

| File | Changes |
|------|---------|
| `public/og-image.png` | Replace with official Helmet Hub logo/branding image |
| `index.html` | Update OG/Twitter image URLs to absolute paths, add Facebook and Google Maps to `sameAs` |

---

### Updated Structured Data

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Helmet Hub",
  "url": "https://www.helmethub.in",
  "logo": "https://www.helmethub.in/og-image.png",
  "description": "Premium motorcycle helmets, riding gear, and accessories from top brands in India",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Hyderabad",
    "addressRegion": "Telangana",
    "addressCountry": "IN"
  },
  "sameAs": [
    "https://www.instagram.com/helmethub46",
    "https://www.facebook.com/helmethub46",
    "https://maps.app.goo.gl/VWFZsQQupJ1oxvVy6"
  ]
}
```

---

### What I Need From You

1. **Confirm the Facebook page URL** - Is it `https://www.facebook.com/helmethub46` or a different URL?
2. **Upload the correct OG image** - Either:
   - Upload a new 1200×630 image with Helmet Hub branding, OR
   - Confirm I should copy the existing `src/assets/helmet-hub-logo.png` to replace `public/og-image.png`

Once you provide this information, I can implement the changes immediately.

