/**
 * Error Logs Library
 * 
 * This module sets up the structure for error logging within the application.
 * 
 * @module lib/error_logs
 */
import { ErrorLog, ErrorLogCreate } from '@/types/error_logs';
import { createClient } from '@/lib/supabase/client';
import { APP_VERSION_STATUS } from './config';

type LogApiErrorOptions = {
    request: Request;
    error: unknown;
    functionName: string;
    userId?: string | null;
    payloadSent?: unknown;
    payloadReceived?: unknown;
    severity?: number;
    type?: string;
};

export const logError = async (errorData: ErrorLogCreate): Promise<ErrorLog> => {
    if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
        if (process.env.NODE_ENV === 'development') {
            console.warn('Error logging is disabled in development mode. Errors will not be logged to the database.');
        }
        return Promise.resolve({
            id: 'dev-mode',
            ...errorData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        } as ErrorLog);
    }

    // Only log errors if the app version status is 'stable' or 'beta'
    if (APP_VERSION_STATUS !== 'stable' && APP_VERSION_STATUS !== 'beta') {
        console.warn( `Error logging is disabled for app version status: ${APP_VERSION_STATUS}. Errors will not be logged to the database.` );
        return Promise.resolve({
            id: 'version-restricted',
            ...errorData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        } as ErrorLog);
    }

    // Let's log the error
    const supabase = createClient();

    // Insert the error log into the database
    const { data, error } = await supabase
        .from('error_logs')
        .insert(errorData)
        .select()
        .single();

    if (error) {
        console.error('Failed to log error:', error);
        throw error;
    }

    return data;
}

export const logApiError = async ({
    request,
    error,
    functionName,
    userId = null,
    payloadSent = null,
    payloadReceived = null,
    severity = 3,
    type = 'api',
}: LogApiErrorOptions): Promise<void> => {
    const errorDesc = error instanceof Error ? error.message : String(error);
    const route = request instanceof Request && 'url' in request
        ? new URL(request.url).pathname
        : 'unknown';

    const safePayloadSent = payloadSent === null || payloadSent === undefined
        ? null
        : typeof payloadSent === 'string'
            ? payloadSent
            : JSON.stringify(payloadSent);

    const safePayloadReceived = payloadReceived === null || payloadReceived === undefined
        ? null
        : typeof payloadReceived === 'string'
            ? payloadReceived
            : JSON.stringify(payloadReceived);

    try {
        await logError({
            type,
            error_desc: errorDesc,
            severity,
            payload_sent: safePayloadSent,
            payload_received: safePayloadReceived,
            page: null,
            route,
            function: functionName,
            user: userId,
        });
    } catch (logErrorFailure) {
        console.error('Failed to log API error:', logErrorFailure);
    }
};