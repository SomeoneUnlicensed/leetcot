import { Badge } from '@repo/ui/components/badge';
import { Compass } from '@repo/ui/icons';

interface CourseCardSoonProps {
  course: {
    id: number;
    name: string;
    description: string;
  };
}

export function CourseCardSoon({ course }: CourseCardSoonProps) {
  return (
    <article className="relative h-full overflow-hidden rounded-[1.5rem] border border-dashed border-white/10 bg-white/[0.025] p-6 opacity-75">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/[0.08] text-[#d8d4df]">
        <Compass className="h-5 w-5" />
      </div>
      <h2 className="mt-6 text-2xl font-black text-white">{course.name}</h2>
      <p className="mt-3 line-clamp-3 text-sm font-semibold leading-6 text-[#d8d4df]/55">
        {course.description || 'Курс готовится к запуску.'}
      </p>
      <div className="mt-6">
        <Badge className="border-white/10 bg-white/[0.06] text-[#d8d4df]" variant="outline">
          Скоро
        </Badge>
      </div>
    </article>
  );
}
