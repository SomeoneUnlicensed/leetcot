import type { Metadata } from 'next';
import { LENTA_CHAMPIONSHIP_SLUG, prisma } from '@repo/db';
import { redirect } from 'next/navigation';
import { auth } from '~/server/auth';
import { isAdmin } from '~/utils/auth-guards';
import { CreateParticipantsForm } from './_components/create-participants-form';

export const metadata: Metadata = {
  title: 'Участники — Дебаг-Симулятор',
};

export default async function AdminParticipantsPage() {
  const session = await auth();
  if (!session) {
    redirect('/login?callbackUrl=/admin/participants');
  }
  if (!isAdmin(session)) {
    redirect('/debug-simulator');
  }

  const championship = await prisma.championship.findUnique({
    where: { slug: LENTA_CHAMPIONSHIP_SLUG },
  });

  const participants = championship
    ? await prisma.championshipParticipant.findMany({
        where: { championshipId: championship.id },
        orderBy: { joinedAt: 'desc' },
        include: { user: { select: { name: true, loginCode: true } } },
      })
    : [];

  return (
    <main className="min-h-screen bg-white px-4 py-10 text-[#131722]">
      <section className="mx-auto max-w-3xl">
        <h1
          className="mb-6 text-3xl tracking-tight text-[#131722]"
          style={{ fontFamily: 'var(--font-brand)', fontWeight: 700 }}
        >
          Участники
        </h1>

        <div className="border-border mb-8 rounded-2xl border bg-white p-6 shadow-sm">
          <CreateParticipantsForm />
        </div>

        <div className="border-border overflow-hidden rounded-2xl border">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#F5F9FF] text-[#131722]/60">
              <tr>
                <th className="px-4 py-2 font-semibold">Имя</th>
                <th className="px-4 py-2 font-semibold">Код</th>
                <th className="px-4 py-2 font-semibold">Очки</th>
              </tr>
            </thead>
            <tbody>
              {participants.map((p) => (
                <tr key={p.id} className="border-border border-t">
                  <td className="px-4 py-2">{p.user.name}</td>
                  <td className="px-4 py-2 font-mono font-bold text-[#00A0FF]">
                    {p.user.loginCode}
                  </td>
                  <td className="px-4 py-2">{p.score}</td>
                </tr>
              ))}
              {participants.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-6 text-center text-[#131722]/50">
                    Участников пока нет.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
