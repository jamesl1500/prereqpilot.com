/**
 * Sidebar Types
 * 
 * @module types/shared/sidebar
 */

/**
 * Sidebar link interface
 * @interface SidebarLink
 */
export interface SidebarLink {
    label: string;
    href: string;
    icon?: React.ReactNode;
    exact?: boolean;
}

/**
 * Sidebar props interface
 * @interface SidebarProps
 */
export interface SidebarProps {
    links: SidebarLink[];
    isOpen: boolean;
    onClose: () => void;
}