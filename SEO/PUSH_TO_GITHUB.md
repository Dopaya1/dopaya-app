# Push SEO changes to GitHub

Run these commands **in your own terminal** (from the repo root, e.g. `Tech` or `dopaya-app`).

## 1. Go to the repo root

```bash
cd /Users/patrick/Cursor/Dopaya/Tech
```

(Or wherever your `dopaya-app` repo is – the folder that contains `client/`, `SEO/`, `vercel.json`.)

## 2. See what’s uncommitted

```bash
git status
```

You should see:
- **New:** `SEO/dopaya-astro-seo-pages/` (and possibly deleted `SEO/dopaya-astro-brands/`)
- **Modified:** `vercel.json`

## 3. Stage everything

```bash
git add -A
```

## 4. Commit

```bash
git commit -m "Add SEO programmatic Astro site: dopaya-astro-seo-pages, update vercel rewrites"
```

## 5. Push to GitHub

```bash
git push origin main
```

(Use your usual branch name if it’s not `main`.)

---

If `git push` asks for credentials, use your GitHub login or SSH key as you normally do. After a successful push, the latest commit and the `SEO/dopaya-astro-seo-pages` folder will appear on https://github.com/Dopaya1/dopaya-app.

---
*Last main-site deploy trigger: 2026-02-03*
