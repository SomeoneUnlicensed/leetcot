'use client';
import type { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@repo/ui/components/badge';

type ChallengeRow = {
  id: number;
  name: string;
  slug: string;
  difficulty: string;
  language: string;
  shortDescription: string;
};

const difficultyColors: Record<string, string> = {
  BEGINNER: 'bg-green-100 text-green-800',
  EASY: 'bg-emerald-100 text-emerald-800',
  MEDIUM: 'bg-yellow-100 text-yellow-800',
  HARD: 'bg-red-100 text-red-800',
  EXTREME: 'bg-purple-100 text-purple-800',
};

export const columns: ColumnDef<ChallengeRow>[] = [
  { accessorKey: 'name', header: 'Название' },
  { accessorKey: 'shortDescription', header: 'Описание' },
  {
    accessorKey: 'difficulty',
    header: 'Сложность',
    cell: ({ row }) => (
      <Badge className={difficultyColors[row.original.difficulty] || ''}>
        {row.original.difficulty}
      </Badge>
    ),
  },
  { accessorKey: 'language', header: 'Язык' },
];
