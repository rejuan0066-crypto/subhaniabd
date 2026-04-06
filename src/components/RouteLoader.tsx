import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useThemeSettings } from '@/hooks/useThemeSettings';
import PageLoader from './PageLoader';

const RouteLoader = () => {
  const location = useLocation();
  const { theme, isLoading: isThemeLoading } = useThemeSettings();
  const [loading, setLoading] = useState(false);
  const isAdminRoute = location.pathname.startsWith('/admin');

  const stableAdminNavEnabled = useMemo(() => {
    if (typeof window === 'undefined') return theme.sidebarStableNav;

    const persistedStableNav = window.localStorage.getItem('admin-sidebar-stable-nav') === 'true';
    return theme.sidebarStableNav || persistedStableNav;
  }, [theme.sidebarStableNav]);

  useEffect(() => {
    // Keep admin navigation visually stable when the setting is enabled
    // or while the theme preference is still hydrating.
    if (isAdminRoute && (stableAdminNavEnabled || isThemeLoading)) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(timer);
  }, [isAdminRoute, isThemeLoading, location.pathname, stableAdminNavEnabled]);

  if (!loading) return null;
  return <PageLoader />;
};

export default RouteLoader;
