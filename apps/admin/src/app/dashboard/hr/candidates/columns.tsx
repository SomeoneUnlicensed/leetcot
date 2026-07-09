'use client';
import type { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@repo/ui/components/badge';
import { Button } from '@repo/ui/components/button';
import Link from 'next/link';

type CandidateRow = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  pipelineStage: string;
  status: string;
  createdBy: { name: string | null };
  _count: { interviews: number };
};

const stageColors: Record<string, string> = {
  SCREENING: 'bg-blue-100 text-blue-800',
  TECH_INTERVIEW: 'bg-yellow-100 text-yellow-800',
  SYSTEM_DESIGN: 'bg-purple-100 text-purple-800',
  FINAL_INTERVIEW: 'bg-orange-100 text-orange-800',
  OFFER: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
};

export const columns: ColumnDef<CandidateRow>[] = [
  {
    accessorKey: 'firstName',
    header: 'Имя',
    cell: ({ row }) => `${row.original.firstName} ${row.original.lastName}`,
  },
  { accessorKey: 'email', header: 'Email' },
  {
    accessorKey: 'pipelineStage',
    header: 'Этап',
    cell: ({ row }) => (
      <Badge className={stageColors[row.original.pipelineStage] || ''}>
        {row.original.pipelineStage.replace(/_/g, ' ')}
      </Badge>
    ),
  },
  {
    accessorKey: '_count.interviews',
    header: 'Интервью',
  },
  {
    accessorKey: 'createdBy.name',
    header: 'Создал',
  },
  {
    id: 'actions',
    cell: ({ row }) => (
      <Link href={`/dashboard/hr/candidates/${row.original.id}`}>
        <Button variant="link">Открыть</Button>
      </Link>
    ),
  },
];
