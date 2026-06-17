'use client';

import { Button } from '@repo/ui/components/button';
import { type ColumnDef } from '@tanstack/react-table';
import { unbanUser, banUser, type BannedUsers } from '../_actions';

function BanCell({ row }: { row: { original: BannedUsers[0] } }) {
  const isBanned = row.original.status === 'BANNED';
  return (
    <div className="flex gap-2">
      {isBanned ? (
        <Button
          variant="outline"
          size="sm"
          onClick={async () => {
            await unbanUser(row.original.id);
          }}
        >
          Unban
        </Button>
      ) : (
        <Button
          variant="destructive"
          size="sm"
          onClick={async () => {
            // eslint-disable-next-line no-alert
            const reason = window.prompt('Введите причину блокировки:');
            if (reason !== null) {
              await banUser(row.original.id, null, reason);
            }
          }}
        >
          Ban
        </Button>
      )}
    </div>
  );
}

export const columns: ColumnDef<BannedUsers[0]>[] = [
  {
    accessorKey: 'name',
    header: 'Username',
  },
  {
    accessorKey: 'email',
    header: 'Email',
  },
  {
    accessorKey: 'status',
    header: 'Status',
  },
  {
    accessorKey: 'updatedAt',
    header: 'Date',
    cell: ({ row }) => {
      const absoluteTime = new Intl.DateTimeFormat('en-US', {
        dateStyle: 'medium',
        timeStyle: 'medium',
      }).format(row.original.updatedAt);
      return <pre>{absoluteTime}</pre>;
    },
  },
  {
    accessorKey: 'banReason',
    header: 'Reason',
    cell: ({ row }) => row.original.banReason || '-',
  },
  {
    header: '...',
    cell: ({ row }) => <BanCell row={row} />,
  },
];
