import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, useParams } from 'react-router-dom';
import { AuthProvider } from '@/hooks/useAuth';
import { ThemeProvider } from '@/hooks/useTheme';
import { AppLayout } from '@/components/layout/AppLayout';
import { SkeletonLoader } from '@/components/common/SkeletonLoader';

const HomePage = React.lazy(() => import('@/pages/HomePage').then(m => ({ default: m.HomePage })));
const SpaceDetailPage = React.lazy(() => import('@/pages/SpaceDetailPage').then(m => ({ default: m.SpaceDetailPage })));
const PageDetailPage = React.lazy(() => import('@/pages/PageDetailPage').then(m => ({ default: m.PageDetailPage })));
const SearchPage = React.lazy(() => import('@/pages/SearchPage').then(m => ({ default: m.SearchPage })));
const SettingsPage = React.lazy(() => import('@/pages/SettingsPage').then(m => ({ default: m.SettingsPage })));
const LoginPage = React.lazy(() => import('@/pages/LoginPage').then(m => ({ default: m.LoginPage })));
const NotFoundPage = React.lazy(() => import('@/pages/NotFoundPage').then(m => ({ default: m.NotFoundPage })));

// Helper component for direct page/:pageId routes
function DirectPageRedirect() {
  const { pageId } = useParams<{ pageId: string }>();
  return <PageDetailPage key={pageId} />;
}

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Suspense
            fallback={
              <div className="flex h-screen items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-xl animate-pulse">
                    V
                  </div>
                  <span className="text-xs text-muted-foreground font-medium">Loading Vipto Docs...</span>
                </div>
              </div>
            }
          >
            <Routes>
              <Route path="/login" element={<LoginPage />} />

              {/* Main Application Shell with Sub-routes */}
              <Route element={<AppLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/spaces/:spaceKey" element={<SpaceDetailPage />} />
                <Route path="/spaces/:spaceKey/:pageId" element={<PageDetailPage />} />
                <Route path="/page/:pageId" element={<DirectPageRedirect />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Route>
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
