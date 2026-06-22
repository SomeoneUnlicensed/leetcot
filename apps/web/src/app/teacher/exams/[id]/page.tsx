'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@repo/ui/components/button';
import { Card } from '@repo/ui/components/card';
import { Badge } from '@repo/ui/components/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@repo/ui/components/dialog';
import { Input } from '@repo/ui/components/input';
import { Label } from '@repo/ui/components/label';
import {
  SearchIcon,
  BookOpen,
  Plus,
  Info,
  Bold,
  Italic,
  Code,
  List,
  Link2,
  Heading2,
} from '@repo/ui/icons';

const MARKDOWN_TOOLBAR_ACTIONS: {
  icon: typeof Bold;
  title: string;
  before: string;
  after: string;
  placeholder: string;
}[] = [
  { icon: Bold, title: 'Жирный', before: '**', after: '**', placeholder: 'жирный текст' },
  { icon: Italic, title: 'Курсив', before: '_', after: '_', placeholder: 'курсив' },
  { icon: Code, title: 'Код', before: '`', after: '`', placeholder: 'код' },
  { icon: Heading2, title: 'Заголовок', before: '### ', after: '', placeholder: 'Заголовок' },
  { icon: List, title: 'Список', before: '- ', after: '', placeholder: 'пункт списка' },
  { icon: Link2, title: 'Ссылка', before: '[', after: '](url)', placeholder: 'текст ссылки' },
];

function applyMarkdownWrap(
  textarea: HTMLTextAreaElement | null,
  value: string,
  setValue: (v: string) => void,
  before: string,
  after: string,
  placeholder: string,
) {
  if (!textarea) {
    setValue(value + before + placeholder + after);
    return;
  }
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selected = value.slice(start, end) || placeholder;
  const newValue = value.slice(0, start) + before + selected + after + value.slice(end);
  setValue(newValue);
  requestAnimationFrame(() => {
    textarea.focus();
    const cursorStart = start + before.length;
    const cursorEnd = cursorStart + selected.length;
    textarea.setSelectionRange(cursorStart, cursorEnd);
  });
}

const QUESTION_TYPE_LABELS: Record<string, string> = {
  MULTIPLE_CHOICE: 'Множественный выбор',
  CODE_TASK: 'Программирование',
  SHORT_ANSWER: 'Короткий ответ',
  MATCHING: 'Сопоставление пар',
  FILL_IN_BLANK: 'Заполнить пропуски',
  ORDERING: 'Упорядочивание',
};

interface ExamQuestion {
  id: string;
  order: number;
  type: string;
  content: string;
  points: number;
  language?: string;
  functionName?: string | null;
  functionParams?: string[] | null;
  testCases: {
    id: string;
    input: string;
    expectedOutput: string;
    isHidden?: boolean;
  }[];
  options?: string[];
  correctAnswers?: number[];
  correctAnswerText?: string | null;
  matchingPairs?: { left: string; right: string }[] | null;
  blankAnswers?: string[] | null;
  orderingItems?: string[] | null;
}

interface PlatformChallenge {
  id: string;
  name: string;
  shortDescription: string;
  difficulty: string;
}

interface Exam {
  id: string;
  title: string;
  description: string;
  classLevel: string;
  status: string;
  shareToken: string;
  questions: ExamQuestion[];
}

// million-ignore
export default function ExamEditorPage() {
  const params = useParams();
  const examId = params.id as string;
  const [exam, setExam] = useState<Exam | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);
  const [questionType, setQuestionType] = useState('MULTIPLE_CHOICE');
  const [questionContent, setQuestionContent] = useState('');
  const questionContentRef = useRef<HTMLTextAreaElement | null>(null);
  const [questionPoints, setQuestionPoints] = useState('1');
  const [questionLanguage, setQuestionLanguage] = useState('PYTHON');
  const [questionFunctionName, setQuestionFunctionName] = useState('');
  const [questionFunctionParams, setQuestionFunctionParams] = useState('');
  const [questionOptions, setQuestionOptions] = useState<string[]>(['', '', '', '']);
  const [correctAnswerIndex, setCorrectAnswerIndex] = useState('0');
  const [questionCorrectAnswerText, setQuestionCorrectAnswerText] = useState('');
  const [questionMatchingPairs, setQuestionMatchingPairs] = useState<
    { left: string; right: string }[]
  >([
    { left: '', right: '' },
    { left: '', right: '' },
  ]);
  const [questionBlankAnswers, setQuestionBlankAnswers] = useState('');
  const [questionOrderingItems, setQuestionOrderingItems] = useState('');

  // New state variables for editing and test-cases
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [isManagingTestCases, setIsManagingTestCases] = useState(false);
  const [selectedQuestionForTestCases, setSelectedQuestionForTestCases] =
    useState<ExamQuestion | null>(null);
  const [newTestCaseInput, setNewTestCaseInput] = useState('');
  const [newTestCaseExpected, setNewTestCaseExpected] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [newTestCaseIsHidden, setNewTestCaseIsHidden] = useState(false);
  const [addMode, setAddMode] = useState<'bulk' | 'single'>('single');
  const [bulkTestCasesText, setBulkTestCasesText] = useState('');

  // Import state variables

  const [isImportOpen, setIsImportOpen] = useState(false);
  const [importSearch, setImportSearch] = useState('');
  const [importLoading, setImportLoading] = useState(false);
  const [allChallenges, setAllChallenges] = useState<PlatformChallenge[]>([]);
  const [selectedImportChallengeId, setSelectedImportChallengeId] = useState('');
  const [importPoints, setImportPoints] = useState('3');

  const fetchExam = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/exams/${examId}`);

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Ошибка при загрузке теста');
        return;
      }

      const data = await response.json();
      setExam(data.exam);
    } catch (err) {
      console.error('Error fetching exam:', err);
      setError('Ошибка при загрузке теста');
    } finally {
      setLoading(false);
    }
  }, [examId]);

  const fetchExamAndReturn = async () => {
    try {
      const response = await fetch(`/api/exams/${examId}`);
      if (response.ok) {
        const data = await response.json();
        setExam(data.exam);
        return data.exam as Exam;
      }
    } catch (err) {
      console.error('Error fetching exam:', err);
    }
    return null;
  };

  useEffect(() => {
    if (examId) {
      void fetchExam();
    }
  }, [examId, fetchExam]);

  const saveQuestion = async () => {
    if (!questionContent) {
      setError('Пожалуйста, введите текст вопроса');
      return;
    }

    if (questionType === 'MULTIPLE_CHOICE') {
      const nonEmptyOptions = questionOptions.filter((opt) => opt.trim().length > 0);
      if (nonEmptyOptions.length < 2) {
        setError('Пожалуйста, укажите минимум 2 варианта ответов');
        return;
      }
    }

    try {
      const body: Record<string, unknown> = {
        examId,
        type: questionType,
        content: questionContent,
        points: parseInt(questionPoints),
      };

      if (!editingQuestionId) {
        body.order = (exam?.questions?.length || 0) + 1;
      }

      if (questionType === 'CODE_TASK') {
        body.language = questionLanguage;
        body.functionName = questionFunctionName.trim() || null;
        body.functionParams = questionFunctionName.trim()
          ? questionFunctionParams
              .split(',')
              .map((p) => p.trim())
              .filter(Boolean)
          : null;
      } else if (questionType === 'MULTIPLE_CHOICE') {
        body.options = questionOptions.filter((opt) => opt.trim().length > 0);
        body.correctAnswers = [parseInt(correctAnswerIndex)];
      } else if (questionType === 'SHORT_ANSWER') {
        body.correctAnswerText = questionCorrectAnswerText.trim() || null;
      } else if (questionType === 'MATCHING') {
        body.matchingPairs = questionMatchingPairs.filter(
          (p) => p.left.trim().length > 0 && p.right.trim().length > 0,
        );
      } else if (questionType === 'FILL_IN_BLANK') {
        body.blankAnswers = questionBlankAnswers
          .split('\n')
          .map((a) => a.trim())
          .filter(Boolean);
      } else if (questionType === 'ORDERING') {
        body.orderingItems = questionOrderingItems
          .split('\n')
          .map((a) => a.trim())
          .filter(Boolean);
      } else {
        body.language = null;
        body.options = null;
        body.correctAnswers = null;
      }

      const url = editingQuestionId ? `/api/questions/${editingQuestionId}` : '/api/questions';
      const method = editingQuestionId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Ошибка при сохранении вопроса');
        return;
      }

      // Reset form and fetch updated exam
      setQuestionType('MULTIPLE_CHOICE');
      setQuestionContent('');
      setQuestionPoints('1');
      setQuestionOptions(['', '', '', '']);
      setCorrectAnswerIndex('0');
      setQuestionLanguage('PYTHON');
      setQuestionFunctionName('');
      setQuestionFunctionParams('');
      setQuestionCorrectAnswerText('');
      setQuestionMatchingPairs([
        { left: '', right: '' },
        { left: '', right: '' },
      ]);
      setQuestionBlankAnswers('');
      setQuestionOrderingItems('');
      setEditingQuestionId(null);
      setIsAddingQuestion(false);
      await fetchExam();
    } catch (err) {
      console.error('Error saving question:', err);
      setError('Ошибка при сохранении вопроса');
    }
  };

  const startEditingQuestion = (q: ExamQuestion) => {
    setEditingQuestionId(q.id);
    setQuestionType(q.type);
    setQuestionContent(q.content);
    setQuestionPoints(q.points.toString());
    setQuestionLanguage(q.language || 'PYTHON');
    setQuestionFunctionName(q.functionName || '');
    setQuestionFunctionParams((q.functionParams || []).join(', '));
    if (q.type === 'MULTIPLE_CHOICE') {
      const opts = q.options! || ['', '', '', ''];
      const correct = Array.isArray(q.correctAnswers) ? q.correctAnswers[0]?.toString() : '0';
      setQuestionOptions([...opts, '', '', '', ''].slice(0, 4));
      setCorrectAnswerIndex(correct || '0');
    }
    setQuestionCorrectAnswerText(q.correctAnswerText || '');
    setQuestionMatchingPairs(
      q.matchingPairs && q.matchingPairs.length > 0
        ? q.matchingPairs
        : [
            { left: '', right: '' },
            { left: '', right: '' },
          ],
    );
    setQuestionBlankAnswers((q.blankAnswers || []).join('\n'));
    setQuestionOrderingItems((q.orderingItems || []).join('\n'));
    setIsAddingQuestion(true);
  };

  const deleteQuestion = async (questionId: string) => {
    try {
      const response = await fetch(`/api/questions/${questionId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Ошибка при удалении вопроса');
        return;
      }

      await fetchExam();
    } catch (err) {
      console.error('Error deleting question:', err);
      setError('Ошибка при удалении вопроса');
    }
  };

  const addTestCase = async () => {
    if (!selectedQuestionForTestCases) return;
    if (!newTestCaseExpected) {
      setError('Пожалуйста, укажите ожидаемый результат');
      return;
    }

    if (selectedQuestionForTestCases.functionName) {
      try {
        JSON.parse(newTestCaseInput || '[]');
      } catch {
        setError('Аргументы должны быть валидным JSON-массивом, например [2, 3]');
        return;
      }
      try {
        JSON.parse(newTestCaseExpected);
      } catch {
        setError('Ожидаемый результат должен быть валидным JSON-значением, например 5 или "ok"');
        return;
      }
    }

    try {
      const response = await fetch('/api/test-cases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questionId: selectedQuestionForTestCases.id,
          input: newTestCaseInput,
          expectedOutput: newTestCaseExpected,
          points: 1,
          timeout: 5000,
          isHidden: newTestCaseIsHidden,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Ошибка при добавлении тест-кейса');
        return;
      }

      setNewTestCaseInput('');
      setNewTestCaseExpected('');
      setNewTestCaseIsHidden(false);

      const updatedExam = await fetchExamAndReturn();
      if (updatedExam) {
        const q = updatedExam.questions.find((x) => x.id === selectedQuestionForTestCases.id);
        if (q) setSelectedQuestionForTestCases(q);
      }
    } catch (err) {
      console.error('Error adding testcase:', err);
      setError('Ошибка при добавлении тест-кейса');
    }
  };

  const addBulkTestCases = async () => {
    if (!selectedQuestionForTestCases) return;
    if (!bulkTestCasesText.trim()) {
      setError('Пожалуйста, введите тесты');
      return;
    }

    try {
      setError(null);
      const parsed: { input: string; expectedOutput: string }[] = [];

      // Check if it's block-based format
      if (bulkTestCasesText.includes('===') || bulkTestCasesText.includes('---')) {
        const blocks = bulkTestCasesText.split(/===/);
        for (const block of blocks) {
          if (!block.trim()) continue;

          let inputText = '';
          let outputText = '';

          // Match input and output using RegExp.exec
          const inputRegex = /(?:---|Ввод:?|input:?)\s*([\s\S]*?)(?:---|Вывод:?|output:?)/i;
          const outputRegex = /(?:Вывод:?|output:?)\s*([\s\S]*)$/i;

          const inputMatch = inputRegex.exec(block);
          const outputMatch = outputRegex.exec(block);

          const matchedInput = inputMatch?.[1];
          if (matchedInput) {
            inputText = matchedInput.trim();
          }
          const matchedOutput = outputMatch?.[1];
          if (matchedOutput) {
            outputText = matchedOutput.trim();
          } else {
            const lines = block
              .split('\n')
              .map((l) => l.trim())
              .filter(Boolean);
            if (lines.length >= 2) {
              inputText = lines[0] || '';
              outputText = lines[1] || '';
            }
          }

          if (outputText) {
            parsed.push({ input: inputText, expectedOutput: outputText });
          }
        }
      } else {
        // Line-by-line format: input -> output
        const lines = bulkTestCasesText.split('\n');
        for (const line of lines) {
          if (!line.trim()) continue;
          const parts = line.split('->');
          if (parts.length >= 2) {
            parsed.push({
              input: parts[0]?.trim() || '',
              expectedOutput: parts[1]?.trim() || '',
            });
          } else {
            const partsSpace = line.trim().split(/\s+/);
            if (partsSpace.length >= 2) {
              const expected = partsSpace[partsSpace.length - 1] || '';
              const input = partsSpace.slice(0, partsSpace.length - 1).join(' ');
              parsed.push({
                input,
                expectedOutput: expected,
              });
            }
          }
        }
      }

      if (parsed.length === 0) {
        setError('Не удалось распознать тесты. Проверьте формат (например, 2 3 -> 5).');
        return;
      }

      // Add all parsed test cases
      for (const tc of parsed) {
        await fetch('/api/test-cases', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            questionId: selectedQuestionForTestCases.id,
            input: tc.input,
            expectedOutput: tc.expectedOutput,
            points: 1,
            timeout: 5000,
            isHidden: newTestCaseIsHidden,
          }),
        });
      }

      setBulkTestCasesText('');
      setNewTestCaseIsHidden(false);

      const updatedExam = await fetchExamAndReturn();
      if (updatedExam) {
        const q = updatedExam.questions.find((x) => x.id === selectedQuestionForTestCases.id);
        if (q) setSelectedQuestionForTestCases(q);
      }
    } catch (err) {
      console.error('Error batch adding testcases:', err);
      setError('Ошибка при пакетном добавлении тест-кейсов');
    }
  };

  const deleteTestCase = async (id: string) => {
    if (!selectedQuestionForTestCases) return;
    try {
      const response = await fetch(`/api/test-cases/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Ошибка при удалении тест-кейса');
        return;
      }

      const updatedExam = await fetchExamAndReturn();
      if (updatedExam) {
        const q = updatedExam.questions.find((x) => x.id === selectedQuestionForTestCases.id);
        if (q) setSelectedQuestionForTestCases(q);
      }
    } catch (err) {
      console.error('Error deleting test case:', err);
      setError('Ошибка при удалении тест-кейса');
    }
  };

  const activateExam = async () => {
    try {
      const response = await fetch(`/api/exams/${examId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'ACTIVE',
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Ошибка при активации теста');
        return;
      }

      await fetchExam();
    } catch (err) {
      console.error('Error activating exam:', err);
      setError('Ошибка при активации теста');
    }
  };

  const handleCopy = () => {
    void navigator.clipboard.writeText(shareUrl);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const fetchChallenges = useCallback(async () => {
    try {
      setImportLoading(true);
      const response = await fetch('/api/teacher/challenges');
      if (response.ok) {
        const data = await response.json();
        setAllChallenges(data.challenges || []);
      }
    } catch (err) {
      console.error('Error fetching challenges:', err);
    } finally {
      setImportLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isImportOpen) {
      void fetchChallenges();
    }
  }, [isImportOpen, fetchChallenges]);

  const importChallenge = async () => {
    if (!selectedImportChallengeId) {
      setError('Выберите задачу для импорта');
      return;
    }
    try {
      setImportLoading(true);
      const response = await fetch('/api/teacher/import-challenge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          examId,
          challengeId: selectedImportChallengeId,
          points: parseInt(importPoints) || 3,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Ошибка при импорте задачи');
        return;
      }

      setIsImportOpen(false);
      setSelectedImportChallengeId('');
      setImportPoints('3');
      setImportSearch('');
      await fetchExam();
    } catch (err) {
      console.error('Error importing challenge:', err);
      setError('Ошибка при импорте задачи');
    } finally {
      setImportLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-lg">Загрузка...</p>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="container mx-auto py-10">
        <p className="text-lg text-red-600">Тест не найден</p>
      </div>
    );
  }

  const shareUrl = `${window.location.origin}/exam/${exam.shareToken}`;

  return (
    <div className="container mx-auto min-h-screen bg-zinc-950 px-4 py-10 text-white">
      {error ? (
        <div className="mb-4 rounded-xl border border-red-950 bg-red-950/40 p-4 text-sm text-red-400">
          {error}
        </div>
      ) : null}

      <div className="mb-8">
        <div className="mb-4 flex flex-col justify-between gap-4 md:flex-row md:items-start">
          <div>
            <h1 className="mb-2 bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-3xl font-extrabold text-transparent">
              {exam.title}
            </h1>
            <p className="mb-3 text-sm text-zinc-400">{exam.description}</p>
            <div className="flex items-center gap-3 text-xs font-semibold">
              <Badge className="border-zinc-800 bg-zinc-800 text-zinc-300">
                {exam.status === 'DRAFT' ? 'Черновик' : 'Активен'}
              </Badge>
              <span className="text-zinc-500">
                Класс: <span className="text-zinc-300">{exam.classLevel}</span>
              </span>
            </div>
          </div>
          {exam.status === 'DRAFT' && (
            <Button
              onClick={activateExam}
              className="rounded-xl border-0 bg-green-600 py-5 font-bold text-white hover:bg-green-700"
            >
              Активировать тест
            </Button>
          )}
        </div>

        {exam.status === 'ACTIVE' && (
          <Card className="border-amber-500/20 bg-gradient-to-r from-amber-500/5 to-orange-500/5 p-6 shadow-md dark:border-amber-500/10">
            <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-amber-500">
              🚀 Тест активен! Поделитесь ссылкой со студентами:
            </h3>
            <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
              <div className="border-zinc-850 flex flex-1 items-center justify-between gap-3 rounded-xl border bg-zinc-950 p-3.5 font-mono text-sm text-neutral-200 shadow-inner">
                <span className="break-all font-semibold">{shareUrl}</span>
              </div>
              <Button
                onClick={handleCopy}
                className={`rounded-xl px-6 py-3.5 font-bold text-white transition-all duration-300 ${
                  isCopied
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'border-0 bg-gradient-to-r from-amber-600 to-orange-600 shadow-md hover:from-amber-500 hover:to-orange-500 hover:shadow-lg'
                }`}
              >
                {isCopied ? '✓ Скопировано!' : 'Копировать'}
              </Button>
            </div>
          </Card>
        )}
      </div>

      <div className="mb-8">
        <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <h2 className="text-2xl font-bold text-white">Вопросы ({exam.questions.length})</h2>

          <div className="flex flex-wrap gap-2">
            {/* Platform Challenges Import Button */}
            <Button
              onClick={() => setIsImportOpen(true)}
              className="flex items-center gap-1.5 rounded-xl border-0 bg-amber-600 py-5 font-bold text-white hover:bg-amber-700"
            >
              <BookOpen className="h-4 w-4" /> База задач ЛитКот
            </Button>

            {/* Manual Add Question */}
            <Button
              onClick={() => setIsAddingQuestion(true)}
              className="bg-zinc-850 border-zinc-750 flex items-center gap-1.5 rounded-xl border py-5 font-bold text-white hover:bg-zinc-800"
            >
              <Plus className="h-4 w-4" /> Добавить вручную
            </Button>
          </div>
        </div>

        {/* Manual Add/Edit Question Dialog */}
        <Dialog
          open={isAddingQuestion}
          onOpenChange={(open) => {
            setIsAddingQuestion(open);
            if (!open) {
              setEditingQuestionId(null);
              setQuestionType('MULTIPLE_CHOICE');
              setQuestionContent('');
              setQuestionPoints('1');
              setQuestionOptions(['', '', '', '']);
              setCorrectAnswerIndex('0');
              setQuestionFunctionName('');
              setQuestionFunctionParams('');
              setQuestionCorrectAnswerText('');
              setQuestionMatchingPairs([
                { left: '', right: '' },
                { left: '', right: '' },
              ]);
              setQuestionBlankAnswers('');
              setQuestionOrderingItems('');
            }
          }}
        >
          <DialogContent className="max-h-[88vh] max-w-4xl overflow-y-auto rounded-2xl border-zinc-800 bg-zinc-900 text-white">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-white">
                {editingQuestionId ? 'Редактировать вопрос' : 'Добавить новый вопрос'}
              </DialogTitle>
            </DialogHeader>
            <div className="mt-4 space-y-4 text-sm">
              <div className="space-y-1.5">
                <Label htmlFor="type" className="text-xs font-bold uppercase text-neutral-400">
                  Тип вопроса
                </Label>
                <select
                  id="type"
                  value={questionType}
                  onChange={(e) => setQuestionType(e.target.value)}
                  className="w-full rounded-xl border-zinc-800 bg-zinc-950 px-3 py-2.5 text-white focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500/30"
                >
                  <option value="MULTIPLE_CHOICE">Множественный выбор</option>
                  <option value="CODE_TASK">Задача программирования</option>
                  <option value="SHORT_ANSWER">Короткий ответ</option>
                  <option value="MATCHING">Сопоставление пар</option>
                  <option value="FILL_IN_BLANK">Заполнить пропуски</option>
                  <option value="ORDERING">Упорядочивание</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="content" className="text-xs font-bold uppercase text-neutral-400">
                  Текст вопроса
                </Label>
                <div className="flex items-center gap-1 rounded-t-xl border border-b-0 border-zinc-800 bg-zinc-950/60 p-1.5">
                  {MARKDOWN_TOOLBAR_ACTIONS.map((action) => {
                    const ActionIcon = action.icon;
                    return (
                      <button
                        key={action.title}
                        type="button"
                        title={action.title}
                        onClick={() =>
                          applyMarkdownWrap(
                            questionContentRef.current,
                            questionContent,
                            setQuestionContent,
                            action.before,
                            action.after,
                            action.placeholder,
                          )
                        }
                        className="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-amber-400"
                      >
                        <ActionIcon className="h-3.5 w-3.5" />
                      </button>
                    );
                  })}
                </div>
                <textarea
                  id="content"
                  ref={questionContentRef}
                  value={questionContent}
                  onChange={(e) => setQuestionContent(e.target.value)}
                  placeholder="Введите текст вопроса..."
                  className="w-full rounded-b-xl rounded-t-none border-zinc-800 bg-zinc-950 px-3 py-2.5 text-white focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500/30"
                  rows={4}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="points" className="text-xs font-bold uppercase text-neutral-400">
                  Баллы
                </Label>
                <Input
                  id="points"
                  type="number"
                  min="1"
                  value={questionPoints}
                  onChange={(e) => setQuestionPoints(e.target.value)}
                  className="rounded-xl border-zinc-800 bg-zinc-950 px-3 py-2.5 text-white focus:border-amber-500 focus:ring-amber-500/20"
                />
              </div>

              {questionType === 'CODE_TASK' && (
                <div className="space-y-1.5">
                  <Label
                    htmlFor="language"
                    className="text-xs font-bold uppercase text-neutral-400"
                  >
                    Язык программирования
                  </Label>
                  <select
                    id="language"
                    value={questionLanguage}
                    onChange={(e) => setQuestionLanguage(e.target.value)}
                    className="w-full rounded-xl border-zinc-800 bg-zinc-950 px-3 py-2.5 text-white focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500/30"
                  >
                    <option value="PYTHON">Python</option>
                    <option value="JAVASCRIPT">JavaScript</option>
                    <option value="TYPESCRIPT">TypeScript</option>
                    <option value="JAVA">Java</option>
                    <option value="CPP">C++</option>
                  </select>
                </div>
              )}

              {questionType === 'CODE_TASK' && (
                <div className="space-y-3 rounded-xl border border-zinc-800 bg-zinc-950/40 p-4">
                  <p className="text-xs leading-relaxed text-zinc-400">
                    Укажите имя функции, которую должен реализовать ученик — платформа сама вызовет
                    её с тестовыми аргументами и сравнит результат. Не нужно писать ручную обработку
                    ввода и вывода ни ученику, ни вам.
                  </p>
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="function-name"
                      className="text-xs font-bold uppercase text-neutral-400"
                    >
                      Имя функции
                    </Label>
                    <Input
                      id="function-name"
                      value={questionFunctionName}
                      onChange={(e) => setQuestionFunctionName(e.target.value)}
                      placeholder="Например: max_depth"
                      className="rounded-xl border-zinc-800 bg-zinc-950 px-3 py-2.5 font-mono text-white focus:border-amber-500 focus:ring-amber-500/20"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="function-params"
                      className="text-xs font-bold uppercase text-neutral-400"
                    >
                      Параметры (через запятую)
                    </Label>
                    <Input
                      id="function-params"
                      value={questionFunctionParams}
                      onChange={(e) => setQuestionFunctionParams(e.target.value)}
                      placeholder="Например: nums, target"
                      className="rounded-xl border-zinc-800 bg-zinc-950 px-3 py-2.5 font-mono text-white focus:border-amber-500 focus:ring-amber-500/20"
                    />
                  </div>
                </div>
              )}

              {questionType === 'MULTIPLE_CHOICE' && (
                <div className="space-y-3">
                  <Label className="text-xs font-bold uppercase text-neutral-400">
                    Варианны ответов
                  </Label>
                  {questionOptions.map((option, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="correct"
                        checked={parseInt(correctAnswerIndex) === idx}
                        onChange={() => setCorrectAnswerIndex(idx.toString())}
                        className="bg-zinc-955 h-4 w-4 border-zinc-800 text-amber-500 focus:ring-amber-500/20"
                      />
                      <Input
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...questionOptions];
                          newOptions[idx] = e.target.value;
                          setQuestionOptions(newOptions);
                        }}
                        placeholder={`Вариант ${idx + 1}`}
                        className="bg-zinc-955 rounded-xl border-zinc-800 px-3 py-2.5 text-white"
                      />
                    </div>
                  ))}
                  <p className="text-xs text-zinc-500">Выберите правильный ответ</p>
                </div>
              )}

              {questionType === 'SHORT_ANSWER' && (
                <div className="space-y-1.5">
                  <Label
                    htmlFor="correct-answer-text"
                    className="text-xs font-bold uppercase text-neutral-400"
                  >
                    Эталонный ответ
                  </Label>
                  <Input
                    id="correct-answer-text"
                    value={questionCorrectAnswerText}
                    onChange={(e) => setQuestionCorrectAnswerText(e.target.value)}
                    placeholder="Например: фотосинтез"
                    className="rounded-xl border-zinc-800 bg-zinc-950 px-3 py-2.5 text-white focus:border-amber-500 focus:ring-amber-500/20"
                  />
                  <p className="text-xs text-zinc-500">
                    Ответ ученика сверяется автоматически, без учёта регистра и пробелов.
                  </p>
                </div>
              )}

              {questionType === 'MATCHING' && (
                <div className="space-y-3">
                  <Label className="text-xs font-bold uppercase text-neutral-400">
                    Пары для сопоставления
                  </Label>
                  {questionMatchingPairs.map((pair, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <Input
                        value={pair.left}
                        onChange={(e) => {
                          const next = [...questionMatchingPairs];
                          next[idx] = { left: e.target.value, right: next[idx]?.right || '' };
                          setQuestionMatchingPairs(next);
                        }}
                        placeholder={`Термин ${idx + 1}`}
                        className="bg-zinc-955 rounded-xl border-zinc-800 px-3 py-2.5 text-white"
                      />
                      <span className="text-zinc-500">↔</span>
                      <Input
                        value={pair.right}
                        onChange={(e) => {
                          const next = [...questionMatchingPairs];
                          next[idx] = { left: next[idx]?.left || '', right: e.target.value };
                          setQuestionMatchingPairs(next);
                        }}
                        placeholder={`Определение ${idx + 1}`}
                        className="bg-zinc-955 rounded-xl border-zinc-800 px-3 py-2.5 text-white"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setQuestionMatchingPairs(
                            questionMatchingPairs.filter((_, i) => i !== idx),
                          )
                        }
                        className="p-2 text-zinc-500 hover:text-red-400"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      setQuestionMatchingPairs([...questionMatchingPairs, { left: '', right: '' }])
                    }
                    className="bg-zinc-955 rounded-xl border-zinc-800 hover:bg-zinc-800 hover:text-white"
                  >
                    <Plus className="h-4 w-4" /> Добавить пару
                  </Button>
                  <p className="text-xs text-zinc-500">
                    Ученик увидит термины слева и определения справа в случайном порядке — нужно
                    выбрать подходящее определение для каждого термина.
                  </p>
                </div>
              )}

              {questionType === 'FILL_IN_BLANK' && (
                <div className="space-y-1.5">
                  <Label
                    htmlFor="blank-answers"
                    className="text-xs font-bold uppercase text-neutral-400"
                  >
                    Правильные ответы (по одному на строку, по порядку пропусков)
                  </Label>
                  <textarea
                    id="blank-answers"
                    value={questionBlankAnswers}
                    onChange={(e) => setQuestionBlankAnswers(e.target.value)}
                    placeholder={'фотосинтез\nхлорофилл'}
                    className="w-full rounded-xl border-zinc-800 bg-zinc-950 px-3 py-2.5 font-mono text-white focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500/30"
                    rows={4}
                  />
                  <p className="text-xs text-zinc-500">
                    Отмечайте пропуски в тексте вопроса так: «Растения получают энергию через ___».
                    Каждый пропуск — отдельная строка здесь, в том же порядке.
                  </p>
                </div>
              )}

              {questionType === 'ORDERING' && (
                <div className="space-y-1.5">
                  <Label
                    htmlFor="ordering-items"
                    className="text-xs font-bold uppercase text-neutral-400"
                  >
                    Элементы в правильном порядке (по одному на строку)
                  </Label>
                  <textarea
                    id="ordering-items"
                    value={questionOrderingItems}
                    onChange={(e) => setQuestionOrderingItems(e.target.value)}
                    placeholder={'Шаг 1: ...\nШаг 2: ...\nШаг 3: ...'}
                    className="w-full rounded-xl border-zinc-800 bg-zinc-950 px-3 py-2.5 font-mono text-white focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500/30"
                    rows={4}
                  />
                  <p className="text-xs text-zinc-500">
                    Ученик увидит элементы в перемешанном порядке и должен расставить их так же, как
                    здесь.
                  </p>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button
                  onClick={saveQuestion}
                  className="rounded-xl border-0 bg-gradient-to-r from-amber-600 to-orange-600 font-bold text-white hover:from-amber-500 hover:to-orange-500"
                >
                  {editingQuestionId ? 'Сохранить' : 'Добавить'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsAddingQuestion(false)}
                  className="bg-zinc-955 rounded-xl border-zinc-800 hover:bg-zinc-800 hover:text-white"
                >
                  Отмена
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Import Challenges Dialog */}
        <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
          <DialogContent className="max-h-[88vh] max-w-3xl overflow-y-auto rounded-2xl border-zinc-800 bg-zinc-900 text-white">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl font-bold text-white">
                <BookOpen className="h-5 w-5" /> <span>База задач ЛитКот</span>
              </DialogTitle>
            </DialogHeader>
            <div className="mt-4 space-y-4 text-sm">
              <p className="text-left text-xs text-zinc-400">
                Выберите любую готовую задачу платформы для автоматического добавления ее в тест как
                задачу по программированию с автотестами.
              </p>

              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                <Input
                  placeholder="Поиск по названию задачи..."
                  className="border-zinc-800 bg-zinc-950 pl-9 text-sm text-white"
                  value={importSearch}
                  onChange={(e) => setImportSearch(e.target.value)}
                />
              </div>

              {/* List of platform challenges */}
              <div className="max-h-56 divide-y divide-zinc-900 overflow-y-auto rounded-xl border border-zinc-800 bg-zinc-950 text-left">
                {importLoading ? (
                  <div className="py-8 text-center text-xs text-zinc-500">
                    Загрузка базы задач...
                  </div>
                ) : allChallenges.length === 0 ? (
                  <div className="py-8 text-center text-xs text-zinc-500">Задачи не найдены</div>
                ) : (
                  allChallenges
                    .filter((ch) => ch.name.toLowerCase().includes(importSearch.toLowerCase()))
                    .map((ch) => {
                      const isSelected = selectedImportChallengeId === ch.id.toString();
                      return (
                        <div
                          key={ch.id}
                          onClick={() => setSelectedImportChallengeId(ch.id.toString())}
                          className={`flex cursor-pointer items-center justify-between p-3 text-xs transition-all ${
                            isSelected
                              ? 'bg-amber-500/10 font-bold text-amber-400'
                              : 'text-zinc-300 hover:bg-zinc-900/50'
                          }`}
                        >
                          <div className="space-y-0.5">
                            <div className="font-bold">{ch.name}</div>
                            <div className="text-[10px] text-zinc-500">{ch.shortDescription}</div>
                          </div>
                          <Badge
                            variant="outline"
                            className="border-zinc-800 text-[9px] font-bold uppercase text-zinc-400"
                          >
                            {ch.difficulty}
                          </Badge>
                        </div>
                      );
                    })
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5 text-left">
                  <Label
                    htmlFor="import-points"
                    className="text-xs font-bold uppercase text-neutral-400"
                  >
                    Баллы за решение
                  </Label>
                  <Input
                    id="import-points"
                    type="number"
                    min="1"
                    value={importPoints}
                    onChange={(e) => setImportPoints(e.target.value)}
                    className="rounded-xl border-zinc-800 bg-zinc-950 text-white focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  onClick={importChallenge}
                  disabled={importLoading || !selectedImportChallengeId}
                  className="flex-1 rounded-xl border-0 bg-amber-600 px-5 font-bold text-white hover:bg-amber-700"
                >
                  {importLoading ? 'Импорт...' : 'Импортировать в тест'}
                </Button>
                <Button
                  variant="outline"
                  disabled={importLoading}
                  onClick={() => setIsImportOpen(false)}
                  className="bg-zinc-955 rounded-xl border-zinc-800 hover:bg-zinc-800 hover:text-white"
                >
                  Отмена
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <div className="space-y-4">
          {exam.questions.length === 0 ? (
            <Card className="rounded-2xl border-zinc-800 bg-zinc-900/40 p-8 text-center shadow-xl">
              <p className="text-zinc-400">Нет вопросов. Добавьте первый вопрос.</p>
            </Card>
          ) : (
            exam.questions.map((question, index) => (
              <Card
                key={question.id}
                className="rounded-2xl border-zinc-800 bg-zinc-900/40 p-5 shadow-xl transition-colors hover:border-zinc-700"
              >
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                  <div className="flex-1">
                    <h3 className="mb-2 text-lg font-bold text-white">
                      Вопрос {index + 1}: {question.content}
                    </h3>
                    <div className="flex flex-wrap gap-4 text-xs font-bold uppercase tracking-wider text-zinc-500">
                      <span>
                        Тип:{' '}
                        <span className="text-zinc-300">
                          {QUESTION_TYPE_LABELS[question.type] || question.type}
                        </span>
                      </span>
                      <span>
                        Баллы: <span className="text-zinc-300">{question.points}</span>
                      </span>
                      {question.language ? (
                        <span>
                          Язык: <span className="text-zinc-300">{question.language}</span>
                        </span>
                      ) : null}
                      {question.type === 'CODE_TASK' && (
                        <span>
                          Тестов:{' '}
                          <span className="text-zinc-300">{question.testCases?.length || 0}</span>
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {question.type === 'CODE_TASK' && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-xl border-amber-500/20 bg-amber-500/5 text-amber-400 hover:bg-amber-500/10 hover:text-white"
                        onClick={() => {
                          setSelectedQuestionForTestCases(question);
                          setIsManagingTestCases(true);
                        }}
                      >
                        Тесты
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-xl border-zinc-800 bg-zinc-900 text-neutral-300 hover:bg-zinc-800 hover:text-white"
                      onClick={() => startEditingQuestion(question)}
                    >
                      Редактировать
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="rounded-xl border-0 bg-red-950/40 text-red-400 hover:bg-red-900 hover:text-white"
                      onClick={() => deleteQuestion(question.id)}
                    >
                      Удалить
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Test Cases Management Dialog */}
      <Dialog open={isManagingTestCases} onOpenChange={setIsManagingTestCases}>
        <DialogContent className="max-h-[88vh] max-w-5xl overflow-y-auto rounded-2xl border-zinc-800 bg-zinc-900 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white">
              Управление тест-кейсами для задачи
            </DialogTitle>
          </DialogHeader>
          {selectedQuestionForTestCases ? (
            <div className="mt-4 space-y-6 text-sm font-normal">
              <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-neutral-500">
                  Задача:
                </p>
                <p className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-zinc-300">
                  {selectedQuestionForTestCases.content}
                </p>
              </div>

              {/* Explanation Card for Teacher */}
              {selectedQuestionForTestCases.functionName ? (
                <div className="p-4.5 space-y-2 rounded-xl border border-zinc-800 bg-zinc-950/40 text-xs leading-relaxed text-zinc-400">
                  <p className="flex items-center gap-1.5 font-bold text-neutral-300">
                    <Info className="h-3.5 w-3.5 text-amber-500" /> Как работает автоматическая
                    проверка?
                  </p>
                  <p>
                    Платформа сама вызывает функцию{' '}
                    <code className="font-mono text-amber-400">
                      {selectedQuestionForTestCases.functionName}(
                      {(selectedQuestionForTestCases.functionParams || []).join(', ')})
                    </code>{' '}
                    с вашими аргументами и сравнивает возвращённое значение с ожидаемым результатом.
                  </p>
                  <p>
                    Аргументы и результат указываются в формате JSON. Для функции с параметрами{' '}
                    <code className="text-neutral-200">
                      ({(selectedQuestionForTestCases.functionParams || []).join(', ')})
                    </code>{' '}
                    введите аргументы как JSON-массив, например{' '}
                    <code className="text-neutral-200">[5, 3]</code>, а ожидаемый результат — как
                    обычное JSON-значение, например <code className="text-neutral-200">8</code> или{' '}
                    <code className="text-neutral-200">[1, 2, 3]</code>.
                  </p>
                </div>
              ) : (
                <div className="p-4.5 space-y-2 rounded-xl border border-zinc-800 bg-zinc-950/40 text-xs leading-relaxed text-zinc-400">
                  <p className="flex items-center gap-1.5 font-bold text-neutral-300">
                    <Info className="h-3.5 w-3.5 text-amber-500" /> Как работает автоматическая
                    проверка?
                  </p>
                  <p>
                    У этой задачи не указана функция, поэтому тестирующая система запускает код
                    ученика в изолированной среде, передавая входные данные и считывая то, что
                    программа вывела на экран.
                  </p>
                  <p>
                    Совет: укажите имя функции и параметры при редактировании вопроса — тогда не
                    придётся настраивать ручной ввод и вывод данных ни себе, ни ученику.
                  </p>
                </div>
              )}

              {/* Mode Select Buttons */}
              <div className="flex gap-2 border-b border-zinc-800 pb-2">
                <button
                  type="button"
                  onClick={() => setAddMode('single')}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                    addMode === 'single'
                      ? 'border border-amber-500/30 bg-amber-500/10 font-bold text-amber-400'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Один тест
                </button>
                <button
                  type="button"
                  onClick={() => setAddMode('bulk')}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                    addMode === 'bulk'
                      ? 'border border-amber-500/30 bg-amber-500/10 font-bold text-amber-400'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Пакетное добавление
                </button>
              </div>

              {/* Add testcase form */}
              {addMode === 'single' ? (
                <div className="space-y-4 rounded-xl border border-amber-500/20 bg-gradient-to-r from-amber-500/5 to-orange-500/5 p-5">
                  <h4 className="text-sm font-bold text-amber-400">Добавить новый тест-кейс</h4>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="tc-input"
                        className="text-xs font-bold uppercase text-neutral-400"
                      >
                        {selectedQuestionForTestCases.functionName
                          ? 'Аргументы (JSON-массив)'
                          : 'Входные данные'}
                      </Label>
                      <textarea
                        id="tc-input"
                        value={newTestCaseInput}
                        onChange={(e) => setNewTestCaseInput(e.target.value)}
                        placeholder={
                          selectedQuestionForTestCases.functionName
                            ? 'Например: [2, 3]'
                            : 'Например: 2 3'
                        }
                        className="w-full rounded-xl border-zinc-800 bg-zinc-950 px-3 py-2.5 font-mono text-xs text-white focus:border-amber-500 focus:outline-none"
                        rows={3}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label
                        htmlFor="tc-expected"
                        className="text-xs font-bold uppercase text-neutral-400"
                      >
                        {selectedQuestionForTestCases.functionName
                          ? 'Ожидаемый результат (JSON) *'
                          : 'Ожидаемый результат *'}
                      </Label>
                      <textarea
                        id="tc-expected"
                        value={newTestCaseExpected}
                        onChange={(e) => setNewTestCaseExpected(e.target.value)}
                        placeholder="Например: 5"
                        className="w-full rounded-xl border-zinc-800 bg-zinc-950 px-3 py-2.5 font-mono text-xs text-white focus:border-amber-500 focus:outline-none"
                        rows={3}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="flex cursor-pointer items-center gap-2 text-xs text-zinc-300">
                      <input
                        type="checkbox"
                        checked={newTestCaseIsHidden}
                        onChange={(e) => setNewTestCaseIsHidden(e.target.checked)}
                        className="h-4 w-4 rounded border-zinc-800 bg-zinc-950 text-amber-500 focus:ring-amber-500/20"
                      />
                      <span>Скрытый тест-кейс (ученик не увидит входные/выходные данные)</span>
                    </label>

                    <Button
                      onClick={addTestCase}
                      className="rounded-xl border-0 bg-gradient-to-r from-amber-600 to-orange-600 font-bold text-white hover:from-amber-500 hover:to-orange-500"
                    >
                      Добавить тест-кейс
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 rounded-xl border border-amber-500/20 bg-gradient-to-r from-amber-500/5 to-orange-500/5 p-5">
                  <h4 className="text-sm font-bold text-amber-400">Пакетное добавление тестов</h4>
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="tc-bulk"
                      className="text-xs font-bold uppercase text-neutral-400"
                    >
                      Список тестов в формате ВХОДНЫЕ ДАННЫЕ {'->'} РЕЗУЛЬТАТ (каждый с новой
                      строки)
                    </Label>
                    <textarea
                      id="tc-bulk"
                      value={bulkTestCasesText}
                      onChange={(e) => setBulkTestCasesText(e.target.value)}
                      placeholder="Например:&#10;2 3 -> 5&#10;10 20 -> 30"
                      className="w-full rounded-xl border-zinc-800 bg-zinc-950 px-3 py-2.5 font-mono text-xs text-white focus:border-amber-500 focus:outline-none"
                      rows={6}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="flex cursor-pointer items-center gap-2 text-xs text-zinc-300">
                      <input
                        type="checkbox"
                        checked={newTestCaseIsHidden}
                        onChange={(e) => setNewTestCaseIsHidden(e.target.checked)}
                        className="h-4 w-4 rounded border-zinc-800 bg-zinc-950 text-amber-500 focus:ring-amber-500/20"
                      />
                      <span>Все эти тесты скрытые</span>
                    </label>

                    <Button
                      onClick={addBulkTestCases}
                      className="rounded-xl border-0 bg-gradient-to-r from-amber-600 to-orange-600 font-bold text-white hover:from-amber-500 hover:to-orange-500"
                    >
                      Добавить пакет тестов
                    </Button>
                  </div>
                </div>
              )}

              {/* List testcases */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-white">Список текущих тестов</h4>
                {!selectedQuestionForTestCases.testCases ||
                selectedQuestionForTestCases.testCases.length === 0 ? (
                  <p className="text-xs text-neutral-500">
                    У этой задачи еще нет тест-кейсов. Добавьте первый тест выше.
                  </p>
                ) : (
                  <div className="max-h-64 divide-y divide-zinc-800 overflow-y-auto rounded-xl border border-zinc-800 bg-zinc-950">
                    {selectedQuestionForTestCases.testCases.map((tc) => (
                      <div
                        key={tc.id}
                        className="flex items-start justify-between gap-3 bg-zinc-900/30 p-3.5 text-xs"
                      >
                        <div className="grid flex-1 grid-cols-2 gap-4">
                          <div>
                            <span className="text-[10px] font-bold uppercase text-neutral-500">
                              {selectedQuestionForTestCases.functionName ? 'Аргументы:' : 'Ввод:'}
                            </span>
                            <pre className="border-zinc-850 mt-1.5 overflow-x-auto whitespace-pre rounded-lg border bg-zinc-950 p-2 font-mono text-[11px] text-zinc-300">
                              {tc.input || '(пусто)'}
                            </pre>
                          </div>
                          <div>
                            <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-neutral-500">
                              Ожидаемый вывод:
                              {tc.isHidden ? (
                                <span className="py-0.2 rounded border border-zinc-700 bg-zinc-800 px-1.5 font-mono text-[9px] text-amber-500">
                                  Скрытый
                                </span>
                              ) : null}
                            </span>
                            <pre className="border-zinc-850 mt-1.5 overflow-x-auto whitespace-pre rounded-lg border bg-zinc-950 p-2 font-mono text-[11px] text-zinc-300">
                              {tc.expectedOutput}
                            </pre>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="self-center rounded-lg text-red-500 hover:bg-red-950/40 hover:text-red-400"
                          onClick={() => deleteTestCase(tc.id)}
                        >
                          Удалить
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
