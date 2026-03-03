/**
 * Contact Form Types
 *
 * Types for community contact form submissions and API communication.
 * Matches the ContactDto from Spring Boot backend.
 */

// ================================
// CONTACT FORM ENUMS
// ================================

/**
 * Contact form subject categories
 * Matches the ContactSubject enum from backend
 */
export type ContactSubject =
  | "GENERAL_INQUIRY"
  | "CONTENT_SUGGESTION"
  | "TECHNICAL_ISSUE"
  | "PARTNERSHIP";

// ================================
// CONTACT FORM REQUEST/RESPONSE TYPES
// ================================

/**
 * Contact form submission request
 * Matches the ContactRequest DTO from backend
 *
 * Used for POST /api/v1/contact endpoint
 */
export interface ContactRequest {
  /**
   * Name of the person submitting the contact form
   */
  name: string;

  /**
   * Email address for response
   */
  email: string;

  /**
   * Subject category for routing and organization
   */
  subjectCategory: ContactSubject;

  /**
   * Message content
   */
  message: string;
}

/**
 * Contact form confirmation response
 * Matches the ContactConfirmationDto from backend
 *
 * Returned after successful contact form submission
 */
export interface ContactConfirmationDto {
  /**
   * Unique identifier for the submitted contact form
   */
  id: string;

  /**
   * User-friendly confirmation message
   *
   * Example: "Thank you for contacting us! We'll respond within 48 hours."
   */
  message: string;

  /**
   * ISO 8601 timestamp of when the form was submitted
   */
  submittedAt: string;
}

// ================================
// SUBJECT CATEGORY HELPERS
// ================================

/**
 * Human-readable labels for contact subject categories
 */
export const CONTACT_SUBJECT_LABELS: Record<ContactSubject, string> = {
  GENERAL_INQUIRY: "General Inquiry",
  CONTENT_SUGGESTION: "Content Suggestion",
  TECHNICAL_ISSUE: "Technical Issue",
  PARTNERSHIP: "Partnership Opportunity",
};

/**
 * Get display label for contact subject category
 */
export function getContactSubjectLabel(subject: ContactSubject): string {
  return CONTACT_SUBJECT_LABELS[subject];
}

/**
 * All available contact subject categories
 */
export const CONTACT_SUBJECTS: ContactSubject[] = [
  "GENERAL_INQUIRY",
  "CONTENT_SUGGESTION",
  "TECHNICAL_ISSUE",
  "PARTNERSHIP",
];
