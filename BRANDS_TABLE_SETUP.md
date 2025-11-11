# Brands Table Setup Guide

## Overview
The brands table stores information about sustainable brand partners that appear on the brands landing page. This replaces the hardcoded logo imports with a database-driven approach.

## Database Schema

The `brands` table has the following structure:

```sql
CREATE TABLE IF NOT EXISTS "brands" (
  "id" SERIAL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "logo_path" TEXT,
  "website_url" TEXT,
  "description" TEXT,
  "category" TEXT,
  "featured" BOOLEAN DEFAULT FALSE,
  "display_order" INTEGER DEFAULT 0,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

## Field Descriptions

- **id**: Auto-incrementing primary key
- **name**: Brand name (required) - e.g., "Bonji", "Milletarian", "Sankalpa Art Village"
- **logo_path**: Path to the brand logo. Can be:
  - Full URL (https://example.com/logo.png)
  - Supabase Storage path (e.g., `brand-logos/bonji-logo.png`)
  - Relative path (e.g., `/assets/brand-logos/bonji.png`)
- **website_url**: Brand's website URL (optional)
- **description**: Short description of the brand (optional)
- **category**: Brand category (optional) - e.g., "Beauty & Wellness", "Food & Agriculture", "Sustainable Lifestyle"
- **featured**: Boolean flag for featured brands (default: false)
- **display_order**: Integer for controlling display order in the slider (lower numbers appear first, default: 0)
- **created_at**: Timestamp when record was created
- **updated_at**: Timestamp when record was last updated

## How to Add Brands

### Option 1: Via Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **Table Editor** → **brands**
3. Click **Insert row** or **New row**
4. Fill in the fields:
   - **name**: Enter the brand name
   - **logo_path**: 
     - If using Supabase Storage: Upload the logo to a storage bucket (e.g., `brand-logos`) and use the path like `brand-logos/bonji-logo.png`
     - If using external URL: Enter the full URL
     - If using local assets: Use a relative path like `/assets/Brand_backers/bonji-logo.png`
   - **website_url**: (Optional) Brand's website
   - **description**: (Optional) Short description
   - **category**: (Optional) Category name
   - **featured**: Check if this brand should be featured
   - **display_order**: Set the order (0 = first, higher numbers = later)

### Option 2: Via SQL

```sql
INSERT INTO "brands" (
  "name", 
  "logo_path", 
  "website_url", 
  "description", 
  "category", 
  "featured", 
  "display_order"
)
VALUES 
(
  'Bonji',
  'brand-logos/bonji-logo.png',  -- Supabase Storage path
  'https://bonji.in',
  'Anti-pollution skin & hair care products made with natural ingredients.',
  'Beauty & Wellness',
  true,
  1
),
(
  'Milletarian',
  'brand-logos/milletarian-logo.png',
  'https://milletarian.netlify.app',
  '100% natural, no preservatives Ragi Malt.',
  'Health & Nutrition',
  true,
  2
),
(
  'Sankalpa Art Village',
  'brand-logos/sankalpa-logo.png',
  'https://www.sankalpaartvillage.com',
  'Sustainable living through natural dyed clothing and conscious products.',
  'Sustainable Lifestyle',
  true,
  3
);
```

### Option 3: Upload Logos to Supabase Storage

1. Go to **Storage** in Supabase dashboard
2. Create a bucket called `brand-logos` (or use existing bucket)
3. Upload brand logo files
4. Copy the file path (e.g., `brand-logos/bonji-logo.png`)
5. Use this path in the `logo_path` field when inserting brands

## Logo Path Formats

The system supports multiple logo path formats:

1. **Full URL**: `https://example.com/logo.png`
2. **Supabase Storage**: `brand-logos/bonji-logo.png` (will be converted to full Supabase Storage URL)
3. **Relative path**: `/assets/Brand_backers/bonji-logo.png`

The `getLogoUrl()` utility function in `lib/image-utils.ts` handles all these formats automatically.

## Fallback Behavior

If no brands are found in the database, the page will fall back to hardcoded logo imports for backward compatibility. The fallback mapping includes:
- Milletarian
- Adithi Millets
- Allika
- Bonji
- Aapar
- Sankalpa Art Village

## Display Order

Brands are displayed in the slider based on:
1. `display_order` (ascending)
2. `created_at` (descending, for brands with same display_order)

To control the order, set `display_order` values:
- Featured brands: 1-10
- Regular brands: 11-100
- Lower numbers appear first

## Example: Complete Brand Entry

```sql
INSERT INTO "brands" (
  "name",
  "logo_path",
  "website_url",
  "description",
  "category",
  "featured",
  "display_order"
) VALUES (
  'Bonji - Beyond Just Natural',
  'brand-logos/bonji-sustainable-brand-logo.png',
  'https://bonji.in',
  'Anti-pollution skin & hair care products made with natural ingredients. Beyond just trends, basics, and looks - real science-backed solutions for city life damage.',
  'Beauty & Wellness',
  true,
  1
);
```

## Migration Notes

- The brands table is automatically created when the database schema is set up
- Existing hardcoded logos will continue to work as fallbacks
- You can gradually migrate brands to the database
- The page will automatically use database brands when available

