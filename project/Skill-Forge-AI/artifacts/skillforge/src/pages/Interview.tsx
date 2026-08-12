import { useState } from 'react';
import { ArrowRight, ClipboardCheck, Lightbulb, Play } from 'lucide-react';
import { PageHead } from '@/components/shared/PageHead';
import { Pill } from '@/components/shared/Pill';
import { ProgressBar } from '@/components/shared/ProgressBar';
import { getInterviewFramework, getInterviewPrompts } from '@/services/mock';

export function Interview() {
  const prompts = getInterviewPrompts();
  const framework = getInterviewFramework();
  const [started, setStarted] = useState(false);

  return (
    <div className="sf-content">
      <PageHead
        eyebrow="High-leverage practice"
        title="Interview prep"
        copy="Practice the questions that reveal your senior signal. Honest, specific, and grounded in your own work."
        action={
          <button type="button" className="sf-button sf-button-primary" onClick={() => setStarted(true)} data-testid="button-start-interview">
            <Play size={15} /> {started ? 'Session started' : 'Start a practice session'}
          </button>
        }
      />
      <div className="sf-grid sf-grid-2">
        <section className="sf-card sf-card-pad" style={{ background: 'hsl(var(--sidebar))', color: 'hsl(var(--sidebar-foreground))' }}>
          <div className="sf-action-kicker"><ClipboardCheck size={14} /> Recommended set</div>
          <h2 className="sf-action-title" style={{ color: 'inherit', maxWidth: 380 }}>The product-minded designer.</h2>
          <p className="sf-action-copy" style={{ color: 'hsl(var(--sidebar-muted))' }}>Three prompts tuned to your biggest gap: connecting craft to outcomes.</p>
          <div style={{ marginTop: 25 }}><ProgressBar value={started ? 33 : 0} /></div>
        </section>
        <section className="sf-card sf-card-pad">
          <div className="sf-section-head">
            <h2 className="sf-section-title">Your prompts</h2>
            <span className="sf-mini-label">3 questions</span>
          </div>
          {prompts.map((prompt, index) => (
            <button
              type="button"
              key={prompt}
              className="sf-check"
              style={{ width: '100%', marginBottom: 8 }}
              onClick={() => setStarted(true)}
              data-testid={`button-interview-prompt-${index + 1}`}
            >
              <span className="sf-mono" style={{ color: 'hsl(var(--accent))', fontSize: 11 }}>0{index + 1}</span>
              <span className="sf-check-title">{prompt}</span>
              <ArrowRight size={14} style={{ marginLeft: 'auto', color: 'hsl(var(--muted-foreground))' }} />
            </button>
          ))}
        </section>
      </div>
      <section className="sf-card sf-card-pad" style={{ marginTop: 18 }}>
        <div className="sf-section-head">
          <h2 className="sf-section-title">A useful answer has three parts</h2>
          <Pill tone="teal"><Lightbulb size={12} /> Framework</Pill>
        </div>
        <div className="sf-grid sf-grid-3">
          {framework.map(({ title, copy }, index) => (
            <div key={title}>
              <span className="sf-mono" style={{ color: 'hsl(var(--accent))', fontSize: 11 }}>0{index + 1}</span>
              <h3 style={{ font: '600 15px Space Grotesk', margin: '8px 0 5px' }}>{title}</h3>
              <p style={{ margin: 0, color: 'hsl(var(--muted-foreground))', fontSize: 11, lineHeight: 1.5 }}>{copy}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
