/**
 * Comprehensive API type definitions for backend communication
 * This file defines all API response structures and error handling types
 */

// ================================
// GENERIC API RESPONSE TYPES
// ================================

/**
 * Standard API response wrapper for single items
 */
export interface ApiResponse<T> {
  data: T;
  timestamp: string;
  success: boolean;
  message?: string;
}

/**
 * Standard API response wrapper for paginated data
 */
export interface PagedApiResponse<T> {
  data: T[];
  timestamp: string;
  success: boolean;
  message?: string;
  pagination: {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    first: boolean;
    last: boolean;
  };
}

// ================================
// ERROR RESPONSE TYPES
// ================================

/**
 * Detailed error information for validation failures
 */
export interface ErrorDetail {
  field: string;
  message: string;
  code?: string;
  rejectedValue?: unknown;
}

/**
 * Standard API error response structure
 */
export interface ApiErrorResponse {
  error: string;
  message: string;
  timestamp: string;
  status: number;
  path: string;
  details?: ErrorDetail[];
  trace?: string;
}

// ================================
// DIRECTORY ENTRY API TYPES
// ================================

/**
 * Directory entry as returned by backend API
 * Matches the DirectoryEntryDto from Spring Boot backend
 */
export interface DirectoryEntryDto {
  id: string;
  slug: string;
  name: string;
  category: "Restaurant" | "Hotel" | "Beach" | "Landmark";
  imageUrl: string | null;
  town: string;
  latitude: number;
  longitude: number;
  description: string;
  rating: number | null;
  reviewCount: number;
  createdAt: string; // ISO 8601 timestamp
  updatedAt: string; // ISO 8601 timestamp
  details: RestaurantDetailsDto | HotelDetailsDto | null;
}

/**
 * Restaurant-specific details from backend
 */
export interface RestaurantDetailsDto {
  phoneNumber: string;
  openingHours: string;
  cuisine: string[];
}

/**
 * Hotel-specific details from backend
 */
export interface HotelDetailsDto {
  phoneNumber?: string;
  amenities: string[];
}

/**
 * Request payload for creating directory entries
 */
export interface CreateDirectoryEntryRequest {
  name: string;
  category: "Restaurant" | "Hotel" | "Beach" | "Landmark";
  description: string;
  town: string;
  latitude: number;
  longitude: number;
  imageUrl?: string;
  details?: RestaurantDetailsDto | HotelDetailsDto;
}

// ================================
// TOWN API TYPES
// ================================

/**
 * Town as returned by backend API
 * Matches the TownDto from Spring Boot backend
 */
export interface TownDto {
  id: string;
  slug: string;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  population: string | null;
  elevation: string | null;
  founded: string | null;
  highlights: string[];
  heroImage: string | null;
  gallery: string[];
  createdAt: string; // ISO 8601 timestamp
  updatedAt: string; // ISO 8601 timestamp
}

// ================================
// MEDIA/FILE UPLOAD API TYPES
// ================================

/**
 * Media metadata as returned by backend API
 */
export interface MediaMetadataDto {
  id: string;
  filename: string;
  originalFilename: string;
  contentType: string;
  size: number;
  url: string;
  category?: string;
  description?: string;
  uploadedAt: string; // ISO 8601 timestamp
  uploadedBy: string; // User ID
}

/**
 * File upload request parameters
 */
export interface UploadFileRequest {
  file: File;
  category?: string;
  description?: string;
}

// ================================
// AUTHENTICATION API TYPES
// ================================

/**
 * User session information
 */
export interface UserSession {
  id: string;
  email: string;
  role: string;
  accessToken: string;
  refreshToken?: string;
  expiresAt: number; // Unix timestamp
}

/**
 * Authentication error response
 */
export interface AuthErrorResponse {
  error: "UNAUTHORIZED" | "FORBIDDEN" | "TOKEN_EXPIRED" | "INVALID_CREDENTIALS";
  message: string;
  timestamp: string;
}

// ================================
// API REQUEST PARAMETERS
// ================================

/**
 * Common pagination parameters
 */
export interface PaginationParams {
  page?: number;
  size?: number;
}

/**
 * Directory entries query parameters
 */
export interface DirectoryQueryParams extends PaginationParams {
  category?: string;
  town?: string;
  search?: string;
}

/**
 * Map-specific query parameters
 */
export interface MapQueryParams {
  category?: string;
  bounds?: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
}

// ================================
// HTTP CLIENT TYPES
// ================================

/**
 * Fetch options with authentication
 */
export interface AuthenticatedFetchOptions extends RequestInit {
  requireAuth?: boolean;
  timeout?: number;
}

/**
 * API client configuration
 */
export interface ApiClientConfig {
  baseUrl: string;
  timeout: number;
  retries: number;
  headers: Record<string, string>;
}

// ================================
// CACHE TYPES
// ================================

/**
 * Next.js fetch cache configuration
 */
export interface CacheConfig {
  revalidate?: number; // ISR revalidation in seconds
  cache?:
    | "force-cache"
    | "no-cache"
    | "no-store"
    | "default"
    | "reload"
    | "only-if-cached";
}

// ================================
// TYPE GUARDS AND VALIDATION
// ================================

/**
 * Type guard for API error responses
 */
export function isApiErrorResponse(obj: unknown): obj is ApiErrorResponse {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "error" in obj &&
    "message" in obj &&
    "timestamp" in obj &&
    "status" in obj
  );
}

/**
 * Type guard for API success responses
 */
export function isApiResponse<T>(obj: unknown): obj is ApiResponse<T> {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "data" in obj &&
    "timestamp" in obj &&
    "success" in obj
  );
}

/**
 * Type guard for paginated API responses
 */
export function isPagedApiResponse<T>(
  obj: unknown
): obj is PagedApiResponse<T> {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "data" in obj &&
    "timestamp" in obj &&
    "success" in obj &&
    "pagination" in obj &&
    Array.isArray((obj as any).data)
  );
}

// ================================
// VALIDATION ERROR HELPERS
// ================================

/**
 * Extract validation error messages from API error response
 */
export function extractValidationErrors(
  errorResponse: ApiErrorResponse
): Record<string, string> {
  if (!errorResponse.details) {
    return {};
  }

  return errorResponse.details.reduce(
    (acc, detail) => {
      acc[detail.field] = detail.message;
      return acc;
    },
    {} as Record<string, string>
  );
}

/**
 * Format validation errors for display
 */
export function formatValidationErrors(
  errorResponse: ApiErrorResponse
): string {
  if (!errorResponse.details) {
    return errorResponse.message;
  }

  return errorResponse.details
    .map((detail) => `${detail.field}: ${detail.message}`)
    .join(", ");
}

// ================================
// HTTP STATUS HELPERS
// ================================

/**
 * HTTP status code constants
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
} as const;

/**
 * Check if HTTP status indicates success
 */
export function isSuccessStatus(status: number): boolean {
  return status >= 200 && status < 300;
}

/**
 * Check if HTTP status indicates client error
 */
export function isClientError(status: number): boolean {
  return status >= 400 && status < 500;
}

/**
 * Check if HTTP status indicates server error
 */
export function isServerError(status: number): boolean {
  return status >= 500 && status < 600;
}
