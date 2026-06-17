'use client';

import { Button } from '@repo/ui/components/button';
import { type ColumnDef } from '@tanstack/react-table';
import { unbanUser, banUser, updateUserRoles, type BannedUsers } from '../_actions';

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

function RolesCell({ row }: { row: { original: BannedUsers[0] } }) {
  const currentRoles = row.original.roles?.map((r) => r.role) || [];
  return (
    <div className="flex items-center gap-2">
      <span className="bg-muted text-muted-foreground rounded px-1.5 py-0.5 font-mono text-xs">
        {currentRoles.join(', ') || 'USER'}
      </span>
      <Button
        variant="outline"
        size="sm"
        onClick={async () => {
          // eslint-disable-next-line no-alert
          const rolesStr = window.prompt(
            'Введите роли через запятую (USER, ADMIN, TEACHER, BUSINESS_ADMIN, CHAMPIONSHIP_MANAGER, STUDENT, MODERATOR, CREATOR):',
            currentRoles.join(', '),
          );
          if (rolesStr !== null) {
            const newRoles = rolesStr
              .split(',')
              .map((r) => r.trim().toUpperCase())
              .filter(Boolean);
            await updateUserRoles(row.original.id, newRoles);
          }
        }}
      >
        Edit
      </Button>
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
    header: 'Roles',
    cell: ({ row }) => <RolesCell row={row} />,
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
