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

export const getAllVocab = async () => {
    const { data, error } = await supabase
        .from("vocab_words")
        .select("*");
    if (error) {
        console.error("Error fetching vocabulary:", error);
        return [];
    }

    return data.sort((a, b) => a.word.localeCompare(b.word)) || [];
}

export const addVocabWord = async (payload) => {
    const { data, error } = await supabase
        .from("vocab_words")
        .insert(payload)
        .select("*")
        .single();

    if (error) throw error;
    return data;
}

export const updateVocabWord = async (id, payload) => {
    console.log("Updating vocab word with id:", id, "and payload:", payload);
    const { data, error } = await supabase
        .from("vocab_words")
        .update(payload)
        .eq("id", id)
        .select("*")
        .single();

    if (error) throw error;
    return data;
}
