import { auth } from '~/server/auth';
import { DataTable } from '@repo/ui/components/data-table';
import { assertAdmin } from '~/utils/auth-guards';
import { getUsers } from './_actions';
import { columns } from './_components/columns';

export default async function UsersPage() {
  const session = await auth();
  assertAdmin(session);

  const users = await getUsers();

  return (
    <div>
      <DataTable data={users} columns={columns} />
    </div>
  );
}
