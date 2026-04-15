import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { TimetableProvider } from "@/context/TimetableContext";
import { AuthProvider } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppLayout } from "@/components/AppLayout";
import Dashboard from "./pages/Dashboard";
import FacultyPage from "./pages/FacultyPage";
import CoursesPage from "./pages/CoursesPage";
import RoomsPage from "./pages/RoomsPage";
import ProgramsPage from "./pages/ProgramsPage";
import GeneratePage from "./pages/GeneratePage";
import TimetablePage from "./pages/TimetablePage";
import ScheduleSettingsPage from "./pages/ScheduleSettingsPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <TimetableProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="*" element={
                <ProtectedRoute>
                  <AppLayout>
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/faculty" element={<FacultyPage />} />
                      <Route path="/courses" element={<CoursesPage />} />
                      <Route path="/rooms" element={<RoomsPage />} />
                      <Route path="/programs" element={<ProgramsPage />} />
                      <Route path="/generate" element={<GeneratePage />} />
                      <Route path="/timetable" element={<TimetablePage />} />
                      <Route path="/settings" element={<ScheduleSettingsPage />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </AppLayout>
                </ProtectedRoute>
              } />
            </Routes>
          </BrowserRouter>
        </TimetableProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
