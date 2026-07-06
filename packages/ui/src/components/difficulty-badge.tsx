import { type Difficulty } from '@repo/db/types';
import { Badge } from './badge';
import { cn } from '../cn';

interface DifficultyBadgeProps {
  difficulty: Difficulty;
  className?: string;
}

const COLORS_BY_DIFFICULTY = {
  BEGINNER: 'dark:bg-difficulty-beginner-dark bg-difficulty-beginner',
  EASY: 'dark:bg-difficulty-easy-dark bg-difficulty-easy',
  MEDIUM: 'dark:bg-difficulty-medium-dark bg-difficulty-medium',
  HARD: 'dark:bg-difficulty-hard-dark bg-difficulty-hard',
  EXTREME: 'dark:bg-difficulty-extreme-dark bg-difficulty-extreme',
  ULTRA:
    'bg-[linear-gradient(90deg,rgba(244,63,94,0.82),rgba(251,191,36,0.78),rgba(74,222,128,0.78),rgba(34,211,238,0.78),rgba(168,85,247,0.82))] shadow-[0_0_10px_rgba(168,85,247,0.24)]',
  // this will never actually be used
  EVENT: 'dark:bg-difficulty-extreme-dark bg-difficulty-extreme',
};

const LABELS_BY_DIFFICULTY = {
  BEGINNER: 'Новичок',
  EASY: 'Легко',
  MEDIUM: 'Средне',
  HARD: 'Сложно',
  EXTREME: 'Экстрим',
  ULTRA: 'Ультра',
  EVENT: 'Событие',
};

export function DifficultyBadge({ className, difficulty }: DifficultyBadgeProps) {
  return (
    <Badge
      className={cn(
        `duration-300 ${COLORS_BY_DIFFICULTY[difficulty]} ${
          difficulty === 'ULTRA' ? 'text-white dark:text-white' : 'text-white dark:text-black'
        }`,
        className,
      )}
    >
      {LABELS_BY_DIFFICULTY[difficulty] || difficulty}
    </Badge>
  );
}
