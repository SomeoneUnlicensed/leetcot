import { Badge } from '@repo/ui/components/badge';
import { Card, CardContent } from '@repo/ui/components/card';
import { Compass } from '@repo/ui/icons';
import { clsx } from 'clsx';

interface CourseCardSoonProps {
  course: {
    id: number;
    name: string;
    description: string;
  };
}

export function CourseCardSoon({ course }: CourseCardSoonProps) {
  return (
    <div className="group">
      <Card
        className={clsx(
          'relative overflow-hidden border-dashed duration-300',
          'group-hover:border-neutral-400/50 group-focus:border-neutral-500 dark:group-hover:border-neutral-400/50',
        )}
      >
        <div className="absolute -bottom-12 -left-4 w-full -translate-x-1/4 translate-y-1/4 rotate-[30deg]">
          <div className="-ml-4 h-12 w-full border-t border-neutral-500/50 bg-gradient-to-r from-neutral-100 to-transparent duration-500 dark:border-neutral-700/50 dark:from-neutral-900 dark:group-hover:brightness-150" />
          <div className="-ml-8 h-12 w-full border-t border-neutral-500/50 bg-gradient-to-r from-neutral-100 to-transparent duration-500 dark:border-neutral-700/50 dark:from-neutral-900 dark:group-hover:brightness-150" />
          <div className="-ml-12 h-12 w-full border-t border-neutral-500/50 bg-gradient-to-r from-neutral-100 to-transparent duration-500 dark:border-neutral-700/50 dark:from-neutral-900 dark:group-hover:brightness-150" />
          <div className="-ml-16 h-12 w-full border-t border-neutral-500/50 bg-gradient-to-r from-neutral-100 to-transparent duration-500 dark:border-neutral-700/50 dark:from-neutral-900 dark:group-hover:brightness-150" />
        </div>
        <CardContent className="relative z-10 flex flex-col items-center gap-6 p-9">
          <div
            className={clsx(
              'relative bg-gradient-to-r from-neutral-500/10 from-10% to-neutral-500/50 to-100% dark:from-neutral-900 dark:to-neutral-500/50',
              'flex h-24 w-24 flex-none items-center justify-center rounded-2xl',
            )}
          >
            <Compass
              size={50}
              className="opacity-50 transition-opacity duration-300 group-hover:opacity-100 group-focus:opacity-100"
            />
          </div>
          <div className="text-center font-semibold capitalize tracking-wide">{course.name}</div>
          <div className="text-muted-foreground line-clamp-3 text-center text-sm tracking-wide">
            Этот курс ещё в разработке. <br /> Скоро будет доступен!
          </div>

          <div className="text-center">
            <Badge className="flex-none bg-neutral-600">Скоро</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
