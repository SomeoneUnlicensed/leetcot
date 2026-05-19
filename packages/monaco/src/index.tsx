'use client';

import { Button } from '@repo/ui/components/button';
import { ToastAction } from '@repo/ui/components/toast';
import { Tooltip, TooltipContent, TooltipTrigger } from '@repo/ui/components/tooltip';
import { useToast } from '@repo/ui/components/use-toast';
import { CheckCircle2, ChevronUp, XCircle } from '@repo/ui/icons';
import clsx from 'clsx';
import debounce from 'lodash/debounce';
import lzstring from 'lz-string';
import type * as monaco from 'monaco-editor';
import type * as monaco_editor from 'monaco-editor/esm/vs/editor/editor.api';
import { usePathname, useSearchParams } from 'next/navigation';
import React, { useCallback, useEffect, useState } from 'react';
import { useResetEditor } from './editor-hooks';
import SplitEditor, { TESTS_PATH, USER_CODE_PATH } from './split-editor';
import { useLocalStorage } from './useLocalStorage';

export interface CodePanelProps {
  challenge: {
    id: number;
    code: string;
    slug: string;
    tests: string;
    tsconfig?: monaco.languages.typescript.CompilerOptions;
  };
  validator?: (args: unknown[]) => boolean;
  saveSubmission: (code: string, isSuccessful: boolean) => Promise<void>;
  submissionDisabled: boolean;
  settingsElement: React.ReactNode;
  updatePlaygroundTestsLocalStorage?: (code: string) => void;
  updatePlaygroundCodeLocalStorage?: (code: string) => void;
}

export type TsErrors = [
  SemanticDiagnostics: monaco.languages.typescript.Diagnostic[],
  SyntacticDiagnostics: monaco.languages.typescript.Diagnostic[],
  CompilerOptionsDiagnostics: monaco.languages.typescript.Diagnostic[],
];

export function CodePanel(props: CodePanelProps) {
  const params = useSearchParams();
  const pathname = usePathname();
  const isPlayground = pathname.includes('playground');
  const { toast } = useToast();
  const [tsErrors, setTsErrors] = useState<TsErrors>();
  const [isTestPanelExpanded, setIsTestPanelExpanded] = useState(true);
  const [localStorageCode, setLocalStorageCode] = useLocalStorage(
    props.challenge.slug !== 'test-slug' ? `challenge-${props.challenge.slug}` : '',
    '',
  );

  const [checkingState, setCheckingState] = useState<'editor' | 'verifying' | 'success' | 'failure'>('editor');
  const [checkingErrors, setCheckingErrors] = useState<string[]>([]);

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
  useResetEditor().subscribe('resetCode', () => {
    setCode(props.challenge.code);
    setLocalStorageCode(props.challenge.code);
  });

  const [testEditorState, setTestEditorState] = useState<monaco.editor.IStandaloneCodeEditor>();
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
    if (monacoInstance == null) {
      return;
    }

    setCheckingState('verifying');
    setCheckingErrors([]);

    // Cute thinking animation delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    try {
      const getTsWorker = await monacoInstance.languages.typescript.getTypeScriptWorker();
      console.log('Available Monaco Models:', monacoInstance.editor.getModels().map(m => m.uri.toString()));
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

      const allDiagnostics = [
        ...testErrors[0], ...testErrors[1], ...testErrors[2],
        ...userErrors[0], ...userErrors[1], ...userErrors[2],
      ];

      const formattedErrors: string[] = [];

      try {
        validator(code);
      } catch (err: any) {
        formattedErrors.push(err.message || 'Ошибка валидации кода');
      }

      allDiagnostics.forEach((d) => {
        if (!d.messageText) return;
        if (typeof d.messageText === 'string') {
          formattedErrors.push(d.messageText);
        } else {
          let msg = d.messageText.messageText;
          let current = d.messageText.next;
          while (current) {
            msg += '\n' + current.messageText;
            current = current.next;
          }
          formattedErrors.push(msg);
        }
      });

      if (formattedErrors.length > 0) {
        setCheckingErrors(formattedErrors);
        setCheckingState('failure');
        toast({
          variant: 'destructive',
          title: 'Проверка провалена',
          description: 'Код не прошел компиляцию или тесты.',
        });
      } else {
        setCheckingState('success');
        await props.saveSubmission(code ?? '', true);
        toast({
          variant: 'success',
          title: 'Успешно!',
          description: 'Все тесты пройдены! Кот доволен 🐾',
        });
      }
    } catch (e: any) {
      console.error(e);
      setCheckingErrors([e?.message || 'Произошла непредвиденная ошибка при проверке']);
      setCheckingState('failure');
      toast({
        variant: 'destructive',
        title: 'Упс!',
        description: 'Произошла ошибка во время выполнения тестов.',
      });
    }
  }, [code, monacoInstance, props.saveSubmission]);

  const debouncedHandleSubmit = useCallback(debounce(handleSubmit, 500), [handleSubmit]);

  useEffect(() => {
    const onSubmit = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.code === 'KeyY') {
        e.preventDefault();
        debouncedHandleSubmit();
      }
    };

    document.addEventListener('keydown', onSubmit);

    return () => {
      document.removeEventListener('keydown', onSubmit);
    };
  }, [debouncedHandleSubmit]);

  if (checkingState === 'verifying') {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] bg-zinc-50 dark:bg-zinc-950 p-6 select-none transition-all duration-300">
        <pre className="font-mono text-zinc-700 dark:text-zinc-300 text-lg md:text-xl font-bold leading-relaxed mb-6 whitespace-pre text-center animate-pulse">
{`   /\\_/\\
  ( o.o )  *мурр... проверяем ваш код*
   > ^ <`}
        </pre>
        <div className="flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin" />
          <span className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 mt-2 font-mono">
            Проверяем...
          </span>
        </div>
      </div>
    );
  }

  if (checkingState === 'success') {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] bg-zinc-50 dark:bg-zinc-950 p-6 select-none transition-all duration-300 animate-fade-in">
        <pre className="font-mono text-emerald-600 dark:text-emerald-400 text-lg md:text-xl font-bold leading-relaxed mb-6 whitespace-pre text-center">
{`   /\\_/\\
  ( ^.^ )  *УРА! Все тесты пройдены!*
   > ^ <`}
        </pre>
        <span className="text-xl font-extrabold text-zinc-800 dark:text-zinc-100 font-sans text-center mb-2">
          Мур-мяу! Задание выполнено! 🎉
        </span>
        <span className="text-sm text-zinc-500 dark:text-zinc-400 text-center font-mono">
          Код успешно проверен и сохранен.
        </span>
      </div>
    );
  }

  if (checkingState === 'failure') {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] bg-zinc-50 dark:bg-zinc-950 p-6 transition-all duration-300 overflow-y-auto">
        <pre className="font-mono text-red-600 dark:text-red-400 text-lg md:text-xl font-bold leading-relaxed mb-6 whitespace-pre text-center">
{`   /\\_/\\
  ( x.x )  *грустное мяу...*
   > ^ <`}
        </pre>
        <span className="text-lg font-extrabold text-zinc-800 dark:text-zinc-100 text-center mb-2">
          Код не прошел тесты! 😿
        </span>
        <div className="w-full max-w-2xl bg-zinc-950 text-red-400 font-mono text-xs md:text-sm p-4 rounded-lg border border-red-900/50 max-h-[300px] overflow-y-auto mt-4 text-left whitespace-pre-wrap shadow-inner shadow-black/80">
          <div className="text-zinc-500 font-bold mb-2 border-b border-zinc-800 pb-1 flex justify-between items-center">
            <span>КОШАЧИЙ ЛОГ ОШИБОК:</span>
            <span className="text-[10px] bg-red-950 text-red-400 px-1.5 py-0.5 rounded border border-red-900">FAILED</span>
          </div>
          {checkingErrors.map((err, idx) => (
            <div key={idx} className="mb-2 last:mb-0 pb-2 border-b border-red-950/30 last:border-0">
              <span className="text-red-500 font-bold mr-1">[{idx + 1}]</span> {err}
            </div>
          ))}
        </div>
        <Button
          onClick={() => setCheckingState('editor')}
          className="mt-6 bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-950 font-bold px-6 py-2 rounded-lg flex items-center gap-2 transition-all border border-zinc-700 dark:border-zinc-300"
        >
          <span>Попробовать еще раз 🐾</span>
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="sticky top-0 flex h-[40px] shrink-0 items-center justify-between border-b border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-[#1e1e1e]">
        <div className="flex items-center gap-1">{props.settingsElement}</div>
        <Button
          disabled={disabled}
          size="sm"
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1 rounded-lg flex items-center gap-1 text-xs transition-colors whitespace-nowrap"
          onClick={debouncedHandleSubmit}
        >
          На проверочку! 🐾
        </Button>
      </div>
      <SplitEditor
        isTestsReadonly={!isPlayground}
        userEditorState={userEditorState}
        monaco={monacoInstance}
        expandTestPanel={isTestPanelExpanded}
        setIsTestPanelExpanded={setIsTestPanelExpanded}
        tests={tests}
        userCode={code}
        tsconfig={props.challenge.tsconfig}
        onMount={{
          tests: async (editor, monaco) => {
            const getTsWorker = await monaco.languages.typescript.getTypeScriptWorker();

            const model = monaco.editor.getModel(monaco.Uri.parse(TESTS_PATH));
            if (!model) return null;

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

            setTsErrors(
              testErrors.map((err, i) => {
                return [...err, ...(userErrors[i] || [])];
              }) as TsErrors,
            );

            setTestEditorState(editor);
          },
          user: async (editor, monaco) => {
            setMonacoInstance(monaco);
            setUserEditorState(editor);

            const getTsWorker = await monaco.languages.typescript.getTypeScriptWorker();
            const model = monaco.editor.getModel(monaco.Uri.parse(USER_CODE_PATH));

            if (!model) {
              throw new Error();
            }

            const tsWorker = await getTsWorker(model.uri);

            const testErrors = await Promise.all([
              tsWorker.getSemanticDiagnostics(USER_CODE_PATH),
              tsWorker.getSyntacticDiagnostics(USER_CODE_PATH),
              tsWorker.getCompilerOptionsDiagnostics(USER_CODE_PATH),
            ] as const);

            const userErrors = await Promise.all([
              tsWorker.getSemanticDiagnostics(USER_CODE_PATH),
              tsWorker.getSyntacticDiagnostics(USER_CODE_PATH),
              tsWorker.getCompilerOptionsDiagnostics(USER_CODE_PATH),
            ] as const);

            setTsErrors(
              testErrors.map((err, i) => {
                return [...err, ...(userErrors[i] || [])];
              }) as TsErrors,
            );
          },
        }}
        onChange={{
          tests: async (code = '') => {
            if (isPlayground) {
              props.updatePlaygroundTestsLocalStorage?.(code ?? '');

              if (!monacoInstance) return null;
              setTests(code);
              setLocalStorageCode(code);

              const getTsWorker = await monacoInstance.languages.typescript.getTypeScriptWorker();

              const mm = monacoInstance.editor.getModel(monacoInstance.Uri.parse(TESTS_PATH));
              if (!mm) return null;

              const tsWorker = await getTsWorker(mm.uri);

              const testErrors = await Promise.all([
                tsWorker.getSemanticDiagnostics(TESTS_PATH),
                tsWorker.getSyntacticDiagnostics(TESTS_PATH),
                tsWorker.getCompilerOptionsDiagnostics(TESTS_PATH),
              ] as const);

              setTsErrors(testErrors);
            }
          },
          user: async (code = '') => {
            if (!monacoInstance) return null;
            if (isPlayground) {
              props.updatePlaygroundCodeLocalStorage?.(code ?? '');
            }
            setCode(code);
            setLocalStorageCode(code);

            const getTsWorker = await monacoInstance.languages.typescript.getTypeScriptWorker();

            const mm = monacoInstance.editor.getModel(monacoInstance.Uri.parse(TESTS_PATH));
            if (!mm) return null;

            const tsWorker = await getTsWorker(mm.uri);

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

            setTsErrors(
              testErrors.map((err, i) => {
                return [...err, ...(userErrors[i] || [])];
              }) as TsErrors,
            );
          },
        }}
      />
    </>
  );
}
