import type { Metadata } from 'next';
import { auth } from '~/server/auth';
import { assertAdmin } from '~/utils/auth-guards';
import { ChampionshipDashboard } from './_components/championships-dashboard';

export const metadata: Metadata = {
  title: 'Чемпионаты | ЛитКот Admin',
};

export default async function ChampionshipsPage() {
  const session = await auth();
  assertAdmin(session);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Управление Чемпионатами</h3>
        <p className="text-muted-foreground text-sm">
          Раздел для администраторов с ролью CHAMPIONSHIP_MANAGER. Здесь вы можете создавать и
          модерировать соревнования.
        </p>
      </div>
      <div className="bg-border my-6 h-[1px] w-full shrink-0" />
      <ChampionshipDashboard />
    </div>
  );
}
