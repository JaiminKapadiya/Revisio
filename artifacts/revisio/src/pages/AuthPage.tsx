import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) setError(error.message);
      else setMessage("Check your email to confirm your account.");
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0F1117] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-white tracking-tight">Revisio</h1>
          <p className="text-[#8B8FA8] mt-2 text-sm">Spaced repetition for lasting memory</p>
        </div>

        <div className="bg-[#1A1D27] rounded-2xl p-8 border border-[#2A2D3E]">
          <div className="flex bg-[#0F1117] rounded-xl p-1 mb-6">
            <button
              data-testid="tab-login"
              onClick={() => setMode("login")}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                mode === "login"
                  ? "bg-[#6C63FF] text-white"
                  : "text-[#8B8FA8] hover:text-white"
              }`}
            >
              Sign In
            </button>
            <button
              data-testid="tab-signup"
              onClick={() => setMode("signup")}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                mode === "signup"
                  ? "bg-[#6C63FF] text-white"
                  : "text-[#8B8FA8] hover:text-white"
              }`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-[#8B8FA8] mb-1.5">Email</label>
              <input
                data-testid="input-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-[#0F1117] border border-[#2A2D3E] rounded-xl px-4 py-3 text-white placeholder-[#4A4D5E] focus:outline-none focus:border-[#6C63FF] transition-colors text-sm"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-sm text-[#8B8FA8] mb-1.5">Password</label>
              <input
                data-testid="input-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-[#0F1117] border border-[#2A2D3E] rounded-xl px-4 py-3 text-white placeholder-[#4A4D5E] focus:outline-none focus:border-[#6C63FF] transition-colors text-sm"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="text-red-400 text-sm">{error}</p>
            )}
            {message && (
              <p className="text-green-400 text-sm">{message}</p>
            )}

            <button
              data-testid="button-submit"
              type="submit"
              disabled={loading}
              className="w-full bg-[#6C63FF] hover:bg-[#5A52E0] text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-50 mt-2"
            >
              {loading ? "Loading..." : mode === "login" ? "Sign In" : "Create Account"}
            </button>
          </form>
        </div>

        <p className="text-center text-[#4A4D5E] text-xs mt-6">
          Your revisions are private and synced across devices
        </p>
      </div>
    </div>
  );
}
