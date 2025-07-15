# Nos Ilha Frontend Sitemap

This document provides a comprehensive overview of the frontend application's route structure, navigation, and site architecture for the Nos Ilha tourism platform.

## Application Overview

- **Framework**: Next.js 15 with App Router
- **Route Organization**: Uses route groups with parentheses for logical organization
- **Authentication**: Supabase Auth with client-side guards
- **Caching Strategy**: ISR (Incremental Static Regeneration) for content pages
- **Dynamic Routing**: Supports category-based and slug-based routes

## Route Groups Structure

### 1. Public Routes - Main Site `(main)/`

#### Homepage
- **Route**: `/`
- **File**: `(main)/page.tsx`
- **Purpose**: Landing page showcasing Brava Island
- **Features**: Hero section, featured directory entries, island guide navigation
- **Caching**: `dynamic = "force-dynamic"` (real-time updates)
- **Access**: Public

#### Interactive Map
- **Route**: `/map`
- **File**: `(main)/map/page.tsx`
- **Purpose**: Interactive map displaying all points of interest on Brava Island
- **Features**: Mapbox integration, dynamically imported client-side component
- **Access**: Public

#### Directory Category Pages
- **Route**: `/directory/[category]`
- **File**: `(main)/directory/[category]/page.tsx`
- **Purpose**: Browse directory entries by category
- **Examples**: 
  - `/directory/restaurant` - Restaurant listings
  - `/directory/landmark` - Historical landmarks and points of interest
  - `/directory/beach` - Beach and coastal attractions
- **Features**: Category-specific filtering, grid layout
- **Caching**: ISR with 1-hour revalidation
- **Access**: Public

#### Individual Entry Detail Pages
- **Route**: `/directory/entry/[slug]`
- **File**: `(main)/directory/entry/[slug]/page.tsx`
- **Purpose**: Detailed view of individual businesses, landmarks, or attractions
- **Features**: 
  - Image galleries
  - Contact information
  - Category-specific details (cuisine, amenities, historical info)
  - User photo contribution section
- **Caching**: ISR with 30-minute revalidation
- **Access**: Public

### 2. Authentication Routes `(auth)/`

#### Login Page
- **Route**: `/login`
- **File**: `(auth)/login/page.tsx`
- **Purpose**: User authentication and sign-in
- **Features**: Login form, redirect parameter support, Supabase Auth integration
- **Access**: Public (redirects authenticated users)

#### Sign Up Page
- **Route**: `/signup`
- **File**: `(auth)/signup/page.tsx`
- **Purpose**: User registration and community joining
- **Features**: Registration form, community onboarding
- **Access**: Public (redirects authenticated users)

### 3. Admin/Protected Routes `(admin)/`

#### Add Directory Entry
- **Route**: `/add-entry`
- **File**: `(admin)/add-entry/page.tsx`
- **Purpose**: Admin interface for adding new directory entries
- **Features**: 
  - Protected route with authentication check
  - Admin form for directory entry creation
  - Loading states and error handling
- **Protection**: Client-side authentication guard with redirect to login
- **Access**: Requires authentication

### 4. Development/Testing Routes

#### Component Testing
- **Route**: `/test`
- **File**: `test/page.tsx`
- **Purpose**: Development testing page for components and API integration
- **Features**: Logo testing, DirectoryCard component demonstrations
- **Access**: Public (development only)

## Navigation Structure

### Primary Navigation (Header Component)
- **Home** → `/`
- **Restaurants** → `/directory/restaurant`
- **Landmarks** → `/directory/landmark`
- **Beaches** → `/directory/beach`
- **Map** → `/map`

### Footer Navigation (Extended Site Structure)

#### Explore Brava Section
- **Interactive Map** → `/map`
- **Towns & Villages** → `/towns` ⚠️ **MISSING LANDING PAGE**
- **Restaurants & Cafes** → `/directory/restaurant`
- **Landmarks** → `/directory/landmark`
- **Beaches & Bays** → `/directory/beach`

#### Culture & History Section
- **History of Brava** → `/history` ⚠️ **MISSING PAGE**
- **Historical Figures** → `/people` ⚠️ **MISSING PAGE**
- **Music & Arts** → `/media/music` ⚠️ **MISSING PAGE**
- **Photo Galleries** → `/media/photos` ⚠️ **MISSING PAGE**

#### Connect Section
- **About Us** → `/about` ⚠️ **MISSING PAGE**
- **Contact Us** → `/contact` ⚠️ **MISSING PAGE**
- **Contribute** → `/contribute` ⚠️ **MISSING PAGE**
- **Privacy Policy** → `/privacy` ⚠️ **MISSING PAGE**
- **Terms of Service** → `/terms` ⚠️ **MISSING PAGE**

#### Newsletter Subscription
- **Newsletter Signup** → (Form component in footer, not a separate route)
- **Social Media Links** → External links to Facebook and Instagram

### Secondary Navigation (Header)
- **Contribute** → `/contribute` ⚠️ **MISSING PAGE**
- **Add Entry** → `/add-entry` (Admin only, conditional display)

### Authentication Links
- **Log in** → `/login`
- **Sign up** → `/signup`
- **Logout** → (Action, not route)

## Missing/Incomplete Routes

### High Priority Pages

#### 1. Towns Landing Page
- **Expected Route**: `/towns`
- **Status**: Referenced in footer navigation but no corresponding page exists
- **Purpose**: Overview of all towns and villages on Brava Island with navigation to individual town pages

#### 2. History Section
- **Expected Route**: `/history`
- **Status**: Directory exists at `(main)/history/` but no `page.tsx` file
- **Purpose**: Historical articles and cultural heritage content

#### 3. Individual Towns Pages
- **Expected Route**: `/towns/[slug]`
- **Status**: Directory structure exists at `(main)/towns/[slug]/` but no `page.tsx` file
- **Purpose**: Individual town information and local guides

#### 4. About Us Page
- **Expected Route**: `/about`
- **Status**: Referenced in footer navigation but no corresponding page exists
- **Purpose**: Information about the Nos Ilha platform, mission, and team

#### 5. Contact Us Page
- **Expected Route**: `/contact`
- **Status**: Referenced in footer navigation but no corresponding page exists
- **Purpose**: Contact information, support forms, and communication channels

#### 6. Contribute Page
- **Expected Route**: `/contribute`
- **Status**: Referenced in both header and footer navigation but no corresponding page exists
- **Purpose**: Community contribution guidelines, photo submission forms, and volunteer opportunities

### Medium Priority Pages

#### 7. Historical Figures Page
- **Expected Route**: `/people`
- **Status**: Referenced in footer navigation but no corresponding page exists
- **Purpose**: Profiles of notable historical figures from Brava Island

#### 8. Music & Arts Page
- **Expected Route**: `/media/music`
- **Status**: Referenced in footer navigation but no corresponding page or directory structure exists
- **Purpose**: Showcase of Brava's musical heritage, traditional arts, and cultural expressions

#### 9. Photo Galleries Page
- **Expected Route**: `/media/photos`
- **Status**: Referenced in footer navigation but no corresponding page or directory structure exists
- **Purpose**: Curated photo collections showcasing Brava's landscapes, culture, and community

### Legal/Compliance Pages

#### 10. Privacy Policy Page
- **Expected Route**: `/privacy`
- **Status**: Referenced in footer navigation but no corresponding page exists
- **Purpose**: Privacy policy and data protection information

#### 11. Terms of Service Page
- **Expected Route**: `/terms`
- **Status**: Referenced in footer navigation but no corresponding page exists
- **Purpose**: Terms of service and usage agreements

## Route Protection Analysis

### Current Implementation
- **Middleware**: Configured for `/add-entry/:path*` but currently performs no actual protection
- **Client-side Guards**: Only `/add-entry` page implements authentication checking
- **Server-side Protection**: Not implemented

### Protection Levels
- **Public Routes**: All main site routes, authentication routes, test page
- **Client-Protected**: `/add-entry` (with redirect to login if unauthenticated)
- **Role-Based**: Admin features conditionally displayed in header component

### Security Considerations
- Route protection is primarily client-side and can be bypassed
- No server-side middleware enforcement
- Admin routes rely on component-level authentication checks

## Technical Characteristics

### Caching Strategy
| Route Type | Caching Strategy | Revalidation |
|------------|------------------|--------------|
| Homepage | `dynamic = "force-dynamic"` | Real-time |
| Category pages | ISR | 1 hour |
| Entry detail pages | ISR | 30 minutes |
| Map page | Client-side only | No SSR |
| Auth pages | Static | None |

### Dynamic Routing Patterns
- **`[category]`**: Supports any category name for directory browsing
- **`[slug]`**: Supports any slug for individual entries and future town pages

### Route Groups Benefits
- Clean URL structure (parentheses don't affect URLs)
- Logical organization of related pages
- Shared layouts within groups
- Independent loading and error boundaries

## API Integration

### External API Routes
- No `/api` directory exists in the frontend
- All API calls route to external Spring Boot backend at `/api/v1/`
- Frontend uses centralized API client in `lib/api.ts`

### Key API Endpoints Used
- `GET /api/v1/directory/entries` - Directory listings
- `GET /api/v1/directory/entries/{id}` - Individual entry details
- `POST /api/v1/directory/entries` - Create new entries (admin)

## Future Development Considerations

### High Priority Missing Routes
1. **`/towns`** - Towns and villages landing page with overview of all settlements
2. **`/history`** - Cultural heritage section with historical articles and content
3. **`/towns/[slug]`** - Individual town pages with detailed local information
4. **`/about`** - About Us page explaining the platform's mission and team
5. **`/contact`** - Contact page with support information and communication channels
6. **`/contribute`** - Community contribution page with guidelines and forms

### Medium Priority Missing Routes
7. **`/people`** - Historical figures and notable personalities from Brava
8. **`/media/music`** - Music and arts showcase highlighting Brava's cultural heritage
9. **`/media/photos`** - Photo galleries featuring curated collections of island imagery

### Legal/Compliance Routes (Required for Production)
10. **`/privacy`** - Privacy policy and data protection information
11. **`/terms`** - Terms of service and usage agreements

### New Route Group Considerations
- **Media Routes** (`/media/*`): New route group needed for music and photo galleries
- **Legal Routes**: Consider grouping privacy and terms pages for better organization

### Recommended Improvements
1. **Server-side Route Protection**: Implement proper middleware authentication
2. **Error Pages**: Add custom 404 and error boundary pages
3. **SEO Optimization**: Add proper metadata and sitemap.xml generation
4. **Accessibility**: Ensure all routes meet WCAG guidelines

### Performance Optimizations
1. **Preloading**: Critical route prefetching
2. **Bundle Splitting**: Route-based code splitting
3. **Image Optimization**: Dynamic image optimization for entry pages

## Summary

### Current Route Status
- **Implemented Routes**: 9 pages (Homepage, Map, Directory categories, Entry details, Auth pages, Add entry, Test page)
- **Missing Routes**: 11 pages identified from footer navigation analysis
- **Total Planned Routes**: 20 pages for complete platform functionality

### Missing Routes by Category
- **High Priority**: 6 pages (Towns landing, History, Individual towns, About, Contact, Contribute)
- **Medium Priority**: 3 pages (People, Music & Arts, Photo galleries)
- **Legal/Compliance**: 2 pages (Privacy, Terms)

### Development Impact
The footer component reveals a significantly larger planned site structure than initially documented. Implementation of these missing routes is essential for:
1. **User Experience**: Complete navigation functionality across all footer links
2. **Content Strategy**: Comprehensive coverage of Brava Island's culture and tourism
3. **Platform Completeness**: Professional presentation with proper legal and about pages
4. **Community Engagement**: Full contribution and cultural content ecosystem

---

*This sitemap reflects the current state of the frontend application as of the comprehensive analysis including footer navigation. Routes marked with ⚠️ indicate missing or incomplete functionality that requires development attention. Updated to include all 11 missing pages discovered through footer component analysis.*