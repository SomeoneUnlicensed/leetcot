import type { ReactNode } from 'react';

export interface PracticeTaskShell {
  id: number | string;
  slug: string;
  title: string;
  language: string;
  difficulty?: string;
}

export interface PracticeWorkspaceProps {
  left: ReactNode | ((controls: PracticeWorkspaceControls) => ReactNode);
  right: ReactNode;
  task?: PracticeTaskShell;
  isPlayground?: boolean;
  isReversed?: boolean;
  className?: string;
}

export interface PracticeWorkspaceControls {
  expandPanel: () => void;
  collapsePanel: () => void;
  isDesktop: boolean;
}
