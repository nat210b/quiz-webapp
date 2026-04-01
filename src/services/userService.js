import { supabase } from "../utils/supabaseClient";

export const getUser = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.user ?? null;
};

export const registerUser = async (email, password, displayName) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { display_name: displayName ?? "" },
    },
  });

  // Supabase ไม่ return error ถ้า email ซ้ำ
  // แต่จะ return user ที่มี identities เป็น [] แทน
  if (!error && data?.user?.identities?.length === 0) {
    throw new Error("This email is already registered. Please log in instead.");
  }

  if (error) throw error;

  return data;
};

export const signInUser = async (email, password) => {
  return supabase.auth.signInWithPassword({ email, password });
};

export const signOutUser = async () => {
  return supabase.auth.signOut();
};
