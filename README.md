# SallusTech — Website Package

A complete, ready-to-deploy static website that ties all your tools together under one
branded hub at **sallustech.store**. It is plain HTML, CSS and JavaScript — no build step,
no framework, no server required. Upload it as-is and it works.

The hub, navigation, all the supporting pages, and a fully working **Grade Converter** are
built and finished. The four larger apps (PDF Studio, Image Studio, Email Crafter, Universal TV)
have labelled slots where you drop in **your own** latest files — see Step 1.

---

## Folder structure

```
sallustech-hub/
├── index.html            ← the hub / landing page (the menu)
├── about.html
├── contact.html          ← EDIT your email + channel links before publishing
├── privacy.html          ← required for AdSense (review for your region)
├── 404.html
├── ads.txt               ← already contains your AdSense publisher line
├── CNAME                 ← contains "sallustech.store" (for GitHub Pages)
├── robots.txt
├── sitemap.xml
├── assets/
│   ├── css/styles.css     ← shared design system (one place to rebrand)
│   └── js/main.js
└── tools/
    ├── pdf-studio/index.html      ← REPLACE with your file (placeholder for now)
    ├── image-studio/index.html    ← REPLACE with your file (placeholder for now)
    ├── email-crafter/index.html   ← REPLACE with your file (placeholder for now)
    ├── universal-tv/index.html    ← REPLACE with your file (placeholder for now)
    └── grade-converter/index.html ← DONE — fully working, no action needed
```

---

## Step 1 — Drop in your own tool files

Each big app you already built is a single HTML file. Put it in the matching folder and
rename it to `index.html`. The hub already links to each folder, so the menu works the
instant you do this.

| Tool on the hub | Folder to put it in | Your file → rename to |
|---|---|---|
| PDF Studio | `tools/pdf-studio/` | `sallustech-pdf-studio.html` → `index.html` |
| Image Studio | `tools/image-studio/` | `sallustech-image-studio.html` → `index.html` |
| Email Crafter | `tools/email-crafter/` | your MailCraft Studio file → `index.html` |
| Universal TV | `tools/universal-tv/` | your web player file → `index.html` |
| Grade Converter | `tools/grade-converter/` | already built — leave it |

Your app files are self-contained, so nothing inside them needs editing. Any backend they
already use (Apps Script relay URLs, tokens, AdSense IDs) keeps working unchanged.

> **Optional — a “back to hub” button inside your own apps.** If you want a consistent way
> back to the menu from inside each app *without changing its structure*, paste this one line
> just before `</body>` in any tool file:
>
> ```html
> <a href="/" style="position:fixed;left:16px;bottom:16px;z-index:9999;display:inline-flex;align-items:center;gap:8px;background:#18233b;color:#fff;font:600 14px Inter,sans-serif;padding:10px 14px;border-radius:11px;text-decoration:none;box-shadow:0 6px 18px rgba(0,0,0,.18)">&larr; SallusTech</a>
> ```

---

## Step 2 — Test it locally (optional but recommended)

Open a terminal in the `sallustech-hub` folder and run any one of these, then visit
`http://localhost:8000`:

```bash
python3 -m http.server 8000
# or:  npx serve .
```

Click through the hub → each tool → back. Confirm the Grade Converter works end to end.

---

## Step 3 — Deploy (free)

### Option A — GitHub Pages (recommended)
1. Create a new repository on GitHub.
2. Upload the **contents** of `sallustech-hub/` to the repo root (so `index.html` is at the top).
3. Repo **Settings → Pages** → Source: *Deploy from a branch* → `main` / `root` → Save.
4. The `CNAME` file is already included, so your custom domain registers automatically.

### Option B — Cloudflare Pages
1. Create a Pages project and connect the repo (or drag-and-drop the folder in the dashboard).
2. Framework preset: *None*. Build command: *(blank)*. Output directory: `/`.
3. Add `sallustech.store` as a custom domain in the project settings.

Either host gives you free hosting and free HTTPS.

---

## Step 4 — Connect your domain (sallustech.store)

At your domain registrar's DNS panel:

**For GitHub Pages** — add four A records on the apex domain plus a CNAME for `www`:
```
A      @     185.199.108.153
A      @     185.199.109.153
A      @     185.199.110.153
A      @     185.199.111.153
CNAME  www   <your-github-username>.github.io
```
Then in repo **Settings → Pages**, set the custom domain to `sallustech.store` and tick
**Enforce HTTPS** once the certificate is issued.

**For Cloudflare Pages** — point your domain's nameservers to the two Cloudflare nameservers
shown in your Cloudflare dashboard; the custom domain and SSL are then handled for you.

DNS changes can take anywhere from a few minutes to a few hours to propagate.

---

## Step 5 — Before you publish: quick edits

- **contact.html** — replace `hello@sallustech.store` with your real email, and point the
  YouTube/Web links to your real URLs (search for `EDIT:` in the file).
- **privacy.html** — review the wording for your audience and region (a note is included).

---

## Step 6 — AdSense (when you're ready)

`ads.txt` already contains your publisher line:
```
google.com, pub-2989173811138340, DIRECT, f08c47fec0942fa0
```
Once the site is live on your domain:
1. In the AdSense dashboard → **Sites → New site**, add `sallustech.store` and request review.
2. After approval, open `index.html` (and the other pages) and **uncomment** the AdSense
   loader line in the `<head>` — it's already there with your publisher ID, marked
   `ADSENSE SLOT`.

Because the site is on your own domain with full `<head>` access and a real `ads.txt`,
verification will go through cleanly — which is exactly what a Google Sites URL can't do.

---

## Rebranding in one place

- **Colours, fonts, spacing** — all defined as variables at the top of `assets/css/styles.css`.
  Change `--navy` and `--accent` to recolour the whole site.
- **Add a new tool** — create `tools/<your-tool>/index.html`, then copy one of the existing
  `<a class="card">` blocks in `index.html` and point it at the new folder.
- **Brand name** — search `SallusTech` across the HTML files.

---

Built for Salsabeel · SallusTech · *TechTalk by Sallu*
