'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@repo/ui/components/button';
import { Card } from '@repo/ui/components/card';
import { Badge } from '@repo/ui/components/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@repo/ui/components/alert-dialog';
import { Markdown } from '@repo/ui/components/markdown';
import { CodeEditor } from '@repo/monaco/code-editor';
import dynamic from 'next/dynamic';
import { useEditorSettingsStore } from '@repo/monaco/settings-store';
import { SettingsButton } from '~/app/challenge/_components/settings/settings-button';

const VimStatusBar = dynamic(() => import('@repo/monaco/vim-mode'), { ssr: false });

const QUESTION_TYPE_LABELS: Record<string, string> = {
  MULTIPLE_CHOICE: 'Множественный выбор',
  SHORT_ANSWER: 'Короткий ответ',
  MATCHING: 'Сопоставление пар',
  FILL_IN_BLANK: 'Заполнить пропуски',
  ORDERING: 'Упорядочивание',
};

function parseJsonArray(value: string | undefined, fallbackLength: number): string[] {
  if (value) {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed.map((v) => String(v ?? ''));
    } catch {
      // not JSON yet, fall through to default
    }
  }
  return new Array(fallbackLength).fill('');
}

function generateBoilerplate(
  language: string | undefined,
  functionName: string | null | undefined,
  functionParams: string[] | null | undefined,
): string {
  if (!functionName) return '';
  const params = (functionParams || []).join(', ');
  if (language?.toLowerCase() === 'python') {
    return `def ${functionName}(${params}):\n    # Твой код здесь\n    pass\n`;
  }
  if (language?.toLowerCase() === 'javascript' || language?.toLowerCase() === 'typescript') {
    return `function ${functionName}(${params}) {\n  // Твой код здесь\n}\n`;
  }
  return '';
}

interface Question {
  id: string;
  order: number;
  type: string;
  content: string;
  points: number;
  language?: string;
  functionName?: string | null;
  functionParams?: string[] | null;
  options?: string[];
  correctAnswers?: number[];
  matchingLeftItems?: string[] | null;
  matchingRightOptions?: string[] | null;
  blankCount?: number | null;
  orderingShuffledItems?: string[] | null;
  testCases?: {
    id: string;
    input: string | null;
    expectedOutput: string;
    isHidden?: boolean;
  }[];
}

interface ExamData {
  title: string;
  description: string;
  questions: Question[];
}

interface SessionData {
  id: string;
  status: string;
  startedAt: string;
  exam: ExamData;
  answers: {
    id: string;
    questionId: string;
    answer: string;
  }[];
}

export default function ExamSessionPage() {
  const params = useParams();
  const shareToken = params.shareToken as string;
  const sessionId = params.sessionId as string;

  const [session, setSession] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  interface TestResult {
    testCaseId: string;
    input: string | null;
    expected: string;
    actual: string;
    error: string | null;
    duration: number;
    passed: boolean;
  }

  const [isRunningCode, setIsRunningCode] = useState(false);
  const [runResults, setRunResults] = useState<TestResult[] | null>(null);
  const [runError, setRunError] = useState<string | null>(null);
  const [checkingState, setCheckingState] = useState<
    'editor' | 'failure' | 'success' | 'verifying'
  >('editor');

  const [isTestPanelExpanded, setIsTestPanelExpanded] = useState(true);
  const [testPanelTab, setTestPanelTab] = useState<'results' | 'tests'>('tests');
  const [selectedTestCaseIdx, setSelectedTestCaseIdx] = useState(0);
  const [userEditorState, setUserEditorState] = useState<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
  const { settings } = useEditorSettingsStore();
  const editorCodeRef = useRef<string>('');

  useEffect(() => {
    setCheckingState('editor');
    setRunResults(null);
    setRunError(null);
    setSelectedTestCaseIdx(0);
    setTestPanelTab('tests');
    setUserEditorState(null);
    const question = session?.exam.questions[currentQuestionIndex];
    if (question) {
      editorCodeRef.current =
        answers[question.id] ||
        generateBoilerplate(question.language, question.functionName, question.functionParams);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestionIndex, session]);

  const handleRunCode = async () => {
    if (!session?.exam.questions) return;
    const currentQuestion = session.exam.questions[currentQuestionIndex];
    if (!currentQuestion) return;

    const code = editorCodeRef.current || '';
    if (!code.trim()) {
      setRunError('Пожалуйста, напишите какой-нибудь код перед проверкой.');
      setRunResults(null);
      setCheckingState('failure');
      setIsTestPanelExpanded(true);
      setTestPanelTab('results');
      return;
    }

    try {
      setIsRunningCode(true);
      setCheckingState('verifying');
      setIsTestPanelExpanded(true);
      setTestPanelTab('results');
      setRunError(null);
      setRunResults(null);

      const response = await fetch(`/api/exam-sessions/${sessionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questionId: currentQuestion.id,
          answer: code,
          action: 'run',
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        setRunError(data.error || 'Ошибка при запуске кода.');
        setCheckingState('failure');
        setIsTestPanelExpanded(true);
        setTestPanelTab('results');
        return;
      }

      const data = await response.json();
      const results = data.testResults || [];
      setRunResults(results);

      const allPassed = results.length > 0 && results.every((r: TestResult) => r.passed);
      if (allPassed) {
        setCheckingState('success');
      } else {
        setCheckingState('failure');
      }
      setIsTestPanelExpanded(true);
      setTestPanelTab('results');
    } catch (err) {
      console.error('Error running code:', err);
      setRunError('Ошибка соединения с сервером.');
      setCheckingState('failure');
      setIsTestPanelExpanded(true);
      setTestPanelTab('results');
    } finally {
      setIsRunningCode(false);
    }
  };

  const fetchSession = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/exam-sessions/${sessionId}`);

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Ошибка при загрузке сессии');
        return;
      }

      const data = await response.json();
      setSession(data.session);

      // Load previously saved answers
      const savedAnswers: Record<string, string> = {};
      data.session.answers.forEach((answer: { questionId: string; answer: string }) => {
        savedAnswers[answer.questionId] = answer.answer;
      });
      setAnswers(savedAnswers);
    } catch (err) {
      console.error('Error fetching session:', err);
      setError('Ошибка при загрузке сессии');
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    void fetchSession();
  }, [sessionId, fetchSession]);

  const saveAnswer = useCallback(async (questionId: string, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));

    try {
      await fetch(`/api/exam-sessions/${sessionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questionId,
          answer,
          action: 'save',
        }),
      });
    } catch (err) {
      console.error('Error saving answer:', err);
    }
  }, [sessionId]);

  const handleCodeChange = useCallback((val: string | undefined) => {
    const code = val || '';
    editorCodeRef.current = code;
    if (session?.exam.questions[currentQuestionIndex]) {
      saveAnswer(session.exam.questions[currentQuestionIndex].id, code);
    }
  }, [currentQuestionIndex, saveAnswer, session]);

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setError(null);

      const response = await fetch(`/api/exam-sessions/${sessionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'submit',
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Ошибка при отправке теста');
        return;
      }

      // Redirect to results
      router.push(`/exam/${shareToken}/session/${sessionId}/results`);
    } catch (err) {
      console.error('Error submitting exam:', err);
      setError('Ошибка при отправке теста');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-lg">Загрузка теста...</p>
      </div>
    );
  }

  if (error && !session) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-full max-w-md p-8">
          <div className="text-center text-red-600">
            <p className="mb-2 text-lg font-semibold">Ошибка</p>
            <p>{error}</p>
          </div>
        </Card>
      </div>
    );
  }

  if (!session?.exam.questions || session.exam.questions.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-full max-w-md p-8">
          <div className="text-center">
            <p className="text-lg">Нет вопросов в этом тесте</p>
          </div>
        </Card>
      </div>
    );
  }

  const currentQuestion = session.exam.questions[currentQuestionIndex];

  if (!currentQuestion) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-lg">Ошибка: вопрос не найден</p>
      </div>
    );
  }

  const currentAnswer =
    answers[currentQuestion.id] ||
    generateBoilerplate(
      currentQuestion.language,
      currentQuestion.functionName,
      currentQuestion.functionParams,
    );
  const totalQuestions = session.exam.questions.length;
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="min-h-screen bg-zinc-950 px-4 py-12 text-neutral-100">
      <div
        className={`mx-auto ${currentQuestion.type === 'CODE_TASK' ? 'max-w-7xl' : 'max-w-4xl'}`}
      >
        {/* Header */}
        <div className="mb-8">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h1 className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-3xl font-extrabold text-transparent">
                {session.exam.title}
              </h1>
              <p className="mt-1.5 text-sm text-neutral-400">
                Вопрос {currentQuestionIndex + 1} из {totalQuestions}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                Отвечено
              </p>
              <p className="text-2xl font-black text-amber-500">
                {answeredCount}/{totalQuestions}
              </p>
            </div>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-900">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-300"
              style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
            />
          </div>
        </div>

        {error ? (
          <div className="mb-5 rounded-xl border border-red-950 bg-red-950/40 p-4 text-sm text-red-400">
            {error}
          </div>
        ) : null}

        {/* Questions Grid */}
        <div className="mb-8 grid grid-cols-4 gap-3 sm:grid-cols-8">
          {session.exam.questions.map((q, idx) => (
            <button
              key={q.id}
              onClick={() => setCurrentQuestionIndex(idx)}
              className={`rounded-xl border-2 py-3.5 text-sm font-bold transition-all ${
                idx === currentQuestionIndex
                  ? 'border-amber-500 bg-amber-500/10 text-amber-400'
                  : answers[q.id]
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                    : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:border-amber-500/50 hover:text-neutral-200'
              }`}
            >
              {idx + 1}
              {answers[q.id] ? <span className="ml-1 text-emerald-500">✓</span> : null}
            </button>
          ))}
        </div>

        {/* Question Card */}
        {currentQuestion.type === 'CODE_TASK' ? (
          <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Left Column: Description & Examples */}
            <Card className="flex flex-col justify-between rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 shadow-xl backdrop-blur-md lg:col-span-5">
              <div>
                <div className="mb-4 flex items-start justify-between">
                  <h2 className="text-xl font-extrabold text-white">Условие задачи</h2>
                  <Badge
                    variant="outline"
                    className="border-amber-500/20 bg-amber-500/10 px-3 py-1 font-bold text-amber-400"
                  >
                    {currentQuestion.points} баллов
                  </Badge>
                </div>

                <div className="prose-invert prose-h3:text-xl max-w-none text-sm leading-relaxed">
                  <Markdown>{currentQuestion.content}</Markdown>
                </div>

                {/* Student Memo */}
                {currentQuestion.functionName ? (
                  <div className="mt-6 space-y-1.5 rounded-xl border border-zinc-800/80 bg-zinc-950/60 p-4 text-xs leading-relaxed text-zinc-400">
                    <p className="flex items-center gap-1.5 font-bold text-neutral-300">
                      <span className="text-amber-500">💡</span> Реализуйте функцию
                    </p>
                    <p>
                      Напишите тело функции{' '}
                      <code className="font-mono text-amber-400">
                        {currentQuestion.functionName}(
                        {(currentQuestion.functionParams || []).join(', ')})
                      </code>{' '}
                      и верните ответ через{' '}
                      <code className="font-mono text-neutral-200">return</code>. Остальное система
                      сделает сама.
                    </p>
                  </div>
                ) : null}
              </div>

              {/* Public Test Cases */}
              {currentQuestion.testCases &&
              currentQuestion.testCases.filter((tc) => !tc.isHidden).length > 0 ? (
                <div className="mt-8 border-t border-zinc-800/80 pt-5">
                  <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-neutral-400">
                    Примеры тестов:
                  </h3>
                  <div className="space-y-3">
                    {currentQuestion.testCases
                      .filter((tc) => !tc.isHidden)
                      .slice(0, 3)
                      .map((tc, idx) => (
                        <div
                          key={tc.id || idx}
                          className="bg-zinc-955 rounded-xl border border-zinc-900 p-4 font-mono text-xs"
                        >
                          {tc.input ? (
                            <div className="mb-2">
                              <span className="text-neutral-500">
                                {currentQuestion.functionName ? 'Аргументы:' : 'Ввод:'}
                              </span>
                              <pre className="border-zinc-850 mt-1 overflow-x-auto rounded-lg border bg-zinc-900 p-2 text-neutral-200">
                                {tc.input}
                              </pre>
                            </div>
                          ) : null}
                          <div>
                            <span className="text-neutral-500">
                              {currentQuestion.functionName
                                ? 'Ожидаемый результат:'
                                : 'Ожидаемый вывод:'}
                            </span>
                            <pre className="border-zinc-850 mt-1 overflow-x-auto rounded-lg border bg-zinc-900 p-2 text-neutral-200">
                              {tc.expectedOutput}
                            </pre>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              ) : null}
            </Card>

            {/* Right Column: Code Editor & Sandboxed Verification Console */}
            <Card className="relative flex min-h-[580px] flex-col gap-0 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 shadow-xl backdrop-blur-md lg:col-span-7">
              {/* Header Settings Bar */}
              <div className="sticky top-0 z-20 flex h-[48px] shrink-0 items-center justify-between border-b border-zinc-800 bg-zinc-950/90 px-4 py-2 backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <SettingsButton />
                  </div>
                  <div className="h-4 w-px bg-zinc-800" />
                  <div className="flex items-center gap-2 text-xs font-semibold tracking-wide text-zinc-300 antialiased">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-500 opacity-75" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
                    </span>
                    <span>Ожидаем {currentQuestion.language || 'PYTHON'}-код</span>
                  </div>
                </div>
                <Button
                  disabled={isRunningCode}
                  size="sm"
                  className="group relative flex h-[30px] items-center gap-2 overflow-hidden rounded-md border-0 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 px-3.5 text-xs font-semibold uppercase tracking-wider text-white shadow-[0_0_12px_rgba(245,158,11,0.3)] transition-all duration-300 hover:from-amber-400 hover:via-orange-400 hover:to-amber-500 hover:shadow-[0_0_18px_rgba(245,158,11,0.6)] active:scale-95 disabled:pointer-events-none disabled:opacity-50"
                  onClick={handleRunCode}
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
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                </Button>
              </div>

              {/* Editor Workspace */}
              <div className="flex min-h-[300px] w-full flex-1 flex-col overflow-hidden">
                <div className="relative w-full flex-1 overflow-hidden">
                  <CodeEditor
                    key={currentQuestion.id}
                    defaultValue={currentAnswer}
                    onChange={handleCodeChange}
                    language={currentQuestion.language?.toLowerCase()}
                    onMount={(editor) => {
                      setUserEditorState(editor);
                    }}
                  />
                </div>
                {userEditorState && settings.bindings === 'vim' ? (
                  <div className="border-zinc-850 shrink-0 border-t bg-zinc-950">
                    <VimStatusBar editor={userEditorState} />
                  </div>
                ) : null}
              </div>

              {/* Resizer & Test Panel */}
              <div className="flex shrink-0 flex-col border-t border-zinc-800 bg-zinc-950">
                {/* Header of Test Panel */}
                <div className="flex select-none items-center justify-between border-b border-zinc-900 bg-zinc-900/30 px-4 py-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setTestPanelTab('tests')}
                      className={`rounded-lg px-3 py-1 text-xs font-bold transition-all ${
                        testPanelTab === 'tests'
                          ? 'border border-amber-500/20 bg-amber-500/10 text-amber-400'
                          : 'border border-transparent text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      Тесты
                    </button>
                    <button
                      onClick={() => setTestPanelTab('results')}
                      className={`flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-bold transition-all ${
                        testPanelTab === 'results'
                          ? 'border border-amber-500/20 bg-amber-500/10 text-amber-400'
                          : 'border border-transparent text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      <span>Результаты</span>
                      {checkingState === 'verifying' ? (
                        <div className="h-1.5 w-1.5 animate-ping rounded-full bg-amber-500" />
                      ) : runResults ? (
                        <span
                          className={`inline-block h-1.5 w-1.5 rounded-full ${
                            runResults.every((r) => r.passed) ? 'bg-emerald-500' : 'bg-red-500'
                          }`}
                        />
                      ) : null}
                    </button>
                  </div>

                  <button
                    onClick={() => setIsTestPanelExpanded(!isTestPanelExpanded)}
                    className="rounded p-1 text-zinc-400 transition-colors hover:bg-zinc-900 hover:text-zinc-200"
                    title={isTestPanelExpanded ? 'Свернуть панель' : 'Развернуть панель'}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className={`transition-transform duration-200 ${isTestPanelExpanded ? 'rotate-180' : ''}`}
                    >
                      <polyline points="18 15 12 9 6 15" />
                    </svg>
                  </button>
                </div>

                {/* Content area */}
                {isTestPanelExpanded ? (
                  <div className="h-[250px] overflow-y-auto bg-zinc-950/40 p-4 font-sans text-xs">
                    {testPanelTab === 'tests' ? (
                      <div className="space-y-4">
                        {/* Test cases list selector */}
                        {currentQuestion.testCases &&
                        currentQuestion.testCases.filter((tc) => !tc.isHidden).length > 0 ? (
                          <>
                            <div className="flex flex-wrap gap-2">
                              {currentQuestion.testCases
                                .filter((tc) => !tc.isHidden)
                                .map((tc, idx) => (
                                  <button
                                    key={tc.id || idx}
                                    onClick={() => setSelectedTestCaseIdx(idx)}
                                    className={`rounded-xl border px-3 py-1.5 font-semibold transition-all ${
                                      selectedTestCaseIdx === idx
                                        ? 'border-amber-500/35 bg-amber-500/10 text-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.15)]'
                                        : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                                    }`}
                                  >
                                    Кейс #{idx + 1}
                                  </button>
                                ))}
                            </div>

                            {/* Show details of selected test case */}
                            {currentQuestion.testCases.filter((tc) => !tc.isHidden)[
                              selectedTestCaseIdx
                            ] ? (
                              <div className="space-y-3 pt-2 font-mono text-[11px]">
                                {currentQuestion.testCases.filter((tc) => !tc.isHidden)[
                                  selectedTestCaseIdx
                                ]?.input ? (
                                  <div>
                                    <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-500">
                                      {currentQuestion.functionName
                                        ? 'Аргументы:'
                                        : 'Входные данные:'}
                                    </span>
                                    <pre className="border-zinc-850 mt-1 max-h-[80px] overflow-x-auto whitespace-pre-wrap rounded-xl border bg-zinc-900 p-2.5 text-neutral-200">
                                      {
                                        currentQuestion.testCases.filter((tc) => !tc.isHidden)[
                                          selectedTestCaseIdx
                                        ]?.input
                                      }
                                    </pre>
                                  </div>
                                ) : null}
                                <div>
                                  <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-500">
                                    Ожидаемый результат:
                                  </span>
                                  <pre className="border-zinc-850 mt-1 max-h-[80px] overflow-x-auto whitespace-pre-wrap rounded-xl border bg-zinc-900 p-2.5 text-neutral-200">
                                    {
                                      currentQuestion.testCases.filter((tc) => !tc.isHidden)[
                                        selectedTestCaseIdx
                                      ]?.expectedOutput
                                    }
                                  </pre>
                                </div>
                              </div>
                            ) : null}
                          </>
                        ) : (
                          <div className="py-6 text-center text-zinc-500">
                            Публичные тесты для этого задания скрыты или отсутствуют.
                          </div>
                        )}
                      </div>
                    ) : (
                      /* Results tab */
                      <div className="space-y-4">
                        {checkingState === 'editor' && !runResults && !runError ? (
                          <div className="py-8 text-center text-zinc-500">
                            Код еще не запускался. Напишите решение и нажмите «Запустить».
                          </div>
                        ) : null}

                        {checkingState === 'verifying' ? (
                          <div className="flex animate-pulse flex-col items-center justify-center py-6">
                            <pre className="text-left font-mono text-base font-bold leading-none text-zinc-400">
                              {`  /\\_/\\
 ( o.o )
  > ^ <`}
                            </pre>
                            <span className="mt-3 text-center text-xs font-bold text-zinc-400">
                              мурр... проверяем ваш код
                            </span>
                            <div className="mt-4 flex items-center gap-2">
                              <div className="h-4 w-4 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
                              <span className="font-mono text-[10px] text-zinc-500">
                                Идет выполнение...
                              </span>
                            </div>
                          </div>
                        ) : null}

                        {checkingState === 'success' ? (
                          <div className="flex flex-col items-center justify-center py-3 text-center">
                            <pre className="mb-3 text-left font-mono text-base font-bold leading-none text-emerald-400">
                              {`  /\\_/\\
 ( ^.^ )
  > ^ <`}
                            </pre>
                            <span className="mb-1 text-sm font-extrabold text-white">
                              Мур-мяу! Задание выполнено! 🎉
                            </span>
                            <span className="mb-4 text-[11px] text-zinc-400">
                              Все тесты успешно пройдены.
                            </span>
                            <div className="w-full max-w-lg space-y-2.5">
                              {runResults?.map((res, idx) => (
                                <div
                                  key={res.testCaseId || idx}
                                  className="flex items-center justify-between rounded-xl border border-emerald-950/30 bg-emerald-950/10 p-2.5 font-mono text-[11px] text-emerald-400"
                                >
                                  <span>
                                    Тест #{idx + 1} (
                                    {res.input
                                      ? `${currentQuestion?.functionName ? 'Аргументы' : 'Ввод'}: "${res.input}"`
                                      : currentQuestion?.functionName
                                        ? 'без аргументов'
                                        : 'без ввода'}
                                    )
                                  </span>
                                  <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-bold">
                                    Пройден
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : null}

                        {checkingState === 'failure' ? (
                          <div className="flex flex-col items-center justify-center py-2">
                            <pre className="mb-3 text-left font-mono text-base font-bold leading-none text-red-500">
                              {`  /\\_/\\
 ( x.x )
  > ^ <`}
                            </pre>
                            <span className="mb-1 text-sm font-extrabold text-white">
                              Код не прошел тесты! 😿
                            </span>

                            <div className="mt-3 w-full max-w-xl overflow-hidden rounded-xl border border-red-500/20 bg-zinc-950 text-left shadow-xl">
                              <div className="flex items-center justify-between border-b border-zinc-900 bg-zinc-900/40 px-3 py-2">
                                <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-red-500/80">
                                  Системный отчет об ошибках
                                </span>
                                <span className="rounded border border-red-500/20 bg-red-500/10 px-1.5 py-0.5 font-mono text-[8px] font-bold text-red-400">
                                  FAILED
                                </span>
                              </div>

                              <div className="max-h-[180px] space-y-2.5 overflow-y-auto p-3 font-mono text-[11px] leading-relaxed text-red-200/90">
                                {runError ? (
                                  <pre className="bg-red-955/40 max-h-[140px] overflow-y-auto whitespace-pre-wrap rounded-xl border border-red-900/40 p-2.5 text-[10px] text-red-400">
                                    {runError}
                                  </pre>
                                ) : null}

                                {runResults && runResults.length > 0 ? (
                                  <div className="space-y-2">
                                    {runResults.map((res, idx) => (
                                      <div
                                        key={res.testCaseId || idx}
                                        className={`rounded-xl border p-2.5 ${
                                          res.passed
                                            ? 'border-emerald-900/25 bg-emerald-950/10 text-emerald-400'
                                            : 'border-red-900/25 bg-red-950/10 text-red-400'
                                        }`}
                                      >
                                        <div className="mb-1.5 flex items-center justify-between">
                                          <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-400">
                                            Тест #{idx + 1}
                                          </span>
                                          <span
                                            className={`py-0.2 rounded px-1.5 text-[8px] font-bold ${
                                              res.passed
                                                ? 'bg-emerald-500/10 text-emerald-400'
                                                : 'bg-red-500/10 text-red-400'
                                            }`}
                                          >
                                            {res.passed ? 'Пройден' : 'Не пройден'}
                                          </span>
                                        </div>

                                        {res.expected === 'HIDDEN' ? (
                                          <div className="py-1 text-[10px] italic text-zinc-500">
                                            Этот тест скрыт учителем (результаты скрыты).
                                          </div>
                                        ) : (
                                          <>
                                            {res.input ? (
                                              <div className="mb-1.5">
                                                <span className="text-[9px] text-zinc-500">
                                                  {currentQuestion?.functionName
                                                    ? 'Аргументы:'
                                                    : 'Входные данные:'}
                                                </span>
                                                <pre className="mt-0.5 overflow-x-auto whitespace-pre rounded border border-zinc-900 bg-zinc-950/80 p-1.5 text-[10px] text-neutral-300">
                                                  {res.input}
                                                </pre>
                                              </div>
                                            ) : null}

                                            <div className="grid grid-cols-2 gap-2">
                                              <div>
                                                <span className="text-[9px] text-zinc-500">
                                                  Ожидалось:
                                                </span>
                                                <pre className="mt-0.5 overflow-x-auto whitespace-pre rounded border border-zinc-900 bg-zinc-950/80 p-1.5 text-[10px] text-neutral-300">
                                                  {res.expected}
                                                </pre>
                                              </div>
                                              <div>
                                                <span className="text-[9px] text-zinc-500">
                                                  Получено:
                                                </span>
                                                <pre className="mt-0.5 overflow-x-auto whitespace-pre rounded border border-zinc-900 bg-zinc-950/80 p-1.5 text-[10px] text-neutral-300">
                                                  {res.actual || '(пусто)'}
                                                </pre>
                                              </div>
                                            </div>
                                          </>
                                        )}

                                        {res.error ? (
                                          <div className="mt-1.5 overflow-x-auto whitespace-pre-wrap rounded border border-red-900/30 bg-red-950/30 p-1.5 text-[9px] leading-normal text-red-400">
                                            {res.error}
                                          </div>
                                        ) : null}
                                      </div>
                                    ))}
                                  </div>
                                ) : null}
                              </div>
                            </div>
                          </div>
                        ) : null}
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            </Card>
          </div>
        ) : (
          <Card className="mb-8 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-8 shadow-xl backdrop-blur-md">
            <div className="mb-6">
              <div className="mb-4 flex items-start justify-between">
                <div className="prose-invert prose-h3:text-xl prose-p:my-0 flex-1 text-xl font-bold text-neutral-100">
                  <Markdown>{currentQuestion.content}</Markdown>
                </div>
                <Badge
                  variant="outline"
                  className="ml-4 border-amber-500/20 bg-amber-500/10 px-3 py-1 font-bold text-amber-400"
                >
                  {currentQuestion.points} баллов
                </Badge>
              </div>
              <p className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                Тип: {QUESTION_TYPE_LABELS[currentQuestion.type] || currentQuestion.type}
              </p>
            </div>

            {/* Answer Area */}
            <div className="mb-6">
              {currentQuestion.type === 'MULTIPLE_CHOICE' ? (
                <div className="space-y-3">
                  {(currentQuestion.options || []).map((option, idx) => (
                    <label
                      key={idx}
                      className={`p-4.5 flex cursor-pointer items-center rounded-xl border transition-colors ${
                        currentAnswer === idx.toString()
                          ? 'border-amber-500 bg-amber-500/10 font-semibold text-amber-300'
                          : 'border-zinc-800 bg-zinc-900/40 text-neutral-300 hover:bg-zinc-900/80'
                      }`}
                    >
                      <input
                        type="radio"
                        name="answer"
                        value={idx.toString()}
                        checked={currentAnswer === idx.toString()}
                        onChange={(e) => saveAnswer(currentQuestion.id, e.target.value)}
                        className="h-4.5 w-4.5 mr-3.5 border-zinc-800 bg-zinc-950 text-amber-500 focus:ring-amber-500/20"
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              ) : currentQuestion.type === 'MATCHING' ? (
                (() => {
                  const leftItems = currentQuestion.matchingLeftItems || [];
                  const rightOptions = currentQuestion.matchingRightOptions || [];
                  const selections = parseJsonArray(answers[currentQuestion.id], leftItems.length);
                  return (
                    <div className="space-y-3">
                      {leftItems.map((left, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                          <span className="w-1/2 rounded-xl border border-zinc-800 bg-zinc-900/40 p-3.5 text-sm text-neutral-200">
                            {left}
                          </span>
                          <span className="text-zinc-500">↔</span>
                          <select
                            value={selections[idx] || ''}
                            onChange={(e) => {
                              const next = [...selections];
                              next[idx] = e.target.value;
                              saveAnswer(currentQuestion.id, JSON.stringify(next));
                            }}
                            className="w-1/2 rounded-xl border border-zinc-800 bg-zinc-950 p-3.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                          >
                            <option value="">Выберите...</option>
                            {rightOptions.map((opt, optIdx) => (
                              <option key={optIdx} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                        </div>
                      ))}
                    </div>
                  );
                })()
              ) : currentQuestion.type === 'FILL_IN_BLANK' ? (
                (() => {
                  const blankCount = currentQuestion.blankCount || 0;
                  const filled = parseJsonArray(answers[currentQuestion.id], blankCount);
                  return (
                    <div className="space-y-2.5">
                      {Array.from({ length: blankCount }).map((_, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                          <span className="w-28 shrink-0 text-xs font-bold uppercase tracking-wider text-neutral-500">
                            Пропуск {idx + 1}
                          </span>
                          <input
                            type="text"
                            value={filled[idx] || ''}
                            onChange={(e) => {
                              const next = [...filled];
                              next[idx] = e.target.value;
                              saveAnswer(currentQuestion.id, JSON.stringify(next));
                            }}
                            className="flex-1 rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-sm text-white placeholder-zinc-700 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                          />
                        </div>
                      ))}
                    </div>
                  );
                })()
              ) : currentQuestion.type === 'ORDERING' ? (
                (() => {
                  const shuffled = currentQuestion.orderingShuffledItems || [];
                  const savedOrder = answers[currentQuestion.id]
                    ? parseJsonArray(answers[currentQuestion.id], 0)
                    : [];
                  const order = savedOrder.length === shuffled.length ? savedOrder : shuffled;
                  const move = (idx: number, dir: -1 | 1) => {
                    const next = [...order];
                    const target = idx + dir;
                    if (target < 0 || target >= next.length) return;
                    const tmp = next[idx]!;
                    next[idx] = next[target]!;
                    next[target] = tmp;
                    saveAnswer(currentQuestion.id, JSON.stringify(next));
                  };
                  return (
                    <div className="space-y-2.5">
                      {order.map((item, idx) => (
                        <div
                          key={`${item}-${idx}`}
                          className="flex items-center justify-between gap-3 rounded-xl border border-zinc-800 bg-zinc-900/40 p-3.5 text-sm text-neutral-200"
                        >
                          <span className="flex items-center gap-3">
                            <span className="text-xs font-bold text-zinc-500">{idx + 1}.</span>
                            {item}
                          </span>
                          <span className="flex gap-1">
                            <button
                              type="button"
                              disabled={idx === 0}
                              onClick={() => move(idx, -1)}
                              className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-amber-400 disabled:opacity-30"
                            >
                              ↑
                            </button>
                            <button
                              type="button"
                              disabled={idx === order.length - 1}
                              onClick={() => move(idx, 1)}
                              className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-amber-400 disabled:opacity-30"
                            >
                              ↓
                            </button>
                          </span>
                        </div>
                      ))}
                    </div>
                  );
                })()
              ) : (
                <div className="space-y-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                    Ваш ответ
                  </p>
                  <textarea
                    value={currentAnswer}
                    onChange={(e) => saveAnswer(currentQuestion.id, e.target.value)}
                    placeholder="Введите ваш ответ здесь..."
                    className="h-28 w-full rounded-xl border border-zinc-800 bg-zinc-950 p-4 text-sm text-white placeholder-zinc-700 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Navigation */}
        <div className="flex justify-between gap-4">
          <Button
            variant="outline"
            disabled={currentQuestionIndex === 0}
            onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
            className="rounded-xl border-zinc-800 bg-zinc-900 px-6 py-5 text-neutral-300 shadow-sm hover:bg-zinc-800 hover:text-white"
          >
            ← Предыдущий
          </Button>

          <div className="flex gap-4">
            {currentQuestionIndex < totalQuestions - 1 ? (
              <Button
                onClick={() =>
                  setCurrentQuestionIndex((prev) => Math.min(totalQuestions - 1, prev + 1))
                }
                className="rounded-xl border-0 bg-gradient-to-r from-amber-600 to-orange-600 px-6 py-5 font-bold text-white shadow-md hover:from-amber-500 hover:to-orange-500 hover:shadow-lg"
              >
                Следующий →
              </Button>
            ) : (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button className="rounded-xl border-0 bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-5 font-bold text-white shadow-md hover:from-emerald-500 hover:to-teal-500 hover:shadow-lg">
                    Отправить тест
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="rounded-2xl border-zinc-800 bg-zinc-900 text-white">
                  <AlertDialogTitle>Отправить тест?</AlertDialogTitle>
                  <AlertDialogDescription className="text-zinc-400">
                    Вы ответили на {answeredCount} из {totalQuestions} вопросов. Вы уверены, что
                    хотите завершить прохождение теста?
                  </AlertDialogDescription>
                  <div className="mt-4 flex justify-end gap-2">
                    <AlertDialogCancel className="rounded-xl border-zinc-800 bg-zinc-950 text-neutral-300 hover:bg-zinc-900 hover:text-white">
                      Отмена
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="rounded-xl border-0 bg-gradient-to-r from-emerald-600 to-teal-600 font-bold text-white hover:from-emerald-500 hover:to-teal-500"
                    >
                      {isSubmitting ? 'Отправка...' : 'Отправить'}
                    </AlertDialogAction>
                  </div>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
