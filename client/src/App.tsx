import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Landing from "@/pages/Landing";
import Dashboard from "@/pages/Dashboard";
import PersonDetail from "@/pages/PersonDetail";
import RecordVisit from "@/pages/RecordVisit";
import ReviewTranscript from "@/pages/ReviewTranscript";
import VisitSummary from "@/pages/VisitSummary";
import Resources from "@/pages/Resources";
import NotFound from "@/pages/not-found";
import Layout from "@/components/Layout";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 bg-faith-blue rounded-lg flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-hands-helping text-white text-lg"></i>
          </div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Switch>
      {!isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={() => <Layout><Dashboard /></Layout>} />
          <Route path="/person/:id" component={() => <Layout><PersonDetail /></Layout>} />
          <Route path="/person/:id/record" component={() => <Layout><RecordVisit /></Layout>} />
          <Route path="/person/:id/review" component={() => <Layout><ReviewTranscript /></Layout>} />
          <Route path="/person/:id/summary" component={() => <Layout><VisitSummary /></Layout>} />
          <Route path="/resources" component={() => <Layout><Resources /></Layout>} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
