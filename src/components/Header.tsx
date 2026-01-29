'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ChevronDown } from 'lucide-react';
import styles from '@/styles/modules/components/Header.module.scss';
import { NavLink } from '@/types/shared/header';

export default function Header() {
    const router = useRouter();
    const [showDropdown, setShowDropdown] = useState(false);
    
    const primaryLinks: NavLink[] = [
        { href: '/dashboard', label: 'Dashboard' },
        { href: '/programs', label: 'Programs' },
        { href: '/plans', label: 'Plans' },
    ];

    const dropdownLinks: NavLink[] = [
        { href: '/classes', label: 'Classes' },
        { href: '/transcript', label: 'Transcript' },
        { href: '/institutions', label: 'Institutions' },
        { href: '/scenarios', label: 'Scenarios' },
        { href: '/settings', label: 'Settings' },
    ];

    const handleLogout = async () => {
        try {
            const response = await fetch('/api/auth/logout', {
                method: 'POST',
            });
            
            if (response.ok) {
                router.push('/');
                router.refresh();
            }
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    return (
        <header className={styles.header}>
            <div className={styles.container}>
                <Link href="/" className={styles.logo}>
                    <Image
                        src="/primary_logo.png"
                        alt="PrereqPilot Logo"
                        width={32}
                        height={32}
                        className={styles.logoImage}
                    />
                    <span>PREREQPILOT</span>
                </Link>

                <nav className={styles.nav}>
                    {primaryLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={styles.navLink}
                        >
                            {link.label}
                        </Link>
                    ))}
                    
                    <div 
                        className={styles.dropdown}
                        onMouseEnter={() => setShowDropdown(true)}
                        onMouseLeave={() => setShowDropdown(false)}
                    >
                        <button className={styles.dropdownTrigger}>
                            More
                            <ChevronDown size={16} />
                        </button>
                        {showDropdown && (
                            <div className={styles.dropdownMenu}>
                                {dropdownLinks.map((link) => (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className={styles.dropdownItem}
                                    >
                                        {link.label}
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>

                    <button
                        onClick={handleLogout}
                        className={`${styles.navLink} ${styles.actionLink}`}
                    >
                        Logout
                    </button>
                </nav>
            </div>
        </header>
    );
}
