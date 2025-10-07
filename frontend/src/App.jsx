import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/contexts/AuthContext";
import { RoadmapProvider } from "./contexts/RoadmapContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import VerifyEmail from "./pages/VerifyEmail";
import Dashboard from "./pages/Dashboard";
import SettingsPage from './pages/SettingsPage'; // Import SettingsPage
import NotFound from "./pages/NotFound";
import ForgotPassword from "./pages/ForgotPassword";
import BlogSection from "@/components/BlogSection";
import AboutSection from "@/components/AboutSection";

import ResetPassword from "./pages/ResetPassword";

// optional layout wrapper
import {AppLayout} from "./components/Layout/AppLayout";  
import RoadmapPage from "./components/RoadmapPage";
import ProfileRoadmapPage from "./pages/ProfilePage";

const queryClient = new QueryClient();

const App = () => {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <AppLayout />, // top-level layout
      errorElement: <NotFound />,
      children: [
        { path: "/", element: <Index /> },
        { path: "/about", element: <AboutSection /> },
        { path: "/blogs", element: <BlogSection /> },
        { path: "/login", element: <Login /> },
        { path: "/signup", element: <Signup /> },
        { path: "/verify-email", element: <VerifyEmail /> },
        {path:"/roadmap/:id", element:<RoadmapPage />},
        {path:"/roadmaps", element:<RoadmapPage />},
        {
          path:"/profile",
          element:(
          <ProtectedRoute>
            <ProfileRoadmapPage />
          </ProtectedRoute>
          )
        },
        {
          path: "/dashboard",
          element: (
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          ),
        },
        { path: "/settings", element: <SettingsPage /> }, // Add SettingsPage route
        { path: "/forgot-password", element: <ForgotPassword /> },
        { path: "/reset-password", element: <ResetPassword /> },
      ],
    },
  ]);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RoadmapProvider>
          <RouterProvider router={router} />
        </RoadmapProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
