import type { ReactNode } from 'react';
import { Bell, Check, ChevronRight, CircleHelp, Route as RouteIcon, Settings2 } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { Logo } from '@/components/layout/Logo';
import { pageTitleForLocation, practiceNavItems, primaryNavItems } from '@/config/nav';
import { useWorkspaceToast } from '@/hooks/use-workspace-data';
import { currentUser } from '@/mock/user';

export function Shell({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const toast = useWorkspaceToast();
  const mobileItems = primaryNavItems.slice(0, 4);

  return (
    <div className="sf-app">
      <div className="sf-shell">
        <aside className="sf-sidebar">
          <Logo href="/dashboard" />
          <div className="sf-nav-label">Workspace</div>
          <nav className="sf-nav" aria-label="Primary navigation">
            {primaryNavItems.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={`sf-nav-link ${location === href ? 'active' : ''}`}
                data-testid={`link-nav-${label.toLowerCase().replaceAll(' ', '-')}`}
                aria-current={location === href ? 'page' : undefined}
              >
                <Icon size={16} />
                {label}
              </Link>
            ))}
          </nav>
          <div className="sf-nav-label" style={{ marginTop: 28 }}>Practice</div>
          <nav className="sf-nav" aria-label="Practice navigation">
            {practiceNavItems.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={`sf-nav-link ${location === href ? 'active' : ''}`}
                data-testid={`link-nav-${label.toLowerCase().replaceAll(' ', '-')}`}
                aria-current={location === href ? 'page' : undefined}
              >
                <Icon size={16} />
                {label}
              </Link>
            ))}
          </nav>
          <div className="sf-sidebar-spacer" />
          <Link href="/onboarding" className="sf-nav-link" data-testid="link-nav-profile">
            <Settings2 size={16} />
            Profile setup
          </Link>
          <div className="sf-profile">
            <div className="sf-avatar" data-testid="avatar-jordan">{currentUser.initials}</div>
            <div>
              <div className="sf-profile-name">{currentUser.name}</div>
              <div className="sf-profile-role">{currentUser.role}</div>
            </div>
          </div>
        </aside>
        <main className="sf-main">
          <header className="sf-topbar">
            <div className="sf-breadcrumb">
              <span>Workspace</span>
              <ChevronRight size={13} />
              <strong>{pageTitleForLocation(location)}</strong>
            </div>
            <div className="sf-top-actions">
              <button type="button" className="sf-icon-button" aria-label="Open help" data-testid="button-help">
                <CircleHelp size={16} />
              </button>
              <button type="button" className="sf-icon-button" aria-label="View notifications" data-testid="button-notifications">
                <Bell size={16} />
              </button>
              <div className="sf-avatar" aria-label={currentUser.name} data-testid="avatar-top">{currentUser.initials}</div>
            </div>
          </header>
          {children}
        </main>
        <nav className="sf-mobile-nav" aria-label="Mobile navigation">
          {mobileItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`sf-mobile-link ${location === href ? 'active' : ''}`}
              data-testid={`link-mobile-${label.toLowerCase().replaceAll(' ', '-')}`}
            >
              <Icon size={17} />
              <span>{label === 'Skills inventory' ? 'Skills' : label}</span>
            </Link>
          ))}
          <Link
            href="/roadmap"
            className={`sf-mobile-link ${location === '/roadmap' ? 'active' : ''}`}
            data-testid="link-mobile-roadmap"
          >
            <RouteIcon size={17} />
            <span>Plan</span>
          </Link>
        </nav>
      </div>
      {toast && (
        <div className="sf-toast" role="status" data-testid="status-roadmap-updated">
          <Check size={14} style={{ verticalAlign: 'middle', marginRight: 7, color: 'hsl(var(--accent))' }} />
          {toast}
        </div>
      )}
    </div>
  );
}
