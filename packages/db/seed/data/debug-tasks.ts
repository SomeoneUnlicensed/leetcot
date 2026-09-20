import { Difficulty } from '@prisma/client';

export type DebugTaskCategory =
  | 'ACCESS'
  | 'CLOUD'
  | 'CRYPTO'
  | 'INCIDENT_RESPONSE'
  | 'NETWORK'
  | 'RECON'
  | 'WEB';

export interface DebugTaskSeed {
  slug: string;
  title: string;
  category: DebugTaskCategory;
  difficulty: Difficulty;
  points: number;
  sortOrder: number;
  /// Briefing shown to the participant. Real connection details (host/port/creds)
  /// are issued separately per team by infra and are not stored here.
  instructions: string;
  /// Short in-character mission story shown once before the task starts (~1-2 min
  /// read). Sets the scene; instructions stays the terse technical brief.
  narrative: string;
  /// Docker image that auto-deploys this task's live environment. Omit for tasks
  /// without one yet (participants get the "ask organizers" fallback instead).
  dockerImage?: string;
}

// The task set was removed to be rewritten from scratch. The previous 20 tasks (definitions,
// challenges/docker/* images, ordering) are kept at git tag archive/tasks-v1.
export const debugTasks: DebugTaskSeed[] = [];
