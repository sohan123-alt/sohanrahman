// ========================================
// SUPABASE CONFIG
// ========================================

const SUPABASE_URL = 'https://qpevxichqzeuqswvacqa.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_pz9O2PocfjwdFNSlkfnAtw_Hni6wFAh';

// Create Supabase Client
const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);

// Make Global
window.supabaseClient = supabaseClient;

console.log('✅ Supabase client initialized successfully');
