import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Route, Switch, useLocation, Router as WouterRouter } from 'wouter';
import { ErrorBoundary } from '@/components/error-boundary';
import { Shell } from '@/components/layout/Shell';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { WorkspaceDataProvider } from '@/hooks/use-workspace-data';
import { CareerGoal } from '@/pages/CareerGoal';
import { Dashboard } from '@/pages/Dashboard';
import { Interview } from '@/pages/Interview';
import { Landing } from '@/pages/Landing';
import { NotFound } from '@/pages/NotFound';
import { Onboarding } from '@/pages/Onboarding';
import { Progress } from '@/pages/Progress';
import { Recommendations } from '@/pages/Recommendations';
import { Resume } from '@/pages/Resume';
import { Roadmap } from '@/pages/Roadmap';
import { SignIn } from '@/pages/SignIn';
import { SkillGap } from '@/pages/SkillGap';
import { Skills } from '@/pages/Skills';

const queryClient = new QueryClient();

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function Workspace() {
  return (
    <WorkspaceDataProvider>
      <Shell>
        <Switch>
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/skills" component={Skills} />
          <Route path="/goal" component={CareerGoal} />
          <Route path="/gap" component={SkillGap} />
          <Route path="/roadmap" component={Roadmap} />
          <Route path="/recommendations" component={Recommendations} />
          <Route path="/progress" component={Progress} />
          <Route path="/interview" component={Interview} />
          <Route path="/resume" component={Resume} />
          <Route path="/onboarding" component={Onboarding} />
          <Route component={NotFound} />
        </Switch>
      </Shell>
    </WorkspaceDataProvider>
  );
}

function Router() {
  return (
    <RoutedErrorBoundary>
      <Switch>
        <Route path="/" component={Landing} />
        <Route path="/signin" component={SignIn} />
        <Route component={Workspace} />
      </Switch>
    </RoutedErrorBoundary>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
