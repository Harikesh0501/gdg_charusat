import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { useLocation } from 'wouter';
import { PageHead } from '@/components/shared/PageHead';
import { ProgressBar } from '@/components/shared/ProgressBar';
import { getCareerGoals } from '@/services/mock';

const CAPACITY_OPTIONS = ['1–2 hrs', '3–5 hrs', '5+ hrs'];
const TOTAL_STEPS = 3;

export function Onboarding() {
  const [, setLocation] = useLocation();
  const careerGoals = getCareerGoals();
  const [step, setStep] = useState(1);
  const [name, setName] = useState('Jordan Lee');

  return (
    <div className="sf-content">
      <PageHead
        eyebrow={`Setup · 0${step} of 03`}
        title={step === 1 ? 'Start with the person, not the profile.' : step === 2 ? 'Name the direction.' : 'Set your working rhythm.'}
        copy={step === 1 ? 'A little context makes every recommendation more honest.' : step === 2 ? 'We’ll use this as the lens for your skill gaps and roadmap.' : 'Your plan should fit the way you actually work.'}
      />
      <section className="sf-card sf-card-pad" style={{ maxWidth: 630 }}>
        <div style={{ marginBottom: 28 }}>
          <ProgressBar value={(step / TOTAL_STEPS) * 100} />
        </div>
        {step === 1 && (
          <div className="sf-field">
            <label htmlFor="onboarding-name">What should we call you?</label>
            <input id="onboarding-name" className="sf-input" value={name} onChange={(event) => setName(event.target.value)} data-testid="input-onboarding-name" />
          </div>
        )}
        {step === 2 && (
          <div className="sf-field">
            <label htmlFor="onboarding-goal">Your target role</label>
            <select id="onboarding-goal" className="sf-select" defaultValue={careerGoals[0]?.title} data-testid="select-onboarding-goal">
              {careerGoals.map((goal) => <option key={goal.id}>{goal.title}</option>)}
            </select>
          </div>
        )}
        {step === 3 && (
          <div>
            <div className="sf-mini-label">Weekly capacity</div>
            <div className="sf-grid sf-grid-3" style={{ marginTop: 12 }}>
              {CAPACITY_OPTIONS.map((time, index) => (
                <button
                  type="button"
                  key={time}
                  className={`sf-goal-option ${index === 1 ? 'selected' : ''}`}
                  style={{ padding: 14 }}
                  data-testid={`button-capacity-${index + 1}`}
                >
                  <strong style={{ fontSize: 13 }}>{time}</strong>
                </button>
              ))}
            </div>
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 30 }}>
          <span style={{ color: 'hsl(var(--muted-foreground))', fontSize: 11 }}>{step === TOTAL_STEPS ? 'You can adjust this later.' : 'Takes about 2 minutes.'}</span>
          <button
            type="button"
            className="sf-button sf-button-primary"
            onClick={() => (step === TOTAL_STEPS ? setLocation('/dashboard') : setStep(step + 1))}
            data-testid="button-onboarding-next"
          >
            {step === TOTAL_STEPS ? 'Setup complete' : 'Continue'} <ArrowRight size={15} />
          </button>
        </div>
      </section>
    </div>
  );
}
