# 🔄 Quick Rollback Guide

## ⚡ Emergency Rollback (30 seconds)

### **Method 1: Feature Flag (Fastest)**

**File 1:** `src/lib/formula3.ts`
```typescript
// Change line 24 from:
const ENABLE_BRAND_FILTERING = true;
// To:
const ENABLE_BRAND_FILTERING = false;
```

**File 2:** `src/pages/brands/[...slug].astro`
```typescript
// Change line 12 from:
const ENABLE_BRAND_FILTERING = true;
// To:
const ENABLE_BRAND_FILTERING = false;
```

**Then:**
```bash
npm run build
npm run validate
# Deploy
```

---

## 🔙 Full Rollback (Git)

```bash
cd /Users/patrick/Cursor/Dopaya/Tech/SEO/dopaya-astro-seo-pages

# Find the commit
git log --oneline | head -5

# Revert the commit (replace <commit-hash>)
git revert <commit-hash>

# Or reset to before changes (CAREFUL - loses uncommitted work)
git reset --hard HEAD~1

# Push
git push
```

---

## ✅ Verify Rollback Worked

```bash
# Build should succeed
npm run build

# Check page count (should be higher)
npm run validate

# Check sitemap includes all brands
cat dist/sitemap-seo.xml | grep -o 'brands/[^"]*' | sort | uniq
```

---

## 🆘 If Something Breaks

1. **Immediate:** Set feature flags to `false` (see Method 1 above)
2. **If that doesn't work:** Use Git rollback (see Method 2)
3. **If main site affected:** Revert SEO deployment immediately
4. **Contact:** Check `CHANGES_OVERVIEW_2026-02-18.md` for details

---

**Remember:** Main DoPaya site was NOT changed. Only SEO project files were modified.
