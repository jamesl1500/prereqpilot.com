'use client';

import React from 'react';
import Link from 'next/link';
import { PenTool } from 'lucide-react';
import styles from '@/styles/modules/components/Header.module.scss';
import { NavLink } from '@/types/shared/header';

export default function Header() {
    const links: NavLink[] = [
        { href: '/settings', label: 'Settings' },
        { href: '/logout', label: 'Logout', action: true },
    ];

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
                            className={`${styles.navLink} ${link.action ? styles.actionLink : ''}`}
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>
            </div>
        </header>
    );
}
