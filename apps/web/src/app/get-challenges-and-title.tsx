import type {
  AllChallenges,
  ChallengesByTagOrDifficulty,
} from './explore/_components/explore.action';

export const SORT_KEYS = [
  {
    label: 'Популярные',
    value: 'popular',
  },
  {
    label: 'Новичок',
    value: 'beginner',
  },
  {
    label: 'Легко',
    value: 'easy',
  },
  {
    label: 'Средне',
    value: 'medium',
  },
  {
    label: 'Сложно',
    value: 'hard',
  },
  {
    label: 'Экстрим',
    value: 'extreme',
  },
] as const;

export type ChallengeLabelType = (typeof SORT_KEYS)[number]['label'];

export type ChallengeType = (typeof SORT_KEYS)[number]['value'];

export interface SortKeyType {
  label: ChallengeLabelType;
  value: ChallengeType;
}
export type ChallengeTitles =
  | 'Для мастеров'
  | 'Для тех, кто учится'
  | 'Для экспертов'
  | 'Для энтузиастов'
  | 'Отлично для новичков'
  | 'Рекомендуемые испытания';

interface ChallengeResult {
  title: ChallengeTitles;
  challenges: ChallengesByTagOrDifficulty;
  key: SortKeyType;
}
export function getChallengesAndTitle(
  trackName: ChallengeType,
  AC: AllChallenges,
): ChallengeResult {
  switch (trackName) {
    case 'popular':
      return {
        title: 'Рекомендуемые испытания',
        challenges: AC.popularChallenges,
        key: SORT_KEYS[0],
      };
    case 'beginner':
      return {
        title: 'Отлично для новичков',
        challenges: AC.beginnerChallenges,
        key: SORT_KEYS[1],
      };
    case 'easy':
      return {
        title: 'Для тех, кто учится',
        challenges: AC.easyChallenges,
        key: SORT_KEYS[2],
      };
    case 'medium':
      return {
        title: 'Для энтузиастов',
        challenges: AC.mediumChallenges,
        key: SORT_KEYS[3],
      };
    case 'hard':
      return {
        title: 'Для экспертов',
        challenges: AC.hardChallenges,
        key: SORT_KEYS[4],
      };
    case 'extreme':
      return {
        title: 'Для мастеров',
        challenges: AC.extremeChallenges,
        key: SORT_KEYS[5],
      };
    default:
      return {
        title: 'Рекомендуемые испытания',
        challenges: AC.popularChallenges,
        key: SORT_KEYS[0],
      };
  }
}
