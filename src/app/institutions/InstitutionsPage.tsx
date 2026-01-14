'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Search, Building2, Globe, MapPin, Plus } from 'lucide-react';
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Institution } from "@/types";
import { User } from "@supabase/supabase-js";
import styles from '@/styles/modules/pages/institutions.module.scss';

interface InstitutionsPageProps {
  user: User;
  userInstitutions: Institution[];
  officialInstitutions: Institution[];
}

export default function InstitutionsPage({ user, userInstitutions, officialInstitutions }: InstitutionsPageProps) {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCountry, setSelectedCountry] = useState<string>('all');

    // Get unique countries from official institutions
    const countries = useMemo(() => {
        const countrySet = new Set(
            officialInstitutions
                .map(inst => inst.country)
                .filter(Boolean) as string[]
        );
        return Array.from(countrySet).sort();
    }, [officialInstitutions]);

    // Filter official institutions
    const filteredOfficialInstitutions = useMemo(() => {
        return officialInstitutions.filter(institution => {
            // Search query
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                const nameMatch = institution.name.toLowerCase().includes(query);
                const shortCodeMatch = institution.short_code?.toLowerCase().includes(query);
                if (!nameMatch && !shortCodeMatch) return false;
            }

            // Country filter
            if (selectedCountry !== 'all' && institution.country !== selectedCountry) {
                return false;
            }

            return true;
        });
    }, [officialInstitutions, searchQuery, selectedCountry]);

    // Filter user institutions
    const filteredUserInstitutions = useMemo(() => {
        if (!searchQuery) return userInstitutions;
        
        const query = searchQuery.toLowerCase();
        return userInstitutions.filter(institution => {
            const nameMatch = institution.name.toLowerCase().includes(query);
            const shortCodeMatch = institution.short_code?.toLowerCase().includes(query);
            return nameMatch || shortCodeMatch;
        });
    }, [userInstitutions, searchQuery]);

    const handleAddInstitution = () => {
        router.push('/institutions/new');
    };

    const handleViewInstitution = (institutionId: string) => {
        router.push(`/institutions/${institutionId}`);
    };

    return (
        <DashboardLayout user={user}>
            <div className={styles.container}>
                {/* Header */}
                <div className={styles.header}>
                    <div>
                        <h1 className={styles.title}>Institutions</h1>
                        <p className={styles.subtitle}>
                            Browse institutions and manage your custom institutions
                        </p>
                    </div>
                    <button className={styles.addButton} onClick={handleAddInstitution}>
                        <Plus size={20} />
                        Add Institution
                    </button>
                </div>

                {/* Search and Filters */}
                <div className={styles.filters}>
                    <div className={styles.searchBox}>
                        <Search size={20} />
                        <input
                            type="text"
                            placeholder="Search institutions..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={styles.searchInput}
                        />
                    </div>
                    
                    <select 
                        value={selectedCountry}
                        onChange={(e) => setSelectedCountry(e.target.value)}
                        className={styles.filterSelect}
                    >
                        <option value="all">All Countries</option>
                        {countries.map(country => (
                            <option key={country} value={country}>
                                {country}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Your Institutions Section */}
                {userInstitutions.length > 0 && (
                    <div className={styles.section}>
                        <h2 className={styles.sectionTitle}>
                            <Building2 size={24} />
                            Your Institutions
                        </h2>
                        <p className={styles.sectionDescription}>
                            Institutions you've created for tracking your coursework
                        </p>
                        
                        {filteredUserInstitutions.length === 0 ? (
                            <div className={styles.empty}>
                                <p>No institutions match your search</p>
                            </div>
                        ) : (
                            <div className={styles.institutionsGrid}>
                                {filteredUserInstitutions.map((institution) => (
                                    <div 
                                        key={institution.id} 
                                        className={styles.institutionCard}
                                    >
                                        <div className={styles.cardHeader}>
                                            <div className={styles.institutionIcon}>
                                                <Building2 size={32} />
                                            </div>
                                            <div className={styles.badge}>
                                                Custom
                                            </div>
                                        </div>
                                        
                                        <div className={styles.cardContent}>
                                            <h3 className={styles.institutionName}>
                                                {institution.name}
                                            </h3>
                                            {institution.short_code && (
                                                <p className={styles.institutionCode}>
                                                    {institution.short_code}
                                                </p>
                                            )}
                                            
                                            <div className={styles.institutionMeta}>
                                                {institution.country && (
                                                    <div className={styles.metaItem}>
                                                        <MapPin size={16} />
                                                        {institution.country}
                                                    </div>
                                                )}
                                                {institution.website_url && (
                                                    <div className={styles.metaItem}>
                                                        <Globe size={16} />
                                                        {institution.website_url}
                                                    </div>
                                                )}
                                            </div>
                                            
                                            {institution.courses && institution.courses[0]?.count > 0 && (
                                                <div className={styles.courseInfo}>
                                                    <span className={styles.courseCount}>
                                                        {institution.courses[0].count} course{institution.courses[0].count !== 1 ? 's' : ''}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                        
                                        <div className={styles.cardActions}>
                                            <button 
                                                className={styles.viewButton}
                                                onClick={() => handleViewInstitution(institution.id)}
                                            >
                                                View Details
                                            </button>
                                            <button 
                                                className={styles.editButton}
                                                onClick={() => router.push(`/institutions/${institution.id}/edit`)}
                                            >
                                                Edit
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Official Institutions Section */}
                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>
                        <Globe size={24} />
                        Official Institutions
                    </h2>
                    <p className={styles.sectionDescription}>
                        Verified institutions with official course catalogs and programs
                    </p>
                    
                    <div className={styles.resultsCount}>
                        {filteredOfficialInstitutions.length} institution{filteredOfficialInstitutions.length !== 1 ? 's' : ''} found
                    </div>
                    
                    {filteredOfficialInstitutions.length === 0 ? (
                        <div className={styles.empty}>
                            <Building2 size={64} strokeWidth={1.5} />
                            <h3>No institutions found</h3>
                            <p>Try adjusting your search or filters</p>
                        </div>
                    ) : (
                        <div className={styles.institutionsGrid}>
                            {filteredOfficialInstitutions.map((institution) => (
                                <div 
                                    key={institution.id} 
                                    className={styles.institutionCard}
                                    onClick={() => handleViewInstitution(institution.id)}
                                >
                                    <div className={styles.cardHeader}>
                                        {institution.logo_url ? (
                                            <Image 
                                                src={institution.logo_url} 
                                                alt={institution.name}
                                                width={64}
                                                height={64}
                                                className={styles.institutionLogo}
                                            />
                                        ) : (
                                            <div className={styles.institutionIcon}>
                                                <Building2 size={32} />
                                            </div>
                                        )}
                                        <div className={`${styles.badge} ${styles.verified}`}>
                                            Verified
                                        </div>
                                    </div>
                                    
                                    <div className={styles.cardContent}>
                                        <h3 className={styles.institutionName}>
                                            {institution.name}
                                        </h3>
                                        {institution.short_code && (
                                            <p className={styles.institutionCode}>
                                                {institution.short_code}
                                            </p>
                                        )}
                                        
                                        <div className={styles.institutionMeta}>
                                            {institution.country && (
                                                <div className={styles.metaItem}>
                                                    <MapPin size={16} />
                                                    {institution.country}
                                                </div>
                                            )}
                                            {institution.website && (
                                                <div className={styles.metaItem}>
                                                    <Globe size={16} />
                                                    Website
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div className={styles.cardFooter}>
                                        {institution.courses && institution.courses[0]?.count > 0 && (
                                            <span className={styles.courseCount}>
                                                {institution.courses[0].count} course{institution.courses[0].count !== 1 ? 's' : ''}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}