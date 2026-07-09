'use client';

import * as React from 'react';
import type { Language } from '@repo/db/types';
import { searchChallenges, type SearchedChallenge } from '~/app/explore/_components/explore.action';

export type SearchLanguage = 'ALL' | 'GO' | 'PYTHON' | 'SQL';

interface SearchContextType {
  language: SearchLanguage;
  query: string;
  setQuery: (query: string) => void;
  setLanguage: (language: SearchLanguage) => void;
  results: SearchedChallenge[];
  status: 'error' | 'idle' | 'loading' | 'success';
}

const SearchContext = React.createContext<SearchContextType | undefined>(undefined);

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const [query, setQuery] = React.useState('');
  const [language, setLanguage] = React.useState<SearchLanguage>('ALL');
  const [results, setResults] = React.useState<SearchedChallenge[]>([]);
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
        const data = await searchChallenges(
          query,
          language === 'ALL' ? undefined : (language as Language),
        );
        setResults(data);
        setStatus('success');
      } catch (error) {
        console.error('Search error:', error);
        setStatus('error');
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [language, query]);

  return (
    <SearchContext.Provider value={{ language, query, results, setLanguage, setQuery, status }}>
      {children}
    </SearchContext.Provider>
  );
}

export function useSearchStatus(): { status: 'error' | 'idle' | 'loading' | 'success' } {
  const context = React.useContext(SearchContext);
  if (!context) throw new Error('useSearchStatus must be used within SearchProvider');
  return { status: context.status };
}

export function useSearchResult(): { results: SearchedChallenge[]; query: string } {
  const context = React.useContext(SearchContext);
  if (!context) throw new Error('useSearchResult must be used within SearchProvider');
  return { results: context.results, query: context.query };
}

export type Result = SearchedChallenge;

export function useSearchProviderInput(): { query: string; update: (query: string) => void } {
  const context = React.useContext(SearchContext);
  if (!context) throw new Error('useSearchProviderInput must be used within SearchProvider');
  return { query: context.query, update: context.setQuery };
}

export function useSearchBox(): {
  language: SearchLanguage;
  query: string;
  setLanguage: (language: SearchLanguage) => void;
  setQuery: (query: string) => void;
} {
  const context = React.useContext(SearchContext);
  if (!context) throw new Error('useSearchBox must be used within SearchProvider');
  return {
    language: context.language,
    query: context.query,
    setLanguage: context.setLanguage,
    setQuery: context.setQuery,
  };
}
