import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { getTodayStr } from "@/lib/utils";
import { LogOut } from "lucide-react";

type Revision = {
  id: string;
  scheduled_date: string;
  status: string;
  completed_at: string | null;
  topic_id: string;
};

export default function StatsPage() {
  const { user, signOut } = useAuth();
  const [revisions, setRevisions] = useState<Revision[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRevisions = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("revisions")
      .select("*")
      .eq("user_id", user.id)
      .order("scheduled_date", { ascending: false });
    setRevisions((data ?? []) as Revision[]);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchRevisions();
  }, [fetchRevisions]);

  const today = getTodayStr();

  const done = revisions.filter((r) => r.status === "done");
  const totalScheduled = revisions.filter((r) => r.scheduled_date <= today).length;
  const accuracy = totalScheduled > 0 ? Math.round((done.length / totalScheduled) * 100) : 0;
  const streak = computeStreak(done);
  const heatmap = buildHeatmap(done);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="w-6 h-6 border-2 border-[#6C63FF] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">Stats</h2>
        <p className="text-[#8B8FA8] text-sm mt-1">Your revision performance</p>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-5">
        <StatCard
          label="Current Streak"
          value={streak}
          unit={streak === 1 ? "day" : "days"}
          color="#FF6B6B"
          testId="stat-current-streak"
        />
        <StatCard
          label="Revisions Done"
          value={done.length}
          color="#4ADE80"
          testId="stat-revisions-done"
        />
        <StatCard
          label="Accuracy"
          value={accuracy}
          unit="%"
          unitInline
          color="#6C63FF"
          testId="stat-accuracy"
        />
        <StatCard
          label="Scheduled"
          value={totalScheduled}
          color="#FFE66D"
          testId="stat-scheduled"
        />
      </div>

      <div className="bg-[#1A1D27] rounded-2xl border border-[#2A2D3E] p-5 mb-4">
        <p className="text-[#8B8FA8] text-xs font-medium uppercase tracking-wider mb-4">
          Activity — Last 12 Weeks
        </p>
        <Heatmap data={heatmap} />
      </div>

      {done.length === 0 && (
        <div className="text-center py-4">
          <p className="text-[#4A4D5E] text-sm">Complete your first revision to see stats here</p>
        </div>
      )}

      <div className="mt-8 pt-6 border-t border-[#2A2D3E]">
        <p className="text-[#4A4D5E] text-xs text-center mb-4">{user?.email}</p>
        <button
          data-testid="button-signout"
          onClick={signOut}
          className="w-full flex items-center justify-center gap-2 bg-[#1A1D27] hover:bg-[#252837] border border-[#2A2D3E] text-[#8B8FA8] hover:text-white text-sm font-medium py-3 rounded-xl transition-all"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  unit,
  unitInline = false,
  color,
  testId,
}: {
  label: string;
  value: number;
  unit?: string;
  unitInline?: boolean;
  color: string;
  testId: string;
}) {
  return (
    <div
      data-testid={testId}
      className="bg-[#1A1D27] rounded-2xl border border-[#2A2D3E] p-4"
    >
      <div
        className="w-1.5 h-1.5 rounded-full mb-4"
        style={{ backgroundColor: color }}
      />
      {unitInline ? (
        <p className="text-4xl font-bold text-white leading-none mb-1">
          {value}
          <span className="text-2xl" style={{ color }}>{unit}</span>
        </p>
      ) : (
        <p className="text-4xl font-bold text-white leading-none mb-1">{value}</p>
      )}
      {unit && !unitInline && (
        <p className="text-sm font-medium mb-1" style={{ color }}>{unit}</p>
      )}
      <p className="text-[#8B8FA8] text-xs">{label}</p>
    </div>
  );
}

function computeStreak(done: Revision[]): number {
  const today = getTodayStr();
  const doneDates = new Set(
    done.filter((r) => r.completed_at).map((r) => r.completed_at!.split("T")[0])
  );

  let streak = 0;
  const cursor = new Date(today + "T00:00:00");

  while (true) {
    const dateStr = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}-${String(cursor.getDate()).padStart(2, "0")}`;
    if (doneDates.has(dateStr)) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    } else if (dateStr === today) {
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

function buildHeatmap(done: Revision[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const r of done) {
    if (r.completed_at) {
      const d = r.completed_at.split("T")[0];
      counts[d] = (counts[d] ?? 0) + 1;
    }
  }
  return counts;
}

function Heatmap({ data }: { data: Record<string, number> }) {
  const today = new Date();
  const days: string[] = [];

  for (let i = 83; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    days.push(`${y}-${m}-${day}`);
  }

  const maxCount = Math.max(1, ...Object.values(data));

  const intensityColor = (count: number) => {
    if (!count) return "#252837";
    const intensity = count / maxCount;
    if (intensity < 0.25) return "#6C63FF44";
    if (intensity < 0.5) return "#6C63FF77";
    if (intensity < 0.75) return "#6C63FFAA";
    return "#6C63FF";
  };

  const weeks: string[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  return (
    <div className="flex gap-1">
      {weeks.map((week, wi) => (
        <div key={wi} className="flex flex-col gap-1">
          {week.map((day) => {
            const count = data[day] ?? 0;
            return (
              <div
                key={day}
                data-testid={`heatmap-day-${day}`}
                title={`${day}: ${count} revision${count !== 1 ? "s" : ""}`}
                className="w-3.5 h-3.5 rounded-sm transition-colors"
                style={{ backgroundColor: intensityColor(count) }}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}
