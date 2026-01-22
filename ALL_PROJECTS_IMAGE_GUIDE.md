# 🖼️ All Projects Universal Fund - Image Guide

**Date:** December 18, 2025  
**Purpose:** Instructions for creating the hero image for "All Projects" universal fund

---

## 📋 **Image Requirements**

### **File Location**
- **Path:** `/Tech/client/public/assets/all-projects-hero.jpg`
- **Alternative:** Update the `image_url` in the database after creating the image

### **Specifications**
- **Dimensions:** 800x450px (16:9 aspect ratio) or larger
- **Format:** JPG or PNG
- **File Size:** < 500KB (optimized for web)
- **Style:** Mosaic/collage of multiple project images

---

## 🎨 **Design Recommendations**

### **Option 1: Mosaic of Project Images**
Create a grid collage showing 4-6 of your most impactful projects:

```
┌─────────────┬─────────────┐
│  Project A  │  Project B  │
│             │             │
├─────────────┼─────────────┤
│  Project C  │  Project D  │
│             │             │
└─────────────┴─────────────┘
```

**Tools:**
- Canva (free, easy collage maker)
- Photoshop/GIMP (advanced editing)
- Figma (design tool with grid layouts)

### **Option 2: Globe/World Map with Icons**
- World map background
- Location pins showing project locations
- Icons representing different project categories
- Warm, inviting color scheme (yellows, oranges, greens)

### **Option 3: Hands Together/Unity Theme**
- Multiple hands coming together from different directions
- Diverse representation
- Gradient background (yellow to orange)
- Text overlay: "Supporting All Projects Together"

---

## 🚀 **Quick Setup Steps**

### **Temporary Solution (Use Placeholder)**
Until you create the custom image:

1. Use an existing project image as placeholder
2. Or use a stock image from Unsplash:
   - Search: "diversity collaboration" or "global community"
   - Download free-to-use image
   - Rename to `all-projects-hero.jpg`

3. Update database:
```sql
UPDATE projects 
SET image_url = '/assets/all-projects-hero.jpg' 
WHERE slug = 'all-projects';
```

### **Permanent Solution (Custom Design)**

**Using Canva (Recommended for Non-Designers):**

1. Go to Canva.com
2. Create design → "Custom size" → 1600x900px
3. Search templates: "photo collage" or "grid layout"
4. Replace template images with your project photos
5. Add text overlay: "All Projects" or "Universal Impact Fund"
6. Add gradient overlay (yellow/orange) at 20% opacity
7. Download as JPG (high quality)
8. Compress at TinyJPG.com if needed
9. Upload to `/Tech/client/public/assets/all-projects-hero.jpg`

---

## 📝 **Alternative: Dynamic Image Generation**

Instead of a static image, you could generate it dynamically:

**Approach:**
- Fetch top 4-6 featured projects
- Use CSS Grid to display their images in a mosaic
- Add overlay with "All Projects" badge

**Code Example (Future Enhancement):**
```typescript
// In project-card.tsx or support-page.tsx
if (project.isUniversalFund && !project.imageUrl) {
  // Fetch featured projects and create mosaic
  const featuredProjects = await fetchFeaturedProjects();
  return <MosaicImage projects={featuredProjects.slice(0, 6)} />;
}
```

---

## ✅ **Checklist**

- [ ] Created/downloaded hero image
- [ ] Optimized file size (< 500KB)
- [ ] Uploaded to `/Tech/client/public/assets/all-projects-hero.jpg`
- [ ] Updated database `image_url` if using different path
- [ ] Tested image loads on projects page
- [ ] Tested image loads on support page
- [ ] Image looks good on mobile (responsive)

---

## 🎯 **Recommended Stock Images**

If you need a quick placeholder, use these free sources:

1. **Unsplash** (unsplash.com)
   - Search: "collaboration", "diversity", "global impact"
   - License: Free to use
   
2. **Pexels** (pexels.com)
   - Search: "teamwork", "community", "world"
   - License: Free to use

3. **Pixabay** (pixabay.com)
   - Search: "hands together", "unity", "globe"
   - License: Free to use

---

## 💡 **Brand Guidelines**

To match Dopaya's brand:

- **Colors:** Yellow (#FFC107), Orange (#f2662d), White, Gray
- **Style:** Modern, clean, optimistic
- **Mood:** Empowering, inclusive, action-oriented
- **Fonts:** (if adding text) Clean sans-serif, bold

---

**Next Steps:** Create the image and upload it before running the database migration!



