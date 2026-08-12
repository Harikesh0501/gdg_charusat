import {
  ClipboardCheck, FileText, Gauge, Home, Route as RouteIcon,
  Search, Sparkles, Target, TrendingUp,
} from 'lucide-react';
import type { NavItem } from '@/types/nav';

export const primaryNavItems: NavItem[] = [
  { href: '/dashboard', label: 'Overview', icon: Home },
  { href: '/skills', label: 'Skills inventory', icon: Gauge },
  { href: '/goal', label: 'Career goal', icon: Target },
  { href: '/gap', label: 'Gap analysis', icon: Search },
  { href: '/roadmap', label: 'Roadmap', icon: RouteIcon },
  { href: '/recommendations', label: 'Recommendations', icon: Sparkles },
];

export const practiceNavItems: NavItem[] = [
  { href: '/progress', label: 'Progress', icon: TrendingUp },
  { href: '/interview', label: 'Interview prep', icon: ClipboardCheck },
  { href: '/resume', label: 'Resume lab', icon: FileText },
];

export function pageTitleForLocation(location: string): string {
  const found = [...primaryNavItems, ...practiceNavItems].find((item) => item.href === location);
  return found?.label
    ?? (location === '/onboarding' ? 'Profile setup' : location === '/signin' ? 'Sign in' : 'Workspace');
}
