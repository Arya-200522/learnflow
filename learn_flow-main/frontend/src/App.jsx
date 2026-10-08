import { lazy, Suspense } from "react";

import { Navigate, Route, Routes } from "react-router-dom";

import AppShell from "./components/AppShell.jsx";

import Loading from "./components/Loading.jsx";

import ProtectedRoute from "./components/ProtectedRoute.jsx";
import ForgotPasswordPage from "./pages/ForgotPasswordPage.jsx";
import ResetPasswordPage from "./pages/ResetPasswordPage.jsx";

const AuthPage = lazy(() => import("./pages/AuthPage.jsx"));

const AdminApprovalsPage = lazy(() => import("./pages/AdminApprovalsPage.jsx"));

const BookmarksPage = lazy(() => import("./pages/BookmarksPage.jsx"));

const ContinuePage = lazy(() => import("./pages/ContinuePage.jsx"));

const CourseDetailPage = lazy(() => import("./pages/CourseDetailPage.jsx"));

const CoursesPage = lazy(() => import("./pages/CoursesPage.jsx"));

const DashboardPage = lazy(() => import("./pages/DashboardPage.jsx"));

const LessonPage = lazy(() => import("./pages/LessonPage.jsx"));

const PdfViewerPage = lazy(() => import("./pages/PdfViewerPage.jsx"));

const SearchPage = lazy(() => import("./pages/SearchPage.jsx"));

export default function App() {
  return (
    <Suspense fallback={<Loading label="Loading page" />}>
      <Routes>
        <Route path="/login" element={<AuthPage mode="login" />} />

        <Route path="/register" element={<AuthPage mode="register" />} />
<Route
  path="/forgot-password"
  element={<ForgotPasswordPage />}
/>

<Route
  path="/reset-password/:token"
  element={<ResetPasswordPage />}
/>
        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route path="admin/approvals" element={<AdminApprovalsPage />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["user"]} />}>
          <Route element={<AppShell />}>
            <Route index element={<DashboardPage />} />

            <Route path="courses" element={<CoursesPage />} />

            <Route path="courses/:slug" element={<CourseDetailPage />} />

            <Route path="lessons/:id" element={<LessonPage />} />

            <Route path="pdfs/:id" element={<PdfViewerPage />} />

            <Route path="continue" element={<ContinuePage />} />

            <Route path="bookmarks" element={<BookmarksPage />} />

            <Route path="search" element={<SearchPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
