'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useRef } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui/components/select';
import { Input } from '@repo/ui/components/input';
import { SearchIcon } from '@repo/ui/icons';

export function ExploreFilterBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value && value !== 'ALL') {
        params.set(name, value);
      } else {
        params.delete(name);
      }
      return params.toString();
    },
    [searchParams],
  );

  const onFilterChange = (name: string, value: string) => {
    router.push(`/explore?${createQueryString(name, value)}`);
  };

  return (
    <div className="container flex flex-col gap-4 py-6 md:flex-row md:items-center md:justify-between">
      <div className="relative flex max-w-md flex-1 items-center gap-2">
        <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
        <Input
          placeholder="Поиск задачек..."
          className="border-zinc-800 bg-zinc-900/50 pl-10 focus:border-pink-500/50"
          defaultValue={searchParams.get('query') ?? ''}
          onChange={(e) => {
            const query = e.target.value;
            if (debounceRef.current) {
              clearTimeout(debounceRef.current);
            }
            debounceRef.current = setTimeout(() => onFilterChange('query', query), 500);
          }}
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Select
          defaultValue={searchParams.get('language') ?? 'ALL'}
          onValueChange={(v) => onFilterChange('language', v)}
        >
          <SelectTrigger className="w-[140px] border-zinc-800 bg-zinc-900/50">
            <SelectValue placeholder="Язык" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Все языки</SelectItem>
            <SelectItem value="PYTHON">Python</SelectItem>
            <SelectItem value="TYPESCRIPT">TypeScript</SelectItem>
            <SelectItem value="JAVASCRIPT">JavaScript</SelectItem>
            <SelectItem value="GO">Go</SelectItem>
          </SelectContent>
        </Select>

        <Select
          defaultValue={searchParams.get('difficulty') ?? 'ALL'}
          onValueChange={(v) => onFilterChange('difficulty', v)}
        >
          <SelectTrigger className="w-[140px] border-zinc-800 bg-zinc-900/50">
            <SelectValue placeholder="Сложность" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Любая</SelectItem>
            <SelectItem value="BEGINNER">Новичок</SelectItem>
            <SelectItem value="EASY">Легко</SelectItem>
            <SelectItem value="MEDIUM">Средне</SelectItem>
            <SelectItem value="HARD">Сложно</SelectItem>
            <SelectItem value="EXTREME">Экстрим</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
