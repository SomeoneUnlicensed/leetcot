import { Confetti } from '~/components/confetti';

interface SummaryProps {
  isUserACreator: boolean;
}
export function Summary({ isUserACreator }: SummaryProps) {
  return (
    <div className="flex flex-col items-center justify-center pb-8 pt-12">
      <Confetti />
      <div className="mb-3 max-w-[20ch] text-center text-3xl font-bold text-gray-900 md:text-5xl dark:text-gray-100">
        {isUserACreator ? (
          <>
            🎉 <br />
            <br /> Спасибо за создание задачи! Отправьте её, чтобы поделиться с сообществом.
          </>
        ) : (
          <>
            🎉 <br /> <br />
            Спасибо за создание задачи! Отправьте её на проверку сообществу.
          </>
        )}
      </div>
    </div>
  );
}
