import { Switch, Route } from "wouter";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import AuthPage from "@/pages/AuthPage";
import TodayPage from "@/pages/TodayPage";
import TopicsPage from "@/pages/TopicsPage";
import CalendarPage from "@/pages/CalendarPage";
import StatsPage from "@/pages/StatsPage";
import Layout from "@/components/Layout";

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F1117] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#6C63FF] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return (
    <Layout>
      <Switch>
        <Route path="/" component={TodayPage} />
        <Route path="/topics" component={TopicsPage} />
        <Route path="/calendar" component={CalendarPage} />
        <Route path="/stats" component={StatsPage} />
        <Route>
          <TodayPage />
        </Route>
      </Switch>
    </Layout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
