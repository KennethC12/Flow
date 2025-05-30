import { createClient } from '@supabase/supabase-js';
import type { Database } from './schema';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    console.error('Missing environment variable: NEXT_PUBLIC_SUPABASE_URL');
    throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL');
}
if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error('Missing environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY');
    throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('Supabase URL configured:', supabaseUrl ? 'Yes' : 'No');
console.log('Supabase Key configured:', supabaseKey ? 'Yes' : 'No');

const globalForSupabase = globalThis as unknown as {
    supabase: ReturnType<typeof createClient<Database>> | undefined
}

export const supabase = globalForSupabase.supabase ?? createClient<Database>(supabaseUrl, supabaseKey);

if (process.env.NODE_ENV !== 'production') {
    globalForSupabase.supabase = supabase;
}

// Handle auth state changes
supabase.auth.onAuthStateChange((event, session) => {
    switch (event) {
        case 'SIGNED_IN':
            console.log('User signed in:', session?.user?.email);
            break;
        case 'SIGNED_OUT':
            console.log('User signed out');
            break;
        case 'TOKEN_REFRESHED':
            console.log('Token refreshed');
            break;
        case 'USER_UPDATED':
            console.log('User updated:', session?.user?.email);
            break;
    }
});
