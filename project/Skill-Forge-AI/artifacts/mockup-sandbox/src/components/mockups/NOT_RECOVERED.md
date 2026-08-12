The actual prototype/mockup screen components are not recoverable.

The scaffolding that would serve them (mockupPreviewPlugin.ts, the full
shadcn/ui kit, App.tsx's PreviewRenderer) was recovered in full — only the
mockup screens built on top of it were never staged before the incident, or
were created after the last `git add`. Nothing here was fabricated.
