import { useState } from 'react';
import { ArrowRight, LockKeyhole } from 'lucide-react';
import { useLocation } from 'wouter';
import { Logo } from '@/components/layout/Logo';
import { Pill } from '@/components/shared/Pill';

export function SignIn() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const isValidEmail = email.includes('@');
  const showEmailHint = email.length > 0 && !isValidEmail;

  const handleSignIn = () => {
    setSubmitting(true);
    window.setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
      window.setTimeout(() => setLocation('/dashboard'), 700);
    }, 600);
  };

  return (
    <div className="sf-signin">
      <section className="sf-signin-aside">
        <Logo />
        <div>
          <div className="sf-eyebrow" style={{ color: 'hsl(var(--accent))' }}>Career intelligence, made clear</div>
          <h1>Know where you stand. Decide what’s next.</h1>
          <p>SkillForge turns your experience into an honest, explainable path toward the work you want to do.</p>
        </div>
        <div className="sf-quote">“The best career advice is specific enough to act on, and honest enough to trust.”</div>
      </section>
      <section className="sf-signin-panel">
        <div className="sf-signin-box">
          <div className="sf-mark">sf</div>
          <h2>Welcome back.</h2>
          <p className="sf-subtitle" style={{ marginTop: 0 }}>Continue building your next chapter.</p>
          <div className="sf-field">
            <label htmlFor="signin-email">Work email</label>
            <input
              id="signin-email"
              className="sf-input"
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              aria-invalid={showEmailHint}
              aria-describedby={showEmailHint ? 'signin-email-hint' : undefined}
              data-testid="input-signin-email"
            />
            {showEmailHint && (
              <span id="signin-email-hint" style={{ color: 'hsl(var(--destructive))', fontSize: 11 }} data-testid="hint-signin-email">
                Enter a valid work email to continue.
              </span>
            )}
          </div>
          <button
            type="button"
            className="sf-button sf-button-primary"
            style={{ width: '100%', marginTop: 7 }}
            onClick={handleSignIn}
            disabled={!isValidEmail || submitting}
            aria-busy={submitting}
            data-testid="button-signin"
          >
            {submitting ? 'Signing in…' : <>Continue with email <ArrowRight size={15} /></>}
          </button>
          {submitted && (
            <Pill tone="teal" style={{ marginTop: 15, width: '100%', justifyContent: 'center' }} data-testid="status-signin">
              Signed in — opening your workspace
            </Pill>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '27px 0', color: 'hsl(var(--muted-foreground))', fontSize: 11 }}>
            <LockKeyhole size={13} /> Your information is private by default.
          </div>
          <button type="button" className="sf-button sf-button-ghost" style={{ width: '100%' }} onClick={() => setLocation('/dashboard')} data-testid="button-demo-access">
            Explore the demo <ArrowRight size={15} />
          </button>
        </div>
      </section>
    </div>
  );
}
