# Frontend Agent Knowledge Base

## Domain Expertise: Next.js 15 + React 19 + TypeScript Development

### Architecture Overview
```
App Router (Route Groups)
    ↓
Server Components (Default)
    ↓
Client Components (Interactive)
    ↓
Tailwind CSS + Catalyst UI
    ↓
Supabase Auth Integration
```

### Key Technologies
- **Next.js 15.3.3** with App Router and async dynamic APIs
- **React 19.0.0** with Server Components and Concurrent Features  
- **TypeScript 5** with strict mode and comprehensive typing
- **Tailwind CSS 4** with custom design system and CSS variables
- **Catalyst UI** component library (25+ components)
- **Supabase Auth 2.50.0** for authentication and user management
- **Mapbox GL JS 3.12.0** for interactive mapping
- **Framer Motion 12** for animations and transitions

## Next.js 15 Async Dynamic APIs

### 1. Async Dynamic Route Parameters
```typescript
// Next.js 15 introduces async params - based on Context7 documentation
import { notFound } from 'next/navigation'

interface DirectoryEntryPageProps {
  params: Promise<{ slug: string }>
}

export default async function DirectoryEntryPage({ params }: DirectoryEntryPageProps) {
  // Await params in Next.js 15
  const { slug } = await params
  
  const entry = await getEntryBySlug(slug)
  
  if (!entry) {
    notFound()
  }

  return (
    <div>
      <h1>{entry.name}</h1>
      <p>{entry.description}</p>
    </div>
  )
}
```

### 2. Async Headers and Cookies
```typescript
// Next.js 15 async dynamic APIs
import { headers, cookies } from 'next/headers'

export default async function AuthenticatedPage() {
  // Await headers in Next.js 15
  const headersList = await headers()
  const authorization = headersList.get('authorization')
  
  // Await cookies in Next.js 15  
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get('session')
  
  if (!sessionToken || !authorization) {
    redirect('/login')
  }

  return <div>Protected content</div>
}
```

### 3. Async Search Parameters
```typescript
interface SearchPageProps {
  searchParams: Promise<{ category?: string; query?: string }>
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  // Await searchParams in Next.js 15
  const { category, query } = await searchParams
  
  const entries = await searchEntries({ category, query })
  
  return (
    <div>
      <SearchResults entries={entries} />
    </div>
  )
}
```

## Core Patterns

### 1. App Router Structure with Route Groups
```typescript
// Route organization using parentheses for logical grouping
src/app/
├── (auth)/                    # Authentication routes
│   ├── login/page.tsx
│   └── signup/page.tsx
├── (main)/                    # Main public routes
│   ├── page.tsx              # Homepage
│   ├── about/page.tsx
│   ├── directory/
│   │   ├── page.tsx
│   │   ├── [category]/page.tsx
│   │   └── entry/[slug]/page.tsx
│   ├── map/page.tsx
│   └── history/page.tsx
├── (admin)/                   # Protected admin routes
│   └── add-entry/page.tsx
├── layout.tsx                 # Root layout
└── globals.css               # Global styles

// Route Groups don't affect URL structure
// (auth)/login/page.tsx → /login
// (main)/about/page.tsx → /about
```

### 2. Server vs Client Component Pattern
```typescript
// Server Component (default) - for data fetching and static content
import { DirectoryEntryService } from '@/lib/api'

export default async function DirectoryPage() {
  // Server-side data fetching
  const entries = await DirectoryEntryService.getAllEntries()
  
  return (
    <div>
      <PageHeader title="Explore Brava Island" />
      <DirectoryGrid entries={entries} />
    </div>
  )
}

// Client Component - for interactivity
'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

export function DirectoryGrid({ entries }: { entries: DirectoryEntry[] }) {
  const [filteredEntries, setFilteredEntries] = useState(entries)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)

  // Client-side filtering and interactions
  const handleCategoryFilter = (category: Category) => {
    setSelectedCategory(category)
    setFilteredEntries(entries.filter(entry => entry.category === category))
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredEntries.map((entry) => (
        <DirectoryCard 
          key={entry.id} 
          entry={entry}
          onSelect={handleEntrySelect}
        />
      ))}
    </div>
  )
}
```

### 3. Tailwind CSS + Design System Integration
```typescript
// Design system configuration in tailwind.config.ts
const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Nos Ilha brand colors
        'ocean-blue': '#005A8D',
        'valley-green': '#3E7D5A', 
        'bougainvillea-pink': '#D90368',
        'sunny-yellow': '#F7B801',
        
        // Extended palette for tourism
        'brava-blue': {
          50: '#E6F3FF',
          500: '#005A8D',
          900: '#003F62'
        }
      },
      fontFamily: {
        'heading': ['Merriweather', 'serif'],
        'body': ['Lato', 'sans-serif']
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'slide-up': 'slideUp 0.8s ease-out',
        'scale-in': 'scaleIn 0.4s ease-out'
      }
    }
  }
}

// Component usage with consistent styling
export function DirectoryCard({ entry }: { entry: DirectoryEntry }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
      <div className="relative aspect-[4/3] overflow-hidden">
        <img 
          src={entry.imageUrl} 
          alt={entry.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-4 left-4">
          <CategoryBadge category={entry.category} />
        </div>
      </div>
      
      <div className="p-6">
        <h3 className="font-heading text-xl font-semibold text-gray-900 mb-2">
          {entry.name}
        </h3>
        <p className="font-body text-gray-600 text-sm leading-relaxed">
          {entry.description}
        </p>
      </div>
    </div>
  )
}
```

### 4. Supabase Authentication Integration
```typescript
// Auth Provider setup
'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import { createClient, type User } from '@/lib/supabase-client'

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    if (error) throw error
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

// Hook for using auth context
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Protected route middleware
// middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  
  const { data: { session } } = await supabase.auth.getSession()

  // Protect admin routes
  if (req.nextUrl.pathname.startsWith('/admin') && !session) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  return res
}

export const config = {
  matcher: ['/admin/:path*']
}
```

## Component Architecture Patterns

### 1. Catalyst UI Integration
```typescript
// Using Catalyst UI components with customization
import { Button } from '@/components/catalyst-ui/button'
import { Input } from '@/components/catalyst-ui/input'
import { Dialog, DialogPanel, DialogTitle } from '@/components/catalyst-ui/dialog'

// Custom component extending Catalyst patterns
export function DirectoryEntryForm({ onSubmit }: { onSubmit: (data: CreateEntryRequest) => void }) {
  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState<CreateEntryRequest>({
    name: '',
    description: '',
    category: 'RESTAURANT',
    latitude: 0,
    longitude: 0
  })

  return (
    <>
      <Button onClick={() => setIsOpen(true)} color="blue">
        Add New Entry
      </Button>

      <Dialog open={isOpen} onClose={setIsOpen}>
        <DialogPanel className="max-w-lg">
          <DialogTitle className="font-heading text-xl font-semibold mb-6">
            Add Directory Entry
          </DialogTitle>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              name="name"
              placeholder="Business or location name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
            
            <textarea
              name="description"
              placeholder="Description for visitors..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-blue focus:border-transparent"
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />

            <div className="flex gap-3">
              <Button type="submit" color="blue" className="flex-1">
                Add Entry
              </Button>
              <Button type="button" color="gray" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </DialogPanel>
      </Dialog>
    </>
  )
}
```

### 2. API Integration Pattern
```typescript
// Based on actual implementation from frontend/src/lib/api.ts
import type { DirectoryEntry } from "@/types/directory"
import type { Town } from "@/types/town"
import { supabase } from "@/lib/supabase-client"
import { getMockEntriesByCategory, getMockEntryBySlug } from "@/lib/mock-api"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL

// Environment variable validation
if (!API_BASE_URL) {
  throw new Error(
    "NEXT_PUBLIC_API_URL is not defined. Please check your .env.local file."
  )
}

/**
 * Creates an authenticated fetch request with JWT token from Supabase session
 */
async function authenticatedFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const headers = {
    ...options.headers,
  }

  // Add Authorization header if user is authenticated
  if (session?.access_token) {
    Object.assign(headers, {
      Authorization: `Bearer ${session.access_token}`,
    })
  }

  const response = await fetch(url, {
    ...options,
    headers,
  })

  // Handle authentication errors
  if (response.status === 401) {
    await supabase.auth.signOut()
    window.location.href = "/login"
    throw new Error("Authentication expired. Please log in again.")
  }

  if (response.status === 403) {
    throw new Error(
      "Access denied. You do not have permission to perform this action."
    )
  }

  return response
}

/**
 * Fetches all directory entries with ISR caching and fallback to mock data
 */
export async function getEntriesByCategory(
  category: string,
  page: number = 0,
  size: number = 20
): Promise<DirectoryEntry[]> {
  const params = new URLSearchParams()
  
  if (category.toLowerCase() !== "all") {
    params.append("category", category)
  }
  params.append("page", page.toString())
  params.append("size", size.toString())

  const endpoint = `${API_BASE_URL}/api/v1/directory/entries?${params.toString()}`

  try {
    // Use ISR with 1 hour cache for directory content
    const response = await fetch(endpoint, { 
      next: { revalidate: 3600 } 
    })
    
    if (!response.ok) {
      throw new Error(`API call failed with status: ${response.status}`)
    }

    const apiResponse = await response.json()
    const rawData = apiResponse.data || []
    return validateDirectoryEntries(rawData)
  } catch (error) {
    console.error("Failed to fetch entries by category, using fallback:", error)
    // Fallback to mock data for resilience
    return getMockEntriesByCategory(category)
  }
}

/**
 * Creates a new directory entry with authentication
 */
export async function createDirectoryEntry(
  entryData: Omit<DirectoryEntry, "id" | "slug" | "rating" | "reviewCount" | "createdAt" | "updatedAt">
): Promise<DirectoryEntry> {
  const endpoint = `${API_BASE_URL}/api/v1/directory/entries`

  const response = await authenticatedFetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(entryData),
  })

  if (!response.ok) {
    try {
      const errorResult = await response.json()
      
      // Handle validation errors with detailed field information
      if (errorResult.error === "Validation failed" && errorResult.details) {
        const fieldErrors = errorResult.details.map((detail: any) => 
          `${detail.field}: ${detail.message}`
        ).join(", ")
        throw new Error(`Validation failed: ${fieldErrors}`)
      }
      
      throw new Error(errorResult.error || errorResult.message || `API error: ${response.status}`)
    } catch (parseError) {
      throw new Error(`Failed to create directory entry (${response.status})`)
    }
  }

  const apiResponse = await response.json()
  return apiResponse.data
}
  error?: string
  message?: string
}

class ApiClient {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}/api/v1${endpoint}`
    
    // Add auth header if user is logged in
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    }

    // Get auth token from Supabase
    if (typeof window !== 'undefined') {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`
      }
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result: ApiResponse<T> = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'API request failed')
      }

      return result.data!
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error)
      throw error
    }
  }

  // Directory entries
  async getDirectoryEntries(): Promise<DirectoryEntry[]> {
    return this.request<DirectoryEntry[]>('/directory/entries')
  }

  async getDirectoryEntry(id: string): Promise<DirectoryEntry> {
    return this.request<DirectoryEntry>(`/directory/entries/${id}`)
  }

  async createDirectoryEntry(entry: CreateEntryRequest): Promise<DirectoryEntry> {
    return this.request<DirectoryEntry>('/directory/entries', {
      method: 'POST',
      body: JSON.stringify(entry)
    })
  }

  // Category-specific endpoints
  async getRestaurants(): Promise<DirectoryEntry[]> {
    return this.request<DirectoryEntry[]>('/directory/entries?category=RESTAURANT')
  }

  async getHotels(): Promise<DirectoryEntry[]> {
    return this.request<DirectoryEntry[]>('/directory/entries?category=HOTEL')
  }
}

export const apiClient = new ApiClient()

// React hook for data fetching with loading states
export function useDirectoryEntries() {
  const [entries, setEntries] = useState<DirectoryEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchEntries() {
      try {
        setLoading(true)
        const data = await apiClient.getDirectoryEntries()
        setEntries(data)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch entries')
        setEntries([])
      } finally {
        setLoading(false)
      }
    }

    fetchEntries()
  }, [])

  return { entries, loading, error, refetch: () => fetchEntries() }
}
```

### 3. Responsive Design Patterns
```typescript
// Mobile-first responsive components
export function DirectoryGrid({ entries }: { entries: DirectoryEntry[] }) {
  return (
    <div className={`
      grid gap-6
      grid-cols-1           
      sm:grid-cols-2        
      lg:grid-cols-3        
      xl:grid-cols-4        
      2xl:grid-cols-5       
      px-4 sm:px-6 lg:px-8
    `}>
      {entries.map((entry) => (
        <DirectoryCard key={entry.id} entry={entry} />
      ))}
    </div>
  )
}

// Adaptive navigation for mobile/desktop
export function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Logo className="h-8 w-auto" />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <NavLink href="/">Home</NavLink>
              <NavLink href="/directory">Directory</NavLink>
              <NavLink href="/map">Map</NavLink>
              <NavLink href="/about">About</NavLink>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-md text-gray-600 hover:text-gray-900"
            >
              <MenuIcon className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <MobileNavLink href="/">Home</MobileNavLink>
            <MobileNavLink href="/directory">Directory</MobileNavLink>
            <MobileNavLink href="/map">Map</MobileNavLink>
            <MobileNavLink href="/about">About</MobileNavLink>
          </div>
        </div>
      )}
    </nav>
  )
}
```

## Performance Optimization

### 1. Image Optimization
```typescript
// Next.js Image component with tourism-specific optimizations
import Image from 'next/image'

export function DirectoryEntryImage({ 
  entry, 
  priority = false 
}: { 
  entry: DirectoryEntry
  priority?: boolean 
}) {
  return (
    <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
      <Image
        src={entry.imageUrl}
        alt={`${entry.name} - ${entry.category} in Brava Island`}
        fill
        className="object-cover transition-transform duration-300 hover:scale-105"
        priority={priority} // For above-the-fold images
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        quality={85} // Balanced quality for tourism photos
      />
      
      {/* Gradient overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
      
      {/* Category badge */}
      <div className="absolute top-3 left-3">
        <CategoryBadge category={entry.category} />
      </div>
    </div>
  )
}

// Lazy loading gallery with intersection observer
export function ImageGallery({ images }: { images: string[] }) {
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set())
  const observerRef = useRef<IntersectionObserver>()

  const imageRef = useCallback((node: HTMLDivElement | null, index: number) => {
    if (observerRef.current) observerRef.current.disconnect()
    
    observerRef.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setLoadedImages(prev => new Set(prev.add(index)))
        observerRef.current?.disconnect()
      }
    })
    
    if (node) observerRef.current.observe(node)
  }, [])

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {images.map((image, index) => (
        <div
          key={index}
          ref={(node) => imageRef(node, index)}
          className="aspect-square bg-gray-200 rounded-lg overflow-hidden"
        >
          {loadedImages.has(index) && (
            <Image
              src={image}
              alt={`Gallery image ${index + 1}`}
              width={300}
              height={300}
              className="w-full h-full object-cover"
            />
          )}
        </div>
      ))}
    </div>
  )
}
```

### 2. ISR (Incremental Static Regeneration)
```typescript
// Static generation with revalidation for directory pages
export async function generateStaticParams() {
  const entries = await apiClient.getDirectoryEntries()
  
  return entries.map((entry) => ({
    slug: entry.slug,
  }))
}

export default async function DirectoryEntryPage({ 
  params 
}: { 
  params: { slug: string } 
}) {
  const entry = await apiClient.getDirectoryEntryBySlug(params.slug)
  
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <DirectoryEntryDetail entry={entry} />
    </div>
  )
}

// Revalidate every hour for tourism content
export const revalidate = 3600
```

## Common File Locations

### Source Structure
```
frontend/src/
├── app/                           # App Router pages
│   ├── (auth)/                    # Authentication routes
│   ├── (main)/                    # Public routes
│   ├── (admin)/                   # Protected admin routes
│   ├── layout.tsx                 # Root layout
│   ├── page.tsx                   # Homepage
│   └── globals.css                # Global styles
├── components/                    # Reusable components
│   ├── catalyst-ui/               # Catalyst UI components
│   ├── ui/                        # Custom UI components
│   ├── admin/                     # Admin-specific components
│   ├── auth/                      # Authentication components
│   └── providers/                 # Context providers
├── lib/                           # Utilities and services
│   ├── api.ts                     # API client
│   ├── supabase-client.ts         # Supabase configuration
│   ├── mock-api.ts                # Mock data for development
│   └── api-validation.ts          # Input validation
├── types/                         # TypeScript type definitions
│   ├── directory.ts               # Directory entry types
│   └── town.ts                    # Town/location types
├── hooks/                         # Custom React hooks
└── utils/                         # Helper functions
```

## Tourism-Specific Features

### 1. Category-Based Filtering
```typescript
// Tourism category management
export type Category = 'RESTAURANT' | 'HOTEL' | 'LANDMARK' | 'BEACH'

const CATEGORY_CONFIG = {
  RESTAURANT: {
    icon: '🍽️',
    color: '#E53E3E',
    bgColor: '#FED7D7',
    label: 'Restaurants'
  },
  HOTEL: {
    icon: '🏨', 
    color: '#3182CE',
    bgColor: '#BEE3F8',
    label: 'Hotels'
  },
  LANDMARK: {
    icon: '🏛️',
    color: '#805AD5',
    bgColor: '#E9D8FD', 
    label: 'Landmarks'
  },
  BEACH: {
    icon: '🏖️',
    color: '#38A169',
    bgColor: '#C6F6D5',
    label: 'Beaches'
  }
} as const

export function CategoryFilter({ 
  selectedCategories, 
  onCategoryChange 
}: {
  selectedCategories: Category[]
  onCategoryChange: (categories: Category[]) => void
}) {
  return (
    <div className="flex flex-wrap gap-3">
      {Object.entries(CATEGORY_CONFIG).map(([category, config]) => (
        <button
          key={category}
          onClick={() => toggleCategory(category as Category)}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all
            ${selectedCategories.includes(category as Category)
              ? 'bg-opacity-100 text-white'
              : 'bg-opacity-20 text-gray-700 hover:bg-opacity-30'
            }
          `}
          style={{ backgroundColor: selectedCategories.includes(category as Category) ? config.color : config.bgColor }}
        >
          <span>{config.icon}</span>
          <span>{config.label}</span>
        </button>
      ))}
    </div>
  )
}
```

### 2. Tourism Content Components
```typescript
// Tourism-focused content display
export function TourismHero() {
  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0"
      >
        <source src="/videos/brava-island-hero.mp4" type="video/mp4" />
      </video>
      
      <div className="absolute inset-0 bg-black bg-opacity-40 z-10" />
      
      <div className="relative z-20 text-center text-white px-6 max-w-4xl">
        <h1 className="font-heading text-4xl md:text-6xl font-bold mb-6 leading-tight">
          Discover the Magic of
          <span className="block text-sunny-yellow">Brava Island</span>
        </h1>
        
        <p className="text-xl md:text-2xl mb-8 font-light leading-relaxed">
          Explore pristine beaches, authentic cuisine, and rich cultural heritage 
          in Cape Verde's hidden gem
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" className="bg-ocean-blue hover:bg-ocean-blue/90">
            Explore Directory
          </Button>
          <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-gray-900">
            View Interactive Map
          </Button>
        </div>
      </div>
    </section>
  )
}

// Location showcase component
export function LocationShowcase({ entry }: { entry: DirectoryEntry }) {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <CategoryBadge category={entry.category} size="lg" />
            <span className="text-sm text-gray-500 font-medium">
              {CATEGORY_CONFIG[entry.category].label}
            </span>
          </div>
          
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            {entry.name}
          </h1>
          
          <p className="text-lg text-gray-600 leading-relaxed mb-8">
            {entry.description}
          </p>
          
          <div className="flex flex-wrap gap-4">
            <Button className="bg-ocean-blue">
              <MapPinIcon className="w-4 h-4 mr-2" />
              View on Map
            </Button>
            <Button variant="outline">
              <ShareIcon className="w-4 h-4 mr-2" />
              Share Location
            </Button>
          </div>
        </div>
        
        <div>
          <DirectoryEntryImage entry={entry} priority />
        </div>
      </div>
    </div>
  )
}
```

This knowledge base provides comprehensive coverage of Next.js App Router patterns, React 19 features, TypeScript integration, and tourism-specific frontend development for the Nos Ilha platform.