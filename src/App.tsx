import { useEffect } from 'react';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { RouterProvider, useRouter } from '@/context/RouterContext';
import { LoadingScreen } from '@/components/LoadingScreen';
import { LandingPage } from '@/pages/LandingPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { AnalyzePage } from '@/pages/AnalyzePage';
import { HistoryPage } from '@/pages/HistoryPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { SettingsPage } from '@/pages/SettingsPage';

const ACCOUNT_PAGES = ['/dashboard', '/history', '/profile', '/settings'];

function Routes() {
  const { path, navigate } = useRouter();
  const { session, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    const isAccountPage = ACCOUNT_PAGES.some((p) => path === p || path.startsWith(p + '/'));
    if (isAccountPage && !session) {
      if (path !== '/') navigate('/');
    }
  }, [path, session, loading, navigate]);

  if (loading) return <LoadingScreen />;

  switch (path) {
    case '/':
      return <LandingPage />;
    case '/dashboard':
      return <DashboardPage />;
    case '/analyze':
      return <AnalyzePage />;
    case '/history':
      return <HistoryPage />;
    case '/profile':
      return <ProfilePage />;
    case '/settings':
      return <SettingsPage />;
    default:
      return <LandingPage />;
  }
}

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider>
        <Routes />
      </RouterProvider>
    </AuthProvider>
  );
}
