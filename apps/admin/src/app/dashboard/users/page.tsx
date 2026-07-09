import { auth } from '~/server/auth';
import { assertAdmin } from '~/utils/auth-guards';
import { getUsers, getUserStats } from './_actions';
import { UsersAdminPanel } from './_components/users-admin-panel';

export default async function UsersPage() {
  const session = await auth();
  assertAdmin(session);

  const [users, stats] = await Promise.all([getUsers(), getUserStats()]);

  return <UsersAdminPanel users={users} stats={stats} />;
}
