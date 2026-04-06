import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useThemeSettings } from '@/hooks/useThemeSettings';
import PageLoader from './PageLoader';

const RouteLoader = () => {
  const location = useLocation();
  const { theme } = useThemeSettings();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Skip loader when stable navigation is enabled
    if (theme.sidebarStableNav) return;
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(timer);
  }, [location.pathname, theme.sidebarStableNav]);

  if (!loading) return null;
  return <PageLoader />;
};

export default RouteLoader;
