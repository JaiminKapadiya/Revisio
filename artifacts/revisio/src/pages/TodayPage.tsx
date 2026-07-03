import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { getTodayStr, formatDate, addDays } from "@/lib/utils";
import { CheckCircle2, Clock, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";

type RevisionWithTopic = {
  id: string;
  scheduled_date: string;
  status: string;
  topic_id: string;
  topics: {
    title: string;
    subject: string;
  };
};

export default function TodayPage() {
  const { user } = useAuth();
  const [todayRevisions, setTodayRevisions] = useState<RevisionWithTopic[]>([]);
  const [missedRevisions, setMissedRevisions] = useState<RevisionWithTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMissed, setShowMissed] = useState(false);

  const today = getTodayStr();

  const fetchRevisions = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("revisions")
      .select("*, topics(title, subject)")
      .eq("user_id", user.id)
      .in("status", ["pending", "postponed"])
      .order("scheduled_date", { ascending: true });

    const all = (data ?? []) as RevisionWithTopic[];
    setTodayRevisions(all.filter((r) => r.scheduled_date === today));
    setMissedRevisions(all.filter((r) => r.scheduled_date < today));
    setLoading(false);
  }, [user, today]);

  useEffect(() => {
    fetchRevisions();
  }, [fetchRevisions]);

  const markDone = async (id: string) => {
    await supabase
      .from("revisions")
      .update({ status: "done", completed_at: new Date().toISOString() })
      .eq("id", id);
    fetchRevisions();
  };

  const postpone = async (id: string) => {
    const tomorrow = addDays(today, 1);
    await supabase
      .from("revisions")
      .update({ status: "postponed", scheduled_date: tomorrow })
      .eq("id", id);
    fetchRevisions();
  };

  const rescheduleFromToday = async (id: string) => {
    const tomorrow = addDays(today, 1);
    await supabase
      .from("revisions")
      .update({ status: "pending", scheduled_date: tomorrow })
      .eq("id", id);
    fetchRevisions();
  };

  const subjectColors: Record<string, string> = {
    Math: "#FF6B6B",
    Science: "#4ECDC4",
    History: "#FFE66D",
    Language: "#A29BFE",
    Programming: "#6C63FF",
    Literature: "#FD79A8",
    Art: "#FDCB6E",
    Music: "#00CEC9",
    Default: "#8B8FA8",
  };

  const getColor = (subject: string) =>
    subjectColors[subject] ?? subjectColors["Default"];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="w-6 h-6 border-2 border-[#6C63FF] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const allDone = todayRevisions.length === 0 && missedRevisions.length === 0;

  return (
    <div>
      <div className="mb-6">
        <p className="text-[#8B8FA8] text-sm">{formatDate(today)}</p>
        <h2 className="text-2xl font-bold text-white mt-1">Today</h2>
      </div>

      {allDone ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 bg-[#1A1D27] rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 size={32} className="text-[#6C63FF]" />
          </div>
          <p className="text-white font-semibold text-lg">All caught up!</p>
          <p className="text-[#8B8FA8] text-sm mt-1">No revisions due today</p>
        </div>
      ) : (
        <>
          {todayRevisions.length > 0 && (
            <div className="mb-6">
              <p className="text-[#8B8FA8] text-xs font-medium uppercase tracking-wider mb-3">
                Due Today — {todayRevisions.length}
              </p>
              <div className="space-y-3">
                {todayRevisions.map((rev) => (
                  <RevisionCard
                    key={rev.id}
                    rev={rev}
                    color={getColor(rev.topics?.subject)}
                    onDone={() => markDone(rev.id)}
                    onPostpone={() => postpone(rev.id)}
                    showPostpone
                  />
                ))}
              </div>
            </div>
          )}

          {missedRevisions.length > 0 && (
            <div>
              <button
                data-testid="button-toggle-missed"
                onClick={() => setShowMissed(!showMissed)}
                className="flex items-center gap-2 text-[#FF6B6B] text-xs font-medium uppercase tracking-wider mb-3 hover:opacity-80 transition-opacity"
              >
                <AlertCircle size={14} />
                Missed — {missedRevisions.length}
                {showMissed ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>

              {showMissed && (
                <div className="space-y-3">
                  {missedRevisions.map((rev) => (
                    <RevisionCard
                      key={rev.id}
                      rev={rev}
                      color={getColor(rev.topics?.subject)}
                      onDone={() => markDone(rev.id)}
                      onPostpone={() => rescheduleFromToday(rev.id)}
                      isMissed
                      showPostpone
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function RevisionCard({
  rev,
  color,
  onDone,
  onPostpone,
  isMissed = false,
  showPostpone = false,
}: {
  rev: RevisionWithTopic;
  color: string;
  onDone: () => void;
  onPostpone: () => void;
  isMissed?: boolean;
  showPostpone?: boolean;
}) {
  return (
    <div
      data-testid={`revision-card-${rev.id}`}
      className="bg-[#1A1D27] rounded-2xl p-4 border border-[#2A2D3E]"
    >
      <div className="flex items-start gap-3">
        <div
          className="w-1 rounded-full flex-shrink-0 mt-1"
          style={{ backgroundColor: color, height: "40px" }}
        />
        <div className="flex-1 min-w-0">
          <p className="text-white font-medium text-sm truncate">{rev.topics?.title}</p>
          <div className="flex items-center gap-2 mt-1">
            <span
              className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{ backgroundColor: color + "22", color }}
            >
              {rev.topics?.subject}
            </span>
            {isMissed && (
              <span className="text-xs text-[#FF6B6B]">
                {formatDate(rev.scheduled_date)}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-2 mt-4">
        <button
          data-testid={`button-done-${rev.id}`}
          onClick={onDone}
          className="flex-1 flex items-center justify-center gap-1.5 bg-[#6C63FF] hover:bg-[#5A52E0] text-white text-sm font-medium py-2.5 rounded-xl transition-colors"
        >
          <CheckCircle2 size={15} />
          Done
        </button>
        {showPostpone && (
          <button
            data-testid={`button-postpone-${rev.id}`}
            onClick={onPostpone}
            className="flex items-center justify-center gap-1.5 bg-[#0F1117] hover:bg-[#252837] text-[#8B8FA8] hover:text-white text-sm font-medium py-2.5 px-4 rounded-xl transition-colors border border-[#2A2D3E]"
          >
            <Clock size={14} />
            {isMissed ? "Reschedule" : "Postpone"}
          </button>
        )}
      </div>
    </div>
  );
}
