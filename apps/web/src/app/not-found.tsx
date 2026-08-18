import { Button } from '@repo/ui/components/button';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center gap-6 bg-white px-4 text-center">
      <h1 className="text-8xl font-extrabold tracking-tighter text-[#131722]/15 md:text-9xl">
        404
      </h1>
      <p className="max-w-md text-lg text-[#131722]/70">Такой страницы не существует.</p>
      <Link href="/">
        <Button className="w-56 bg-[#00A0FF] font-bold text-white hover:bg-[#0090e6]" size="lg">
          На главную
        </Button>
      </Link>
    </div>
  );
}
