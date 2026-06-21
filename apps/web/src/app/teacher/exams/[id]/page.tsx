'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@repo/ui/components/button';
import { Card } from '@repo/ui/components/card';
import { Badge } from '@repo/ui/components/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@repo/ui/components/dialog';
import { Input } from '@repo/ui/components/input';
import { Label } from '@repo/ui/components/label';
import { SearchIcon } from '@repo/ui/icons';

interface ExamQuestion {
  id: string;
  order: number;
  type: string;
  content: string;
  points: number;
  language?: string;
  testCases: {
    id: string;
    input: string;
    expectedOutput: string;
  }[];
  options?: string[];
  correctAnswers?: number[];
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

export default function ExamEditorPage() {
  const params = useParams();
  const examId = params.id as string;
  const [exam, setExam] = useState<Exam | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);
  const [questionType, setQuestionType] = useState('MULTIPLE_CHOICE');
  const [questionContent, setQuestionContent] = useState('');
  const [questionPoints, setQuestionPoints] = useState('1');
  const [questionLanguage, setQuestionLanguage] = useState('PYTHON');
  const [questionOptions, setQuestionOptions] = useState<string[]>(['', '', '', '']);
  const [correctAnswerIndex, setCorrectAnswerIndex] = useState('0');

  // New state variables for editing and test-cases
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [isManagingTestCases, setIsManagingTestCases] = useState(false);
  const [selectedQuestionForTestCases, setSelectedQuestionForTestCases] = useState<ExamQuestion | null>(null);
  const [newTestCaseInput, setNewTestCaseInput] = useState('');
  const [newTestCaseExpected, setNewTestCaseExpected] = useState('');
  const [isCopied, setIsCopied] = useState(false);

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
      } else if (questionType === 'MULTIPLE_CHOICE') {
        body.options = questionOptions.filter((opt) => opt.trim().length > 0);
        body.correctAnswers = [parseInt(correctAnswerIndex)];
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
    if (q.type === 'MULTIPLE_CHOICE') {
      const opts = q.options! || ['', '', '', ''];
      const correct = Array.isArray(q.correctAnswers) ? q.correctAnswers[0]?.toString() : '0';
      setQuestionOptions([...opts, '', '', '', ''].slice(0, 4));
      setCorrectAnswerIndex(correct || '0');
    }
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
          isHidden: false,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Ошибка при добавлении тест-кейса');
        return;
      }

      setNewTestCaseInput('');
      setNewTestCaseExpected('');
      
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
    <div className="container mx-auto py-10 px-4 min-h-screen bg-zinc-950 text-white">
      {error ? (
        <div className="mb-4 rounded-xl border border-red-950 bg-red-950/40 p-4 text-red-400 text-sm">
          {error}
        </div>
      ) : null}

      <div className="mb-8">
        <div className="mb-4 flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <h1 className="mb-2 text-3xl font-extrabold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">{exam.title}</h1>
            <p className="mb-3 text-sm text-zinc-400">{exam.description}</p>
            <div className="flex items-center gap-3 text-xs font-semibold">
              <Badge className="border-zinc-800 bg-zinc-800 text-zinc-300">{exam.status === 'DRAFT' ? 'Черновик' : 'Активен'}</Badge>
              <span className="text-zinc-500">Класс: <span className="text-zinc-300">{exam.classLevel}</span></span>
            </div>
          </div>
          {exam.status === 'DRAFT' && (
            <Button onClick={activateExam} className="bg-green-600 hover:bg-green-700 font-bold border-0 rounded-xl text-white py-5">
              Активировать тест
            </Button>
          )}
        </div>

        {exam.status === 'ACTIVE' && (
          <Card className="border-amber-500/20 bg-gradient-to-r from-amber-500/5 to-orange-500/5 p-6 shadow-md dark:border-amber-500/10">
            <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-amber-500">
              🚀 Тест активен! Поделитесь ссылкой со студентами:
            </h3>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="flex-1 flex items-center justify-between gap-3 rounded-xl border border-zinc-850 bg-zinc-950 p-3.5 font-mono text-sm shadow-inner text-neutral-200">
                <span className="break-all font-semibold">
                  {shareUrl}
                </span>
              </div>
              <Button
                onClick={handleCopy}
                className={`px-6 py-3.5 font-bold transition-all duration-300 rounded-xl text-white ${
                  isCopied
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 shadow-md hover:shadow-lg border-0'
                }`}
              >
                {isCopied ? '✓ Скопировано!' : 'Копировать'}
              </Button>
            </div>
          </Card>
        )}
      </div>

      <div className="mb-8">
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-2xl font-bold text-white">Вопросы ({exam.questions.length})</h2>
          
          <div className="flex flex-wrap gap-2">

            {/* Platform Challenges Import Button */}
            <Button
              onClick={() => setIsImportOpen(true)}
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-5 rounded-xl border-0 flex items-center gap-1.5"
            >
              📚 База задач ЛитКот
            </Button>

            {/* Manual Add Question */}
            <Button
              onClick={() => setIsAddingQuestion(true)}
              className="bg-zinc-850 hover:bg-zinc-800 text-white font-bold py-5 rounded-xl border border-zinc-750 flex items-center gap-1.5"
            >
              ➕ Добавить вручную
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
            }
          }}
        >
          <DialogContent className="bg-zinc-900 border-zinc-800 text-white rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-white">
                {editingQuestionId ? 'Редактировать вопрос' : 'Добавить новый вопрос'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 text-sm mt-4">
              <div className="space-y-1.5">
                <Label htmlFor="type" className="text-xs font-bold text-neutral-400 uppercase">
                  Тип вопроса
                </Label>
                <select
                  id="type"
                  value={questionType}
                  onChange={(e) => setQuestionType(e.target.value)}
                  className="w-full rounded-xl bg-zinc-950 border-zinc-800 text-white px-3 py-2.5 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500/30"
                >
                  <option value="MULTIPLE_CHOICE">Множественный выбор</option>
                  <option value="CODE_TASK">Задача программирования</option>
                  <option value="SHORT_ANSWER">Короткий ответ</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="content" className="text-xs font-bold text-neutral-400 uppercase">
                  Текст вопроса
                </Label>
                <textarea
                  id="content"
                  value={questionContent}
                  onChange={(e) => setQuestionContent(e.target.value)}
                  placeholder="Введите text вопроса..."
                  className="w-full rounded-xl bg-zinc-950 border-zinc-800 text-white px-3 py-2.5 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500/30"
                  rows={4}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="points" className="text-xs font-bold text-neutral-400 uppercase">
                  Баллы
                </Label>
                <Input
                  id="points"
                  type="number"
                  min="1"
                  value={questionPoints}
                  onChange={(e) => setQuestionPoints(e.target.value)}
                  className="rounded-xl bg-zinc-950 border-zinc-800 text-white px-3 py-2.5 focus:border-amber-500 focus:ring-amber-500/20"
                />
              </div>

              {questionType === 'CODE_TASK' && (
                <div className="space-y-1.5">
                  <Label htmlFor="language" className="text-xs font-bold text-neutral-400 uppercase">
                    Язык программирования
                  </Label>
                  <select
                    id="language"
                    value={questionLanguage}
                    onChange={(e) => setQuestionLanguage(e.target.value)}
                    className="w-full rounded-xl bg-zinc-950 border-zinc-800 text-white px-3 py-2.5 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500/30"
                  >
                    <option value="PYTHON">Python</option>
                    <option value="JAVASCRIPT">JavaScript</option>
                    <option value="TYPESCRIPT">TypeScript</option>
                    <option value="JAVA">Java</option>
                    <option value="CPP">C++</option>
                  </select>
                </div>
              )}

              {questionType === 'MULTIPLE_CHOICE' && (
                <div className="space-y-3">
                  <Label className="text-xs font-bold text-neutral-400 uppercase">
                    Варианны ответов
                  </Label>
                  {questionOptions.map((option, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="correct"
                        checked={parseInt(correctAnswerIndex) === idx}
                        onChange={() => setCorrectAnswerIndex(idx.toString())}
                        className="h-4 w-4 text-amber-500 border-zinc-800 bg-zinc-955 focus:ring-amber-500/20"
                      />
                      <Input
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...questionOptions];
                          newOptions[idx] = e.target.value;
                          setQuestionOptions(newOptions);
                        }}
                        placeholder={`Вариант ${idx + 1}`}
                        className="rounded-xl bg-zinc-955 border-zinc-800 text-white px-3 py-2.5"
                      />
                    </div>
                  ))}
                  <p className="text-xs text-zinc-500">Выберите правильный ответ</p>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button
                  onClick={saveQuestion}
                  className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold border-0 rounded-xl"
                >
                  {editingQuestionId ? 'Сохранить' : 'Добавить'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsAddingQuestion(false)}
                  className="rounded-xl border-zinc-800 bg-zinc-955 hover:bg-zinc-800 hover:text-white"
                >
                  Отмена
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>



        {/* Import Challenges Dialog */}
        <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
          <DialogContent className="bg-zinc-900 border-zinc-800 text-white rounded-2xl max-w-xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
                <span>📚 База задач ЛитКот</span>
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 text-sm mt-4">
              <p className="text-xs text-zinc-400 text-left">
                Выберите любую готовую задачу платформы для автоматического добавления ее в тест как задачу по программированию с автотестами.
              </p>

              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                <Input
                  placeholder="Поиск по названию задачи..."
                  className="pl-9 bg-zinc-950 border-zinc-800 text-sm text-white"
                  value={importSearch}
                  onChange={(e) => setImportSearch(e.target.value)}
                />
              </div>

              {/* List of platform challenges */}
              <div className="border border-zinc-800 rounded-xl max-h-56 overflow-y-auto bg-zinc-950 divide-y divide-zinc-900 text-left">
                {importLoading ? (
                  <div className="text-center py-8 text-zinc-500 text-xs">Загрузка базы задач...</div>
                ) : allChallenges.length === 0 ? (
                  <div className="text-center py-8 text-zinc-500 text-xs">Задачи не найдены</div>
                ) : (
                  allChallenges
                    .filter((ch) => ch.name.toLowerCase().includes(importSearch.toLowerCase()))
                    .map((ch) => {
                      const isSelected = selectedImportChallengeId === ch.id.toString();
                      return (
                        <div
                          key={ch.id}
                          onClick={() => setSelectedImportChallengeId(ch.id.toString())}
                          className={`p-3 text-xs flex justify-between items-center cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-amber-500/10 text-amber-400 font-bold'
                              : 'text-zinc-300 hover:bg-zinc-900/50'
                          }`}
                        >
                          <div className="space-y-0.5">
                            <div className="font-bold">{ch.name}</div>
                            <div className="text-[10px] text-zinc-500">{ch.shortDescription}</div>
                          </div>
                          <Badge variant="outline" className="text-[9px] uppercase border-zinc-800 font-bold text-zinc-400">
                            {ch.difficulty}
                          </Badge>
                        </div>
                      );
                    })
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5 text-left">
                  <Label htmlFor="import-points" className="text-xs font-bold text-neutral-400 uppercase">
                    Баллы за решение
                  </Label>
                  <Input
                    id="import-points"
                    type="number"
                    min="1"
                    value={importPoints}
                    onChange={(e) => setImportPoints(e.target.value)}
                    className="rounded-xl bg-zinc-950 border-zinc-800 text-white focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  onClick={importChallenge}
                  disabled={importLoading || !selectedImportChallengeId}
                  className="bg-amber-600 hover:bg-amber-700 text-white font-bold border-0 rounded-xl px-5 flex-1"
                >
                  {importLoading ? 'Импорт...' : 'Импортировать в тест'}
                </Button>
                <Button
                  variant="outline"
                  disabled={importLoading}
                  onClick={() => setIsImportOpen(false)}
                  className="rounded-xl border-zinc-800 bg-zinc-955 hover:bg-zinc-800 hover:text-white"
                >
                  Отмена
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <div className="space-y-4">
          {exam.questions.length === 0 ? (
            <Card className="p-8 text-center border-zinc-800 bg-zinc-900/40 rounded-2xl shadow-xl">
              <p className="text-zinc-400">Нет вопросов. Добавьте первый вопрос.</p>
            </Card>
          ) : (
            exam.questions.map((question, index) => (
              <Card key={question.id} className="p-5 border-zinc-800 bg-zinc-900/40 rounded-2xl shadow-xl hover:border-zinc-700 transition-colors">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="mb-2 font-bold text-lg text-white">
                      Вопрос {index + 1}: {question.content}
                    </h3>
                    <div className="flex flex-wrap gap-4 text-xs font-bold uppercase tracking-wider text-zinc-500">
                      <span>
                        Тип:{' '}
                        <span className="text-zinc-300">
                          {question.type === 'MULTIPLE_CHOICE'
                            ? 'Множественный выбор'
                            : question.type === 'CODE_TASK'
                              ? 'Программирование'
                              : 'Короткий ответ'}
                        </span>
                      </span>
                      <span>Баллы: <span className="text-zinc-300">{question.points}</span></span>
                      {question.language ? <span>Язык: <span className="text-zinc-300">{question.language}</span></span> : null}
                      {question.type === 'CODE_TASK' && (
                        <span>Тестов: <span className="text-zinc-300">{question.testCases?.length || 0}</span></span>
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
                    <Button variant="outline" size="sm" className="rounded-xl border-zinc-800 bg-zinc-900 text-neutral-300 hover:bg-zinc-800 hover:text-white" onClick={() => startEditingQuestion(question)}>
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
        <DialogContent className="max-w-2xl bg-zinc-900 border-zinc-800 text-white rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white">Управление тест-кейсами для задачи</DialogTitle>
          </DialogHeader>
          {selectedQuestionForTestCases ? (
            <div className="space-y-6 text-sm mt-4 font-normal">
              <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
                <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">Задача:</p>
                <p className="font-mono text-xs whitespace-pre-wrap text-zinc-300 leading-relaxed">{selectedQuestionForTestCases.content}</p>
              </div>

              {/* Add testcase form */}
              <div className="space-y-4 rounded-xl border border-amber-500/20 bg-gradient-to-r from-amber-500/5 to-orange-500/5 p-5">
                <h4 className="font-bold text-sm text-amber-400">Добавить новый тест-кейс</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="tc-input" className="text-xs font-bold text-neutral-400 uppercase">
                      Входные данные (stdin)
                    </Label>
                    <textarea
                      id="tc-input"
                      value={newTestCaseInput}
                      onChange={(e) => setNewTestCaseInput(e.target.value)}
                      placeholder="Например: 2 3"
                      className="w-full rounded-xl bg-zinc-950 border-zinc-800 text-white px-3 py-2.5 text-xs font-mono focus:border-amber-500 focus:outline-none"
                      rows={3}
                    />
                  </div>
                  
                  <div className="space-y-1.5">
                    <Label htmlFor="tc-expected" className="text-xs font-bold text-neutral-400 uppercase">
                      Ожидаемый результат *
                    </Label>
                    <textarea
                      id="tc-expected"
                      value={newTestCaseExpected}
                      onChange={(e) => setNewTestCaseExpected(e.target.value)}
                      placeholder="Например: 5"
                      className="w-full rounded-xl bg-zinc-950 border-zinc-800 text-white px-3 py-2.5 text-xs font-mono focus:border-amber-500 focus:outline-none"
                      rows={3}
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={addTestCase} className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold border-0 rounded-xl">
                    Добавить тест-кейс
                  </Button>
                </div>
              </div>

              {/* List testcases */}
              <div className="space-y-3">
                <h4 className="font-bold text-sm text-white">Список текущих тестов</h4>
                {(!selectedQuestionForTestCases.testCases || selectedQuestionForTestCases.testCases.length === 0) ? (
                  <p className="text-xs text-neutral-500">У этой задачи еще нет тест-кейсов. Добавьте первый тест выше.</p>
                ) : (
                  <div className="divide-y divide-zinc-800 rounded-xl border border-zinc-800 max-h-64 overflow-y-auto bg-zinc-950">
                    {selectedQuestionForTestCases.testCases.map((tc) => (
                      <div key={tc.id} className="p-3.5 flex items-start justify-between bg-zinc-900/30 text-xs gap-3">
                        <div className="flex-1 grid grid-cols-2 gap-4">
                          <div>
                            <span className="font-bold text-neutral-500 uppercase text-[10px]">Ввод:</span>
                            <pre className="bg-zinc-950 border border-zinc-850 p-2 rounded-lg mt-1.5 font-mono text-[11px] overflow-x-auto whitespace-pre text-zinc-300">{tc.input || '(пусто)'}</pre>
                          </div>
                          <div>
                            <span className="font-bold text-neutral-500 uppercase text-[10px]">Ожидаемый вывод:</span>
                            <pre className="bg-zinc-950 border border-zinc-850 p-2 rounded-lg mt-1.5 font-mono text-[11px] overflow-x-auto whitespace-pre text-zinc-300">{tc.expectedOutput}</pre>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="rounded-lg text-red-500 hover:bg-red-950/40 hover:text-red-400 self-center"
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
