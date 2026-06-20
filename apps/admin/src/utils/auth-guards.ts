import type { Session } from '@repo/auth/server';
import { RoleTypes } from '@repo/db/types';

export const assertAdmin = (session: Session | null) => {
  const isAdmin = session?.user?.role.includes(RoleTypes.ADMIN);

  if (!isAdmin) {
    throw new Error('You are not authorized to perform this action.');
  }
};

export const assertAdminOrChampionshipManager = (session: Session | null) => {
  const roles = session?.user?.role ?? [];
  const isAdmin = roles.includes(RoleTypes.ADMIN);
  const isChampManager = roles.includes(RoleTypes.CHAMPIONSHIP_MANAGER);

  if (!isAdmin && !isChampManager) {
    throw new Error('You are not authorized to perform this action.');
  }
};

