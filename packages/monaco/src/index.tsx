'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/restrict-plus-operands */

import { Button } from '@repo/ui/components/button';
import { useToast } from '@repo/ui/components/use-toast';
import debounce from 'lodash/debounce';
import lzstring from 'lz-string';
import type * as monaco from 'monaco-editor';
import type * as monaco_editor from 'monaco-editor/esm/vs/editor/editor.api';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useState, useRef, useMemo } from 'react';
import Link from 'next/link';
import { useResetEditor } from './editor-hooks';
import SplitEditor from './split-editor';
import { useLocalStorage } from './useLocalStorage';

export interface CodePanelProps {
  challenge: {
    id: number;
    code: string;
    slug: string;
    tests: string;
    language: string;
    tsconfig?: monaco.languages.typescript.CompilerOptions;
  };
  validator?: (args: unknown[]) => boolean;
  saveSubmission: (code: string, isSuccessful: boolean) => Promise<any>;
  submissionDisabled: boolean;
  settingsElement: React.ReactNode;
  updatePlaygroundTestsLocalStorage?: (code: string) => void;
  updatePlaygroundCodeLocalStorage?: (code: string) => void;
  nextChallengeSlug?: string | null;
  nextChallengeName?: string | null;
  trackSlug?: string | null;
}

export type TsErrors = [
  SemanticDiagnostics: monaco.languages.typescript.Diagnostic[],
  SyntacticDiagnostics: monaco.languages.typescript.Diagnostic[],
  CompilerOptionsDiagnostics: monaco.languages.typescript.Diagnostic[],
];

function formatTraceback(errorStr: string) {
  if (
    errorStr.includes('Traceback') ||
    errorStr.includes('File "main.py"') ||
    errorStr.includes('File "<string>"') ||
    errorStr.includes('line ')
  ) {
    const lines = errorStr.split('\n');
    const cleanedLines = lines.map((line, lineIdx) => {
      const cleaned = line
        .replace(/\/code\/main\.py/g, 'решение.py')
        .replace(/\/tmp\/litkot-run-[^/]+\/main\.py/g, 'решение.py')
        .replace(/\/tmp\/litkot-run-[^/]+\/main\.js/g, 'решение.js');

      if (
        cleaned.includes('line ') &&
        (cleaned.includes('решение.py') ||
          cleaned.includes('main.py') ||
          cleaned.includes('решение.js'))
      ) {
        return (
          <span
            key={lineIdx}
            className="my-0.5 block rounded bg-red-500/10 px-2 py-0.5 font-bold text-red-400"
          >
            {cleaned}
          </span>
        );
      }

      const isErrorDescriptor =
        /^[A-Za-z]+Error:/.test(cleaned.trim()) ||
        cleaned.trim().startsWith('AssertionError') ||
        cleaned.trim().startsWith('ReferenceError') ||
        cleaned.trim().startsWith('TypeError') ||
        cleaned.trim().startsWith('SyntaxError');

      if (isErrorDescriptor) {
        return (
          <span
            key={lineIdx}
            className="my-1 block border-l-2 border-rose-500 pl-2 font-bold text-rose-500"
          >
            {cleaned}
          </span>
        );
      }

      return (
        <span key={lineIdx} className="block opacity-75">
          {cleaned}
        </span>
      );
    });

    return <div className="space-y-0.5 font-mono text-xs md:text-sm">{cleanedLines}</div>;
  }

  return <span className="whitespace-pre-wrap">{errorStr}</span>;
}

export function CodePanel(props: CodePanelProps) {
  const router = useRouter();
  const params = useSearchParams();
  const pathname = usePathname();
  const isPlayground = pathname.includes('playground');
  const { toast } = useToast();
  const [isTestPanelExpanded, setIsTestPanelExpanded] = useState(true);
  const [localStorageCode, setLocalStorageCode] = useLocalStorage(
    props.challenge.slug !== 'test-slug' ? `challenge-${props.challenge.slug}` : '',
    '',
  );

  const [checkingState, setCheckingState] = useState<
    'editor' | 'failure' | 'success' | 'verifying'
  >('editor');
  const [checkingErrors, setCheckingErrors] = useState<string[]>([]);
  const [latestSubmissionId, setLatestSubmissionId] = useState<number | null>(null);

  const disabled = props.submissionDisabled;

  const defaultCode =
    lzstring.decompressFromEncodedURIComponent(params.get('code') ?? '') ?? localStorageCode;

  const getDefaultCode = () => {
    if (!defaultCode) {
      return props.challenge.code;
    }

    return defaultCode;
  };

  const [code, setCode] = useState(() => getDefaultCode());
  const [tests, setTests] = useState(() => props.challenge.tests);

  useEffect(() => {
    if (
      localStorageCode &&
      localStorageCode !== props.challenge.code &&
      code === props.challenge.code
    ) {
      setCode(localStorageCode);
    }
  }, [localStorageCode, props.challenge.code, code]);

  useResetEditor().subscribe('resetCode', () => {
    setCode(props.challenge.code);
    setLocalStorageCode(props.challenge.code);
  });

  const codeRef = useRef(code);
  useEffect(() => {
    codeRef.current = code;
  }, [code]);

  const isCheckingRef = useRef(false);

  const [userEditorState, setUserEditorState] = useState<monaco.editor.IStandaloneCodeEditor>();
  const [monacoInstance, setMonacoInstance] = useState<typeof monaco_editor>();

  function validator(code: string) {
    if (props.challenge.slug !== '2024-10') return;

    const disallowed = ['5', '6', '7', '8', '9', '+', '-'];

    if (disallowed.some((char) => code.includes(char))) {
      throw new Error(`Решение не может содержать: ${disallowed.join(', ')}`);
    }
  }

  const handleSubmit = useCallback(async () => {
    if (monacoInstance == null || isCheckingRef.current) {
      return;
    }

    isCheckingRef.current = true;
    setCheckingState('verifying');
    setCheckingErrors([]);

    // Cute thinking animation delay
    await new Promise((resolve) => {
      setTimeout(resolve, 800);
    });

    try {
      const currentCode = codeRef.current;
      const extension =
        props.challenge.language.toLowerCase() === 'python'
          ? 'py'
          : props.challenge.language.toLowerCase() === 'javascript'
            ? 'js'
            : 'ts';
      const TESTS_PATH = `file:///tests.${extension}`;
      const USER_CODE_PATH = `file:///user.${extension}`;

      const formattedErrors: string[] = [];

      try {
        validator(currentCode);
      } catch (err) {
        formattedErrors.push((err as Error).message || 'Ошибка валидации кода');
      }

      if (extension === 'ts' || extension === 'js') {
        const getTsWorker = await monacoInstance.languages.typescript.getTypeScriptWorker();
        const model = monacoInstance.editor.getModel(monacoInstance.Uri.parse(TESTS_PATH));

        if (!model) {
          console.error('TESTS_PATH model not found! Target:', TESTS_PATH);
          throw new Error('Не удалось запустить компилятор тестов');
        }

        const tsWorker = await getTsWorker(model.uri);

        const testErrors = await Promise.all([
          tsWorker.getSemanticDiagnostics(TESTS_PATH),
          tsWorker.getSyntacticDiagnostics(TESTS_PATH),
          tsWorker.getCompilerOptionsDiagnostics(TESTS_PATH),
        ] as const);

        const userErrors = await Promise.all([
          tsWorker.getSemanticDiagnostics(USER_CODE_PATH),
          tsWorker.getSyntacticDiagnostics(USER_CODE_PATH),
          tsWorker.getCompilerOptionsDiagnostics(USER_CODE_PATH),
        ] as const);

        const allDiagnostics: monaco.languages.typescript.Diagnostic[] = [
          ...testErrors[0],
          ...testErrors[1],
          ...testErrors[2],
          ...userErrors[0],
          ...userErrors[1],
          ...userErrors[2],
        ];

        allDiagnostics.forEach((d) => {
          if (!d.messageText) return;
          const messageText = d.messageText as any;
          if (typeof messageText === 'string') {
            formattedErrors.push(messageText);
          } else {
            let msg = messageText.messageText || '';
            const next = messageText.next;
            if (Array.isArray(next)) {
              next.forEach((n: any) => {
                if (n?.messageText) {
                  msg += `\n${n.messageText}`;
                }
              });
            } else if (next?.messageText) {
              msg += `\n${next.messageText}`;
            }
            formattedErrors.push(msg);
          }
        });
      } else if (extension === 'py') {
        try {
          const res = await fetch('/api/execute', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              code: currentCode,
              tests: props.challenge.tests,
              language: 'python',
            }),
          });
          const data = await res.json();
          if (!data.success) {
            formattedErrors.push(data.error || 'Ошибка выполнения');
            if (data.output) {
              formattedErrors.push(`[ВЫВОД КОНСОЛИ]\n${data.output}`);
            }
          }
        } catch (fetchErr: any) {
          formattedErrors.push(`Ошибка соединения с песочницей: ${fetchErr.message}`);
        }
      } else {
        formattedErrors.push(`Песочница для расширения ${extension} пока не настроена.`);
      }

      if (formattedErrors.length > 0) {
        setCheckingErrors(formattedErrors);
        setCheckingState('failure');
        toast({
          variant: 'destructive',
          title: 'Проверка провалена',
          description: 'Код не прошел компиляцию или тесты.',
        });
      } else {
        const submission = await props.saveSubmission(currentCode ?? '', true);
        if (submission && typeof submission === 'object' && 'id' in submission) {
          setLatestSubmissionId(submission.id);
        }
        setCheckingState('success');
        toast({
          variant: 'success',
          title: 'Успешно!',
          description: 'Все тесты пройдены! Кот доволен 🐾',
        });
      }
    } catch (e) {
      console.error(e);
      setCheckingErrors([(e as Error)?.message || 'Произошла непредвиденная ошибка при проверке']);
      setCheckingState('failure');
      toast({
        variant: 'destructive',
        title: 'Упс!',
        description: 'Произошла ошибка во время выполнения тестов.',
      });
    } finally {
      isCheckingRef.current = false;
    }
  }, [monacoInstance, props.saveSubmission, props.challenge.language, props.challenge.tests]);

  const debouncedHandleSubmit = useMemo(() => debounce(handleSubmit, 500), [handleSubmit]);

  const handleCodeChange = useCallback(
    (newCode?: string) => {
      if (!monacoInstance) return;
      const code = newCode ?? '';
      if (isPlayground) {
        props.updatePlaygroundCodeLocalStorage?.(code);
      }
      setCode(code);
      setLocalStorageCode(code);
    },
    [monacoInstance, isPlayground, props],
  );

  const handleTestsChange = useCallback(
    (newTests?: string) => {
      if (isPlayground) {
        const tests = newTests ?? '';
        props.updatePlaygroundTestsLocalStorage?.(tests);
        if (!monacoInstance) return;
        setTests(tests);
        setLocalStorageCode(tests);
      }
    },
    [isPlayground, monacoInstance, props],
  );

  useEffect(() => {
    const onSubmit = (e: KeyboardEvent) => {
      // If success screen is shown and user presses Enter, go to next challenge
      if (checkingState === 'success' && e.code === 'Enter') {
        if (props.nextChallengeSlug) {
          e.preventDefault();
          router.push(
            `/challenge/${props.nextChallengeSlug}${props.trackSlug ? `?slug=${props.trackSlug}` : ''}`,
          );
          setCheckingState('editor');
        }
        return;
      }

      // If failure/success screen is shown and user presses Escape, return to editor
      if ((checkingState === 'success' || checkingState === 'failure') && e.code === 'Escape') {
        e.preventDefault();
        setCheckingState('editor');
        return;
      }

      const isEnter = e.code === 'Enter' || e.code === 'NumpadEnter';
      const isKeyY = e.code === 'KeyY';
      if ((e.ctrlKey || e.metaKey) && (isKeyY || isEnter)) {
        e.preventDefault();
        debouncedHandleSubmit();
      }
    };

    document.addEventListener('keydown', onSubmit);

    return () => {
      document.removeEventListener('keydown', onSubmit);
    };
  }, [debouncedHandleSubmit, checkingState, props.nextChallengeSlug, props.trackSlug, router]);

  const displayLang =
    props.challenge.language.toLowerCase() === 'python'
      ? 'Python'
      : props.challenge.language.toLowerCase() === 'javascript'
        ? 'JavaScript'
        : props.challenge.language.toLowerCase() === 'typescript'
          ? 'TypeScript'
          : props.challenge.language;

  return (
    <div className="relative flex h-full w-full flex-col">
      <div className="sticky top-0 z-20 flex h-[48px] shrink-0 items-center justify-between border-b border-zinc-800 bg-zinc-950/90 px-4 py-2 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">{props.settingsElement}</div>
          <div className="h-4 w-px bg-zinc-800" />
          <div className="flex items-center gap-2 text-xs font-semibold tracking-wide text-zinc-300 antialiased">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-fuchsia-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-fuchsia-500 shadow-[0_0_8px_rgba(217,70,239,0.8)]"></span>
            </span>
            <span>Ожидаем {displayLang}-код</span>
          </div>
        </div>
        <Button
          disabled={disabled}
          size="sm"
          className="group relative flex h-[30px] items-center gap-2 overflow-hidden rounded-md border-0 bg-gradient-to-r from-fuchsia-500 via-pink-500 to-violet-600 px-3.5 text-xs font-semibold uppercase tracking-wider text-white shadow-[0_0_12px_rgba(217,70,239,0.3)] transition-all duration-300 hover:from-fuchsia-400 hover:via-pink-400 hover:to-violet-500 hover:shadow-[0_0_18px_rgba(217,70,239,0.6)] active:scale-95 disabled:pointer-events-none disabled:opacity-50"
          onClick={debouncedHandleSubmit}
        >
          <span>Запустить</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:scale-110"
          >
            <polygon points="5 3 19 12 5 21 5 3"></polygon>
          </svg>
        </Button>
      </div>

      {checkingState !== 'editor' && (
        <div
          onMouseDown={(e) => e.stopPropagation()}
          className="animate-fade-in-overlay absolute inset-x-0 bottom-0 top-[48px] z-50 flex flex-col items-center justify-center overflow-y-auto bg-zinc-50/80 p-6 backdrop-blur-md dark:bg-zinc-950/85"
        >
          {checkingState === 'verifying' && (
            <>
              <div className="mb-6 flex animate-pulse flex-col items-center">
                <pre className="text-left font-mono text-lg font-bold leading-none text-zinc-700 dark:text-zinc-300">
                  {`  /\\_/\\
 ( o.o )
  > ^ <`}
                </pre>
                <span className="mt-4 text-center font-sans text-sm font-bold text-zinc-500 dark:text-zinc-400">
                  мурр... проверяем ваш код
                </span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-fuchsia-500 border-t-transparent" />
                <span className="mt-2 font-mono text-sm font-semibold text-zinc-500 dark:text-zinc-400">
                  Проверяем...
                </span>
              </div>
            </>
          )}

          {checkingState === 'success' && (
            <>
              <div className="mb-6 flex flex-col items-center">
                <pre className="text-left font-mono text-lg font-bold leading-none text-emerald-600 dark:text-emerald-400">
                  {`  /\\_/\\
 ( ^.^ )
  > ^ <`}
                </pre>
                <span className="mt-4 text-center font-sans text-sm font-bold text-emerald-600 dark:text-emerald-400">
                  УРА! Все тесты пройдены!
                </span>
              </div>
              <span className="mb-2 text-center font-sans text-xl font-extrabold text-zinc-800 dark:text-zinc-100">
                Мур-мяу! Задание выполнено! 🎉
              </span>
              <span className="mb-6 text-center font-mono text-sm text-zinc-500 dark:text-zinc-400">
                Код успешно проверен и сохранен.
              </span>

              <div className="flex w-full max-w-xs flex-col gap-3">
                {props.nextChallengeSlug ? (
                  <Link
                    href={`/challenge/${props.nextChallengeSlug}${props.trackSlug ? `?slug=${props.trackSlug}` : ''}`}
                    onClick={() => setCheckingState('editor')}
                  >
                    <Button className="group flex h-auto w-full items-center justify-center gap-2 rounded-xl border-0 bg-gradient-to-r from-fuchsia-500 via-pink-500 to-violet-600 py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-[0_0_15px_rgba(217,70,239,0.3)] transition-all duration-300 hover:from-fuchsia-400 hover:via-pink-400 hover:to-violet-500 hover:shadow-[0_0_20px_rgba(217,70,239,0.5)]">
                      <span>Следующая задача</span>
                      <kbd className="hidden rounded bg-white/20 px-1.5 py-0.5 font-mono text-[9px] lowercase tracking-normal text-white/95 sm:inline-block">
                        Enter
                      </kbd>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="transition-transform duration-300 group-hover:translate-x-1"
                      >
                        <polyline points="9 18 15 12 9 6"></polyline>
                      </svg>
                    </Button>
                  </Link>
                ) : null}

                {latestSubmissionId ? (
                  <Link
                    href={`/challenge/${props.challenge.slug}/submissions/${latestSubmissionId}?success=true${props.trackSlug ? `&slug=${props.trackSlug}` : ''}`}
                    onClick={() => setCheckingState('editor')}
                  >
                    <Button className="h-auto w-full rounded-xl border border-zinc-700 bg-zinc-900 py-3.5 text-xs font-bold text-white hover:bg-zinc-800 dark:border-zinc-300 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-200">
                      Посмотреть решения 🐾
                    </Button>
                  </Link>
                ) : null}

                <Button
                  onClick={() => setCheckingState('editor')}
                  variant="ghost"
                  className="w-full py-2 text-xs font-semibold text-zinc-500 hover:bg-transparent hover:text-zinc-300"
                >
                  <span>Вернуться в редактор</span>
                  <kbd className="ml-1 hidden rounded bg-zinc-800 px-1.5 py-0.5 font-mono text-[9px] text-zinc-400 sm:inline-block">
                    Esc
                  </kbd>
                </Button>
              </div>
            </>
          )}

          {checkingState === 'failure' && (
            <>
              <div className="mb-6 flex flex-col items-center">
                <pre className="text-left font-mono text-lg font-bold leading-none text-red-600 dark:text-red-400">
                  {`  /\\_/\\
 ( x.x )
  > ^ <`}
                </pre>
                <span className="mt-4 text-center font-sans text-sm font-bold text-red-600 dark:text-red-400">
                  грустное мяу...
                </span>
              </div>
              <span className="mb-2 text-center text-lg font-extrabold text-zinc-800 dark:text-zinc-100">
                Код не прошел тесты! 😿
              </span>
              <div className="mt-4 w-full max-w-2xl rounded-xl border border-red-500/20 bg-zinc-950 shadow-2xl shadow-red-950/25">
                <div className="flex items-center justify-between border-b border-zinc-900 bg-zinc-900/40 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 animate-pulse rounded-full bg-red-500/85" />
                    <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-red-500/80">
                      Системный отчет об ошибках
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => {
                        const textToCopy = checkingErrors.join('\n');
                        navigator.clipboard.writeText(textToCopy);
                        toast({
                          title: 'Отчет скопирован!',
                          description: 'Текст ошибок скопирован в буфер обмена.',
                          variant: 'success',
                        });
                      }}
                      variant="ghost"
                      size="sm"
                      className="h-6 gap-1 rounded border border-zinc-800 bg-zinc-900/50 px-2 font-mono text-[9px] text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 active:scale-95"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="10"
                        height="10"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                        <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                      </svg>
                      Копировать
                    </Button>
                    <span className="rounded border border-red-500/20 bg-red-500/10 px-2 py-0.5 font-mono text-[9px] font-bold text-red-400">
                      FAILED
                    </span>
                  </div>
                </div>
                <div className="max-h-[300px] select-text overflow-y-auto p-5 font-mono text-xs leading-relaxed text-red-200/90 selection:bg-red-500/30 selection:text-red-100">
                  <div className="space-y-4">
                    {Array.from(new Set(checkingErrors)).map((err, idx) => (
                      <div key={idx} className="group flex gap-3">
                        <span className="select-none font-bold text-red-500/40">0{idx + 1}</span>
                        <div className="flex-1 select-text">{formatTraceback(err)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <Button
                onClick={() => setCheckingState('editor')}
                className="mt-6 flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900 px-6 py-2 font-bold text-white transition-all hover:bg-zinc-800 dark:border-zinc-300 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-200"
              >
                <span>Попробовать еще раз 🐾</span>
                <kbd className="hidden rounded bg-white/10 px-1.5 py-0.5 font-mono text-[10px] text-zinc-400 sm:inline-block">
                  Esc
                </kbd>
              </Button>
            </>
          )}

          <div className="absolute bottom-6 left-0 right-0 flex select-none items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-wider text-zinc-500/80">
            <img
              src="https://arlist.ru/icon.svg"
              alt="Arlist Logo"
              className="h-4 w-4 drop-shadow-[0_0_12px_rgba(168,85,247,0.8)]"
            />
            <span className="bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-emerald-400 bg-clip-text text-transparent opacity-90 drop-shadow-sm">
              Исполняется на Арлист.инфраструктура
            </span>
          </div>
        </div>
      )}

      <SplitEditor
        isTestsReadonly={!isPlayground}
        userEditorState={userEditorState}
        monaco={monacoInstance}
        expandTestPanel={isTestPanelExpanded}
        setIsTestPanelExpanded={setIsTestPanelExpanded}
        tests={tests}
        userCode={code}
        language={props.challenge.language.toLowerCase()}
        tsconfig={props.challenge.tsconfig}
        onMount={{
          tests: (_editor, _monaco) => {
            console.log('Tests editor mounted');
          },
          user: (_editor, monaco) => {
            setMonacoInstance(monaco);
            setUserEditorState(_editor);
          },
        }}
        onChange={{
          tests: handleTestsChange,
          user: handleCodeChange,
        }}
      />
    </div>
  );
}
