const SUPABASE_URL =
    "https://wiwvpqjlwmtmlexusiyd.supabase.co";

const SUPABASE_ANON_KEY =
    "sb_publishable_LzX0GpaYAK2KNSu2eetEuw_tr5PKqSi";


const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_ANON_KEY
    );


window.supabaseClient =
    supabaseClient;