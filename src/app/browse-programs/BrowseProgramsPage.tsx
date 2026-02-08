/* eslint-disable @next/next/no-img-element */
'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Filter, GraduationCap, MapPin, Calendar, Users } from 'lucide-react';
import type { User } from '@supabase/supabase-js';
import type { Institution } from '@/types/institution';
import DashboardLayout from '@/components/layout/DashboardLayout';
import styles from '@/styles/modules/pages/browse-programs.module.scss';

interface Program {
  id: string;
  name: string;
  institution: Institution;
  institution_id: string;
  program_type: string | null;
  degree_type: string | null;
  field_of_study: string | null;
  description: string | null;
  min_prereq_gpa: number | null;
  min_overall_gpa: number | null;
  application_deadline: unknown;
  seats_available: number | null;
  acceptance_rate: number | null;
  avg_completion_time: number | null;
  tuition_info: unknown;
  is_published: boolean;
}

interface BrowseProgramsPageProps {
  user: User;
  programs: Program[];
  institutions: Institution[];
  userInstitutions: Institution[];
}

export default function BrowseProgramsPage({ user, programs, institutions, userInstitutions }: BrowseProgramsPageProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInstitution, setSelectedInstitution] = useState<string>('all');
  const [selectedProgramType, setSelectedProgramType] = useState<string>('all');
  const [selectedDegreeType, setSelectedDegreeType] = useState<string>('all');
  const [selectedField, setSelectedField] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Extract unique values for filters
  const programTypes = useMemo(() => {
    const types = new Set(programs.map(p => p.program_type).filter(Boolean));
    return Array.from(types).sort();
  }, [programs]);

  const degreeTypes = useMemo(() => {
    const types = new Set(programs.map(p => p.degree_type).filter(Boolean));
    return Array.from(types).sort();
  }, [programs]);

  const fields = useMemo(() => {
    const fieldSet = new Set(programs.map(p => p.field_of_study).filter(Boolean));
    return Array.from(fieldSet).sort();
  }, [programs]);

  // Filter programs
  const filteredPrograms = useMemo(() => {
    return programs.filter(program => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesName = program.name.toLowerCase().includes(query);
        const matchesInstitution = program.institution?.name.toLowerCase().includes(query);
        const matchesField = program.field_of_study?.toLowerCase().includes(query);
        if (!matchesName && !matchesInstitution && !matchesField) return false;
      }

      // Institution filter
      if (selectedInstitution !== 'all' && program.institution_id !== selectedInstitution) {
        return false;
      }

      // Program type filter
      if (selectedProgramType !== 'all' && program.program_type !== selectedProgramType) {
        return false;
      }

      // Degree type filter
      if (selectedDegreeType !== 'all' && program.degree_type !== selectedDegreeType) {
        return false;
      }

      // Field filter
      if (selectedField !== 'all' && program.field_of_study !== selectedField) {
        return false;
      }

      return true;
    });
  }, [programs, searchQuery, selectedInstitution, selectedProgramType, selectedDegreeType, selectedField]);

  const handleViewProgram = (programId: string) => {
    router.push(`/browse-programs/${programId}`);
  };

  return (
    <DashboardLayout user={user}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Browse Programs</h1>
            <p className={styles.subtitle}>
              Discover programs from verified institutions nationwide
            </p>
          </div>
        </div>

        {/* Your Institutions */}
        {userInstitutions.length > 0 && (
          <div className={styles.userInstitutions}>
            <h3 className={styles.sectionTitle}>Your Institutions</h3>
            <div className={styles.institutionChips}>
              {userInstitutions.map(inst => (
                <button
                  key={inst.id}
                  className={`${styles.institutionChip} ${selectedInstitution === inst.id ? styles.active : ''}`}
                  onClick={() => setSelectedInstitution(selectedInstitution === inst.id ? 'all' : inst.id)}
                >
                  {inst.logo_url && <img src={inst.logo_url} alt={inst.name} className={styles.chipLogo} />}
                  {inst.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className={styles.controls}>
          <div className={styles.searchBar}>
            <Search size={20} />
            <input
              type="text"
              placeholder="Search programs, institutions, or fields..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          <button 
            className={styles.filterToggle}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={20} />
            Filters
            {(selectedProgramType !== 'all' || selectedDegreeType !== 'all' || selectedField !== 'all' || selectedInstitution !== 'all') && (
              <span className={styles.filterBadge}>●</span>
            )}
          </button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className={styles.filters}>
            <div className={styles.filterGroup}>
              <label>Institution</label>
              <select
                value={selectedInstitution}
                onChange={(e) => setSelectedInstitution(e.target.value)}
                className={styles.select}
              >
                <option value="all">All Institutions</option>
                {institutions.map(inst => (
                  <option key={inst.id} value={inst.id}>{inst.name}</option>
                ))}
              </select>
            </div>

            <div className={styles.filterGroup}>
              <label>Program Type</label>
              <select
                value={selectedProgramType}
                onChange={(e) => setSelectedProgramType(e.target.value)}
                className={styles.select}
              >
                <option value="all">All Types</option>
                {programTypes.map(type => (
                  <option key={type || 'unknown'} value={type || ''}>{type}</option>
                ))}
              </select>
            </div>

            <div className={styles.filterGroup}>
              <label>Degree Type</label>
              <select
                value={selectedDegreeType}
                onChange={(e) => setSelectedDegreeType(e.target.value)}
                className={styles.select}
              >
                <option value="all">All Degrees</option>
                {degreeTypes.map(degree => (
                  <option key={degree || 'unknown'} value={degree || ''}>{degree}</option>
                ))}
              </select>
            </div>

            <div className={styles.filterGroup}>
              <label>Field of Study</label>
              <select
                value={selectedField}
                onChange={(e) => setSelectedField(e.target.value)}
                className={styles.select}
              >
                <option value="all">All Fields</option>
                {fields.map(field => (
                  <option key={field || 'unknown'} value={field || ''}>{field}</option>
                ))}
              </select>
            </div>

            <button 
              className={styles.clearFilters}
              onClick={() => {
                setSelectedInstitution('all');
                setSelectedProgramType('all');
                setSelectedDegreeType('all');
                setSelectedField('all');
                setSearchQuery('');
              }}
            >
              Clear All Filters
            </button>
          </div>
        )}

        {/* Results Count */}
        <div className={styles.resultsCount}>
          {filteredPrograms.length} program{filteredPrograms.length !== 1 ? 's' : ''} found
        </div>

        {/* Programs Grid */}
        {filteredPrograms.length === 0 ? (
          <div className={styles.empty}>
            <GraduationCap size={64} strokeWidth={1.5} />
            <h3>No programs found</h3>
            <p>Try adjusting your filters or search query</p>
          </div>
        ) : (
          <div className={styles.programsGrid}>
            {filteredPrograms.map((program) => (
              <div key={program.id} className={styles.programCard}>
                {/* Institution Header */}
                <div className={styles.institutionHeader}>
                  {program.institution?.logo_url && (
                    <img src={program.institution.logo_url} alt={program.institution.name} className={styles.institutionLogo} />
                  )}
                  <div className={styles.institutionInfo}>
                    <div className={styles.institutionName}>{program.institution?.name}</div>
                    {program.institution?.country && (
                      <div className={styles.institutionLocation}>
                        <MapPin size={14} />
                        {program.institution.country}
                      </div>
                    )}
                  </div>
                </div>

                {/* Program Details */}
                <div className={styles.programContent}>
                  <h3 className={styles.programName}>{program.name}</h3>
                  
                  {program.description && (
                    <p className={styles.programDescription}>
                      {program.description.length > 150 
                        ? program.description.substring(0, 150) + '...' 
                        : program.description}
                    </p>
                  )}

                  <div className={styles.programMeta}>
                    {program.degree_type && (
                      <div className={styles.metaItem}>
                        <GraduationCap size={16} />
                        {program.degree_type}
                      </div>
                    )}
                    {program.program_type && (
                      <div className={styles.metaItem}>
                        <Users size={16} />
                        {program.program_type}
                      </div>
                    )}
                    {program.avg_completion_time && (
                      <div className={styles.metaItem}>
                        <Calendar size={16} />
                        {program.avg_completion_time} months
                      </div>
                    )}
                  </div>

                  {/* Requirements */}
                  <div className={styles.requirements}>
                    {program.min_prereq_gpa !== null && (
                      <div className={styles.requirement}>
                        <span className={styles.requirementLabel}>Min Prereq GPA:</span>
                        <span className={styles.requirementValue}>{program.min_prereq_gpa.toFixed(2)}</span>
                      </div>
                    )}
                    {program.min_overall_gpa !== null && (
                      <div className={styles.requirement}>
                        <span className={styles.requirementLabel}>Min Overall GPA:</span>
                        <span className={styles.requirementValue}>{program.min_overall_gpa.toFixed(2)}</span>
                      </div>
                    )}
                  </div>

                  {/* Stats */}
                  {(program.acceptance_rate || program.seats_available) && (
                    <div className={styles.stats}>
                      {program.acceptance_rate && (
                        <div className={styles.stat}>
                          <span className={styles.statValue}>{(program.acceptance_rate * 100).toFixed(0)}%</span>
                          <span className={styles.statLabel}>Acceptance</span>
                        </div>
                      )}
                      {program.seats_available && (
                        <div className={styles.stat}>
                          <span className={styles.statValue}>{program.seats_available}</span>
                          <span className={styles.statLabel}>Seats</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className={styles.cardActions}>
                  <button 
                    className={styles.viewButton}
                    onClick={() => handleViewProgram(program.id)}
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
