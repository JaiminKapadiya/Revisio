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
      else setMessage("Account created! You can now sign in.");
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
    }
    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: "https://revisio-revisio-jade.vercel.app",
      },
    });
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

          <button
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-3 bg-white text-gray-800 font-semibold py-3 rounded-xl mb-4 hover:bg-gray-100 transition-all"
          >
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/>
              <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2.04a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z"/>
              <path fill="#FBBC05" d="M4.5 10.48A4.8 4.8 0 0 1 4.5 7.5V5.43H1.83a8 8 0 0 0 0 7.14z"/>
              <path fill="#EA4335" d="M8.98 3.58c1.32 0 2.5.45 3.44 1.35l2.56-2.56A8 8 0 0 0 1.83 5.43L4.5 7.5c.66-1.97 2.52-3.92 4.48-3.92z"/>
            </svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-[#2A2D3E]"></div>
            <span className="text-[#8B8FA8] text-xs">or</span>
            <div className="flex-1 h-px bg-[#2A2D3E]"></div>
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
                className="w-full bg-[#0F1117] border border-[#2A2D3E] rounded-xl px-4 py-3 text-white placeholder-[#8B8FA8] focus:outline-none focus:border-[#6C63FF]"
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
                className="w-full bg-[#0F1117] border border-[#2A2D3E] rounded-xl px-4 py-3 text-white placeholder-[#8B8FA8] focus:outline-none focus:border-[#6C63FF]"
                placeholder="••••••••"
              />
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}
            {message && <p className="text-green-400 text-sm">{message}</p>}

            <button
              data-testid="button-submit"
              type="submit"
              disabled={loading}
              className="w-full bg-[#6C63FF] hover:bg-[#5A52E0] text-white font-semibold py-3 rounded-xl transition-all"
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
