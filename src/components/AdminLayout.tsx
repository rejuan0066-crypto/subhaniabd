import { createContext, useContext, ReactNode, useRef, useState, useEffect, useTransition } from 'react';
import BackButton from './BackButton';
import AdminPageWithTabs from './AdminPageWithTabs';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useIsEmbedded } from '@/contexts/EmbeddedContext';
import { useQuery } from '@tanstack/react-query';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';
import { isAdminRole } from '@/lib/roles';
import { supabase } from '@/integrations/supabase/client';
import { useMenuSettings, MenuItemConfig } from '@/hooks/useMenuSettings';
import { useThemeSettings } from '@/hooks/useThemeSettings';
import { useSidebarSections } from '@/hooks/useSidebarSections';
import { useWebsiteSettings } from '@/hooks/useWebsiteSettings';
import LanguageToggle from './LanguageToggle';
import NotificationPanel from './NotificationPanel';
import DarkModeToggle from './DarkModeToggle';
import {
  LayoutDashboard, Users, UserCog, BookOpen, FileText, Bell,
  CreditCard, Settings, Globe, GraduationCap, Menu, X, LogOut,
  ChevronRight, Layers, Receipt, Heart, ReceiptText, FileSignature,
  FilePlus, FileCheck, Tag, Wrench, UserCircle, ChevronDown, FileBox,
  Blocks, FlaskConical, CalendarDays, ShieldCheck, BarChart3, KeyRound, Palette,
  ListOrdered, Home, Image, Mail, Phone, MapPin, Star, Award, Clock, Folder, LayoutGrid,
  HardDrive, MessageSquare, Wallet, UserPlus, Camera, Search, Maximize2, MoreVertical,
  CalendarClock, ClipboardList,
  type LucideIcon
} from 'lucide-react';

const ICON_MAP: Record<string, LucideIcon> = {
  LayoutDashboard, Users, UserCog, BookOpen, FileText, Bell,
  CreditCard, Settings, Globe, GraduationCap, Heart, Layers,
  Receipt, ReceiptText, FileSignature, FilePlus, FileCheck, Tag,
  Wrench, Blocks, FlaskConical, CalendarDays, ShieldCheck, BarChart3,
  KeyRound, Palette, ListOrdered, UserCircle, FileBox, Home,
  Image, Mail, Phone, MapPin, Star, Award, Clock, Folder, LayoutGrid, HardDrive, MessageSquare, Wallet, UserPlus, Camera,
  CalendarClock, ClipboardList,
};

const MENU_SCROLL_STORAGE_KEYS = {
  desktop: 'admin-layout-menu-scroll-desktop',
  mobile: 'admin-layout-menu-scroll-mobile',
} as const;

const getIcon = (name: string): LucideIcon => ICON_MAP[name] || FileBox;

const AdminLayoutNestingContext = createContext(false);

const AdminLayout = ({ children }: { children: ReactNode }) => {
  const isEmbedded = useIsEmbedded();
  const isNestedAdminLayout = useContext(AdminLayoutNestingContext);
  const { t, language } = useLanguage();
  const { signOut, role, user } = useAuth();
  const { canView, hasUserPermission } = usePermissions();
  const location = useLocation();
  const navigate = useNavigate();
  const { menuConfig } = useMenuSettings();
  const { theme: adminTheme } = useThemeSettings();
  const { sections: sidebarSections } = useSidebarSections();
  const { settings: websiteSettings } = useWebsiteSettings();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const [hoverGroup, setHoverGroup] = useState<string | null>(null);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [, startNavTransition] = useTransition();
  const menuScrollPositionsRef = useRef({ desktop: 0, mobile: 0 });

  // Fetch staff photo for sidebar avatar
  const { data: sidebarStaffPhoto } = useQuery({
    queryKey: ['sidebar-staff-photo', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase.from('staff').select('photo_url, name_bn, name_en').eq('user_id', user.id).maybeSingle();
      return data;
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  });

  // Apply default theme mode from settings
  useEffect(() => {
    const stored = localStorage.getItem('theme');
    if (!stored && adminTheme.defaultThemeMode !== 'system') {
      if (adminTheme.defaultThemeMode === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [adminTheme.defaultThemeMode]);

  // Compute dynamic styles from theme
  const sidebarWidthMap = { narrow: 'w-[200px]', default: 'w-[260px]', wide: 'w-[300px]' };
  const sidebarWidthClass = sidebarWidthMap[adminTheme.sidebarWidth] || 'w-[260px]';
  const sidebarWidthPxMap = { narrow: 200, default: 260, wide: 300 };
  const expandedSidebarWidth = sidebarWidthPxMap[adminTheme.sidebarWidth] || 260;
  const collapsedSidebarWidth = 64;
  const desktopSidebarWidth = sidebarOpen ? expandedSidebarWidth : collapsedSidebarWidth;
  const iconSizeMap = { small: 'w-4 h-4', medium: 'w-[18px] h-[18px]', large: 'w-5 h-5' };
  const iconSizeClass = iconSizeMap[adminTheme.sidebarIconSize] || 'w-[18px] h-[18px]';
  const headerHeightMap = { compact: 'py-1.5', default: 'py-2.5', tall: 'py-4' };
  const headerPadClass = headerHeightMap[adminTheme.headerHeight] || 'py-2.5';
  const mobileHeaderOffsetMap = {
    compact: 'pt-[calc(env(safe-area-inset-top)+3.75rem)]',
    default: 'pt-[calc(env(safe-area-inset-top)+4.25rem)]',
    tall: 'pt-[calc(env(safe-area-inset-top)+5rem)]',
  };
  const mobileHeaderOffsetClass = mobileHeaderOffsetMap[adminTheme.headerHeight] || 'pt-[calc(env(safe-area-inset-top)+4.25rem)]';
  const desktopHeaderOffsetMap = {
    compact: 'lg:pt-14',
    default: 'lg:pt-16',
    tall: 'lg:pt-20',
  };
  const desktopHeaderOffsetClass = desktopHeaderOffsetMap[adminTheme.headerHeight] || 'lg:pt-16';
  const headerTopPaddingMap = { compact: '0.375rem', default: '0.625rem', tall: '1rem' };
  const headerTopPadding = headerTopPaddingMap[adminTheme.headerHeight] || '0.625rem';

  const sidebarStyle: React.CSSProperties = {
    ...(adminTheme.sidebarBgColor ? { backgroundColor: adminTheme.sidebarBgColor } : {}),
    ...(adminTheme.sidebarTextColor ? { color: adminTheme.sidebarTextColor } : {}),
  };
  const headerStyle: React.CSSProperties = {
    boxShadow: 'var(--shadow-soft)',
    ...(adminTheme.headerBgColor ? { backgroundColor: adminTheme.headerBgColor } : {}),
    ...(adminTheme.headerTextColor ? { color: adminTheme.headerTextColor } : {}),
  };

  // When embedded or already inside an admin shell, render only the page content
  if (isEmbedded || isNestedAdminLayout) {
    return <>{children}</>;
  }

  const isAdmin = isAdminRole(role);

  // Check if user can see a menu path
  const canAccessPath = (path: string): boolean => {
    if (isAdmin) return true;
    const basePath = path.split('?')[0];
    if (basePath === '/admin' || basePath === '/admin/profile') return true;
    return canView(basePath) || hasUserPermission(basePath, 'view');
  };

  const toggleGroup = (key: string) => {
    setOpenGroups(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const persistMenuScroll = (mobile: boolean, scrollTop: number) => {
    const storageKey = mobile ? MENU_SCROLL_STORAGE_KEYS.mobile : MENU_SCROLL_STORAGE_KEYS.desktop;
    menuScrollPositionsRef.current[mobile ? 'mobile' : 'desktop'] = scrollTop;
    window.sessionStorage.setItem(storageKey, String(scrollTop));
  };

  const restoreMenuScroll = (element: HTMLElement | null, mobile: boolean) => {
    if (!element) return;
    const storageKey = mobile ? MENU_SCROLL_STORAGE_KEYS.mobile : MENU_SCROLL_STORAGE_KEYS.desktop;
    const savedScrollTop = window.sessionStorage.getItem(storageKey);
    const fallbackScrollTop = menuScrollPositionsRef.current[mobile ? 'mobile' : 'desktop'];
    const scrollTop = savedScrollTop ? Number(savedScrollTop) : fallbackScrollTop;
    requestAnimationFrame(() => {
      element.scrollTop = Number.isFinite(scrollTop) ? scrollTop : 0;
    });
  };

  // Fetch published custom forms for dynamic menu
  const { data: publishedForms = [] } = useQuery({
    queryKey: ['published-custom-forms'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('custom_forms')
        .select('*')
        .neq('publish_to', 'none')
        .eq('is_active', true)
        .order('created_at');
      if (error) throw error;
      return data;
    },
  });

  type MenuItem = {
    path: string;
    label: string;
    icon: any;
    group?: string;
    children?: { path: string; label: string; icon: any }[];
  };

  const configToMenuItem = (cfg: MenuItemConfig): MenuItem => ({
    path: cfg.path,
    label: language === 'bn' ? cfg.label_bn : cfg.label_en,
    icon: getIcon(cfg.icon),
    children: cfg.children
      ?.filter(c => c.visible && !c.tab_of && canAccessPath(c.path))
      .map(c => ({
        path: c.path,
        label: language === 'bn' ? c.label_bn : c.label_en,
        icon: getIcon(c.icon),
      })),
  });

  const canAccessParent = (item: MenuItemConfig): boolean => {
    if (isAdmin) return true;
    if (canAccessPath(item.path)) return true;
    if (item.children && item.children.length > 0) {
      return item.children.some(c => c.visible && canAccessPath(c.path));
    }
    return false;
  };

  const baseMenuItems: MenuItem[] = menuConfig.sidebar
    .filter(item => item.visible && !item.tab_of && canAccessParent(item))
    .sort((a, b) => a.sort_order - b.sort_order)
    .map(configToMenuItem);

  const menuItems: MenuItem[] = baseMenuItems.map(item => {
    const subForms = publishedForms.filter(f => f.publish_to === 'sub_menu' && f.parent_menu === item.path);
    if (subForms.length > 0) {
      const existingChildren = item.children || [];
      const newChildren = subForms.map(f => ({
        path: `/admin/custom/${f.menu_slug}`,
        label: language === 'bn' ? f.name_bn : f.name,
        icon: FileBox,
      }));
      return { ...item, children: [...existingChildren, ...newChildren] };
    }
    return item;
  });

  const mainMenuForms = publishedForms.filter(f => f.publish_to === 'main_menu');
  mainMenuForms.forEach(f => {
    const settingsIdx = menuItems.findIndex(m => m.path === '/admin/settings');
    const newItem: MenuItem = {
      path: `/admin/custom/${f.menu_slug}`,
      label: language === 'bn' ? f.name_bn : f.name,
      icon: FileBox,
    };
    if (settingsIdx !== -1) {
      menuItems.splice(settingsIdx, 0, newItem);
    } else {
      menuItems.push(newItem);
    }
  });

  // Group menu items by category using dynamic sidebar sections
  const getGroupInfo = (path: string): { label: string; color?: string; bgColor?: string } | null => {
    for (const sec of sidebarSections) {
      if (sec.menuPaths.includes(path)) {
        return {
          label: language === 'bn' ? sec.labelBn : sec.labelEn,
          color: sec.color || undefined,
          bgColor: sec.bgColor || undefined,
        };
      }
    }
    return null;
  };

  // Build breadcrumb from current path
  const getBreadcrumbs = () => {
    const crumbs = [{ label: language === 'bn' ? 'হোম' : 'Home', path: '/admin' }];
    const fullPath = location.pathname + location.search;
    const currentItem = menuItems.find(i => i.path === location.pathname || i.path === fullPath);
    if (currentItem && currentItem.path !== '/admin') {
      crumbs.push({ label: currentItem.label, path: currentItem.path });
    } else {
      for (const item of menuItems) {
        const child = item.children?.find(c => {
          const [cPath, cSearch] = c.path.split('?');
          return cSearch ? (location.pathname === cPath && location.search === '?' + cSearch) : location.pathname === c.path;
        });
        if (child) {
          crumbs.push({ label: item.label, path: item.path });
          crumbs.push({ label: child.label, path: child.path });
          break;
        }
      }
    }
    return crumbs;
  };

  const currentPageLabel = (() => {
    const fullPath = location.pathname + location.search;
    for (const item of menuItems) {
      if (item.path === location.pathname || item.path === fullPath) return item.label;
      const child = item.children?.find(c => {
        const [cPath, cSearch] = c.path.split('?');
        return cSearch ? (location.pathname === cPath && location.search === '?' + cSearch) : location.pathname === c.path;
      });
      if (child) return child.label;
    }
    return t('dashboard');
  })();

  const breadcrumbs = getBreadcrumbs();

  const renderSidebar = (mobile = false) => (
    <aside key={mobile ? 'mobile' : 'desktop'} className={`${mobile ? 'fixed inset-0 z-50' : 'hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:flex'} flex`}>
      {mobile && (
        <div
          className="flex-1 bg-foreground/40 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}
      <div
        className={`${mobile ? 'w-[280px] max-w-[85vw] animate-in slide-in-from-left duration-300 h-[100dvh] max-h-[100dvh]' : sidebarOpen ? sidebarWidthClass : 'w-16'} sidebar-glass flex flex-col ${mobile ? '' : 'h-full'} transition-all duration-300 ${mobile ? 'order-first shadow-2xl' : ''}`}
        style={sidebarStyle}
      >
        {/* Logo */}
        <div className="px-4 py-5 flex items-center gap-3 border-b border-sidebar-border/30 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-sidebar-primary flex items-center justify-center shrink-0 shadow-lg shadow-sidebar-primary/25 overflow-hidden">
            {(websiteSettings.favicon_url || websiteSettings.logo_url) ? (
              <img src={websiteSettings.favicon_url || websiteSettings.logo_url} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <span className="text-sm font-bold text-sidebar-primary-foreground">
                {(language === 'bn' ? websiteSettings.institution_name : (websiteSettings.institution_name_en || websiteSettings.institution_name))?.charAt(0) || 'E'}
              </span>
            )}
          </div>
          {(sidebarOpen || mobile) && (
            <div className="overflow-hidden flex-1 min-w-0">
              <h2 className="text-sm font-bold text-sidebar-foreground truncate leading-relaxed">
                {language === 'bn' ? websiteSettings.institution_name : (websiteSettings.institution_name_en || websiteSettings.institution_name)}
              </h2>
              <p className="text-[11px] text-sidebar-foreground/50 leading-relaxed">{language === 'bn' ? 'ম্যানেজমেন্ট সিস্টেম' : 'Management System'}</p>
            </div>
          )}
          {mobile && (
            <button onClick={() => setMobileSidebarOpen(false)} className="ml-auto p-1.5 rounded-md hover:bg-sidebar-accent text-sidebar-foreground shrink-0">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Menu - scrollable area */}
        <nav
          ref={(element) => restoreMenuScroll(element, mobile)}
          onScroll={(event) => persistMenuScroll(mobile, event.currentTarget.scrollTop)}
          className="flex-1 min-h-0 py-3 px-3 space-y-0.5 overflow-y-auto overscroll-contain scrollbar-thin"
          data-current-path={location.pathname}
        >
          {/* Group items with labels */}
          {(() => {
            let lastGroup = '';
            return menuItems.map((item) => {
              const currentFullPath = location.pathname + location.search;
              const isActive = location.pathname === item.path || currentFullPath === item.path;
              const hasChildren = item.children && item.children.length > 0;
              const isGroupOpen = openGroups[item.path] || item.children?.some(c => {
                const [cPath, cSearch] = c.path.split('?');
                return cSearch ? (location.pathname === cPath && location.search === '?' + cSearch) : location.pathname === c.path;
              });
              const groupInfo = getGroupInfo(item.path);
              const groupLabel = groupInfo?.label || '';
              const showGroupLabel = groupLabel && groupLabel !== lastGroup;
              if (groupLabel) lastGroup = groupLabel;

              return (
                <div key={item.path}>
                  {showGroupLabel && (
                    <div
                      className="sidebar-group-label mt-4 first:mt-0"
                      style={{
                        ...(groupInfo?.color ? { color: groupInfo.color } : {}),
                        ...(groupInfo?.bgColor ? { backgroundColor: groupInfo.bgColor + '15', borderRadius: '6px', marginLeft: '-4px', marginRight: '-4px', paddingLeft: '16px' } : {}),
                      }}
                    >
                      {groupLabel}
                    </div>
                  )}
                  <div
                    className="flex items-center"
                    onMouseEnter={() => {
                      if (!mobile && hasChildren) {
                        if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
                        setHoverGroup(item.path);
                      }
                    }}
                    onMouseLeave={() => {
                      if (!mobile && hasChildren) {
                        hoverTimeoutRef.current = setTimeout(() => setHoverGroup(null), 200);
                      }
                    }}
                  >
                    {(() => {
                      const effectClass = adminTheme.sidebarClickEffect && adminTheme.sidebarClickEffect !== 'none' ? `click-${adminTheme.sidebarClickEffect}` : '';
                      const isHoverOpen = hoverGroup === item.path;
                      const isExpanded = isGroupOpen || isHoverOpen;
                      return hasChildren ? (
                      <div className={`sidebar-item flex-1 ${effectClass} ${isActive ? 'active' : ''}`}>
                        <Link
                          to={item.path}
                          onClick={(e) => {
                            if (mobile) setMobileSidebarOpen(false);
                            if (adminTheme.sidebarStableNav) {
                              e.preventDefault();
                              startNavTransition(() => navigate(item.path));
                            }
                          }}
                          className="flex items-center gap-2.5 flex-1 min-w-0"
                          title={!sidebarOpen && !mobile ? item.label : undefined}
                        >
                          <item.icon className="sidebar-icon w-[18px] h-[18px] shrink-0" />
                          {(sidebarOpen || mobile) && <span className="truncate">{item.label}</span>}
                        </Link>
                        {(sidebarOpen || mobile) && hasChildren && (
                          <button
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleGroup(item.path); }}
                            className="p-0.5 rounded hover:bg-sidebar-accent/50 shrink-0 ml-auto"
                          >
                            <ChevronDown className={`sidebar-chevron w-3.5 h-3.5 ${isExpanded ? 'open' : ''}`} />
                          </button>
                        )}
                      </div>
                    ) : (
                      <Link
                        to={item.path}
                        onClick={(e) => {
                          if (mobile) setMobileSidebarOpen(false);
                          if (adminTheme.sidebarStableNav) {
                            e.preventDefault();
                            startNavTransition(() => navigate(item.path));
                          }
                        }}
                        className={`sidebar-item flex-1 ${effectClass} ${isActive ? 'active' : ''}`}
                        title={!sidebarOpen && !mobile ? item.label : undefined}
                      >
                        <item.icon className="sidebar-icon w-[18px] h-[18px] shrink-0" />
                        {(sidebarOpen || mobile) && <span className="truncate">{item.label}</span>}
                        {isActive && (sidebarOpen || mobile) && <ChevronRight className="w-3.5 h-3.5 ml-auto shrink-0 opacity-50" />}
                      </Link>
                    );
                    })()}
                  </div>
                  {hasChildren && (isGroupOpen || hoverGroup === item.path) && (sidebarOpen || mobile) && (
                    <div
                      className="sidebar-submenu-enter ml-5 mt-1 space-y-0.5 border-l-2 border-sidebar-primary/20 pl-3 py-1 rounded-br-lg bg-sidebar-accent/30"
                      onMouseEnter={() => {
                        if (!mobile) {
                          if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
                          setHoverGroup(item.path);
                        }
                      }}
                      onMouseLeave={() => {
                        if (!mobile) {
                          hoverTimeoutRef.current = setTimeout(() => setHoverGroup(null), 200);
                        }
                      }}
                    >
                      {item.children!.map(child => {
                        const [childPathname, childSearch] = child.path.split('?');
                        const childActive = childSearch
                          ? (location.pathname === childPathname && location.search === '?' + childSearch)
                          : location.pathname === child.path;
                        return (
                          <Link
                            key={child.path}
                            to={child.path}
                            onClick={(e) => {
                              if (mobile) setMobileSidebarOpen(false);
                              if (adminTheme.sidebarStableNav) {
                                e.preventDefault();
                                startNavTransition(() => navigate(child.path));
                              }
                            }}
                            className={`sidebar-item text-xs py-1.5 ${childActive ? 'active' : ''}`}
                          >
                            <child.icon className="sidebar-icon w-4 h-4 shrink-0" />
                            <span className="truncate">{child.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            });
          })()}
        </nav>

        {/* Bottom - user profile + logout */}
        {(sidebarOpen || mobile) && (
          <div className="p-3 border-t border-sidebar-border/30 shrink-0">
            <div className="flex items-center gap-3 px-2 py-2.5">
              <div className="w-9 h-9 rounded-full bg-sidebar-primary flex items-center justify-center shrink-0 overflow-hidden shadow-md shadow-sidebar-primary/20 ring-2 ring-sidebar-primary/20">
                {sidebarStaffPhoto?.photo_url ? (
                  <img src={sidebarStaffPhoto.photo_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs font-bold text-sidebar-primary-foreground">
                    {user?.email?.charAt(0).toUpperCase() || 'A'}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-sidebar-foreground truncate leading-relaxed">
                  {(language === 'bn' ? sidebarStaffPhoto?.name_bn : sidebarStaffPhoto?.name_en) || sidebarStaffPhoto?.name_bn || user?.email?.split('@')[0] || 'Admin'}
                </p>
                <span className="user-role-badge mt-0.5">{(() => {
                  const roleLabels: Record<string, { bn: string; en: string }> = {
                    super_admin: { bn: 'সুপার অ্যাডমিন', en: 'Super Admin' },
                    admin: { bn: 'অ্যাডমিন', en: 'Admin' },
                    teacher: { bn: 'শিক্ষক', en: 'Teacher' },
                    staff: { bn: 'স্টাফ', en: 'Staff' },
                    accountant: { bn: 'হিসাবরক্ষক', en: 'Accountant' },
                  };
                  const r = roleLabels[role || ''] || { bn: role || '', en: role || '' };
                  return language === 'bn' ? r.bn : r.en;
                })()}</span>
              </div>
              <button
                onClick={async () => { await signOut(); navigate('/login'); }}
                className="p-1.5 rounded-lg hover:bg-destructive/20 text-sidebar-foreground/60 hover:text-destructive transition-colors"
                title={language === 'bn' ? 'লগআউট' : 'Logout'}
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );

  return (
    <AdminLayoutNestingContext.Provider value>
      <div className="min-h-screen bg-background" style={{ ['--admin-sidebar-width' as string]: `${desktopSidebarWidth}px` }}>
        {renderSidebar(false)}
        {mobileSidebarOpen && renderSidebar(true)}

        <div className={`flex min-h-screen flex-col min-w-0 ${mobileHeaderOffsetClass} ${desktopHeaderOffsetClass} lg:ml-[var(--admin-sidebar-width)]`}>
          {/* Top bar */}
          <header className={`bg-card border-b px-4 lg:px-6 ${headerPadClass} fixed inset-x-0 top-0 z-40 flex items-center justify-between lg:left-[var(--admin-sidebar-width)] lg:right-0`} style={{ ...headerStyle, fontSize: 'var(--header-font-size, 13px)', paddingTop: `calc(env(safe-area-inset-top) + ${headerTopPadding})` }}>
            <div className="flex items-center gap-3">
              <button onClick={() => { if (window.innerWidth < 1024) setMobileSidebarOpen(true); else setSidebarOpen(!sidebarOpen); }} className="p-2 rounded-lg hover:bg-secondary transition-colors">
                <Menu className="w-5 h-5 text-muted-foreground" />
              </button>
              {/* Breadcrumbs */}
              {adminTheme.headerShowBreadcrumb && (
                <nav className="hidden sm:flex items-center gap-1 text-sm">
                  {breadcrumbs.map((crumb, i) => (
                    <span key={crumb.path} className="flex items-center gap-1">
                      {i > 0 && <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/50" />}
                      {i === breadcrumbs.length - 1 ? (
                        <span className="text-foreground font-medium">{crumb.label}</span>
                      ) : (
                        <Link to={crumb.path} className="text-muted-foreground hover:text-foreground transition-colors">{crumb.label}</Link>
                      )}
                    </span>
                  ))}
                </nav>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              {/* Search */}
              {adminTheme.headerShowSearch && (
                <div className="hidden md:flex items-center gap-2 bg-secondary rounded-lg px-3 py-1.5 text-sm text-muted-foreground min-w-[200px]">
                  <Search className="w-4 h-4 shrink-0" />
                  <span className="flex-1 text-xs">{language === 'bn' ? 'শিক্ষার্থী, শিক্ষক, ক্লাস খুঁজুন...' : 'Search students, teachers...'}</span>
                  <kbd className="hidden lg:inline-flex items-center gap-0.5 rounded border bg-card px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                    Ctrl+K
                  </kbd>
                </div>
              )}
              <DarkModeToggle />
              <NotificationPanel />
              <LanguageToggle />
              <Link to="/" className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground" title={t('home')}>
                <Globe className="w-5 h-5" />
              </Link>
            </div>
          </header>

          {/* Page title */}
          <div className="px-4 lg:px-6 pt-5 pb-2">
            <h1 className="text-xl font-bold text-foreground">{currentPageLabel}</h1>
          </div>

          {/* Content */}
          <main className="flex-1 px-4 lg:px-6 pb-6">
            <AdminPageWithTabs>{children}</AdminPageWithTabs>
            <BackButton />
          </main>
        </div>
      </div>
    </AdminLayoutNestingContext.Provider>
  );
};

export default AdminLayout;
