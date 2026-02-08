/**
 * Institution Sidebar component
 * Navigation for institution admin pages
 * @returns InstitutionSidebar JSX element
 */
import { SidebarLink } from '@/types/shared/sidebar';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  BookOpen, 
  Settings,
  BarChart3
} from 'lucide-react';

export default function InstitutionSidebar() {
    const links: SidebarLink[] = [
        { label: 'Dashboard', href: '/institution/dashboard', icon: <LayoutDashboard />, exact: true },
        { label: 'Institution Profile', href: '/institution/profile', icon: <Building2 /> },
        { label: 'Programs', href: '/institution/programs', icon: <BookOpen /> },
        { label: 'Students', href: '/institution/students', icon: <Users /> },
        { label: 'Reports', href: '/institution/reports', icon: <BarChart3 /> },
        { label: 'Settings', href: '/institution/settings', icon: <Settings /> },
    ]

    return (
        <aside className="sidebar sidebar-full">
            <div className="sidebar-inner">
                <div className="sidebar-menu">
                    <div className="sidebar-menu-inner">
                        <div className="navigation-block">
                            <h3 className="navigation-block-title">Institution Admin</h3>
                            <ul className="sidebar-menu-list">
                                {links.map((link) => (
                                    <li key={link.href} className="sidebar-menu-item">
                                        <Link href={link.href} className="sidebar-menu-link">
                                            {link.icon && <span className="sidebar-menu-icon">{link.icon}</span>}
                                            <span className="sidebar-menu-label">{link.label}</span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
                <div className="sidebar-footer">
                    <p className="sidebar-footer-text">© 2026 Prereq Pilot</p>
                </div>
            </div>
        </aside>
    );
}
