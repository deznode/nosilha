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
- **Towns & Villages** → `/towns`
- **Restaurants & Cafes** → `/directory/restaurant`
- **Landmarks** → `/directory/landmark`
- **Beaches & Bays** → `/directory/beach`

#### Culture & History Section
- **History of Brava** → `/history`
- **Historical Figures** → `/people`
- **Music & Arts** → `/media/music`
- **Photo Galleries** → `/media/photos`

#### Connect Section
- **About Us** → `/about`
- **Contact Us** → `/contact`
- **Contribute** → `/contribute`
- **Privacy Policy** → `/privacy`
- **Terms of Service** → `/terms`

#### Newsletter Subscription
- **Newsletter Signup** → (Form component in footer, not a separate route)
- **Social Media Links** → External links to Facebook and Instagram

### Secondary Navigation (Header)
- **Contribute** → `/contribute`
- **Add Entry** → `/add-entry` (Admin only, conditional display)

### Authentication Links
- **Log in** → `/login`
- **Sign up** → `/signup`
- **Logout** → (Action, not route)

## Additional Routes

### High Priority Pages

#### 1. Towns Landing Page
- **Route**: `/towns`
- **File**: `frontend/src/app/(main)/towns/page.tsx`
- **Purpose**: Overview of all towns and villages on Brava Island with navigation to individual town pages
- **Features**: Featured towns, community listings, map integration, responsive design

#### 2. History Section
- **Route**: `/history`
- **File**: `frontend/src/app/(main)/history/page.tsx`
- **Purpose**: Historical articles and cultural heritage content
- **Features**: Timeline, cultural traditions, notable figures, visual storytelling

#### 3. Individual Towns Pages
- **Route**: `/towns/[slug]`
- **File**: `frontend/src/app/(main)/towns/[slug]/page.tsx`
- **Purpose**: Individual town information and local guides
- **Features**: Dynamic routing, town details, photo galleries, local directory integration

#### 4. About Us Page
- **Route**: `/about`
- **File**: `frontend/src/app/(main)/about/page.tsx`
- **Purpose**: Information about the Nos Ilha platform, mission, and team
- **Features**: Mission statement, technical approach, community focus, contribution opportunities

#### 5. Contact Us Page
- **Route**: `/contact`
- **File**: `frontend/src/app/(main)/contact/page.tsx`
- **Purpose**: Contact information, support forms, and communication channels
- **Features**: Contact forms, multiple communication methods, FAQ section

#### 6. Contribute Page
- **Route**: `/contribute`
- **File**: `frontend/src/app/(main)/contribute/page.tsx`
- **Purpose**: Community contribution guidelines, photo submission forms, and volunteer opportunities
- **Features**: Contribution types, guidelines, community engagement, clear CTAs

### Medium Priority Pages

#### 7. Historical Figures Page
- **Route**: `/people`
- **File**: `frontend/src/app/(main)/people/page.tsx`
- **Purpose**: Profiles of notable historical figures from Brava Island
- **Features**: Featured figures, biographical information, cultural contributions, categorized displays

#### 8. Music & Arts Page
- **Route**: `/media/music`
- **File**: `frontend/src/app/(main)/media/music/page.tsx`
- **Purpose**: Showcase of Brava's musical heritage, traditional arts, and cultural expressions
- **Features**: Musical traditions, famous musicians, cultural events, instrument showcase

#### 9. Photo Galleries Page
- **Route**: `/media/photos`
- **File**: `frontend/src/app/(main)/media/photos/page.tsx`
- **Purpose**: Curated photo collections showcasing Brava's landscapes, culture, and community
- **Features**: Gallery categories, photo statistics, contribution guidelines, visual storytelling

### Legal/Compliance Pages

#### 10. Privacy Policy Page
- **Route**: `/privacy`
- **File**: `frontend/src/app/(main)/privacy/page.tsx`
- **Purpose**: Privacy policy and data protection information
- **Features**: Comprehensive privacy policy, user rights, data protection, third-party services

#### 11. Terms of Service Page
- **Route**: `/terms`
- **File**: `frontend/src/app/(main)/terms/page.tsx`
- **Purpose**: Terms of service and usage agreements
- **Features**: Legal document structure, community guidelines, user responsibilities, platform rules

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
| **New Content Pages** | **ISR** | **1-2 hours** |
| Towns pages | ISR | 2 hours |
| History/People pages | ISR | 2 hours |
| Media pages | ISR | 1 hour |
| About/Contact pages | Static | None |
| Legal pages | Static | None |

### Dynamic Routing Patterns
- **`[category]`**: Supports any category name for directory browsing
- **`[slug]`**: Supports any slug for individual entries and town pages

### Route Groups Benefits
- Clean URL structure (parentheses don't affect URLs)
- Logical organization of related pages
- Shared layouts within groups
- Independent loading and error boundaries

### Route Groups Structure
- **`/media/`**: Route group for cultural content
  - `/media/music` - Music and arts heritage
  - `/media/photos` - Photo galleries and visual content
- **`(main)/`**: Main site route group with comprehensive pages
  - Towns section with dynamic routing
  - Cultural heritage pages (history, people)
  - Legal and compliance pages
  - Community engagement pages

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

### Potential Enhancements
1. **Server-side Route Protection**: Implement proper middleware authentication
2. **Error Pages**: Add custom 404 and error boundary pages
3. **Sitemap.xml Generation**: Add automated sitemap generation for SEO
4. **Advanced Analytics**: Implement page-level analytics tracking
5. **Search Functionality**: Add site-wide search capabilities
6. **Multi-language Support**: Add Portuguese and Kriolu translations

### Current Performance Optimizations
1. **ISR Caching**: Configured across all content pages
2. **Bundle Optimization**: Route-based code splitting in place
3. **Image Optimization**: Next.js Image component used throughout
4. **Responsive Design**: Mobile-first approach throughout
5. **SEO Optimization**: Metadata and Open Graph implementation

## Summary

The Nos Ilha frontend implements a comprehensive route structure with:

### Route Overview
- **Total Routes**: 20 pages covering all site functionality
- **Core Routes**: 9 pages (Homepage, Map, Directory categories, Entry details, Auth pages, Add entry, Test page)
- **Extended Routes**: 11 pages (Towns, History, People, Music, Photos, About, Contact, Contribute, Privacy, Terms)

### Route Categories
- **High Priority**: 6 pages (Towns landing, History, Individual towns, About, Contact, Contribute)
- **Medium Priority**: 3 pages (People, Music & Arts, Photo galleries)
- **Legal/Compliance**: 2 pages (Privacy, Terms)

### Platform Capabilities
The platform provides:
1. **Complete User Experience**: All footer navigation links are functional
2. **Comprehensive Content Strategy**: Full coverage of Brava Island's culture and tourism
3. **Professional Platform**: Complete legal and about pages for production readiness
4. **Community Engagement**: Full contribution and cultural content ecosystem
5. **Performance Optimization**: ISR caching and responsive design across all pages
6. **SEO Optimization**: Metadata implementation for all pages

### Technical Standards
- **TypeScript Compliance**: No compilation errors
- **ESLint Compliance**: All linting issues resolved
- **Responsive Design**: Mobile-first approach throughout
- **Accessibility**: WCAG AA compliance standards met
- **Performance**: Optimized caching strategies
- **SEO**: Complete Open Graph and metadata