import { createBrowserClient } from '@supabase/ssr'

export const createClient = () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
        // During build time, these might be missing. We shouldn't crash unless we actually try to use the client.
        // However, standard createBrowserClient throws if they are missing.
        // We can return a dummy or undefined, but consumers expect a client.
        if (typeof window === 'undefined') {
            // Server-side/Build-time: return a dummy or allow failure if critical?
            // Usually best to just warn or return a minimal mock if possible, 
            // but normally we SHOULD fail if we need data. 
            // The issue is pre-rendering /dashboard tries to fetch data.
            // If we are at build time and no keys, we can't fetch.
            // Returning a mock that does nothing might pass the build but result in empty data.
            console.warn('Supabase env vars missing!')
        }
        // Let's rely on the user fixing the env vars, but strict checking helps.
        // The error came from inside createBrowserClient, so we must check before calling.
        throw new Error('Supabase URL and Key are required!')
    }

    return createBrowserClient(supabaseUrl, supabaseKey)
}
