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

### Secondary Navigation
- **Contribute** → `/contribute` ⚠️ **MISSING PAGE**
- **Add Entry** → `/add-entry` (Admin only, conditional display)

### Authentication Links
- **Log in** → `/login`
- **Sign up** → `/signup`
- **Logout** → (Action, not route)

## Missing/Incomplete Routes

### 1. Contribute Page
- **Expected Route**: `/contribute`
- **Status**: Referenced in header navigation but no corresponding page exists
- **Purpose**: Likely community contribution guidelines or forms

### 2. History Section
- **Expected Route**: `/history`
- **Status**: Directory exists at `(main)/history/` but no `page.tsx` file
- **Purpose**: Historical articles and cultural heritage content

### 3. Towns Pages
- **Expected Route**: `/towns/[slug]`
- **Status**: Directory structure exists at `(main)/towns/[slug]/` but no `page.tsx` file
- **Purpose**: Individual town information and local guides

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
1. **`/contribute`** - Community contribution page
2. **`/history`** - Cultural heritage section
3. **`/towns/[slug]`** - Individual town pages

### Recommended Improvements
1. **Server-side Route Protection**: Implement proper middleware authentication
2. **Error Pages**: Add custom 404 and error boundary pages
3. **SEO Optimization**: Add proper metadata and sitemap.xml generation
4. **Accessibility**: Ensure all routes meet WCAG guidelines

### Performance Optimizations
1. **Preloading**: Critical route prefetching
2. **Bundle Splitting**: Route-based code splitting
3. **Image Optimization**: Dynamic image optimization for entry pages

---

*This sitemap reflects the current state of the frontend application as of the last analysis. Routes marked with ⚠️ indicate missing or incomplete functionality that requires development attention.*