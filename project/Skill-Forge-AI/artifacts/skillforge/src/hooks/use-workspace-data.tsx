import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';
import { getRoadmap, getSkills } from '@/services/mock';
import type { RoadmapItem } from '@/types/roadmap';
import type { Skill } from '@/types/skill';

interface WorkspaceDataContextValue {
  skills: Skill[];
  roadmap: RoadmapItem[];
  toggleRoadmapItem: (id: number) => void;
  toast: string;
}

const WorkspaceDataContext = createContext<WorkspaceDataContextValue | null>(null);

/**
 * Owns the data that needs to survive client-side navigation (roadmap completion
 * state, the toast it triggers). Wraps the router the same way the previous
 * `Workspace` component did, so toggling a roadmap item and navigating away and
 * back does not reset it.
 *
 * Backed by mock data today; swapping the two `useState(getX())` calls for
 * `useQuery`/`useMutation` later is the intended migration path — consumers of
 * `useSkills()`/`useRoadmap()` would not need to change.
 */
export function WorkspaceDataProvider({ children }: { children: ReactNode }) {
  const [skills] = useState<Skill[]>(getSkills);
  const [roadmap, setRoadmap] = useState<RoadmapItem[]>(getRoadmap);
  const [toast, setToast] = useState('');
  const toastTimer = useRef<number | undefined>(undefined);

  const toggleRoadmapItem = useCallback((id: number) => {
    setRoadmap((items) => items.map((item) => (item.id === id ? { ...item, done: !item.done } : item)));
    setToast('Roadmap updated');
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(''), 1600);
  }, []);

  return (
    <WorkspaceDataContext.Provider value={{ skills, roadmap, toggleRoadmapItem, toast }}>
      {children}
    </WorkspaceDataContext.Provider>
  );
}

function useWorkspaceDataContext(): WorkspaceDataContextValue {
  const context = useContext(WorkspaceDataContext);
  if (!context) {
    throw new Error('useWorkspaceData hooks must be used within a WorkspaceDataProvider');
  }
  return context;
}

export function useSkills(): Skill[] {
  return useWorkspaceDataContext().skills;
}

export function useRoadmap(): { roadmap: RoadmapItem[]; toggleRoadmapItem: (id: number) => void } {
  const { roadmap, toggleRoadmapItem } = useWorkspaceDataContext();
  return { roadmap, toggleRoadmapItem };
}

export function useWorkspaceToast(): string {
  return useWorkspaceDataContext().toast;
}
