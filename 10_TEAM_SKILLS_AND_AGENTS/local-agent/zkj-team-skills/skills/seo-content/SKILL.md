---
name: seo-content
description: SEO rules for zkjverse.com — meta tags, alt text, headings, keywords, structured content for an art e-commerce store. Trigger on "SEO", "meta description", "alt text", "ranking", "search traffic", or when creating/editing any page on the site.
---

# SEO — zkjverse.com

## Keyword territory

Primary: digital art Dubai, limited edition art prints, acrylic art prints, NFT art prints, urban photography Dubai.
Secondary: surreal digital art, architecture photography prints, collectible digital art, smart digital notebooks.
Long-tail wins for us — "limited edition acrylic print Dubai skyline" beats "art".

## Page rules

- One `h1` per page, containing the primary keyword naturally.
- Meta title ≤60 chars, meta description 140–155 chars with a reason to click, not a keyword list.
- Every image gets descriptive alt text (artwork content, medium, collection). This is also accessibility — non-negotiable.
- Product URLs: keep Shopify handle clean and keyword-bearing (`/products/unknown-presence-obsidian-mind` ✓).

## Structured data

- Products must emit `Product` schema with price, availability, and `offers` (most Shopify themes do — verify, don't assume).
- Add `Article` schema to any blog/journal posts.

## Content strategy

- Collector-intent content ranks and converts: artist story, making-of, "how limited editions work", print care guides.
- Each YouTube video gets a companion written page on the site (embeds video, transcribes key points) — search traffic compounds, social doesn't.
- Internal-link every content page to at least one collection and one product.

## Bilingual note

If/when Arabic pages launch (Shopify Markets/Translate), use proper `hreflang` pairs — never machine-translate product stories; rewrite them per `arabic-content`.

## Don'ts

- Don't keyword-stuff; brand voice comes first, keywords fit inside it.
- Don't duplicate meta descriptions across products.
- Don't remove or rename existing product URLs without a 301 redirect.
