import { useState } from "react";
import { useTopics } from "@/hooks/useRevisions";
import { formatDate, REVISION_DAYS } from "@/lib/utils";
import { Plus, Trash2, BookOpen, X } from "lucide-react";

const SUBJECTS = [
  "Math", "Science", "History", "Language", "Programming",
  "Literature", "Art", "Music", "Other"
];

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

export default function TopicsPage() {
  const { topics, loading, addTopic, deleteTopic } = useTopics();
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("Math");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);
    setError("");
    try {
      await addTopic(title.trim(), subject, notes.trim());
      setTitle("");
      setSubject("Math");
      setNotes("");
      setShowForm(false);
    } catch {
      setError("Failed to add topic. Please try again.");
    }
    setSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this topic and all its revisions?")) return;
    await deleteTopic(id);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="w-6 h-6 border-2 border-[#6C63FF] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Topics</h2>
          <p className="text-[#8B8FA8] text-sm mt-1">{topics.length} topics tracked</p>
        </div>
        <button
          data-testid="button-add-topic"
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-[#6C63FF] hover:bg-[#5A52E0] text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors"
        >
          <Plus size={16} />
          Add Topic
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/60 flex items-end justify-center z-50 px-4 pb-4">
          <div className="bg-[#1A1D27] rounded-2xl p-6 w-full max-w-lg border border-[#2A2D3E]">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-white font-semibold text-lg">New Topic</h3>
              <button
                data-testid="button-close-form"
                onClick={() => setShowForm(false)}
                className="text-[#8B8FA8] hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-sm text-[#8B8FA8] mb-1.5">Topic Title</label>
                <input
                  data-testid="input-topic-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full bg-[#0F1117] border border-[#2A2D3E] rounded-xl px-4 py-3 text-white placeholder-[#4A4D5E] focus:outline-none focus:border-[#6C63FF] transition-colors text-sm"
                  placeholder="e.g. Quadratic Equations"
                />
              </div>

              <div>
                <label className="block text-sm text-[#8B8FA8] mb-1.5">Subject</label>
                <div className="flex flex-wrap gap-2">
                  {SUBJECTS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      data-testid={`subject-${s}`}
                      onClick={() => setSubject(s)}
                      className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all border ${
                        subject === s
                          ? "border-[#6C63FF] text-[#6C63FF] bg-[#6C63FF]/10"
                          : "border-[#2A2D3E] text-[#8B8FA8] hover:border-[#4A4D5E]"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm text-[#8B8FA8] mb-1.5">Notes (optional)</label>
                <textarea
                  data-testid="input-topic-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full bg-[#0F1117] border border-[#2A2D3E] rounded-xl px-4 py-3 text-white placeholder-[#4A4D5E] focus:outline-none focus:border-[#6C63FF] transition-colors text-sm resize-none"
                  placeholder="Key points, formulas, concepts..."
                />
              </div>

              <div className="bg-[#0F1117] rounded-xl p-3 border border-[#2A2D3E]">
                <p className="text-[#8B8FA8] text-xs mb-2">Revisions scheduled at days:</p>
                <div className="flex gap-2">
                  {REVISION_DAYS.map((d) => (
                    <span key={d} className="text-[#6C63FF] text-xs bg-[#6C63FF]/10 px-2 py-1 rounded-lg font-medium">
                      +{d}
                    </span>
                  ))}
                </div>
              </div>

              {error && <p className="text-red-400 text-sm">{error}</p>}

              <button
                data-testid="button-submit-topic"
                type="submit"
                disabled={submitting}
                className="w-full bg-[#6C63FF] hover:bg-[#5A52E0] text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-50"
              >
                {submitting ? "Adding..." : "Add Topic"}
              </button>
            </form>
          </div>
        </div>
      )}

      {topics.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 bg-[#1A1D27] rounded-full flex items-center justify-center mb-4">
            <BookOpen size={28} className="text-[#6C63FF]" />
          </div>
          <p className="text-white font-semibold">No topics yet</p>
          <p className="text-[#8B8FA8] text-sm mt-1">Add your first topic to start revising</p>
        </div>
      ) : (
        <div className="space-y-3">
          {topics.map((topic) => {
            const color = subjectColors[topic.subject] ?? "#8B8FA8";
            return (
              <div
                key={topic.id}
                data-testid={`topic-card-${topic.id}`}
                className="bg-[#1A1D27] rounded-2xl p-4 border border-[#2A2D3E]"
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-1 rounded-full flex-shrink-0 mt-1"
                    style={{ backgroundColor: color, height: "44px" }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">{topic.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{ backgroundColor: color + "22", color }}
                      >
                        {topic.subject}
                      </span>
                      <span className="text-[#4A4D5E] text-xs">
                        Added {formatDate(topic.created_at.split("T")[0])}
                      </span>
                    </div>
                    {topic.notes && (
                      <p className="text-[#8B8FA8] text-xs mt-2 line-clamp-2">{topic.notes}</p>
                    )}
                  </div>
                  <button
                    data-testid={`button-delete-topic-${topic.id}`}
                    onClick={() => handleDelete(topic.id)}
                    className="text-[#4A4D5E] hover:text-[#FF6B6B] transition-colors p-1 flex-shrink-0"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
