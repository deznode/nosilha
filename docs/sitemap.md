# Nos Ilha Frontend Sitemap

This document provides a comprehensive overview of the frontend application's route structure, navigation, and site architecture for the Nos Ilha tourism platform.

## Application Overview

- **Framework**: Next.js 16 with App Router
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

#### Directory Index Page
- **Route**: `/directory`
- **File**: `(main)/directory/page.tsx`
- **Purpose**: Main directory landing page with all entries
- **Features**: Category navigation, search, featured entries
- **Caching**: ISR with 1-hour revalidation
- **Access**: Public

#### Directory Category Pages
- **Route**: `/directory/[category]`
- **File**: `(main)/directory/[category]/page.tsx`
- **Purpose**: Browse directory entries by category
- **Examples**:
  - `/directory/restaurant` - Restaurant listings
  - `/directory/hotel` - Accommodation options
  - `/directory/heritage` - Historical landmarks and cultural sites
  - `/directory/nature` - Natural attractions and beaches
- **Features**: Category-specific filtering, grid layout
- **Caching**: ISR with 1-hour revalidation
- **Access**: Public

#### Individual Entry Detail Pages
- **Route**: `/directory/[category]/[slug]`
- **File**: `(main)/directory/[category]/[slug]/page.tsx`
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

### 3. Contribute Routes `(main)/contribute/`

#### Contribute Landing Page
- **Route**: `/contribute`
- **File**: `(main)/contribute/page.tsx`
- **Purpose**: Community contribution guidelines and options
- **Features**: Contribution types overview, guidelines, clear CTAs
- **Access**: Public

#### Add Directory Entry
- **Route**: `/contribute/directory`
- **File**: `(main)/contribute/directory/page.tsx`
- **Purpose**: Admin interface for adding new directory entries
- **Features**:
  - Protected route with authentication check
  - Admin form for directory entry creation
  - Loading states and error handling
- **Protection**: Client-side authentication guard with redirect to login
- **Access**: Requires admin authentication

#### Submit Media
- **Route**: `/contribute/media`
- **File**: `(main)/contribute/media/page.tsx`
- **Purpose**: Community photo and media submission
- **Features**: Media upload form, guidelines for submissions
- **Access**: Requires authentication

#### Share a Story
- **Route**: `/contribute/story`
- **File**: `(main)/contribute/story/page.tsx`
- **Purpose**: Community story and memory submission
- **Features**: Story submission form, cultural content guidelines
- **Access**: Requires authentication

### 4. Stories Routes `(main)/stories/`

#### Stories Index Page
- **Route**: `/stories`
- **File**: `(main)/stories/page.tsx`
- **Purpose**: Browse community stories and narratives
- **Features**: Story listings, category filtering
- **Caching**: ISR with 1-hour revalidation
- **Access**: Public

#### Individual Story Page
- **Route**: `/stories/[slug]`
- **File**: `(main)/stories/[slug]/page.tsx`
- **Purpose**: Read individual community stories
- **Features**: Full story content, related stories
- **Caching**: ISR with 30-minute revalidation
- **Access**: Public

### 5. Gallery Route

#### Media Gallery
- **Route**: `/gallery`
- **File**: `(main)/gallery/page.tsx`
- **Purpose**: Browse curated media and community photos
- **Features**: Image gallery, filtering, lightbox view
- **Caching**: ISR with 1-hour revalidation
- **Access**: Public

### 6. Admin Routes `(admin)/`

#### Admin Dashboard
- **Route**: `/admin`
- **File**: `(admin)/admin/page.tsx`
- **Purpose**: Admin dashboard and content management
- **Features**: Admin navigation, content overview
- **Access**: Requires admin authentication

## Navigation Structure

### Primary Navigation (Header Component)
- **Home** → `/`
- **Culture** (dropdown):
  - **History of Brava** → `/history`
  - **Historical Figures** → `/people`
- **Directory** → `/directory`
- **Stories** → `/stories`
- **Media** → `/gallery`
- **Map** → `/map`
- **Admin** → `/admin` (Admin only, conditional display)

### Footer Navigation

#### Community Section
- **Stories** → `/stories`
- **Directory** → `/directory`
- **Media Gallery** → `/gallery`
- **Share a Memory** → `/contribute/story`

#### Legal & About Section
- **About Us** → `/about`
- **Contact Us** → `/contact`
- **Privacy Policy** → `/privacy`
- **Terms of Service** → `/terms`

#### Newsletter Subscription
- **Newsletter Signup** → (Form component in footer, not a separate route)
- **Social Media Links** → External links to Facebook and Instagram

### User Menu (Authenticated)
- **Your Profile** → `/profile`
- **Settings** → `/settings`
- **Add Entry** → `/contribute/directory` (Admin only)
- **Sign out** → (Action, not route)

### Authentication Links (Unauthenticated)
- **Log in** → `/login`
- **Sign up** → `/signup`

### Mobile Navigation
- **+ Contribute a Story** → `/contribute/story`

## Additional Routes

### High Priority Pages

#### 1. History Section
- **Route**: `/history`
- **File**: `apps/web/src/app/(main)/history/page.tsx`
- **Purpose**: Historical articles and cultural heritage content
- **Features**: Timeline, cultural traditions, notable figures, visual storytelling

#### 2. Individual History Articles
- **Route**: `/history/[slug]`
- **File**: `apps/web/src/app/(main)/history/[slug]/page.tsx`
- **Purpose**: Individual historical article pages
- **Features**: Dynamic routing, article content, related entries

#### 3. About Us Page
- **Route**: `/about`
- **File**: `apps/web/src/app/(main)/about/page.tsx`
- **Purpose**: Information about the Nos Ilha platform, mission, and team
- **Features**: Mission statement, technical approach, community focus, contribution opportunities

#### 4. Contact Us Page
- **Route**: `/contact`
- **File**: `apps/web/src/app/(main)/contact/page.tsx`
- **Purpose**: Contact information, support forms, and communication channels
- **Features**: Contact forms, multiple communication methods, FAQ section

#### 5. Contribute Page
- **Route**: `/contribute`
- **File**: `apps/web/src/app/(main)/contribute/page.tsx`
- **Purpose**: Community contribution guidelines, photo submission forms, and volunteer opportunities
- **Features**: Contribution types, guidelines, community engagement, clear CTAs

### Medium Priority Pages

#### 6. Historical Figures Page
- **Route**: `/people`
- **File**: `apps/web/src/app/(main)/people/page.tsx`
- **Purpose**: Profiles of notable historical figures from Brava Island
- **Features**: Featured figures, biographical information, cultural contributions, categorized displays

#### 7. Individual People Profiles
- **Route**: `/people/[slug]`
- **File**: `apps/web/src/app/(main)/people/[slug]/page.tsx`
- **Purpose**: Detailed profile pages for individual historical figures
- **Features**: Dynamic routing, biographical content, cultural contributions, related history

### User Account Pages

#### 8. User Profile Page
- **Route**: `/profile`
- **File**: `apps/web/src/app/(main)/profile/page.tsx`
- **Purpose**: User profile and account information
- **Features**: Profile display, contribution history, account management
- **Access**: Requires authentication

#### 9. User Settings Page
- **Route**: `/settings`
- **File**: `apps/web/src/app/(main)/settings/page.tsx`
- **Purpose**: User account settings and preferences
- **Features**: Account settings, notification preferences, privacy controls
- **Access**: Requires authentication

### Legal/Compliance Pages

#### 10. Privacy Policy Page
- **Route**: `/privacy`
- **File**: `apps/web/src/app/(main)/privacy/page.tsx`
- **Purpose**: Privacy policy and data protection information
- **Features**: Comprehensive privacy policy, user rights, data protection, third-party services

#### 11. Terms of Service Page
- **Route**: `/terms`
- **File**: `apps/web/src/app/(main)/terms/page.tsx`
- **Purpose**: Terms of service and usage agreements
- **Features**: Legal document structure, community guidelines, user responsibilities, platform rules

### Admin Routes

#### 12. Admin Translations
- **Route**: `/admin/translations`
- **File**: `apps/web/src/app/(admin)/admin/translations/page.tsx`
- **Purpose**: Admin interface for managing translations
- **Features**: Translation management, language content editing
- **Access**: Requires admin authentication

## Route Protection Analysis

### Current Implementation
- **Client-side Guards**: Protected routes implement authentication checking
- **Role-Based Access**: Admin features conditionally displayed in header component

### Protection Levels
- **Public Routes**: All main site routes, authentication routes
- **Client-Protected**: `/contribute/directory`, `/contribute/media`, `/contribute/story`, `/profile`, `/settings`
- **Admin-Only**: `/admin`, `/admin/translations`, `/contribute/directory`
- **Role-Based**: Admin features conditionally displayed in header component

### Security Considerations
- Route protection is primarily client-side
- Admin routes rely on component-level authentication checks

## Technical Characteristics

### Caching Strategy
| Route Type | Caching Strategy | Revalidation |
|------------|------------------|--------------|
| Homepage | `dynamic = "force-dynamic"` | Real-time |
| Directory pages | ISR | 1 hour |
| Entry detail pages | ISR | 30 minutes |
| Stories pages | ISR | 1 hour |
| Gallery page | ISR | 1 hour |
| Map page | Client-side only | No SSR |
| Auth pages | Static | None |
| History/People pages | ISR | 2 hours |
| About/Contact pages | Static | None |
| Legal pages | Static | None |
| Profile/Settings | Dynamic | Real-time |

### Dynamic Routing Patterns
- **`[category]`**: Supports directory categories (restaurant, hotel, heritage, nature)
- **`[slug]`**: Supports any slug for individual entries, history articles, people profiles, and stories

### Route Groups Benefits
- Clean URL structure (parentheses don't affect URLs)
- Logical organization of related pages
- Shared layouts within groups
- Independent loading and error boundaries

### Route Groups Structure
- **`(main)/`**: Main site route group with comprehensive pages
  - Directory pages with category and entry detail views
  - Stories and gallery pages
  - Cultural heritage pages (history, people with dynamic [slug] routes)
  - User account pages (profile, settings)
  - Contribute pages (directory, media, story)
  - Legal and compliance pages
- **`(auth)/`**: Authentication route group
  - Login and signup pages
- **`(admin)/`**: Admin route group
  - Admin dashboard and translations pages

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
3. **Advanced Analytics**: Implement page-level analytics tracking
4. **Search Functionality**: Add site-wide search capabilities
5. **Multi-language Support**: Add Portuguese and Kriolu translations

### Current Performance Optimizations
1. **ISR Caching**: Configured across all content pages
2. **Bundle Optimization**: Route-based code splitting in place
3. **Image Optimization**: Next.js Image component used throughout
4. **Responsive Design**: Mobile-first approach throughout
5. **SEO Optimization**: Metadata and Open Graph implementation

## Summary

The Nos Ilha frontend implements a comprehensive route structure with:

### Route Overview
- **Total Routes**: 24 production pages
- **Core Routes**: Homepage, Map, Directory (index + category + entry), Login, Signup
- **Content Routes**: Stories, Gallery, History, People (with dynamic [slug] routes)
- **Community Routes**: Contribute (landing + directory + media + story)
- **User Routes**: Profile, Settings
- **Legal Routes**: Privacy, Terms, About, Contact
- **Admin Routes**: Admin dashboard, Translations

### Route Categories by Section
- **Public Content**: 15 pages (Directory, Stories, Gallery, History, People, Map, About, Contact)
- **Community Contribution**: 4 pages (Contribute landing + 3 submission forms)
- **User Account**: 2 pages (Profile, Settings)
- **Legal/Compliance**: 2 pages (Privacy, Terms)
- **Authentication**: 2 pages (Login, Signup)
- **Admin**: 2 pages (Dashboard, Translations)

### Platform Capabilities
The platform provides:
1. **Complete User Experience**: All navigation links are functional
2. **Comprehensive Content Strategy**: Full coverage of Brava Island's culture and tourism
3. **Professional Platform**: Complete legal and about pages for production readiness
4. **Community Engagement**: Full contribution ecosystem (stories, media, directory entries)
5. **Performance Optimization**: ISR caching and responsive design across all pages
6. **SEO Optimization**: Automated sitemap.xml generation and Open Graph metadata

### Technical Standards
- **TypeScript Compliance**: No compilation errors
- **ESLint Compliance**: All linting issues resolved
- **Responsive Design**: Mobile-first approach throughout
- **Accessibility**: WCAG AA compliance standards met
- **Performance**: Optimized caching strategies
- **SEO**: Complete robots.txt and sitemap.xml implementation