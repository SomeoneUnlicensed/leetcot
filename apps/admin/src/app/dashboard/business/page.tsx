import type { Metadata } from 'next';
import { auth } from '~/server/auth';
import { assertAdmin } from '~/utils/auth-guards';
import { BusinessDashboard } from './_components/business-dashboard';

export const metadata: Metadata = {
  title: 'Бизнес | ЛитКот Admin',
};

export default async function BusinessPage() {
  const session = await auth();
  assertAdmin(session);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Управление B2B</h3>
        <p className="text-sm text-muted-foreground">
          Раздел для администраторов с ролью BUSINESS_ADMIN. Здесь вы можете управлять бизнес-клиентами.
        </p>
      </div>
      <div className="bg-border my-6 h-[1px] w-full shrink-0" />
      <BusinessDashboard />
    </div>
  );
}
