import { Link } from 'wouter';
import { Logo } from '@/components/layout/Logo';

export function LandingFooter() {
  return (
    <footer className="sf-landing-footer">
      <div className="sf-landing-container sf-landing-footer-inner">
        <Logo />
        <nav className="sf-landing-footer-links" aria-label="Footer">
          <Link href="/signin">Sign In</Link>
          <Link href="/onboarding">Get Started</Link>
        </nav>
      </div>
    </footer>
  );
}
