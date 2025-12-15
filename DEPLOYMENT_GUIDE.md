# Dopaya Platform Deployment Guide

This guide covers everything needed to deploy the optimized homepage and future changes to GitHub and Vercel.

## 🚀 Quick Reference

**Current Status:** 
- ✅ Optimized homepage completed and tested locally
- ✅ Stripe integration made optional for development
- ✅ Frontend build working correctly
- ⚠️ Backend database setup needs environment variables

**Local Development:** http://localhost:8080 (currently running)
**Production:** Will be deployed to Vercel

---

## 📋 Pre-Deployment Checklist

### 1. Environment Variables Required

#### For Local Development:
```bash
# Required for Supabase integration
# ⚠️ Replace these placeholders with your actual Supabase credentials
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key-here
DATABASE_URL="postgresql://postgres:your-password@db.your-project-id.supabase.co:5432/postgres"

# Optional (for payment functionality)
STRIPE_SECRET_KEY=(not required for homepage viewing)
STRIPE_WEBHOOK_SECRET=(not required for homepage viewing)
```

#### For Vercel Production:
- All the above variables need to be added to Vercel environment variables
- Add production Stripe keys if payment functionality is needed

### 2. Files Modified for Optimized Homepage

#### New Components Created:
- `/client/src/pages/home-page-optimized.tsx` - New optimized homepage
- `/client/src/components/home/hero-section-optimized.tsx` - Optimized hero section
- `/client/src/components/home/impact-dashboard-section-optimized.tsx` - Optimized dashboard preview
- `/client/src/components/home/why-social-enterprises-section.tsx` - Educational section
- `/client/src/components/home/partner-showcase-section.tsx` - Bonji partner showcase
- `/client/src/components/home/institutional-proof-section.tsx` - Trust building section
- `/client/src/components/home/community-invitation-cta.tsx` - Authentic community CTA

#### Core Files Modified:
- `/client/src/app.tsx` - Updated routing to use optimized homepage
- `/server/stripe-routes.ts` - Made Stripe optional for development

### 3. Dependencies and Build Status
- ✅ All dependencies installed and working
- ✅ Frontend build successful (`npm run build:frontend`)
- ✅ Components render correctly
- ⚠️ Backend requires environment variables for full functionality

---

## 🔄 Local Development Workflow

### Option 1: Frontend Only (Recommended for UI changes)
```bash
# Build and serve frontend only
# ⚠️ Replace placeholders with your actual Supabase credentials
VITE_SUPABASE_URL=https://your-project-id.supabase.co VITE_SUPABASE_ANON_KEY=your-supabase-anon-key-here npm run build:frontend

# Serve locally
cd dist && python3 -m http.server 8080
```
**Access:** http://localhost:8080

### Option 2: Full Stack Development
```bash
# Full development server with all environment variables
# ⚠️ Replace placeholders with your actual Supabase credentials
VITE_SUPABASE_URL=https://your-project-id.supabase.co VITE_SUPABASE_ANON_KEY=your-supabase-anon-key-here DATABASE_URL="postgresql://postgres:your-password@db.your-project-id.supabase.co:5432/postgres" npm run dev
```

### Environment-Based Development Script (Recommended)

Create a `.env.local` file:
```bash
# .env.local
# ⚠️ Replace placeholders with your actual Supabase credentials
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key-here
DATABASE_URL="postgresql://postgres:your-password@db.your-project-id.supabase.co:5432/postgres"
```

Then use: `source .env.local && npm run dev`

---

## 🚀 GitHub & Vercel Deployment Steps

### Step 1: Prepare Repository
```bash
# Ensure you're on the correct branch
git status
git add .
git commit -m "feat: implement optimized homepage with authentic social impact messaging

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"

# Push to GitHub
git push origin main
```

### Step 2: Vercel Configuration

Create `vercel.json` in project root:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "framework": null,
  "env": {
    "VITE_SUPABASE_URL": "@vite_supabase_url",
    "VITE_SUPABASE_ANON_KEY": "@vite_supabase_anon_key",
    "DATABASE_URL": "@database_url"
  }
}
```

### Step 3: Vercel Environment Variables

In Vercel dashboard, add these environment variables:
```
# ⚠️ Replace placeholders with your actual Supabase credentials
VITE_SUPABASE_URL = https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY = your-supabase-anon-key-here
DATABASE_URL = postgresql://postgres:your-password@db.your-project-id.supabase.co:5432/postgres
```

### Step 4: Deploy
1. Connect GitHub repo to Vercel
2. Configure build settings:
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Root Directory: `/` (leave empty)
3. Deploy

---

## 🔧 Switch Between Local/Production Modes

### Quick Mode Switching Scripts

Add to `package.json`:
```json
{
  "scripts": {
    "dev:local": "source .env.local && npm run dev",
    "dev:frontend": "npm run build:frontend && cd dist && python3 -m http.server 8080",
    "dev:preview": "PREVIEW_MODE=true npm run dev",
    "build:production": "npm run build",
    "test:build": "npm run build:frontend && npm run preview"
  }
}
```

### Environment File Structure
```
/Tech
  ├── .env.local          # Local development
  ├── .env.production     # Production (don't commit)
  ├── .env.example        # Template (commit this)
  └── vercel.json         # Vercel configuration
```

---

## ⚠️ Critical Notes Before Going Live

### 1. Data Verification Required
- **Partner Showcase**: Currently using Bonji as example - verify partnership data
- **Impact Metrics**: Replace sample data with real metrics from Ignis Careers
- **Institutional Proof**: Gather permissions for founder testimonials

### 2. Content Authenticity Check
- All impact claims must be verifiable
- Reward calculations need real backing data
- Partner information must be current and accurate

### 3. Performance Optimizations
- Consider code splitting for large chunks (currently 1.3MB)
- Optimize image loading
- Implement proper caching strategies

### 4. SEO & Analytics
- Verify structured data implementation
- Test social media previews
- Add analytics tracking if needed

---

## 🛠️ Troubleshooting Common Issues

### Build Failures
- **Stripe errors**: Ensure `stripe-routes.ts` has optional Stripe handling
- **Supabase errors**: Verify environment variables are set
- **Type errors**: Check component imports and prop types

### Local Development Issues
- **Port conflicts**: Use different port (`python3 -m http.server 8081`)
- **Environment variables**: Always source `.env.local` before running
- **Database connections**: Can be ignored for frontend-only development

### Vercel Deployment Issues
- **Build timeouts**: Check for circular dependencies
- **Environment variables**: Ensure all variables are set in Vercel dashboard
- **API routes**: May need serverless function configuration

---

## 📝 Future Development Workflow

### For UI/Content Changes:
1. Make changes locally
2. Test with `npm run dev:frontend`
3. Verify at http://localhost:8080
4. Commit and push to GitHub
5. Vercel auto-deploys

### For Backend/API Changes:
1. Test locally with full environment
2. Update environment variables if needed
3. Test build process
4. Deploy to Vercel
5. Verify production functionality

### For Database Changes:
1. Update schema files
2. Test migrations locally
3. Coordinate with Supabase setup
4. Deploy with proper environment variables

---

## 📊 Current Homepage Features

### Implemented Optimizations:
- ✅ Authentic "Support Social Change. Get More Back" value proposition
- ✅ Educational NGO vs Social Enterprise comparison
- ✅ Partner showcase with Bonji integration
- ✅ Community-focused CTAs vs sales-driven
- ✅ Dashboard preview emphasizing utility over gamification
- ✅ Institutional proof section for trust building
- ✅ FAQ section maintained for transparency
- ✅ Founding member benefits naturally highlighted

### Technical Features:
- ✅ Responsive design for all screen sizes
- ✅ Optimized component architecture
- ✅ Supabase integration for dynamic content
- ✅ Auto-scrolling project and reward showcases
- ✅ SEO optimization with structured data
- ✅ Accessibility considerations

---

*Last updated: October 7, 2025*
*Generated with Claude Code assistance*