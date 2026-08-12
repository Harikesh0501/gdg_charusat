import { X } from 'lucide-react';
import { Link } from 'wouter';

export function NotFound() {
  return (
    <div className="sf-empty" style={{ minHeight: '100dvh' }}>
      <div>
        <X size={32} />
        <h1 className="sf-title" style={{ fontSize: 30 }}>That page moved.</h1>
        <Link href="/dashboard" className="sf-link" data-testid="link-not-found-home">Return to overview</Link>
      </div>
    </div>
  );
}
