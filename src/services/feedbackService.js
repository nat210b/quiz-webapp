import { isSupabaseConfigured, supabase } from "../utils/supabaseClient";

export const submitFeedback = async ({ topic, feedbackType, details }) => {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error(
      "Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY."
    );
  }

  const normalizedTopic = String(topic ?? "").trim();
  const normalizedDetails = String(details ?? "").trim();
  const normalizedType = String(feedbackType ?? "").trim();

  if (!normalizedTopic) throw new Error("Topic is required.");
  if (!normalizedType) throw new Error("Feedback type is required.");
  if (!normalizedDetails) throw new Error("Details are required.");

  const { error } = await supabase.from("feedbacks").insert([
    {
      topic: normalizedTopic,
      feedback_type: normalizedType,
      details: normalizedDetails,
    },
  ]);

  if (error) throw error;
};

