## Goal

1. Make Google Search Console verification succeed using the **meta tag** method on `https://www.dynamicshoerack.in`.
2. Optimize SEO for the Bangalore shoe rack business across the site.

No changes to UI, cart, admin, or product functionality.

---

## 1. Google Search Console verification (meta tag)

Add this exact tag inside `<head>` of `index.html` (Lovable serves `index.html` for the root, so this works for both `dynamicshoerack.in` and `www.dynamicshoerack.in`):

```html
<meta name="google-site-verification" content="gkRVGH0xBHD8MWgy3zWZxIPz0UXa6EHULBex6j1CPAo" />
```

Notes for the user:
- Lovable hosting is SPA-based and serves `index.html` for unknown routes. The HTML-file method can fail because the file path may be intercepted by SPA fallback; the **meta tag** method (what you provided) is the right choice and will work after Update/Publish.
- After publishing, in Search Console choose "HTML tag" verification (not "HTML file") and click Verify.

## 2. Domain & canonical updates

Switch all SEO URLs from `rufus-sam.lovable.app` to the new primary domain. Defaulting to **`https://www.dynamicshoerack.in`** as canonical (with non-www working too via Lovable's domain setup). If you prefer root-domain canonical, say so and we'll flip it.

Files to update so canonical/OG/sitemap all point to the new domain:
- `index.html` — title, description, keywords, canonical, OG/Twitter URLs and image, Organization & WebSite JSON-LD `url`/`logo`.
- `src/components/SEO.tsx` — change `SITE_URL` constant to `https://www.dynamicshoerack.in`.
- `public/sitemap.xml` — replace all `<loc>` with new domain.
- `public/robots.txt` — update `Sitemap:` line.

## 3. SEO content rewrite (Bangalore shoe rack focus)

Global defaults in `index.html`:
- **Title:** `Shoe Rack in Bangalore | Free Delivery & Installation – Dynamic Shoe Rack` (≤60 chars target; will trim if needed).
- **Description:** `Buy metal & wooden shoe racks, shoe shelters and shoe cabinets in Bangalore. Free delivery & free installation across the city. Best prices guaranteed.`
- **Keywords:** `shoe rack in Bangalore, shoe shelter, shoe cabinet, metal shoe rack, wooden shoe rack, free delivery, free installation, shoe storage rack Bangalore, multi layer shoe rack`.

Page-level SEO via existing `<SEO />` component (no UI change), updated copy on:
- `Index.tsx` — Bangalore-focused title/description, keep Store schema, add free delivery/installation in description.
- `Products.tsx` — "Shoe Racks in Bangalore – Metal, Wooden & Multi-Layer".
- `ProductDetail.tsx` — already injects Product schema; extend to include `brand: "Dynamic Shoe Rack"` and `areaServed: "Bangalore"` in offers.
- `About.tsx`, `Contact.tsx`, `Hangers.tsx` — Bangalore + free delivery/installation messaging.

## 4. Structured data (JSON-LD)

- **Organization** (in `index.html`) — rename to "Dynamic Shoe Rack", update url/logo to new domain.
- **LocalBusiness** (new, in `index.html`) — built from `src/data/branches.ts`. Use `@type: "Store"` with multiple `location` entries (JP Nagar, Kengeri, KR Puram, Hosur), each with `PostalAddress`, `telephone`, `geo` omitted (no coords), and `hasMap` from `mapsUrl`. Add `areaServed: "Bangalore"`, `priceRange: "₹₹"`, and a primary `telephone`.
- **WebSite + SearchAction** — keep, update URL.
- **Product schema** — already in `ProductDetail.tsx`, just verify domain in URLs/images.

## 5. Sitemap & robots

`public/sitemap.xml` — refresh `<loc>` to new domain and add `<lastmod>` dates. Routes:
- `/`, `/products`, `/products/hangers`, `/about`, `/contact`.

`public/robots.txt` — keep current Disallow list; update Sitemap URL to `https://www.dynamicshoerack.in/sitemap.xml`.

## 6. Open Graph / Twitter

In `index.html` and `SEO.tsx`:
- `og:site_name` = "Dynamic Shoe Rack"
- `og:locale` = `en_IN`
- `og:url` = canonical
- `og:image` = `https://www.dynamicshoerack.in/og-image.jpg` (existing file)
- Twitter card already `summary_large_image` — keep.

## 7. Out of scope (explicitly not touched)

- React components/UI, routing, cart, checkout, admin pages, Supabase queries, product CRUD.
- No `_redirects`, `vercel.json`, `netlify.toml` (Lovable hosting handles SPA fallback automatically).

## Technical change list

| File | Change |
|---|---|
| `index.html` | Add google-site-verification meta; rewrite title/desc/keywords/OG/canonical to new domain; add LocalBusiness JSON-LD from branches; update Organization JSON-LD |
| `src/components/SEO.tsx` | `SITE_URL` → `https://www.dynamicshoerack.in`; default `og:site_name` → "Dynamic Shoe Rack" |
| `public/sitemap.xml` | New domain in all `<loc>`, add `<lastmod>` |
| `public/robots.txt` | New `Sitemap:` URL |
| `src/pages/Index.tsx` | Bangalore-focused SEO copy |
| `src/pages/Products.tsx` | Bangalore-focused SEO copy |
| `src/pages/ProductDetail.tsx` | Add brand + areaServed in Product/Offer JSON-LD |
| `src/pages/About.tsx`, `Contact.tsx`, `Hangers.tsx` | Bangalore + free delivery/installation messaging in SEO tags |

## After implementation (you will do)

1. Click **Update** in the Publish dialog so the new `index.html` (with the verification meta) goes live.
2. In Search Console, choose **HTML tag** method and click **Verify**.
3. Submit `https://www.dynamicshoerack.in/sitemap.xml` in Search Console → Sitemaps.
