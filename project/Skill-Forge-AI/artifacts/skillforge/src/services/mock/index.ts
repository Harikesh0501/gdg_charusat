/**
 * Frontend data-access boundary. Every page reads data through these functions
 * instead of importing mock files directly. When a real backend exists, swap the
 * bodies of these functions (or the hooks that call them) for real API calls —
 * page components should not need to change.
 */
import { careerGoals, defaultCareerGoalId } from '@/mock/career-goals';
import { dashboardSummary } from '@/mock/dashboard';
import { gapSignals, gapWhyItMatters } from '@/mock/gap';
import { interviewFramework, interviewPrompts } from '@/mock/interview';
import { personaComparison } from '@/mock/landing';
import { progressSummary } from '@/mock/progress';
import { recommendationsByCategory } from '@/mock/recommendations';
import { resumeFindings, resumeProcessingCopy, resumeProcessingStages } from '@/mock/resume';
import { roadmapDescription, roadmapPhaseMeta, roadmapTitle, seedRoadmap } from '@/mock/roadmap';
import { seedSkills, skillCategories } from '@/mock/skills';
import type { CareerGoal } from '@/types/career';
import type { RecommendationsByCategory } from '@/types/recommendation';
import type { RoadmapItem, RoadmapPhaseMeta } from '@/types/roadmap';
import type { Skill } from '@/types/skill';

export function getSkills(): Skill[] {
  return seedSkills;
}

export function getSkillCategories(): string[] {
  return skillCategories;
}

export function getRoadmap(): RoadmapItem[] {
  return seedRoadmap;
}

export function getRoadmapPhaseMeta(): RoadmapPhaseMeta[] {
  return roadmapPhaseMeta;
}

export function getRoadmapMeta() {
  return { title: roadmapTitle, description: roadmapDescription };
}

export function getCareerGoals(): CareerGoal[] {
  return careerGoals;
}

export function getDefaultCareerGoalId(): string {
  return defaultCareerGoalId;
}

export function getRecommendations(): RecommendationsByCategory {
  return recommendationsByCategory;
}

export function getDashboardSummary() {
  return dashboardSummary;
}

export function getProgressSummary() {
  return progressSummary;
}

export function getInterviewPrompts(): string[] {
  return interviewPrompts;
}

export function getInterviewFramework() {
  return interviewFramework;
}

export function getGapContext() {
  return { whyItMatters: gapWhyItMatters, signals: gapSignals };
}

export function getResumeFindings() {
  return { findings: resumeFindings, copy: resumeProcessingCopy, stages: resumeProcessingStages };
}

export function getPersonaComparison() {
  return personaComparison;
}
