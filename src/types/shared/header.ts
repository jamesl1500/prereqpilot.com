/**
 * Header types / Interfaces
 * 
 * @module types/shared/header
 */

/**
 * Interface for navigation link
 * 
 * @interface NavLink
 */
export interface NavLink {
  href: string;
  label: string;
  action?: boolean;
}