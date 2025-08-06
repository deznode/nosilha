# Motion & Graphics Agent Knowledge Base

## Domain Expertise: Framer Motion + Interactive Animations for Tourism Platform

### Architecture Overview
```
React Components (UI Layer)
    ↓
Framer Motion (Animation Layer)
    ↓
CSS Transforms (Render Layer)
    ↓
Hardware Acceleration (GPU)
```

### Key Technologies
- **Framer Motion v10+** - React animation library
- **React 18/19** - Component framework with Concurrent Features
- **TypeScript** - Type-safe animation configurations
- **Tailwind CSS** - Utility-first styling with motion classes
- **Intersection Observer API** - Scroll-triggered animations
- **Web APIs** - Touch, Gesture, and Device Orientation

## Core Animation Patterns

### 1. Page Transitions & Route Animations
```typescript
// layout.tsx - App-wide page transitions
import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'

const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.98
  },
  in: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.645, 0.045, 0.355, 1] // Custom easing for tourism feel
    }
  },
  out: {
    opacity: 0,
    y: -20,
    scale: 1.02,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1]
    }
  }
}

export default function AnimatedLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        className="min-h-screen"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
```

### 2. Hero Section with Video Background
```typescript
// VideoHeroSection.tsx
import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'

interface VideoHeroSectionProps {
  videoSrc: string
  title: string
  subtitle: string
  onExploreClick?: () => void
}

export function VideoHeroSection({ 
  videoSrc, 
  title, 
  subtitle, 
  onExploreClick 
}: VideoHeroSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollY } = useScroll()
  
  // Parallax effect for video
  const y = useTransform(scrollY, [0, 500], [0, 250])
  const opacity = useTransform(scrollY, [0, 300], [1, 0])
  const scale = useTransform(scrollY, [0, 500], [1, 1.1])

  return (
    <section 
      ref={containerRef}
      className="relative h-screen overflow-hidden"
    >
      {/* Parallax Video Background */}
      <motion.div
        style={{ y, scale }}
        className="absolute inset-0 w-full h-full"
      >
        <video
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover"
          preload="metadata"
        >
          <source src={videoSrc} type="video/mp4" />
        </video>
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/50" />
      </motion.div>

      {/* Animated Content */}
      <motion.div
        style={{ opacity }}
        className="relative z-10 flex items-center justify-center h-full text-center text-white px-4"
      >
        <div className="max-w-4xl">
          {/* Animated Title */}
          <motion.h1
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ 
              delay: 0.5, 
              duration: 1,
              ease: "easeOut"
            }}
            className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
          >
            {title}
          </motion.h1>

          {/* Animated Subtitle */}
          <motion.p
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ 
              delay: 0.8, 
              duration: 0.8,
              ease: "easeOut"
            }}
            className="text-xl md:text-2xl mb-8 font-light"
          >
            {subtitle}
          </motion.p>

          {/* Animated CTA Button */}
          <motion.button
            onClick={onExploreClick}
            initial={{ y: 20, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            whileHover={{ 
              scale: 1.05,
              y: -2,
              transition: { duration: 0.2 }
            }}
            whileTap={{ scale: 0.95 }}
            transition={{ 
              delay: 1.1, 
              duration: 0.6,
              ease: "easeOut"
            }}
            className="bg-white/10 backdrop-blur-sm border border-white/20 text-white px-8 py-4 rounded-full text-lg font-medium hover:bg-white/20 transition-colors"
          >
            Explore Brava Island
          </motion.button>

          {/* Animated Scroll Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2 }}
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          >
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center"
            >
              <motion.div
                animate={{ y: [0, 12, 0] }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="w-1 h-3 bg-white/70 rounded-full mt-2"
              />
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  )
}
```

### 3. Interactive Image Gallery with Hover Effects
```typescript
// ImageGallery.tsx
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'

interface GalleryImage {
  id: string
  src: string
  alt: string
  title: string
  location?: string
  photographer?: string
}

interface ImageGalleryProps {
  images: GalleryImage[]
  columns?: number
  onImageClick?: (image: GalleryImage) => void
}

export function ImageGallery({ 
  images, 
  columns = 3, 
  onImageClick 
}: ImageGalleryProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: 40,
      scale: 0.9 
    },
    show: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: [0.645, 0.045, 0.355, 1]
      }
    }
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className={`grid grid-cols-1 md:grid-cols-${columns} gap-6 p-6`}
    >
      {images.map((image, index) => (
        <motion.div
          key={image.id}
          variants={itemVariants}
          className="group relative overflow-hidden rounded-2xl cursor-pointer"
          style={{
            aspectRatio: index % 3 === 0 ? '4/5' : '1/1' // Varied aspect ratios
          }}
          onHoverStart={() => setHoveredId(image.id)}
          onHoverEnd={() => setHoveredId(null)}
          onClick={() => onImageClick?.(image)}
          whileHover={{ 
            scale: 1.02,
            transition: { duration: 0.3 }
          }}
          whileTap={{ scale: 0.98 }}
        >
          {/* Image */}
          <motion.img
            src={image.src}
            alt={image.alt}
            className="w-full h-full object-cover"
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />

          {/* Hover Overlay */}
          <AnimatePresence>
            {hoveredId === image.id && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end"
              >
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 20, opacity: 0 }}
                  transition={{ delay: 0.1, duration: 0.3 }}
                  className="p-6 text-white"
                >
                  <h3 className="text-xl font-semibold mb-2">{image.title}</h3>
                  {image.location && (
                    <p className="text-sm text-gray-200 mb-1">📍 {image.location}</p>
                  )}
                  {image.photographer && (
                    <p className="text-xs text-gray-300">📷 {image.photographer}</p>
                  )}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Click Ripple Effect */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={false}
            animate={hoveredId === image.id ? {
              background: [
                "radial-gradient(circle at 50% 50%, rgba(255,255,255,0) 0%, rgba(255,255,255,0) 100%)",
                "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)",
                "radial-gradient(circle at 50% 50%, rgba(255,255,255,0) 0%, rgba(255,255,255,0) 100%)"
              ]
            } : {}}
            transition={{ duration: 1, repeat: Infinity }}
          />
        </motion.div>
      ))}
    </motion.div>
  )
}
```

### 4. Scroll-Triggered Animations (Scrollytelling)
```typescript
// useScrollAnimation.ts
import { useScroll, useTransform, MotionValue } from 'framer-motion'
import { RefObject, useMemo } from 'react'

interface ScrollAnimationOptions {
  offset?: [string, string]
  target?: RefObject<HTMLElement>
}

export function useScrollAnimation(
  element: RefObject<HTMLElement>,
  options: ScrollAnimationOptions = {}
) {
  const { offset = ["start end", "end start"], target } = options
  
  const { scrollYProgress } = useScroll({
    target: target || element,
    offset: offset as any
  })

  // Pre-defined animation transforms for common use cases
  const animations = useMemo(() => ({
    // Fade in/out
    opacity: useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]),
    
    // Slide up
    y: useTransform(scrollYProgress, [0, 0.5, 1], [100, 0, -100]),
    
    // Scale effect
    scale: useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1, 1.2]),
    
    // Rotate
    rotate: useTransform(scrollYProgress, [0, 1], [0, 360]),
    
    // Parallax background
    backgroundY: useTransform(scrollYProgress, [0, 1], ["0%", "50%"]),
    
    // Text reveal
    textReveal: useTransform(scrollYProgress, [0, 0.4], [100, 0])
  }), [scrollYProgress])

  return { scrollYProgress, ...animations }
}

// ScrollReveal component for easy implementation
interface ScrollRevealProps {
  children: React.ReactNode
  animation?: 'fadeIn' | 'slideUp' | 'slideLeft' | 'slideRight' | 'scale'
  delay?: number
  duration?: number
  className?: string
}

export function ScrollReveal({ 
  children, 
  animation = 'fadeIn',
  delay = 0,
  duration = 0.6,
  className 
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScrollAnimation(ref, {
    offset: ["start 0.8", "start 0.3"]
  })

  const animationVariants = {
    fadeIn: {
      opacity: useTransform(scrollYProgress, [0, 1], [0, 1])
    },
    slideUp: {
      opacity: useTransform(scrollYProgress, [0, 1], [0, 1]),
      y: useTransform(scrollYProgress, [0, 1], [50, 0])
    },
    slideLeft: {
      opacity: useTransform(scrollYProgress, [0, 1], [0, 1]),
      x: useTransform(scrollYProgress, [0, 1], [50, 0])
    },
    scale: {
      opacity: useTransform(scrollYProgress, [0, 1], [0, 1]),
      scale: useTransform(scrollYProgress, [0, 1], [0.8, 1])
    }
  }

  return (
    <motion.div
      ref={ref}
      style={animationVariants[animation]}
      transition={{ delay, duration }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
```

### 5. Interactive Directory Cards
```typescript
// DirectoryCard.tsx with enhanced animations
import { motion } from 'framer-motion'
import { useState } from 'react'

interface DirectoryCardProps {
  entry: DirectoryEntry
  onSelect?: (entry: DirectoryEntry) => void
  featured?: boolean
}

export function DirectoryCard({ entry, onSelect, featured }: DirectoryCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  const cardVariants = {
    initial: {
      scale: 1,
      y: 0,
      rotateY: 0,
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
    },
    hover: {
      scale: featured ? 1.05 : 1.03,
      y: -8,
      rotateY: featured ? 5 : 2,
      boxShadow: featured 
        ? "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
        : "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20
      }
    }
  }

  const imageVariants = {
    initial: { scale: 1 },
    hover: { 
      scale: 1.1,
      transition: { duration: 0.4 }
    }
  }

  const overlayVariants = {
    initial: { opacity: 0, y: 20 },
    hover: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3 }
    }
  }

  return (
    <motion.div
      variants={cardVariants}
      initial="initial"
      whileHover="hover"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={() => onSelect?.(entry)}
      className={`
        relative bg-white rounded-2xl overflow-hidden cursor-pointer
        ${featured ? 'col-span-2 row-span-2' : ''}
      `}
      style={{ transformStyle: 'preserve-3d' }}
    >
      {/* Image Container */}
      <div className="relative overflow-hidden">
        <motion.img
          src={entry.imageUrl}
          alt={entry.name}
          variants={imageVariants}
          className={`w-full object-cover ${
            featured ? 'h-64' : 'h-48'
          }`}
        />

        {/* Category Badge */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="absolute top-4 left-4"
        >
          <CategoryMarkerIcon 
            category={entry.category} 
            size={featured ? 'lg' : 'md'} 
          />
        </motion.div>

        {/* Rating Badge */}
        {entry.rating && (
          <motion.div
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="absolute top-4 right-4 bg-black/50 backdrop-blur text-white px-2 py-1 rounded-full text-sm"
          >
            ⭐ {entry.rating}
          </motion.div>
        )}

        {/* Hover Overlay */}
        <motion.div
          variants={overlayVariants}
          className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end"
        >
          <div className="p-4 text-white">
            <p className="text-sm">Click to explore</p>
          </div>
        </motion.div>
      </div>

      {/* Content */}
      <div className="p-6">
        <motion.h3
          className={`font-semibold text-gray-900 mb-2 ${
            featured ? 'text-2xl' : 'text-xl'
          }`}
          animate={isHovered ? { x: 4 } : { x: 0 }}
          transition={{ duration: 0.2 }}
        >
          {entry.name}
        </motion.h3>

        <motion.p
          className="text-gray-600 text-sm leading-relaxed mb-4"
          animate={isHovered ? { opacity: 0.8 } : { opacity: 1 }}
        >
          {entry.description}
        </motion.p>

        {/* Action Buttons */}
        <motion.div
          className="flex gap-2"
          initial={{ y: 10, opacity: 0 }}
          animate={isHovered ? { y: 0, opacity: 1 } : { y: 10, opacity: 0 }}
          transition={{ duration: 0.2, delay: 0.1 }}
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            View Details
          </motion.button>
          
          {entry.latitude && entry.longitude && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium"
            >
              📍 Show on Map
            </motion.button>
          )}
        </motion.div>
      </div>

      {/* Loading shimmer effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
        initial={{ x: "-100%" }}
        animate={isHovered ? { x: "200%" } : { x: "-100%" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        style={{ pointerEvents: 'none' }}
      />
    </motion.div>
  )
}
```

## Performance Optimization

### 1. Hardware Acceleration
```typescript
// Optimized animation configurations
const performantAnimations = {
  // Use transform properties for hardware acceleration
  scale: { type: "spring", stiffness: 400, damping: 30 },
  x: { type: "tween", duration: 0.3 },
  y: { type: "tween", duration: 0.3 },
  rotate: { type: "spring", stiffness: 200, damping: 20 },
  
  // Avoid animating layout properties
  // ❌ Don't animate: width, height, padding, margin
  // ✅ Use transform: scale, translate
}

// Force hardware acceleration with CSS
const hardwareAccelerated = {
  transform: 'translate3d(0, 0, 0)', // Force GPU layer
  willChange: 'transform', // Hint to browser for optimization
  backfaceVisibility: 'hidden' // Prevent flickering
}

// Use layout animations sparingly
const layoutAnimation = {
  layout: true, // Only when necessary
  layoutId: "unique-id", // For shared element transitions
  transition: { type: "spring", stiffness: 400, damping: 30 }
}
```

### 2. Reduced Motion Support
```typescript
// Respect user's motion preferences
import { useReducedMotion } from 'framer-motion'

export function AccessibleAnimation({ children }: { children: React.ReactNode }) {
  const shouldReduceMotion = useReducedMotion()

  const animationProps = shouldReduceMotion
    ? {
        initial: false,
        animate: { opacity: 1 },
        transition: { duration: 0 }
      }
    : {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.6 }
      }

  return (
    <motion.div {...animationProps}>
      {children}
    </motion.div>
  )
}

// CSS-based fallbacks for reduced motion
/* globals.css */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### 3. Loading States and Skeletons
```typescript
// AnimatedSkeleton for loading states
export function AnimatedSkeleton({ className }: { className?: string }) {
  return (
    <motion.div
      className={`bg-gray-200 rounded ${className}`}
      animate={{
        opacity: [0.4, 0.8, 0.4]
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    />
  )
}

// Staggered loading animation
const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
}

export function StaggeredLoader() {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 md:grid-cols-3 gap-6"
    >
      {Array.from({ length: 6 }).map((_, i) => (
        <motion.div key={i} variants={itemVariants}>
          <AnimatedSkeleton className="h-48 mb-4" />
          <AnimatedSkeleton className="h-4 w-3/4 mb-2" />
          <AnimatedSkeleton className="h-3 w-1/2" />
        </motion.div>
      ))}
    </motion.div>
  )
}
```

## Mobile & Touch Optimizations

### 1. Touch-Friendly Gestures
```typescript
// Swipe gestures for mobile galleries
import { PanInfo, useDragControls } from 'framer-motion'

export function SwipeableGallery({ images }: { images: string[] }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const dragControls = useDragControls()

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 50
    
    if (info.offset.x > threshold) {
      // Swipe right - previous image
      setCurrentIndex(Math.max(0, currentIndex - 1))
    } else if (info.offset.x < -threshold) {
      // Swipe left - next image  
      setCurrentIndex(Math.min(images.length - 1, currentIndex + 1))
    }
  }

  return (
    <motion.div
      className="relative overflow-hidden"
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.2}
      onDragEnd={handleDragEnd}
      whileDrag={{ scale: 0.95 }}
    >
      <motion.div
        className="flex"
        animate={{ x: `-${currentIndex * 100}%` }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {images.map((image, index) => (
          <img
            key={index}
            src={image}
            className="w-full h-64 object-cover flex-shrink-0"
            alt={`Gallery image ${index + 1}`}
          />
        ))}
      </motion.div>
      
      {/* Navigation indicators */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
        {images.map((_, index) => (
          <motion.button
            key={index}
            className={`w-2 h-2 rounded-full ${
              index === currentIndex ? 'bg-white' : 'bg-white/50'
            }`}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.8 }}
            onClick={() => setCurrentIndex(index)}
          />
        ))}
      </div>
    </motion.div>
  )
}
```

## Tourism-Specific Animation Patterns

### 1. Location Reveal Animation
```typescript
// LocationReveal for tourism content
export function LocationReveal({ 
  title, 
  description, 
  coordinates 
}: {
  title: string
  description: string
  coordinates: [number, number]
}) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      className="text-center"
    >
      <motion.h2
        variants={{
          hidden: { opacity: 0, y: 50 },
          visible: { 
            opacity: 1, 
            y: 0,
            transition: { duration: 0.8, ease: "easeOut" }
          }
        }}
        className="text-4xl font-bold mb-6"
      >
        {title}
      </motion.h2>

      <motion.p
        variants={{
          hidden: { opacity: 0 },
          visible: { 
            opacity: 1,
            transition: { delay: 0.3, duration: 0.8 }
          }
        }}
        className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto"
      >
        {description}
      </motion.p>

      <motion.div
        variants={{
          hidden: { scale: 0, opacity: 0 },
          visible: { 
            scale: 1, 
            opacity: 1,
            transition: { 
              delay: 0.6, 
              type: "spring",
              stiffness: 200,
              damping: 20
            }
          }
        }}
        className="inline-flex items-center gap-2 text-blue-600 font-medium"
      >
        📍 {coordinates[0].toFixed(3)}, {coordinates[1].toFixed(3)}
      </motion.div>
    </motion.div>
  )
}
```

This knowledge base provides comprehensive coverage of animation patterns, performance optimization, and tourism-specific motion design for the Nos Ilha platform.