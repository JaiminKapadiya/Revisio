import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import type { Topic, Revision } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { scheduleRevisionDates, getTodayStr } from "@/lib/utils";

export function useTopics() {
  const { user } = useAuth();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTopics = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("topics")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setTopics(data ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchTopics();
  }, [fetchTopics]);

  const addTopic = async (title: string, subject: string, notes: string) => {
    if (!user) return;
    const { data, error } = await supabase
      .from("topics")
      .insert({ title, subject, notes: notes || null, user_id: user.id })
      .select()
      .single();
    if (error) throw error;

    const today = new Date();
    const dates = scheduleRevisionDates(today);
    const revisions = dates.map((date) => ({
      topic_id: data.id,
      user_id: user.id,
      scheduled_date: date,
      status: "pending" as const,
    }));
    await supabase.from("revisions").insert(revisions);
    await fetchTopics();
    return data;
  };

  const deleteTopic = async (topicId: string) => {
    await supabase.from("revisions").delete().eq("topic_id", topicId);
    await supabase.from("topics").delete().eq("id", topicId);
    await fetchTopics();
  };

  return { topics, loading, addTopic, deleteTopic, refetch: fetchTopics };
}

export function useRevisions() {
  const { user } = useAuth();
  const [revisions, setRevisions] = useState<Revision[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRevisions = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("revisions")
      .select("*")
      .eq("user_id", user.id)
      .order("scheduled_date", { ascending: true });
    setRevisions(data ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchRevisions();
  }, [fetchRevisions]);

  const markDone = async (revisionId: string) => {
    await supabase
      .from("revisions")
      .update({ status: "done", completed_at: new Date().toISOString() })
      .eq("id", revisionId);
    await fetchRevisions();
  };

  const markMissed = async (revisionId: string) => {
    await supabase
      .from("revisions")
      .update({ status: "missed" })
      .eq("id", revisionId);
    await fetchRevisions();
  };

  const postpone = async (revisionId: string) => {
    const rev = revisions.find((r) => r.id === revisionId);
    if (!rev) return;
    const today = getTodayStr();
    const newDate = new Date(today + "T00:00:00");
    newDate.setDate(newDate.getDate() + 1);
    const tomorrow = newDate.toISOString().split("T")[0];
    await supabase
      .from("revisions")
      .update({ status: "postponed", scheduled_date: tomorrow })
      .eq("id", revisionId);
    await fetchRevisions();
  };

  const rescheduleFromToday = async (revisionId: string) => {
    const today = getTodayStr();
    const tomorrow = new Date(today + "T00:00:00");
    tomorrow.setDate(tomorrow.getDate() + 1);
    const newDate = tomorrow.toISOString().split("T")[0];
    await supabase
      .from("revisions")
      .update({ status: "pending", scheduled_date: newDate })
      .eq("id", revisionId);
    await fetchRevisions();
  };

  return { revisions, loading, markDone, markMissed, postpone, rescheduleFromToday, refetch: fetchRevisions };
}
