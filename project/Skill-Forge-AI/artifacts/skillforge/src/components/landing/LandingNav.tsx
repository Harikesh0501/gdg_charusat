import { Link } from 'wouter';
import { Logo } from '@/components/layout/Logo';

export function LandingNav() {
  return (
    <header className="sf-landing-nav">
      <div className="sf-landing-nav-inner">
        <Logo />
        <nav className="sf-landing-links" aria-label="Landing page sections">
          <a href="#product">Product</a>
          <a href="#how-it-works">How it works</a>
          <a href="#features">Features</a>
        </nav>
        <div className="sf-landing-actions">
          <Link href="/signin" className="sf-button sf-button-ghost" data-testid="link-landing-signin">
            Sign In
          </Link>
          <Link href="/onboarding" className="sf-button sf-button-primary" data-testid="link-landing-get-started">
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
}
