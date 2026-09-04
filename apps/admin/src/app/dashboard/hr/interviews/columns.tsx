'use client';
import type { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@repo/ui/components/badge';
import { Button } from '@repo/ui/components/button';
import Link from 'next/link';

type InterviewRow = {
  id: string;
  title: string;
  token: string;
  status: string;
  candidate: { firstName: string; lastName: string };
  recruiter: { name: string | null };
  _count: { challenges: number };
  createdAt: Date;
};

const statusColors: Record<string, string> = {
  PENDING: 'bg-gray-100 text-gray-800',
  IN_PROGRESS: 'bg-blue-100 text-blue-800',
  COMPLETED: 'bg-green-100 text-green-800',
  EXPIRED: 'bg-red-100 text-red-800',
};

export const columns: ColumnDef<InterviewRow>[] = [
  { accessorKey: 'title', header: 'Название' },
  {
    accessorKey: 'candidate',
    header: 'Кандидат',
    cell: ({ row }) => `${row.original.candidate.firstName} ${row.original.candidate.lastName}`,
  },
  {
    accessorKey: 'status',
    header: 'Статус',
    cell: ({ row }) => (
      <Badge className={statusColors[row.original.status] || ''}>{row.original.status}</Badge>
    ),
  },
  {
    accessorKey: '_count.challenges',
    header: 'Задач',
  },
  { accessorKey: 'recruiter.name', header: 'Рекрутер' },
  {
    accessorKey: 'createdAt',
    header: 'Создано',
    cell: ({ row }) => row.original.createdAt.toLocaleDateString(),
  },
  {
    id: 'actions',
    cell: ({ row }) => (
      <div className="flex gap-2">
        <Link href={`/dashboard/hr/interviews/${row.original.id}`}>
          <Button variant="link">Детали</Button>
        </Link>
        {row.original.status === 'IN_PROGRESS' && (
          <Link href={`/dashboard/hr/interviews/${row.original.id}/live`}>
            <Button variant="outline" size="sm">Live</Button>
          </Link>
        )}
      </div>
    ),
  },
];
