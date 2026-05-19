'use client';

import { DialogClose } from '@radix-ui/react-dialog';
import type { Challenge } from '@repo/db/types';
import { DifficultyBadge } from '@repo/ui/components/difficulty-badge';
import Link from 'next/link';
import { useSearchResult, useSearchStatus, useSearchBox } from './search-provider';
import { useRecentSearchesStorage } from './use-recent-searches-storage';
import { Text } from '@repo/ui/components/typography/typography';
import { SearchIcon, Loader2 as LoaderIcon, X as XIcon } from '@repo/ui/icons';
import { ScrollArea, ScrollBar } from '@repo/ui/components/scroll-area';

function useRecentSearches() {
  return useRecentSearchesStorage();
}

type OnClick = () => void;

interface HitsProps {
  onClick: OnClick;
}

function Results({ onClick }: HitsProps) {
  const { query, results } = useSearchResult();

  if (!query) {
    return (
      <div className="mb-6 flex flex-col">
        <RecentSearches onClick={onClick} />
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="flex h-full flex-grow flex-col justify-between">
        <Text intent="leading" className="my-8 flex items-center justify-center text-center px-4">
          Ничего не найдено по запросу "<strong className="max-w-[50%] md:max-w-[400px] truncate">{query}</strong>"
        </Text>
        <ProposedPhrases />
      </div>
    );
  }

  return (
    <div className="mb-6 flex flex-col">
      {results.map((result) => (
        <Result key={result.id} result={result} onClick={onClick} />
      ))}
    </div>
  );
}

function Result({ result, onClick }: { result: Challenge; onClick: OnClick }) {
  const { onAdd } = useRecentSearches();
  if (result.status !== 'ACTIVE') return null;

  return (
    <Link
      prefetch={false}
      onClick={() => {
        onClick();
        onAdd(result);
      }}
      href={`/challenge/${result.slug}`}
      className="focus-visible:ring-ring hover:bg-foreground/10 flex w-full flex-col items-start justify-center gap-2 overflow-hidden border-b p-6 transition-colors"
    >
      <div className="flex items-center gap-4">
        <DifficultyBadge difficulty={result.difficulty} className="w-[80px] justify-center" />
        <span className="text-sm font-medium text-foreground">{result.name}</span>
      </div>
    </Link>
  );
}

function ProposedPhrases() {
  const { setQuery } = useSearchBox();

  const updateQuery = (query: string) => () => {
    setQuery(query);
  };

  return (
    <div className="flex flex-col">
      <span className="text-muted-foreground border-b px-4 pb-4">Попробуйте поискать:</span>
      <button
        onClick={updateQuery('Easy')}
        className="focus-visible:ring-ring hover:bg-foreground/10 flex w-full flex-col items-start justify-center gap-2 overflow-hidden border-b p-6 transition-colors text-left"
      >
        Easy (Простые)
      </button>
      <button
        onClick={updateQuery('Extreme')}
        className="focus-visible:ring-ring hover:bg-foreground/10 flex w-full flex-col items-start justify-center gap-2 overflow-hidden border-b p-6 transition-colors text-left"
      >
        Extreme (Экстремальные)
      </button>
    </div>
  );
}

function Topbar() {
  const { query, setQuery } = useSearchBox();
  const { status } = useSearchStatus();

  const isLoading = status === 'loading';

  return (
    <div className="relative flex w-full items-center gap-2 border-b p-4">
      {isLoading ? (
        <LoaderIcon className="h-6 w-6 animate-spin" />
      ) : (
        <SearchIcon className="h-6 w-6" />
      )}
      <input
        aria-label="Поиск испытаний"
        type="search"
        className="focus-visible:ring-ring placeholder:text-muted-foreground flex h-10 w-full flex-grow rounded-md bg-transparent px-2 text-sm outline-none"
        placeholder="Поиск испытаний..."
        value={query}
        onChange={(event) => {
          setQuery(event.currentTarget.value);
        }}
      />
      <DialogClose className="hidden md:block">
        <kbd className="bg-muted dark:group-hover:bg-muted-foreground pointer-events-none hidden h-8 select-none items-center gap-1 rounded border px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">esc</span>
        </kbd>
      </DialogClose>
    </div>
  );
}

function RecentSearches({ onClick }: { onClick: OnClick }) {
  const { getItems, onAdd, onRemove } = useRecentSearches();

  const results = getItems() as Challenge[];

  if (results.length === 0) {
    return (
      <div className="flex h-full flex-grow flex-col justify-between">
        <Text intent="leading" className="my-8 flex items-center justify-center text-muted-foreground">
          Нет недавних поисков
        </Text>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <span className="text-muted-foreground border-b p-4">Недавние</span>
      {results.map((result) => (
        <div
          key={result.id}
          className="hover:bg-foreground/10 focus-within:bg-foreground/10 flex items-center justify-between border-b px-6 transition-colors "
        >
          <Link
            prefetch={false}
            onClick={() => {
              onClick();
              onAdd(result);
            }}
            href={`/challenge/${result.slug}`}
            className="flex w-full items-center gap-2 overflow-hidden py-6 focus:outline-none"
          >
            <DifficultyBadge difficulty={result.difficulty} className="w-[80px] justify-center" />
            <p className="text-foreground/60 text-sm truncate">{result.name}</p>
          </Link>
          <button onClick={() => onRemove(result.id)} aria-label={`Удалить ${result.name}`}>
            <XIcon className="h-6 w-6" />
          </button>
        </div>
      ))}
    </div>
  );
}

export function SearchContent({ onClick }: { onClick: OnClick }) {
  return (
    <div className="flex flex-col">
      <Topbar />
      <ScrollArea className="max-h h-[50vh] xl:max-h-[40vh]">
        <Results onClick={onClick} />
        <ScrollBar className="z-30" />
      </ScrollArea>
    </div>
  );
}
