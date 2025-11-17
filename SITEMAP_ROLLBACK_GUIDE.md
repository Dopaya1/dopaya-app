# Sitemap Rollback Guide

## Backup Location
- **Backup file**: `api/sitemap.xml.ts.BACKUP-20251107-114242`
- **Current file**: `api/sitemap.xml.ts`

## Quick Rollback Instructions

### Option 1: Restore from Backup File
```bash
cp api/sitemap.xml.ts.BACKUP-20251107-114242 api/sitemap.xml.ts
git add api/sitemap.xml.ts
git commit -m "Rollback: Restore sitemap from backup"
git push origin main
```

### Option 2: Restore from Git
```bash
# View recent commits
git log --oneline api/sitemap.xml.ts

# Restore to previous working version (before project pages were added)
git checkout HEAD~3 -- api/sitemap.xml.ts
# Or restore to specific commit hash
git checkout <commit-hash> -- api/sitemap.xml.ts

git commit -m "Rollback: Restore previous sitemap version"
git push origin main
```

## Fallback Layers in Current Code

The current implementation has **5 layers of fallbacks**:

1. **Environment Variables**: Tries `VITE_SUPABASE_URL`, then `SUPABASE_URL`, then hardcoded
2. **Supabase Client Creation**: If client creation fails → returns empty array (static pages only)
3. **Query Timeout**: 5-second timeout → returns empty array (static pages only)
4. **Query Errors**: Any Supabase error → returns empty array (static pages only)
5. **Main Handler**: If everything fails → returns static pages only
6. **Final Fallback**: If even static pages fail → returns minimal sitemap with just homepage

## What This Means

✅ **The sitemap will ALWAYS work** - it will never return a 500 error
✅ **If project fetch fails** → You get static pages (current behavior)
✅ **If everything fails** → You get at least the homepage

## Testing the Rollback

After rollback, test:
1. Visit `https://dopaya.com/sitemap.xml`
2. Should see only static pages (no project pages)
3. Should return valid XML (never 500 error)

## Current Status

- ✅ Backup created: `api/sitemap.xml.ts.BACKUP-20251107-114242`
- ✅ Multiple fallback layers implemented
- ✅ Comprehensive error handling
- ✅ Always returns valid XML

