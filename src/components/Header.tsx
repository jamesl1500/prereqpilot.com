'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PenTool } from 'lucide-react';
import styles from '@/styles/modules/components/Header.module.scss';
import { NavLink } from '@/types/shared/header';

export default function Header() {
    const router = useRouter();
    
    const links: NavLink[] = [
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
                    <PenTool size={24} strokeWidth={2} />
                    <span>PREREQPILOT</span>
                </Link>

                <nav className={styles.nav}>
                    {links.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={styles.navLink}
                        >
                            {link.label}
                        </Link>
                    ))}
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
