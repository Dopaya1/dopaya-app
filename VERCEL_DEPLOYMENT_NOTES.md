# Vercel Deployment Notes

## Critical Dependencies

### use-sync-external-store
**Version: 1.2.0 (LOCKED)**

⚠️ **DO NOT UPDATE THIS PACKAGE**

- React 18.3.1 has `useSyncExternalStore` built-in
- Version 1.2.0 properly re-exports React's native hook
- Version 1.6.0+ causes build failures on Vercel
- This version is **locked** (no `^` prefix) to prevent auto-updates

**If you need to update:**
1. Test locally with `npm run build:frontend`
2. Test on Vercel staging first
3. Clear Vercel build cache if issues occur

## Vercel Build Configuration

- **Build Command**: `npm run build:frontend`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

## Common Issues

### Blank Page After Deploy
- Check browser console for errors
- Verify `index.html` is in the output directory
- Ensure all assets are properly bundled

### Build Fails on Vercel but Works Locally
- Check if `package-lock.json` is committed
- Clear Vercel build cache
- Verify Node version matches (see `vercel.json`)

### Module Resolution Errors
- Ensure all aliases in `vite.config.ts` use absolute paths
- Check that `import.meta.dirname` is used (not `__dirname`)

## Last Updated
January 2025 - Fixed use-sync-external-store compatibility




