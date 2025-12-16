/**
 * Modal component props types
 * 
 * @module types/modal
 */
import type { CourseModalData } from './course';
import type { Term } from './term';
import type { Institution } from './institution';
import type { Program } from './program';
import type { Scenario } from './scenario';

/**
 * Delete Modal props structure
 * @interface DeleteModalProps
 */
export interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemType: 'course' | 'institution' | 'program' | 'scenario' | 'term';
  itemId: string;
  itemName: string;
}

/**
 * No Terms Prompt props structure
 * @interface NoTermsPromptProps
 */
export interface NoTermsPromptProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateTerm: () => void;
}

/**
 * Course Modal props structure
 * @interface CourseModalProps
 */
export interface CourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  course?: CourseModalData;
  terms: Term[];
  institutions: Institution[];
}

/**
 * Institution Modal props structure
 * @interface InstitutionModalProps
 */
export interface InstitutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  institution?: Institution;
}

/**
 * Program Modal props structure
 * @interface ProgramModalProps
 */
export interface ProgramModalProps {
  isOpen: boolean;
  onClose: () => void;
  program?: Program;
}

/** 
 * Scenario Modal props structure
 * @interface ScenarioModalProps
 */
export interface ScenarioModalProps {
  isOpen: boolean;
  onClose: () => void;
  scenario?: Scenario;
}

/**
 * Term Modal props structure
 * @interface TermModalProps
 */
export interface TermModalProps {
  isOpen: boolean;
  onClose: () => void;
  term?: Term;
}
