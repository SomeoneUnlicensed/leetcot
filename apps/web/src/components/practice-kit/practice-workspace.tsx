'use client';

import { useState } from 'react';
import { ChallengeLayout, MOBILE_BREAKPOINT } from '~/app/challenge/_components/challenge-layout';
import usePanelAdjustments from '~/app/challenge/_components/usePanelAdjustments';
import type { PracticeWorkspaceProps } from './types';

export function PracticeWorkspace({
  left,
  right,
  isPlayground,
  isReversed = false,
}: PracticeWorkspaceProps) {
  const [isDesktop, setIsDesktop] = useState(
    typeof window === 'undefined' ? true : window.innerWidth > MOBILE_BREAKPOINT,
  );

  const leftPanelBreakpoint = isDesktop ? 500 : 318;
  const defaultDesktopWidthPx = `${leftPanelBreakpoint}px`;
  const { leftSide, adjustPanelSize, expandPanel, collapsePanel, isLeftPanelCollapsed } =
    usePanelAdjustments(defaultDesktopWidthPx, leftPanelBreakpoint, isDesktop);
  const resolvedLeft =
    typeof left === 'function' ? left({ expandPanel, collapsePanel, isDesktop }) : left;

  return (
    <ChallengeLayout
      left={resolvedLeft}
      right={right}
      setIsDesktop={setIsDesktop}
      isDesktop={isDesktop}
      leftSide={leftSide}
      adjustPanelSize={adjustPanelSize}
      expandPanel={expandPanel}
      collapsePanel={collapsePanel}
      isLeftPanelCollapsed={isLeftPanelCollapsed}
      isPlayground={isPlayground}
      isReversed={isReversed}
    />
  );
}
