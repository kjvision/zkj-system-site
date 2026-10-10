---
name: security-review
description: Security audit checklist for ZKJ VERSE web code and store configuration. Trigger on "security review", "is this safe", "audit this code", before publishing theme changes that handle input, or when adding third-party apps/scripts to the store.
---

# Security Review — ZKJ VERSE

Run this checklist and report findings as: severity (high/medium/low), location, fix.

## Input & output

- Any user input rendered back into a page must be escaped (Liquid `| escape`, never raw `innerHTML` from user data).
- Validate on the server/app side — client-side validation is UX, not security.
- Forms: check for injection in search, contact, newsletter fields.

## Secrets & tokens

- No API keys, tokens, or credentials in theme code, JS, or Git history. Storefront-visible code is public.
- Webhooks and custom apps: verify HMAC signatures on incoming requests.

## Third-party scripts & apps (biggest real risk on a Shopify store)

- Every new app/script: who publishes it, what permissions does it ask for, does it load JS on checkout-adjacent pages?
- Prefer Shopify-reviewed apps; remove apps no longer in use — each one is standing attack surface.
- Pin external script sources; no `http://` resources anywhere (mixed content).

## Store configuration

- Staff accounts: least privilege, 2FA required, remove ex-collaborator access immediately.
- Customer data: never export/store customer lists outside Shopify without a reason and a deletion plan.
- NFT/crypto adjacency: never put wallet seed phrases, private keys, or minting credentials anywhere near the codebase or chat tools.

## Headers & transport

- HTTPS everywhere (Shopify default — verify custom domains/redirects don't downgrade).
- Check for `target="_blank"` links missing `rel="noopener"`.

## Report format

```
[HIGH] stored XSS — snippets/search-result.liquid:14 — user query rendered without | escape → add filter
[LOW]  noopener missing — footer social links → add rel="noopener noreferrer"
```

If nothing is found, say so explicitly and list what was checked.
