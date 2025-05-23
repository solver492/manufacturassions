import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "./context/AuthContext";

import MainLayout from "@/components/layout/MainLayout";
import Login from "@/pages/auth/Login";
import Dashboard from "@/pages/Dashboard";
import Calendar from "@/pages/Calendar";
import Sites from "@/pages/Sites";
import Prestations from "@/pages/Prestations";
import Employees from "@/pages/Employees";
import Vehicles from "@/pages/Vehicles";
import Billing from "@/pages/Billing";
import Reports from "@/pages/Reports";
import Profile from "@/pages/Profile";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/not-found";

import { ThemeProvider } from "@/context/ThemeProvider";
import useAuth from "@/hooks/useAuth";

// Protected route component
const ProtectedRoute = ({ component: Component, ...rest }: { component: React.ComponentType<any>, path: string }) => {
  const { user, isLoading } = useAuth();
  const [, navigate] = useLocation();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
  }

  if (!user) {
    navigate("/login");
    return null;
  }

  return <Component {...rest} />;
};

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      
      <Route path="/">
        <MainLayout>
          <ProtectedRoute path="/" component={Dashboard} />
        </MainLayout>
      </Route>
      
      <Route path="/calendar">
        <MainLayout>
          <ProtectedRoute path="/calendar" component={Calendar} />
        </MainLayout>
      </Route>
      
      <Route path="/sites">
        <MainLayout>
          <ProtectedRoute path="/sites" component={Sites} />
        </MainLayout>
      </Route>
      
      <Route path="/prestations">
        <MainLayout>
          <ProtectedRoute path="/prestations" component={Prestations} />
        </MainLayout>
      </Route>
      
      <Route path="/employees">
        <MainLayout>
          <ProtectedRoute path="/employees" component={Employees} />
        </MainLayout>
      </Route>
      
      <Route path="/vehicles">
        <MainLayout>
          <ProtectedRoute path="/vehicles" component={Vehicles} />
        </MainLayout>
      </Route>
      
      <Route path="/billing">
        <MainLayout>
          <ProtectedRoute path="/billing" component={Billing} />
        </MainLayout>
      </Route>
      
      <Route path="/reports">
        <MainLayout>
          <ProtectedRoute path="/reports" component={Reports} />
        </MainLayout>
      </Route>

      <Route path="/profile">
        <MainLayout>
          <ProtectedRoute path="/profile" component={Profile} />
        </MainLayout>
      </Route>

      <Route path="/settings">
        <MainLayout>
          <ProtectedRoute path="/settings" component={Settings} />
        </MainLayout>
      </Route>
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light">
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
