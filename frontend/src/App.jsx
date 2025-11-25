import { lazy, Suspense } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/contexts/AuthContext";
import { RoadmapProvider } from "./contexts/RoadmapContext";
import ProtectedRoute from "@/components/ProtectedRoute";

// Eagerly load critical components
import { AppLayout } from "./components/Layout/AppLayout";
import PageTransition from "./components/PageTransition";

// Lazy load all route components
const Index = lazy(() => import("./pages/Index"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const VerifyEmail = lazy(() => import("./pages/VerifyEmail"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const NotFound = lazy(() => import("./pages/NotFound"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const BlogSection = lazy(() => import("@/components/BlogSection"));
const AboutSection = lazy(() => import("@/components/AboutSection"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const RoadmapPage = lazy(() => import("./components/RoadmapPage"));
const ProfileRoadmapPage = lazy(() => import("./pages/ProfilePage"));
const ResumeDashboard = lazy(() => import("./pages/Resume/ResumeDashboard"));
const ResumeEditor = lazy(() => import("./pages/Resume/ResumeEditor"));
const ResumePreview = lazy(() => import("./pages/Resume/ResumePreview"));

// Loading fallback component
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-900">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
  </div>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const App = () => {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <AppLayout />,
      errorElement: (
        <Suspense fallback={<LoadingFallback />}>
          <NotFound />
        </Suspense>
      ),
      children: [
        { 
          path: "/", 
          element: (
            <Suspense fallback={<LoadingFallback />}>
              <PageTransition>
                <Index />
              </PageTransition>
            </Suspense>
          ) 
        },
        { 
          path: "/about", 
          element: (
            <Suspense fallback={<LoadingFallback />}>
              <AboutSection />
            </Suspense>
          ) 
        },
        { 
          path: "/blogs", 
          element: (
            <Suspense fallback={<LoadingFallback />}>
              <BlogSection />
            </Suspense>
          ) 
        },
        { 
          path: "/login", 
          element: (
            <Suspense fallback={<LoadingFallback />}>
              <Login />
            </Suspense>
          ) 
        },
        { 
          path: "/signup", 
          element: (
            <Suspense fallback={<LoadingFallback />}>
              <Signup />
            </Suspense>
          ) 
        },
        { 
          path: "/verify-email", 
          element: (
            <Suspense fallback={<LoadingFallback />}>
              <VerifyEmail />
            </Suspense>
          ) 
        },
        {
          path: "/roadmap/:id", 
          element: (
            <Suspense fallback={<LoadingFallback />}>
              <RoadmapPage />
            </Suspense>
          )
        },
        {
          path: "/roadmaps", 
          element: (
            <Suspense fallback={<LoadingFallback />}>
              <RoadmapPage />
            </Suspense>
          )
        },
        {
          path: "/profile",
          element: (
            <Suspense fallback={<LoadingFallback />}>
              <ProtectedRoute>
                <ProfileRoadmapPage />
              </ProtectedRoute>
            </Suspense>
          )
        },
        {
          path: "/dashboard",
          element: (
            <Suspense fallback={<LoadingFallback />}>
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            </Suspense>
          ),
        },
        {
          path: "/resumes",
          element: (
            <Suspense fallback={<LoadingFallback />}>
              <ProtectedRoute>
                <ResumeDashboard />
              </ProtectedRoute>
            </Suspense>
          ),
        },
        {
          path: "/resumes/new",
          element: (
            <Suspense fallback={<LoadingFallback />}>
              <ProtectedRoute>
                <ResumeEditor />
              </ProtectedRoute>
            </Suspense>
          ),
        },
        {
          path: "/resumes/edit/:id",
          element: (
            <Suspense fallback={<LoadingFallback />}>
              <ProtectedRoute>
                <ResumeEditor />
              </ProtectedRoute>
            </Suspense>
          ),
        },
        {
          path: "/resumes/preview/:id",
          element: (
            <Suspense fallback={<LoadingFallback />}>
              <ProtectedRoute>
                <ResumePreview />
              </ProtectedRoute>
            </Suspense>
          ),
        },
        { 
          path: "/settings", 
          element: (
            <Suspense fallback={<LoadingFallback />}>
              <SettingsPage />
            </Suspense>
          ) 
        },
        { 
          path: "/forgot-password", 
          element: (
            <Suspense fallback={<LoadingFallback />}>
              <ForgotPassword />
            </Suspense>
          ) 
        },
        { 
          path: "/reset-password", 
          element: (
            <Suspense fallback={<LoadingFallback />}>
              <ResetPassword />
            </Suspense>
          ) 
        },
      ],
    },
  ]);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RoadmapProvider>
          <RouterProvider router={router} />
          <Toaster />
        </RoadmapProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
