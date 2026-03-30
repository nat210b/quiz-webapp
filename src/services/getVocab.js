import { supabase } from "../utils/supabaseClient"
export const getVocab = async (part) => { 
    const { data, error } = await supabase
        .from("vocab_words")
        .select("*")
        .eq("part_scope", part);
    if (error) {
        console.error("Error fetching vocabulary:", error);
        return [];
    }

    return data || [];
}