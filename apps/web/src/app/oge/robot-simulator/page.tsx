import type { Metadata } from 'next';
import { buildMetaForDefault } from '~/app/metadata';
import { Footsies } from '~/components/footsies';
import { RobotSimulatorPage } from './client';

export const metadata: Metadata = buildMetaForDefault({
  title: 'Тренажёр Робот | ОГЭ Информатика | ЛитКот',
  description:
    'Интерактивный тренажёр исполнителя «Робот» для подготовки к заданию 15 КИМ ОГЭ по информатике. Поле со стенами, визуализация, пошаговое выполнение алгоритмов.',
});

export default function RobotSimulatorRoute() {
  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-[#0f0c1a] to-[#1a1528] text-white">
        <div className="from-[#ec4899]/10 pointer-events-none fixed inset-x-0 top-0 -z-10 h-48 bg-gradient-to-b to-transparent" />
        <div className="pointer-events-none fixed bottom-0 right-0 -z-10 h-[40rem] w-[50rem] rounded-l-full bg-[#8ef0de]/5 blur-3xl" />
        <RobotSimulatorPage />
      </div>
      <Footsies />
    </>
  );
}
