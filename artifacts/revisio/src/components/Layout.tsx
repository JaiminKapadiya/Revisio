import { useLocation, Link } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { Home, BookOpen, Calendar, BarChart2, LogOut } from "lucide-react";

const navItems = [
  { href: "/", icon: Home, label: "Today" },
  { href: "/topics", icon: BookOpen, label: "Topics" },
  { href: "/calendar", icon: Calendar, label: "Calendar" },
  { href: "/stats", icon: BarChart2, label: "Stats" },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { signOut } = useAuth();

  return (
    <div className="min-h-screen bg-[#0F1117] flex flex-col max-w-lg mx-auto relative">
      <header className="flex items-center justify-between px-5 pt-12 pb-4">
        <h1 className="text-xl font-bold text-white tracking-tight">Revisio</h1>
        <button
          data-testid="button-signout"
          onClick={signOut}
          className="p-2 rounded-xl text-[#8B8FA8] hover:text-white hover:bg-[#1A1D27] transition-all"
        >
          <LogOut size={18} />
        </button>
      </header>

      <main className="flex-1 px-4 pb-28 overflow-y-auto">
        {children}
      </main>

      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-lg bg-[#1A1D27] border-t border-[#2A2D3E] px-2 py-3 z-50">
        <div className="flex justify-around">
          {navItems.map(({ href, icon: Icon, label }) => {
            const active = location === href;
            return (
              <Link key={href} href={href}>
                <button
                  data-testid={`nav-${label.toLowerCase()}`}
                  className={`flex flex-col items-center gap-1 px-5 py-1.5 rounded-xl transition-all ${
                    active ? "text-[#6C63FF]" : "text-[#4A4D5E] hover:text-[#8B8FA8]"
                  }`}
                >
                  <Icon size={20} strokeWidth={active ? 2.5 : 2} />
                  <span className="text-[10px] font-medium">{label}</span>
                </button>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
