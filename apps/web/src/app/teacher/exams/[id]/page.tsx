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
  DialogTrigger,
} from '@repo/ui/components/dialog';
import { Input } from '@repo/ui/components/input';
import { Label } from '@repo/ui/components/label';

interface ExamQuestion {
  id: string;
  order: number;
  type: string;
  content: string;
  points: number;
  language?: string;
  testCases: unknown[];
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

  useEffect(() => {
    if (examId) {
      void fetchExam();
    }
  }, [examId, fetchExam]);

  const addQuestion = async () => {
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
        order: (exam?.questions?.length || 0) + 1,
        points: parseInt(questionPoints),
      };

      if (questionType === 'CODE_TASK') {
        body.language = questionLanguage;
      } else if (questionType === 'MULTIPLE_CHOICE') {
        body.options = questionOptions.filter((opt) => opt.trim().length > 0);
        body.correctAnswers = [parseInt(correctAnswerIndex)];
      }

      const response = await fetch('/api/questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Ошибка при добавлении вопроса');
        return;
      }

      // Reset form and fetch updated exam
      setQuestionType('MULTIPLE_CHOICE');
      setQuestionContent('');
      setQuestionPoints('1');
      setQuestionOptions(['', '', '', '']);
      setCorrectAnswerIndex('0');
      setIsAddingQuestion(false);
      await fetchExam();
    } catch (err) {
      console.error('Error adding question:', err);
      setError('Ошибка при добавлении вопроса');
    }
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
    <div className="container mx-auto py-10">
      {error ? (
        <div className="mb-4 rounded border border-red-400 bg-red-100 p-4 text-red-700">
          {error}
        </div>
      ) : null}

      <div className="mb-8">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-bold">{exam.title}</h1>
            <p className="mb-2 text-gray-600">{exam.description}</p>
            <div className="flex items-center gap-2">
              <Badge>{exam.status === 'DRAFT' ? 'Черновик' : 'Активен'}</Badge>
              <span className="text-sm text-gray-600">Класс: {exam.classLevel}</span>
            </div>
          </div>
          {exam.status === 'DRAFT' && (
            <Button onClick={activateExam} className="bg-green-600 hover:bg-green-700">
              Активировать тест
            </Button>
          )}
        </div>

        {exam.status === 'ACTIVE' && (
          <Card className="border-blue-200 bg-blue-50 p-4">
            <h3 className="mb-2 font-semibold">Ссылка на тест (поделитесь со студентами):</h3>
            <div className="flex items-center gap-2 rounded border bg-white p-3">
              <code className="flex-1 break-all text-sm">{shareUrl}</code>
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigator.clipboard.writeText(shareUrl)}
              >
                Копировать
              </Button>
            </div>
          </Card>
        )}
      </div>

      <div className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Вопросы ({exam.questions.length})</h2>
          <Dialog open={isAddingQuestion} onOpenChange={setIsAddingQuestion}>
            <DialogTrigger asChild>
              <Button>Добавить вопрос</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Добавить новый вопрос</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="type">Тип вопроса</Label>
                  <select
                    id="type"
                    value={questionType}
                    onChange={(e) => setQuestionType(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2"
                  >
                    <option value="MULTIPLE_CHOICE">Множественный выбор</option>
                    <option value="CODE_TASK">Задача программирования</option>
                    <option value="SHORT_ANSWER">Короткий ответ</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="content">Текст вопроса</Label>
                  <textarea
                    id="content"
                    value={questionContent}
                    onChange={(e) => setQuestionContent(e.target.value)}
                    placeholder="Введите текст вопроса..."
                    className="w-full rounded-md border border-gray-300 px-3 py-2"
                    rows={4}
                  />
                </div>

                <div>
                  <Label htmlFor="points">Баллы</Label>
                  <Input
                    id="points"
                    type="number"
                    min="1"
                    value={questionPoints}
                    onChange={(e) => setQuestionPoints(e.target.value)}
                  />
                </div>

                {questionType === 'CODE_TASK' && (
                  <div>
                    <Label htmlFor="language">Язык программирования</Label>
                    <select
                      id="language"
                      value={questionLanguage}
                      onChange={(e) => setQuestionLanguage(e.target.value)}
                      className="w-full rounded-md border border-gray-300 px-3 py-2"
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
                    <Label>Варианты ответов</Label>
                    {questionOptions.map((option, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="correct"
                          checked={parseInt(correctAnswerIndex) === idx}
                          onChange={() => setCorrectAnswerIndex(idx.toString())}
                          className="h-4 w-4"
                        />
                        <Input
                          value={option}
                          onChange={(e) => {
                            const newOptions = [...questionOptions];
                            newOptions[idx] = e.target.value;
                            setQuestionOptions(newOptions);
                          }}
                          placeholder={`Вариант ${idx + 1}`}
                        />
                      </div>
                    ))}
                    <p className="text-xs text-gray-600">Выберите правильный ответ</p>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button onClick={addQuestion}>Добавить</Button>
                  <Button variant="outline" onClick={() => setIsAddingQuestion(false)}>
                    Отмена
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-4">
          {exam.questions.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-gray-600">Нет вопросов. Добавьте первый вопрос.</p>
            </Card>
          ) : (
            exam.questions.map((question, index) => (
              <Card key={question.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="mb-2 font-semibold">
                      Вопрос {index + 1}: {question.content.substring(0, 100)}...
                    </h3>
                    <div className="flex gap-4 text-sm text-gray-600">
                      <span>
                        Тип:{' '}
                        {question.type === 'MULTIPLE_CHOICE'
                          ? 'Множественный выбор'
                          : question.type === 'CODE_TASK'
                            ? 'Программирование'
                            : 'Короткий ответ'}
                      </span>
                      <span>Баллы: {question.points}</span>
                      {question.language ? <span>Язык: {question.language}</span> : null}
                      <span>Тестовых случаев: {question.testCases?.length || 0}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      Редактировать
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
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
    </div>
  );
}
