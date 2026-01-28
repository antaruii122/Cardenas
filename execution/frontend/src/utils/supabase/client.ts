import { createBrowserClient } from '@supabase/ssr'

export const createClient = () => {
    // Fallback to dummy values to prevent build-time crash
    // Next.js 'use client' components are still pre-rendered on the server.
    // If these keys are missing during build, createBrowserClient throws.
    // We use placeholders so the build passes. Data fetching (useEffect) 
    // will fail at runtime if real keys are not provided.
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://BUILD_PLACEHOLDER.supabase.co'
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'BUILD_PLACEHOLDER_KEY'

    return createBrowserClient(supabaseUrl, supabaseKey)
}
