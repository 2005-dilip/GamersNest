import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, Redirect } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AdminAuthProvider } from "./contexts/AdminAuthContext";
import { ProtectedAdminRoute } from "./components/ProtectedRoute";

import Home from "./pages/Home";
import { AdminLogin } from "./pages/admin/AdminLogin";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { AdminBookings } from "./pages/admin/AdminBookings";
import { AdminConnect } from "./pages/admin/AdminConnect";
import { AdminDataManagement } from "./pages/admin/AdminDataManagement";
// @ts-ignore
import Chatbot from "./Chatbot";

function Router() {
  return (
    <Switch>
      {/* Public Customer Website */}
      <Route path={"/"} component={Home} />

      {/* Admin Portal Authentication */}
      <Route path={"/admin/login"} component={AdminLogin} />

      {/* Main /admin Route Redirect */}
      <Route path={"/admin"}>
        {() => <Redirect to="/admin/dashboard" />}
      </Route>

      {/* Protected Admin Routes */}
      <Route path={"/admin/dashboard"}>
        {() => <ProtectedAdminRoute component={AdminDashboard} />}
      </Route>

      {/* Admin Bookings */}
      <Route path={"/admin/bookings"}>
        {() => <ProtectedAdminRoute component={AdminBookings} />}
      </Route>

      {/* Admin Connect */}
      <Route path={"/admin/connect"}>
        {() => <ProtectedAdminRoute component={AdminConnect} />}
      </Route>

      {/* Admin Data Management */}
      <Route path={"/admin/data"}>
        {() => <ProtectedAdminRoute component={AdminDataManagement} />}
      </Route>

      {/* Final Fallback Route */}
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <AdminAuthProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
            <Chatbot />
          </TooltipProvider>
        </AdminAuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
