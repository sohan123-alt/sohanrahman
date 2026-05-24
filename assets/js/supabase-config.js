// ========================================
// SUPABASE CONFIGURATION
// ========================================

const SUPABASE_URL =
    'https://qpevxichqzeuqswvacqa.supabase.co';

const SUPABASE_ANON_KEY =
    'sb_publishable_pz9O2PocfjwdFNSlkfnAtw_Hni6wFAh';

// CHECK SUPABASE LIBRARY

if (!window.supabase) {

    console.error('❌ Supabase library not loaded');

} else {

    // ========================================
    // CREATE CLIENT
    // ========================================

    const supabaseClient =
        window.supabase.createClient(
            SUPABASE_URL,
            SUPABASE_ANON_KEY
        );

    // ========================================
    // GLOBAL ACCESS
    // ========================================

    window.supabaseClient = supabaseClient;

    console.log('✅ Supabase client initialized successfully');

}
