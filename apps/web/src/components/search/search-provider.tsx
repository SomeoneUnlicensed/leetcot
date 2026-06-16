'use client';

import * as React from 'react';
import type { Challenge } from '@repo/db/types';
import { searchChallenges } from '~/app/explore/_components/explore.action';

interface SearchContextType {
  query: string;
  setQuery: (query: string) => void;
  results: Challenge[];
  status: 'error' | 'idle' | 'loading' | 'success';
}

const SearchContext = React.createContext<SearchContextType | undefined>(undefined);

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const [query, setQuery] = React.useState('');
  const [results, setResults] = React.useState<Challenge[]>([]);
  const [status, setStatus] = React.useState<'error' | 'idle' | 'loading' | 'success'>('idle');

  React.useEffect(() => {
    if (!query) {
      setResults([]);
      setStatus('idle');
      return;
    }

    const timer = setTimeout(async () => {
      setStatus('loading');
      try {
        const data = await searchChallenges(query);
        setResults(data as Challenge[]);
        setStatus('success');
      } catch (error) {
        console.error('Search error:', error);
        setStatus('error');
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <SearchContext.Provider value={{ query, setQuery, results, status }}>
      {children}
    </SearchContext.Provider>
  );
}

export function useSearchStatus(): { status: 'error' | 'idle' | 'loading' | 'success' } {
  const context = React.useContext(SearchContext);
  if (!context) throw new Error('useSearchStatus must be used within SearchProvider');
  return { status: context.status };
}

export function useSearchResult(): { results: Challenge[]; query: string } {
  const context = React.useContext(SearchContext);
  if (!context) throw new Error('useSearchResult must be used within SearchProvider');
  return { results: context.results, query: context.query };
}

export type Result = Challenge;

export function useSearchProviderInput(): { query: string; update: (query: string) => void } {
  const context = React.useContext(SearchContext);
  if (!context) throw new Error('useSearchProviderInput must be used within SearchProvider');
  return { query: context.query, update: context.setQuery };
}

export function useSearchBox(): { query: string; setQuery: (query: string) => void } {
  const context = React.useContext(SearchContext);
  if (!context) throw new Error('useSearchBox must be used within SearchProvider');
  return { query: context.query, setQuery: context.setQuery };
}
