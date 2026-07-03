import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { getTodayStr, formatDate } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

type CalRevision = {
  id: string;
  scheduled_date: string;
  status: string;
  topics: { title: string; subject: string };
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
  Other: "#8B8FA8",
};

export default function CalendarPage() {
  const { user } = useAuth();
  const [revisions, setRevisions] = useState<CalRevision[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const today = getTodayStr();

  const fetchRevisions = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("revisions")
      .select("*, topics(title, subject)")
      .eq("user_id", user.id);
    setRevisions((data ?? []) as CalRevision[]);
  }, [user]);

  useEffect(() => {
    fetchRevisions();
  }, [fetchRevisions]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthName = currentDate.toLocaleString("default", { month: "long", year: "numeric" });

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const getRevForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return revisions.filter((r) => r.scheduled_date === dateStr);
  };

  const selectedRevisions = selectedDay
    ? revisions.filter((r) => r.scheduled_date === selectedDay)
    : [];

  const weeks: (number | null)[][] = [];
  let week: (number | null)[] = Array(firstDay).fill(null);
  for (let d = 1; d <= daysInMonth; d++) {
    week.push(d);
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  }
  if (week.length > 0) {
    while (week.length < 7) week.push(null);
    weeks.push(week);
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">Calendar</h2>
        <p className="text-[#8B8FA8] text-sm mt-1">Your revision schedule</p>
      </div>

      <div className="bg-[#1A1D27] rounded-2xl border border-[#2A2D3E] p-4 mb-4">
        <div className="flex items-center justify-between mb-4">
          <button
            data-testid="button-prev-month"
            onClick={prevMonth}
            className="p-2 rounded-xl text-[#8B8FA8] hover:text-white hover:bg-[#0F1117] transition-all"
          >
            <ChevronLeft size={18} />
          </button>
          <span className="text-white font-semibold">{monthName}</span>
          <button
            data-testid="button-next-month"
            onClick={nextMonth}
            className="p-2 rounded-xl text-[#8B8FA8] hover:text-white hover:bg-[#0F1117] transition-all"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        <div className="grid grid-cols-7 mb-2">
          {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
            <div key={i} className="text-center text-[#4A4D5E] text-xs font-medium py-1">
              {d}
            </div>
          ))}
        </div>

        <div className="space-y-1">
          {weeks.map((week, wi) => (
            <div key={wi} className="grid grid-cols-7">
              {week.map((day, di) => {
                if (!day) return <div key={di} />;
                const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                const dayRevs = getRevForDay(day);
                const isToday = dateStr === today;
                const isSelected = dateStr === selectedDay;
                const hasDone = dayRevs.some((r) => r.status === "done");
                const hasPending = dayRevs.some((r) => r.status === "pending" || r.status === "postponed");
                const hasMissed = dayRevs.some((r) => r.status === "missed");

                return (
                  <button
                    key={di}
                    data-testid={`cal-day-${dateStr}`}
                    onClick={() => setSelectedDay(isSelected ? null : dateStr)}
                    className={`flex flex-col items-center py-1.5 rounded-xl transition-all ${
                      isSelected
                        ? "bg-[#6C63FF]"
                        : isToday
                        ? "bg-[#6C63FF]/20"
                        : "hover:bg-[#0F1117]"
                    }`}
                  >
                    <span
                      className={`text-sm font-medium ${
                        isSelected
                          ? "text-white"
                          : isToday
                          ? "text-[#6C63FF]"
                          : "text-[#8B8FA8]"
                      }`}
                    >
                      {day}
                    </span>
                    {dayRevs.length > 0 && (
                      <div className="flex gap-0.5 mt-0.5">
                        {hasDone && <div className="w-1 h-1 rounded-full bg-green-400" />}
                        {hasPending && <div className="w-1 h-1 rounded-full bg-[#6C63FF]" />}
                        {hasMissed && <div className="w-1 h-1 rounded-full bg-red-400" />}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {selectedDay && (
        <div>
          <p className="text-[#8B8FA8] text-xs font-medium uppercase tracking-wider mb-3">
            {formatDate(selectedDay)} — {selectedRevisions.length} revision{selectedRevisions.length !== 1 ? "s" : ""}
          </p>
          {selectedRevisions.length === 0 ? (
            <p className="text-[#4A4D5E] text-sm text-center py-4">No revisions on this day</p>
          ) : (
            <div className="space-y-2">
              {selectedRevisions.map((rev) => {
                const color = subjectColors[rev.topics?.subject] ?? "#8B8FA8";
                const statusColors: Record<string, string> = {
                  done: "#4ADE80",
                  pending: "#6C63FF",
                  postponed: "#FFE66D",
                  missed: "#FF6B6B",
                };
                return (
                  <div
                    key={rev.id}
                    data-testid={`cal-revision-${rev.id}`}
                    className="bg-[#1A1D27] rounded-xl p-3 border border-[#2A2D3E] flex items-center gap-3"
                  >
                    <div className="w-1 h-10 rounded-full" style={{ backgroundColor: color }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{rev.topics?.title}</p>
                      <span
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: color + "22", color }}
                      >
                        {rev.topics?.subject}
                      </span>
                    </div>
                    <span
                      className="text-xs px-2 py-1 rounded-lg font-medium capitalize"
                      style={{
                        color: statusColors[rev.status],
                        backgroundColor: statusColors[rev.status] + "20",
                      }}
                    >
                      {rev.status}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
