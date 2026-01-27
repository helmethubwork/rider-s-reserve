

## Plan: Implement SEO Basics for Production

### Overview
Add essential SEO files and update metadata to improve search engine visibility for helmethub.in

---

### Files to Create/Modify

#### 1. Create Sitemap (NEW FILE)
**File:** `public/sitemap.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://www.helmethub.in/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://www.helmethub.in/products</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://www.helmethub.in/brands</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://www.helmethub.in/store-locator</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://www.helmethub.in/support</loc>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
</urlset>
```

---

#### 2. Update Robots.txt
**File:** `public/robots.txt`

Replace current content with:
```
User-agent: *
Allow: /

Sitemap: https://www.helmethub.in/sitemap.xml
```

This simplifies the file (since `*` covers all bots) and adds the sitemap reference.

---

#### 3. Update index.html SEO Metadata
**File:** `index.html`

**Changes:**

| Element | Current | Updated |
|---------|---------|---------|
| `<title>` | "Helmet Hub – Premium Motorcycle Gear" | "Helmet Hub – Premium Motorcycle Helmets & Riding Gear in India" |
| Meta description | "Shop premium helmets, jackets, gloves..." | "Helmet Hub offers premium motorcycle helmets, riding gear, and accessories from top brands in India. Shop safe, certified, and stylish helmets online." |
| OG title | "Helmet Hub - Premium Motorcycle Gear" | "Helmet Hub – Premium Motorcycle Helmets & Riding Gear in India" |
| OG description | Short version | Updated to match meta description |

---

### Technical Details

**Line changes in index.html:**
- Line 7: Update `<title>` tag
- Line 8: Update `<meta name="description">` content
- Line 11: Update `og:title` content
- Line 12: Update `og:description` content

**New file structure:**
```
public/
├── _redirects
├── favicon.png
├── og-image.png
├── placeholder.svg
├── robots.txt      <- Modified
└── sitemap.xml     <- New
```

---

### What This Does NOT Change
- No localStorage usage
- No Lovable branding added
- No existing functionality modified
- Only SEO-related files and metadata updated

---

### SEO Benefits
1. Search engines can discover and index all important pages via sitemap
2. Improved title includes location (India) for local SEO
3. Better meta description with keywords: helmets, riding gear, certified, online
4. Consistent Open Graph metadata for social sharing

