/**
 * Error Logs Types
 * 
 * This file defines types related to error logging within the application.
 * 
 * @module types/error_logs
 */

/**
 * Error Log structure
 * @interface ErrorLog
 */
export interface ErrorLog {
    id: string;
    type: string;
    error_desc: string;
    severity: number;
    payload_sent: string | null;
    payload_received: string | null;
    page: string | null;
    route: string;
    function: string | null;
    user: string | null;
    created_at: string;
    updated_at: string;
}

/**
 * Error Log Creation structure
 * @interface ErrorLogCreate
 */
export interface ErrorLogCreate {
    type: string;
    error_desc: string;
    severity: number;
    payload_sent?: string | null;
    payload_received?: string | null;
    page?: string | null;
    route: string;
    function?: string | null;
    user?: string | null;
}