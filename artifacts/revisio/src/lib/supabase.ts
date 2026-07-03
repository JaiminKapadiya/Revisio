import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  topics: Topic;
  revisions: Revision;
};

export type Topic = {
  id: string;
  user_id: string;
  title: string;
  subject: string;
  notes: string | null;
  created_at: string;
};

export type Revision = {
  id: string;
  topic_id: string;
  user_id: string;
  scheduled_date: string;
  status: "pending" | "done" | "missed" | "postponed";
  completed_at: string | null;
  created_at: string;
};
