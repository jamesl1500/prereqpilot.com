/**
 * Legacy Supabase Client Export
 * 
 * @deprecated Use the new SSR-compatible clients instead:
 * - For Client Components: import { createClient } from '@/lib/supabase/client'
 * - For Server Components/Actions: import { createClient } from '@/lib/supabase/server'
 * - For Middleware: import { updateSession } from '@/lib/supabase/middleware'
 * 
 * This file is kept for backwards compatibility but should not be used in new code.
 */

import { createBrowserClient } from '@supabase/ssr';

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);
