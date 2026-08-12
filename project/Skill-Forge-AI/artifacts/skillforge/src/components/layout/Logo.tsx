import { Link } from 'wouter';

interface LogoProps {
  /** Where the wordmark links to. Defaults to the public landing page. */
  href?: string;
}

export function Logo({ href = '/' }: LogoProps) {
  return (
    <Link href={href} className="sf-brand" data-testid="link-logo">
      <span className="sf-mark">sf</span>
      <span className="sf-brand-name">
        skill<span>forge</span>
      </span>
    </Link>
  );
}
