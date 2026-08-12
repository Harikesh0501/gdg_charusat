import { useEffect, useState } from 'react';
import { ArrowRight, Check, Sparkles, UploadCloud } from 'lucide-react';
import { Link } from 'wouter';
import { PageHead } from '@/components/shared/PageHead';
import { getResumeFindings } from '@/services/mock';

/**
 * `stage` is the index of the currently-active step; everything before it is
 * complete. Starts at 1 because step 0 ("Resume uploaded") is already true the
 * moment a file is selected. `done` flips true once the last step finishes.
 */
export function Resume() {
  const { findings, copy, stages } = getResumeFindings();
  const [file, setFile] = useState<string | null>(null);
  const [stage, setStage] = useState(1);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!file) return;
    setStage(1);
    setDone(false);
    const timers = [
      window.setTimeout(() => setStage(2), 350),
      window.setTimeout(() => setStage(3), 800),
      window.setTimeout(() => setDone(true), 1400),
    ];
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [file]);

  const processFile = (name: string) => setFile(name);
  const resetFile = () => { setFile(null); setStage(1); setDone(false); };

  const progressPercent = done ? 100 : Math.round((stage / stages.length) * 100);

  return (
    <div className="sf-content">
      <PageHead
        eyebrow="Trusted source material"
        title="Resume lab"
        copy="Bring your resume in and we’ll show you what it says about your next role — before anything changes."
      />
      {!file && (
        <label className="sf-upload" htmlFor="resume-file" data-testid="label-resume-upload">
          <UploadCloud size={28} color="hsl(var(--primary))" />
          <h3>Drop your resume here</h3>
          <p>PDF or DOCX · Your file stays in this workspace</p>
          <input
            id="resume-file"
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={(event) => {
              const selected = event.target.files?.[0];
              if (selected) processFile(selected.name);
            }}
            data-testid="input-resume-file"
          />
        </label>
      )}
      {file && (
        <section className="sf-processing" data-testid="status-resume-processing">
          <div className="sf-processing-row">
            <div>
              <div className="sf-mini-label" style={{ color: 'hsl(var(--sidebar-muted))' }}>{done ? 'Extraction complete' : 'Reading your resume'}</div>
              <strong style={{ display: 'block', marginTop: 6, fontSize: 15 }}>{file}</strong>
            </div>
            {done ? <Check color="hsl(var(--accent))" /> : <Sparkles color="hsl(var(--accent))" />}
          </div>
          <ul className="sf-stage-list" aria-label="Resume processing steps">
            {stages.map((label, index) => {
              const stageDone = done || index < stage;
              const active = !done && index === stage;
              return (
                <li
                  key={label}
                  className={`sf-stage-row ${stageDone ? 'done' : ''} ${active ? 'active' : ''}`}
                  data-testid={`resume-stage-${index}`}
                >
                  <span className="sf-stage-mark" aria-hidden="true">
                    {stageDone ? <Check size={10} /> : active ? <span className="sf-stage-dot" /> : null}
                  </span>
                  {label}
                  {stageDone && <span className="sr-only"> — complete</span>}
                  {active && <span className="sr-only"> — in progress</span>}
                </li>
              );
            })}
          </ul>
          <div className="sf-progress-track" style={{ marginTop: 16 }}>
            <div className="sf-progress-fill" style={{ width: `${progressPercent}%` }} />
          </div>
          <small style={{ display: 'block', marginTop: 12 }}>{done ? copy.complete : copy.reading}</small>
        </section>
      )}
      {done && (
        <section className="sf-card sf-card-pad" style={{ marginTop: 18 }}>
          <div className="sf-section-head">
            <h2 className="sf-section-title">What we found</h2>
            <button type="button" className="sf-button sf-button-ghost" onClick={resetFile} data-testid="button-replace-resume">
              Replace file
            </button>
          </div>
          <div className="sf-grid sf-grid-3">
            {findings.map(([value, label]) => (
              <div key={label} style={{ background: 'hsl(var(--background))', padding: 17, borderRadius: 10 }}>
                <div className="sf-stat-value" style={{ fontSize: 28 }}>{value}</div>
                <div style={{ color: 'hsl(var(--muted-foreground))', fontSize: 11, marginTop: 4 }}>{label}</div>
              </div>
            ))}
          </div>
          <Link href="/skills" className="sf-button sf-button-primary" style={{ marginTop: 20, width: 'fit-content' }} data-testid="button-review-extracted-skills">
            Review extracted skills <ArrowRight size={15} />
          </Link>
        </section>
      )}
    </div>
  );
}
