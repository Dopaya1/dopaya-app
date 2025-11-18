# Dashboard V2 - README

## Overview

A compact, desktop-first vertical layout dashboard with placeholder/demo bindings. This page is ready for Supabase integration but currently uses mock data.

**Route:** `/dashboard-v2`

## Placeholder Data Mappings

### User Data

| Placeholder Field | Supabase Table/Field | Notes |
|------------------|---------------------|-------|
| `user.firstName` | `public.users.first_name` | Already available via `useAuth()` hook |
| `user.points` | `public.users.impactPoints` | Current Impact Points balance |
| `user.points_value` | Calculated: `impactPoints * 0.1` | ~$ value (10 points = $1) |
| `user.lifetime_impact_summary` | Calculated from `donations` + `projects` | Aggregate impact description |
| `user.support_count` | `COUNT(DISTINCT donations.projectId)` | Number of unique projects supported |

### Featured Projects

| Placeholder Field | Supabase Table/Field | Notes |
|------------------|---------------------|-------|
| `featuredProjects[].id` | `projects.id` | Project ID |
| `featuredProjects[].slug` | `projects.slug` | URL slug |
| `featuredProjects[].image` | `projects.image_url` | Main project image |
| `featuredProjects[].tagline` | `projects.summary` or `projects.title` | Short description |
| `featuredProjects[].impact_snippet` | `projects.key_impact` | One-line impact statement |

**Query:** 
```sql
SELECT id, slug, image_url, summary, key_impact 
FROM projects 
WHERE featured = true 
ORDER BY created_at DESC 
LIMIT 3;
```

### Rewards Preview

| Placeholder Field | Supabase Table/Field | Notes |
|------------------|---------------------|-------|
| `rewardsPreview[].id` | `rewards.id` | Reward ID |
| `rewardsPreview[].brand_logo` | `brands.logo_url` | Via JOIN with brands table |
| `rewardsPreview[].product_image` | `rewards.imageUrl` | Reward product image |
| `rewardsPreview[].points_required` | `rewards.points_cost` | Points needed to redeem |
| `rewardsPreview[].brand_name` | `brands.name` | Via JOIN with brands table |

**Query:**
```sql
SELECT 
  r.id,
  r.imageUrl as product_image,
  r.points_cost as points_required,
  b.logo_url as brand_logo,
  b.name as brand_name
FROM rewards r
JOIN brands b ON r.brand_id = b.id
WHERE r.is_active = true 
  AND r.points_cost <= (SELECT impactPoints FROM users WHERE id = $userId)
ORDER BY r.points_cost ASC
LIMIT 3;
```

### Recent Contributions

| Placeholder Field | Supabase Table/Field | Notes |
|------------------|---------------------|-------|
| `recentContributions[].project_name` | `projects.title` | Via JOIN with donations |
| `recentContributions[].amount` | `donations.amount` | Donation amount |
| `recentContributions[].date` | `donations.created_at` | Donation date |
| `recentContributions[].impact_snippet` | `projects.key_impact` | Via JOIN with projects |

**Query:**
```sql
SELECT 
  p.title as project_name,
  d.amount,
  d.created_at as date,
  p.key_impact as impact_snippet
FROM donations d
JOIN projects p ON d.project_id = p.id
WHERE d.user_id = $userId
ORDER BY d.created_at DESC
LIMIT 3;
```

### Daily Quote

| Placeholder Field | Source | Notes |
|------------------|--------|-------|
| `dailyQuote.text` | `@/constants/impact-quotes.ts` | Already implemented via `getDailyQuoteForUser()` |
| `dailyQuote.author` | `@/constants/impact-quotes.ts` | Already implemented |

**Status:** ✅ Already wired up - uses existing quote system

## Implementation Checklist

### Phase 1: User Data (High Priority)
- [ ] Replace `placeholderUser.points` with `impact?.impactPoints` from `/api/user/impact`
- [ ] Calculate `points_value` as `impactPoints * 0.1`
- [ ] Fetch `lifetime_impact_summary` from donations aggregation
- [ ] Replace `support_count` with `impact?.projectsSupported`

### Phase 2: Featured Projects
- [ ] Create query to fetch 3 featured projects
- [ ] Map `image_url` → `image`
- [ ] Map `summary` or `title` → `tagline`
- [ ] Map `key_impact` → `impact_snippet`

### Phase 3: Rewards Preview
- [ ] Create query joining `rewards` + `brands`
- [ ] Filter by `is_active = true`
- [ ] Filter by `points_cost <= user.impactPoints` (affordable)
- [ ] Limit to 3 results, ordered by `points_cost ASC`

### Phase 4: Recent Contributions
- [ ] Create query joining `donations` + `projects`
- [ ] Filter by `user_id = current_user.id`
- [ ] Order by `created_at DESC`
- [ ] Limit to 3 results
- [ ] Format dates for display

### Phase 5: Impact Timeline
- [ ] Create sparkline data from donations over time
- [ ] Use charting library (e.g., recharts) for visualization
- [ ] Show last 3 contributions in expanded view

## File Structure

```
client/src/pages/
  └── dashboard-story-mode.tsx    # Main page component

client/src/
  └── lib/
      └── (future: dashboard-queries.ts)  # Supabase queries
```

## Current Status

✅ **Complete:**
- Page structure and layout
- All placeholder data structures
- Routing (`/dashboard-story-mode`)
- Responsive design (desktop-first, mobile stacking)
- Accessibility (alt text, keyboard navigation)
- Empty states
- Daily quote integration

⏳ **Pending:**
- Supabase data integration
- Real impact timeline chart
- Image lazy loading optimization

## Testing

Access the page at:
```
http://localhost:3001/dashboard-story-mode
```

**Note:** Requires authentication (ProtectedRoute). You'll need to be logged in.

## Design Notes

- **Desktop-first:** Layout optimized for desktop, stacks on mobile
- **Compact:** Vertical layout, minimal spacing
- **Visual language:** Matches existing Dopaya design system
- **Performance:** Images use `loading="lazy"` attribute
- **Accessibility:** All images have alt text, buttons are keyboard-focusable

## Future Enhancements

1. Real-time impact updates
2. Interactive timeline chart
3. Reward redemption flow
4. Social sharing features
5. Impact goal tracking

