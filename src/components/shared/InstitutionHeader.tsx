'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PenTool, ChevronDown } from 'lucide-react';
import type { User } from '@supabase/supabase-js';
import styles from '@/styles/modules/components/Header.module.scss';
import Image from 'next/image';

interface InstitutionHeaderProps {
    user: User;
}

export default function InstitutionHeader({ user }: InstitutionHeaderProps) {
    const router = useRouter();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

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

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <header className={styles.header}>
            <div className={styles.container}>
                <Link href="/institution/dashboard" className={styles.logo}>
                    <Image
                        src="/primary_logo.png"
                        alt="PrereqPilot Logo"
                        width={32}
                        height={32}
                        className={styles.logoImage}
                    />
                    <span>PREREQPILOT</span>
                    <span className={styles.badge}>Admin</span>
                </Link>

                <nav className={styles.nav}>
                    <Link href="/institution/dashboard" className={styles.navLink}>
                        Dashboard
                    </Link>
                    <Link href="/institution/profile" className={styles.navLink}>
                        Profile
                    </Link>
                    <Link href="/institution/programs" className={styles.navLink}>
                        Programs
                    </Link>
                    <Link href="/institution/courses" className={styles.navLink}>
                        Courses
                    </Link>

                    {/* Dropdown for More Options */}
                    <div className={styles.dropdown} ref={dropdownRef}>
                        <button
                            className={`${styles.navLink} ${styles.dropdownToggle}`}
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        >
                            More <ChevronDown size={16} />
                        </button>
                        {isDropdownOpen && (
                            <div className={styles.dropdownMenu}>
                                <Link href="/institution/staff" className={styles.dropdownItem}>
                                    Manage Staff
                                </Link>
                                <Link href="/institution/settings" className={styles.dropdownItem}>
                                    Settings
                                </Link>
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
