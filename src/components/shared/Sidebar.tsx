/**
 * Sidebar component
 * @returns Sidebar JSX element
 */
import { SidebarLink } from '@/types/shared/sidebar';
import Link from 'next/link';

import { FileQuestionMark, LayoutDashboard, PcCase, Rocket, School, SquareFunction } from 'lucide-react';

export default function Sidebar() {
    const links: SidebarLink[] = [
        { label: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard />, exact: true },
        { label: 'Classes', href: '/classes', icon: <PcCase /> },
        { label: 'Institutions', href: '/institutions', icon: <School /> },
        { label: 'Programs', href: '/programs', icon: <SquareFunction /> },
        { label: 'Scenarios', href: '/scenarios', icon: <FileQuestionMark /> },
    ]

    const sublinks: SidebarLink[] = [
        { label: 'Settings', href: '/settings' },
        { label: 'Help', href: '/help' },
        { label: 'Logout', href: '/logout' },
    ];

    return (
        <aside className="sidebar sidebar-full">
            <div className="sidebar-inner">

                <div className="sidebar-menu">
                    <div className="sidebar-menu-inner">
                        <div className="navigation-block">
                            <h3 className="navigation-block-title">Navigation</h3>
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
                        <div className="navigation-block">
                            <h3 className="navigation-block-title">Account</h3>
                            <ul className="sidebar-menu-list">
                                {sublinks.map((link) => (
                                    <li key={link.href} className="sidebar-menu-item">
                                        <Link href={link.href} className="sidebar-menu-link">
                                            <span className="sidebar-menu-label">{link.label}</span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
                <div className="sidebar-footer">
                    <p className="sidebar-footer-text">© 2024 Prereq Pilot</p>
                </div>
            </div>
        </aside>
    );
}