import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  Home, 
  FileText, 
  Building2, 
  Users, 
  Calendar, 
  CheckSquare, 
  BarChart3, 
  Navigation, 
  DollarSign 
} from 'lucide-react';

export interface NavigationItem {
  id: string;
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  priority: number;
  matchPath?: (pathname: string) => boolean;
}

const navigationItems: NavigationItem[] = [
  {
    id: 'dashboard',
    to: '/dashboard',
    label: 'Dashboard',
    icon: Home,
    priority: 1,
    matchPath: (pathname) => pathname === '/dashboard'
  },
  {
    id: 'reports',
    to: '/reports',
    label: 'Reports',
    icon: FileText,
    priority: 2,
    matchPath: (pathname) => pathname.startsWith('/reports')
  },
  {
    id: 'accounts',
    to: '/accounts',
    label: 'Accounts',
    icon: Building2,
    priority: 3,
    matchPath: (pathname) => pathname.startsWith('/accounts')
  },
  {
    id: 'contacts',
    to: '/contacts',
    label: 'Contacts',
    icon: Users,
    priority: 4,
    matchPath: (pathname) => pathname.startsWith('/contacts')
  },
  {
    id: 'calendar',
    to: '/calendar',
    label: 'Calendar',
    icon: Calendar,
    priority: 5,
    matchPath: (pathname) => pathname === '/calendar'
  },
  {
    id: 'tasks',
    to: '/tasks',
    label: 'Tasks',
    icon: CheckSquare,
    priority: 6,
    matchPath: (pathname) => pathname === '/tasks'
  },
  {
    id: 'routes',
    to: '/routes',
    label: 'Routes',
    icon: Navigation,
    priority: 7,
    matchPath: (pathname) => pathname === '/routes'
  },
  {
    id: 'expenses',
    to: '/expenses',
    label: 'Expenses',
    icon: DollarSign,
    priority: 8,
    matchPath: (pathname) => pathname.startsWith('/expenses')
  },
  {
    id: 'analytics',
    to: '/analytics',
    label: 'Analytics',
    icon: BarChart3,
    priority: 9,
    matchPath: (pathname) => pathname === '/analytics'
  }
];

// Breakpoints for different screen sizes
const BREAKPOINTS = {
  MOBILE: 768,
  SMALL_TABLET: 900,
  MEDIUM_TABLET: 1100,
  LARGE_SCREEN: 1300
};

export function useResponsiveNavigation() {
  const [visibleItems, setVisibleItems] = useState<NavigationItem[]>([]);
  const [hiddenItems, setHiddenItems] = useState<NavigationItem[]>([]);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const location = useLocation();
  
  const updateItemsBasedOnWidth = useCallback((width: number) => {
    // Don't show responsive nav on mobile (handled separately)
    if (width < BREAKPOINTS.MOBILE) {
      setVisibleItems([]);
      setHiddenItems([]);
      return;
    }

    let maxVisibleItems: number;
    
    if (width >= BREAKPOINTS.LARGE_SCREEN) {
      maxVisibleItems = 9; // Show all items
    } else if (width >= BREAKPOINTS.MEDIUM_TABLET) {
      maxVisibleItems = 7; // Hide lowest priority items
    } else if (width >= BREAKPOINTS.SMALL_TABLET) {
      maxVisibleItems = 5; // Show only high priority items
    } else {
      maxVisibleItems = 4; // Very limited space
    }

    const sortedItems = [...navigationItems].sort((a, b) => a.priority - b.priority);
    const visible = sortedItems.slice(0, maxVisibleItems);
    const hidden = sortedItems.slice(maxVisibleItems);

    setVisibleItems(visible);
    setHiddenItems(hidden);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const newWidth = window.innerWidth;
      setWindowWidth(newWidth);
      updateItemsBasedOnWidth(newWidth);
    };

    // Initial calculation
    updateItemsBasedOnWidth(windowWidth);

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [windowWidth, updateItemsBasedOnWidth]);

  const isActive = useCallback((item: NavigationItem) => {
    return item.matchPath ? item.matchPath(location.pathname) : location.pathname === item.to;
  }, [location.pathname]);

  const hasMoreItems = hiddenItems.length > 0;
  const shouldShowResponsiveNav = windowWidth >= BREAKPOINTS.MOBILE;

  return {
    visibleItems,
    hiddenItems,
    hasMoreItems,
    shouldShowResponsiveNav,
    isActive,
    windowWidth
  };
}