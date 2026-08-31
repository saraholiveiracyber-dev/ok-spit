"use strict";

const SUPABASE_URL =
    "https://wiwvpqjlwmtmlexusiyd.supabase.co";

const SUPABASE_ANON_KEY =
    "sb_publishable_LzX0GpaYAK2KNSu2eetEuw_tr5PKqSi";

if (!window.supabase) {

    console.error(
        "Biblioteca Supabase não carregada."
    );

} else {

    window.supabaseClient =
        window.supabase.createClient(
            SUPABASE_URL,
            SUPABASE_ANON_KEY
        );

    console.log(
        "✅ Supabase conectado."
    );
}