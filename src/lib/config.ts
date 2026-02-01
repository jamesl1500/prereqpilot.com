/**
 * Configuration constants for the application.
 * 
 * These values are sourced from environment variables defined in the .env file.
 * 
 * @module config
 */

/**
 * Application URL
 * @constant {string} APP_URL
 */
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

/**
 * Application Name
 * @constant {string} APP_NAME
 */
export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'PrereqPilot';

/**
 * Application Title
 * @constant {string} APP_TITLE
 */
export const APP_TITLE = process.env.NEXT_PUBLIC_APP_TITLE || 'PrereqPilot - Your Academic Planning Assistant';    

/**
 * Application Description
 * @constant {string} APP_DESCRIPTION
 */
export const APP_DESCRIPTION = process.env.NEXT_PUBLIC_APP_DESCRIPTION || 'Your AI-powered study buddy for mastering prerequisites.';

/**
 * Application Version
 * @constant {string} APP_VERSION
 */
export const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0';

/**
 * Application Version Status
 * @constant {string} APP_VERSION_STATUS
 */
export const APP_VERSION_STATUS = process.env.NEXT_PUBLIC_APP_VERSION_STATUS || 'beta';

/**
 * Node ENVironment
 * @constant {string} NODE_ENV
 */
export const NODE_ENV = process.env.NODE_ENV || 'development';

/**
 * Application Port
 * @constant {string|number} PORT
 */
export const PORT = process.env.PORT || 3000;