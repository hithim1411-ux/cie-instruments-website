# CIE Instruments Website

Marketing and product-catalogue website for **Cambridge Instruments & Engg. Co. (CIE)**, Howrah — built with Astro + Tailwind CSS v4.

---

## Running locally

```sh
npm install
npm run dev        # dev server at http://localhost:4321
npm run build      # build static output to ./dist/
npm run preview    # preview the production build locally
```

---

## Editing product data

All product and category information lives in `src/data/`:

| File | What it controls |
|---|---|
| `src/data/products.json` | Every product: model code, name, description, spec table, applications |
| `src/data/categories.json` | Category names, descriptions, icons, and URL slugs |
| `src/data/site.json` | Phone numbers, addresses, email, WhatsApp number, form endpoint |

### Adding a product

1. Open `src/data/products.json`.
2. Copy an existing product object and add it to the array.
3. Set `categoryId` to the matching `id` from `categories.json`.
4. The URL will be `/products/<categoryId>/<id>` — make sure `id` is URL-safe (lowercase, hyphens only).
5. Run `npm run build` and the page is generated automatically.

### Editing specs

Each product has a `specs` array:
```json
{ "label": "Test Voltages", "value": "100 V / 250 V / 500 V" }
```
Edit the `value` field. The label appears in the spec table header.

---

## Configuring the enquiry form

The form in `src/components/EnquiryForm.astro` submits to the endpoint in `src/data/site.json`:

```json
"formEndpoint": "https://formspree.io/f/YOUR_FORM_ID"
```

**Steps to wire it up:**
1. Create a free account at [formspree.io](https://formspree.io).
2. Create a new form — use `cieinstruments@gmail.com` as the recipient.
3. Copy the form endpoint (looks like `https://formspree.io/f/abcdefgh`).
4. Paste it as the value of `formEndpoint` in `src/data/site.json`.

The form already has spam protection (honeypot field) and sets a redirect URL on success to `/contact?sent=1`.

---

## WhatsApp number

Set in `src/data/site.json`:
```json
"whatsapp": "919830091260"
```
Format: country code + number, **no spaces, no `+`**. The floating WhatsApp button and all per-product deep links use this value.

---

## Logo files

Place logo files in `public/logo/`:

| File | Where it's used |
|---|---|
| `cie-logo-light.png` (or `.svg`) | Header and Footer (dark navy background) |
| `cie-logo-dark.png` (or `.svg`) | Light backgrounds (if needed) |

The Header and Footer reference `cie-logo-light.png` by default. If only an SVG is available, rename it accordingly or update the `src` attribute in `src/components/Header.astro` and `src/components/Footer.astro`.

If the image fails to load, the header automatically falls back to a text logo (`CIE`).

---

## Adding product photos

Place product images in `public/images/products/` named `<product-id>.jpg` — e.g. `cie-444.jpg`, `rts-33.jpg`.

The product ID matches the `id` field in `products.json`. If no image is found, a "Image coming soon" placeholder is shown automatically.

---

## Deploying to Cloudflare Pages

1. Push this repository to GitHub.
2. Log in to [Cloudflare Pages](https://pages.cloudflare.com/).
3. Click **Create a project** → **Connect to Git** → select your repository.
4. Build settings:
   - **Framework preset:** Astro
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
5. Set your custom domain to `cieinstruments.in` in the Pages project settings.
6. Cloudflare will build and deploy automatically on every push to `main`.

---

## Site configuration

| Setting | File | Field |
|---|---|---|
| Site domain (for canonical URLs / sitemap) | `astro.config.mjs` | `site: 'https://cieinstruments.in'` |
| Phone numbers | `src/data/site.json` | `phones` array |
| Addresses | `src/data/site.json` | `addresses` array |
| Email | `src/data/site.json` | `email` |
| WhatsApp | `src/data/site.json` | `whatsapp` |
| Form endpoint | `src/data/site.json` | `formEndpoint` |

---

## Design system

Colours and fonts are defined as Tailwind v4 theme tokens in `src/styles/global.css` under the `@theme {}` block. Change them in one place and they propagate everywhere.

Key CSS utility classes (also in `global.css`):
- `.eyebrow` — red, monospace, uppercase, letter-spaced section labels
- `.red-stripe` — left red border accent for feature panels
- `.blueprint-bg` — navy background with subtle grid texture
- `.spec-table` — styled specification table
- `.model-code` — monospace model number style
