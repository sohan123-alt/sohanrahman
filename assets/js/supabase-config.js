// =========================================
// SUPABASE CONFIGURATION
// =========================================

const SUPABASE_URL =
    'https://qpevxichqzeuqswvacqa.supabase.co';

const SUPABASE_ANON_KEY =
    'sb_publishable_pz9O2PocfjwdFNSlkfnAtw_Hni6wFAh';

// CREATE SUPABASE CLIENT

// window.supabase আসে CDN থেকে
// তাই আলাদা variable use করতে হবে

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);

console.log('Supabase client initialized successfully');

// GLOBAL ACCESS
window.db = supabaseClient;
