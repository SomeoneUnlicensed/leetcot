'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui/components/card';
import { Button } from '@repo/ui/components/button';
import { Input } from '@repo/ui/components/input';
import { Textarea } from '@repo/ui/components/textarea';
import { Badge } from '@repo/ui/components/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@repo/ui/components/dialog';
import {
  Trophy,
  Plus,
  Calendar,
  Award,
  SearchIcon,
  Trash2,
  Pencil,
  CheckCircle,
  User,
} from '@repo/ui/icons';
import { useToast } from '@repo/ui/components/use-toast';

import {
  getChampionships,
  createChampionship,
  updateChampionship,
  deleteChampionship,
  getChampionshipChallenges,
  getAvailableChallenges,
  addChallengeToChampionship,
  removeChallengeFromChampionship,
  getChampionshipParticipants,
} from '../championships.actions';
import { getCompanies } from '../../business/business.actions';

function errMsg(err: unknown, fallback: string): string {
  if (err instanceof Error) return err.message;
  return fallback;
}

interface Company {
  id: string;
  name: string;
  domain: string;
}

interface Championship {
  id: string;
  name: string;
  slug: string;
  description: string;
  status: string;
  startDate: Date;
  endDate: Date;
  companyId: string | null;
  company?: Company | null;
  _count?: {
    participants: number;
    challenges: number;
  };
}

interface Challenge {
  id: number;
  name: string;
  difficulty: string;
}

interface Participant {
  id: string;
  score: number;
  joinedAt: Date;
  user: {
    name: string | null;
    email: string | null;
  };
}

export function ChampionshipDashboard() {
  const { toast } = useToast();
  const [championships, setChampionships] = useState<Championship[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Dialog states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isChallengesOpen, setIsChallengesOpen] = useState(false);
  const [isParticipantsOpen, setIsParticipantsOpen] = useState(false);

  // Selected items
  const [selectedChampionship, setSelectedChampionship] = useState<Championship | null>(null);
  const [championshipChallenges, setChampionshipChallenges] = useState<Challenge[]>([]);
  const [availableChallenges, setAvailableChallenges] = useState<Challenge[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loadingModalData, setLoadingModalData] = useState(false);

  // Form fields
  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formStatus, setFormStatus] = useState('DRAFT');
  const [formStartDate, setFormStartDate] = useState('');
  const [formEndDate, setFormEndDate] = useState('');
  const [formCompanyId, setFormCompanyId] = useState('');
  const [selectedChallengeId, setSelectedChallengeId] = useState('');

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const chData = await getChampionships();
      setChampionships(chData as Championship[]);
      const compData = await getCompanies();
      setCompanies(compData);
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Ошибка загрузки',
        description: errMsg(err, 'Не удалось загрузить данные'),
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const handleOpenCreate = () => {
    setSelectedChampionship(null);
    setFormName('');
    setFormSlug('');
    setFormDescription('');
    setFormStatus('DRAFT');
    setFormStartDate('');
    setFormEndDate('');
    setFormCompanyId('');
    setIsFormOpen(true);
  };

  const handleOpenEdit = (ch: Championship) => {
    setSelectedChampionship(ch);
    setFormName(ch.name);
    setFormSlug(ch.slug);
    setFormDescription(ch.description);
    setFormStatus(ch.status);
    setFormStartDate(new Date(ch.startDate).toISOString().slice(0, 16));
    setFormEndDate(new Date(ch.endDate).toISOString().slice(0, 16));
    setFormCompanyId(ch.companyId || '');
    setIsFormOpen(true);
  };

  const handleSaveChampionship = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formSlug || !formStartDate || !formEndDate) {
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: 'Заполните обязательные поля',
      });
      return;
    }

    const payload = {
      name: formName,
      slug: formSlug
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9-_]/g, '-'),
      description: formDescription,
      status: formStatus,
      startDate: new Date(formStartDate),
      endDate: new Date(formEndDate),
      companyId: formCompanyId || null,
    };

    try {
      if (selectedChampionship) {
        await updateChampionship(selectedChampionship.id, payload);
        toast({
          variant: 'success',
          title: 'Обновлено',
          description: 'Чемпионат успешно сохранен',
        });
      } else {
        await createChampionship(payload);
        toast({ variant: 'success', title: 'Создано', description: 'Чемпионат успешно создан' });
      }
      setIsFormOpen(false);
      loadData();
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Ошибка сохранения',
        description: errMsg(err, 'Произошла ошибка'),
      });
    }
  };

  const handleDeleteChampionship = async (id: string) => {
    // eslint-disable-next-line no-alert
    const confirmed = confirm(
      'Вы уверены, что хотите удалить этот чемпионат? Все результаты будут стерты. 😿',
    );
    if (!confirmed) {
      return;
    }

    try {
      await deleteChampionship(id);
      toast({ variant: 'success', title: 'Удалено', description: 'Чемпионат удален' });
      loadData();
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Ошибка удаления',
        description: errMsg(err, 'Не удалось удалить чемпионат'),
      });
    }
  };

  const openChallengesModal = async (ch: Championship) => {
    setSelectedChampionship(ch);
    setIsChallengesOpen(true);
    setLoadingModalData(true);
    setSelectedChallengeId('');
    try {
      const activeChallenges = await getAvailableChallenges();
      setAvailableChallenges(activeChallenges);
      const chChallenges = await getChampionshipChallenges(ch.id);
      setChampionshipChallenges(chChallenges);
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: errMsg(err, 'Не удалось загрузить задачи'),
      });
    } finally {
      setLoadingModalData(false);
    }
  };

  const handleAddChallenge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChampionship || !selectedChallengeId) return;

    try {
      await addChallengeToChampionship(selectedChampionship.id, Number(selectedChallengeId));
      toast({ variant: 'success', title: 'Задача добавлена' });
      setSelectedChallengeId('');
      const chChallenges = await getChampionshipChallenges(selectedChampionship.id);
      setChampionshipChallenges(chChallenges);
      loadData();
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: errMsg(err, 'Не удалось добавить задачу'),
      });
    }
  };

  const handleRemoveChallenge = async (challengeId: number) => {
    if (!selectedChampionship) return;

    try {
      await removeChallengeFromChampionship(selectedChampionship.id, challengeId);
      toast({ variant: 'success', title: 'Задача удалена' });
      const chChallenges = await getChampionshipChallenges(selectedChampionship.id);
      setChampionshipChallenges(chChallenges);
      loadData();
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: errMsg(err, 'Не удалось удалить задачу'),
      });
    }
  };

  const openParticipantsModal = async (ch: Championship) => {
    setSelectedChampionship(ch);
    setIsParticipantsOpen(true);
    setLoadingModalData(true);
    try {
      const data = await getChampionshipParticipants(ch.id);
      setParticipants(data as Participant[]);
    } catch {
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: 'Не удалось загрузить участников',
      });
    } finally {
      setLoadingModalData(false);
    }
  };

  const filteredChampionships = championships.filter((ch) => {
    return (
      ch.name.toLowerCase().includes(search.toLowerCase()) ||
      ch.slug.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-amber-500/20 bg-amber-50/50 dark:bg-amber-950/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold text-amber-600 dark:text-amber-400">
              Всего соревнований
            </CardTitle>
            <Trophy className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-amber-700 dark:text-amber-300">
              {championships.length}
            </div>
            <p className="text-muted-foreground mt-1 text-xs">Активные, архивные и черновики</p>
          </CardContent>
        </Card>

        <Card className="border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-950/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              Идет сейчас
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-300">
              {championships.filter((c) => c.status === 'ACTIVE').length}
            </div>
            <p className="text-muted-foreground mt-1 text-xs">Доступно участникам для решения</p>
          </CardContent>
        </Card>

        <Card className="border-blue-500/20 bg-blue-50/50 dark:bg-blue-950/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold text-blue-600 dark:text-blue-400">
              Всего участников
            </CardTitle>
            <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-blue-700 dark:text-blue-300">
              {championships.reduce((sum, c) => sum + (c._count?.participants || 0), 0)}
            </div>
            <p className="text-muted-foreground mt-1 text-xs">Зарегистрированные профили</p>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
          <Input
            placeholder="Поиск чемпионатов..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 bg-gradient-to-r from-amber-600 to-orange-600 font-bold text-white hover:from-amber-500 hover:to-orange-500"
        >
          <Plus className="h-4 w-4" />
          Создать соревнование
        </Button>
      </div>

      {/* Championships Table */}
      <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50 text-xs font-bold uppercase tracking-wider text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900/50">
                <th className="px-6 py-3.5">Название</th>
                <th className="px-6 py-3.5">Организатор (Компания)</th>
                <th className="px-6 py-3.5">Статус</th>
                <th className="px-6 py-3.5">Задачи</th>
                <th className="px-6 py-3.5">Участники</th>
                <th className="px-6 py-3.5">Период проведения</th>
                <th className="px-6 py-3.5 text-right">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 text-sm dark:divide-neutral-800">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-neutral-500">
                    Загрузка чемпионатов...
                  </td>
                </tr>
              ) : filteredChampionships.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-neutral-500">
                    Соревнования не найдены
                  </td>
                </tr>
              ) : (
                filteredChampionships.map((ch) => (
                  <tr
                    key={ch.id}
                    className="transition-colors hover:bg-neutral-50/50 dark:hover:bg-neutral-900/20"
                  >
                    <td className="px-6 py-4">
                      <div className="font-semibold text-neutral-900 dark:text-neutral-100">
                        {ch.name}
                      </div>
                      <div className="font-mono text-xs text-neutral-500">{ch.slug}</div>
                    </td>
                    <td className="px-6 py-4 text-neutral-700 dark:text-neutral-300">
                      {ch.company ? (
                        <span className="font-semibold">{ch.company.name}</span>
                      ) : (
                        <span className="italic text-neutral-400">Глобальный</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        className={
                          ch.status === 'ACTIVE'
                            ? 'border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : ch.status === 'PAST'
                              ? 'border border-neutral-500/20 bg-neutral-500/10 text-neutral-600 dark:text-neutral-400'
                              : 'border border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400'
                        }
                      >
                        {ch.status === 'ACTIVE'
                          ? 'ИДЕТ'
                          : ch.status === 'PAST'
                            ? 'ЗАВЕРШЕН'
                            : 'ЧЕРНОВИК'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 font-semibold">{ch._count?.challenges || 0} шт.</td>
                    <td className="px-6 py-4 font-semibold">{ch._count?.participants || 0} чел.</td>
                    <td className="space-y-0.5 px-6 py-4 text-xs text-neutral-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>С: {new Date(ch.startDate).toLocaleString('ru-RU')}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>По: {new Date(ch.endDate).toLocaleString('ru-RU')}</span>
                      </div>
                    </td>
                    <td className="space-x-2 whitespace-nowrap px-6 py-4 text-right">
                      <Button size="sm" variant="outline" onClick={() => openChallengesModal(ch)}>
                        Задачи
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => openParticipantsModal(ch)}>
                        Результаты
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleOpenEdit(ch)}
                        className="h-8 w-8"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDeleteChampionship(ch.id)}
                        className="h-8 w-8 text-red-500 hover:bg-red-500/10 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dialog: Create/Edit Championship */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-lg rounded-2xl border border-neutral-300 bg-white p-6 shadow-2xl dark:border-neutral-800 dark:bg-neutral-950">
          <form onSubmit={handleSaveChampionship}>
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">
                {selectedChampionship ? 'Редактировать соревнование' : 'Создать новое соревнование'}
              </DialogTitle>
              <DialogDescription>
                Укажите параметры проведения ИТ-олимпиады или хакатона.
              </DialogDescription>
            </DialogHeader>

            <div className="my-6 space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="ch-name" className="text-xs font-bold uppercase text-neutral-500">
                    Название
                  </label>
                  <Input
                    id="ch-name"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Например: Осенний Хакатон"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="ch-slug" className="text-xs font-bold uppercase text-neutral-500">
                    Slug (URL-ссылка)
                  </label>
                  <Input
                    id="ch-slug"
                    required
                    value={formSlug}
                    onChange={(e) => setFormSlug(e.target.value)}
                    placeholder="autumn-hackathon-2026"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="ch-desc" className="text-xs font-bold uppercase text-neutral-500">
                  Описание соревнования
                </label>
                <Textarea
                  id="ch-desc"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Опишите правила, критерии и призы для участников..."
                  className="h-24 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label
                    htmlFor="ch-start"
                    className="text-xs font-bold uppercase text-neutral-500"
                  >
                    Дата начала
                  </label>
                  <Input
                    id="ch-start"
                    type="datetime-local"
                    required
                    value={formStartDate}
                    onChange={(e) => setFormStartDate(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="ch-end" className="text-xs font-bold uppercase text-neutral-500">
                    Дата окончания
                  </label>
                  <Input
                    id="ch-end"
                    type="datetime-local"
                    required
                    value={formEndDate}
                    onChange={(e) => setFormEndDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label
                    htmlFor="ch-status"
                    className="text-xs font-bold uppercase text-neutral-500"
                  >
                    Статус
                  </label>
                  <select
                    id="ch-status"
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value)}
                    className="border-input bg-background ring-offset-background h-10 w-full rounded-md border px-3 text-sm focus-visible:outline-none"
                  >
                    <option value="DRAFT">Черновик</option>
                    <option value="ACTIVE">Идет (Активен)</option>
                    <option value="PAST">Завершен</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="ch-company"
                    className="text-xs font-bold uppercase text-neutral-500"
                  >
                    Компания-организатор
                  </label>
                  <select
                    id="ch-company"
                    value={formCompanyId}
                    onChange={(e) => setFormCompanyId(e.target.value)}
                    className="border-input bg-background ring-offset-background h-10 w-full rounded-md border px-3 text-sm focus-visible:outline-none"
                  >
                    <option value="">-- Глобальный чемпионат --</option>
                    {companies.map((co) => (
                      <option key={co.id} value={co.id}>
                        {co.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button type="button" variant="ghost" onClick={() => setIsFormOpen(false)}>
                Отмена
              </Button>
              <Button
                type="submit"
                className="bg-gradient-to-r from-amber-600 to-orange-600 font-bold text-white"
              >
                Сохранить
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog: Manage Challenges */}
      <Dialog open={isChallengesOpen} onOpenChange={setIsChallengesOpen}>
        <DialogContent className="max-w-2xl rounded-2xl border border-neutral-300 bg-white p-6 shadow-2xl dark:border-neutral-800 dark:bg-neutral-950">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-bold">
              <span>Задачи чемпионата:</span>
              <span className="font-extrabold text-amber-500">{selectedChampionship?.name}</span>
            </DialogTitle>
            <DialogDescription>
              Добавляйте активные задачи платформы в соревнование участников.
            </DialogDescription>
          </DialogHeader>

          {/* Add Challenge Form */}
          <form onSubmit={handleAddChallenge} className="my-4 flex items-end gap-2 text-xs">
            <div className="flex-1 space-y-1.5">
              <label
                htmlFor="ch-challenge-select"
                className="flex items-center gap-1 text-xs font-bold uppercase text-neutral-500"
              >
                <Award className="h-3 w-3" />
                Выберите задачу из активных
              </label>
              <select
                id="ch-challenge-select"
                value={selectedChallengeId}
                onChange={(e) => setSelectedChallengeId(e.target.value)}
                className="border-input bg-background ring-offset-background h-10 w-full rounded-md border px-3 text-sm focus-visible:outline-none"
              >
                <option value="">-- Выбрать задачу --</option>
                {availableChallenges
                  .filter(
                    (avail) => !championshipChallenges.some((linked) => linked.id === avail.id),
                  )
                  .map((ch) => (
                    <option key={ch.id} value={ch.id}>
                      [{ch.difficulty}] {ch.name}
                    </option>
                  ))}
              </select>
            </div>
            <Button
              type="submit"
              className="h-10 bg-zinc-950 font-bold text-white dark:bg-zinc-100 dark:text-zinc-950"
            >
              Добавить
            </Button>
          </form>

          {/* List Linked Challenges */}
          <div className="max-h-[300px] overflow-hidden overflow-y-auto rounded-xl border border-neutral-200 dark:border-neutral-800">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50 font-bold uppercase text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900/50">
                  <th className="px-4 py-2.5">ID</th>
                  <th className="px-4 py-2.5">Название задачи</th>
                  <th className="px-4 py-2.5">Сложность</th>
                  <th className="px-4 py-2.5 text-right">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                {loadingModalData ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-neutral-500">
                      Загрузка задач...
                    </td>
                  </tr>
                ) : championshipChallenges.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-neutral-500">
                      Задачи не добавлены
                    </td>
                  </tr>
                ) : (
                  championshipChallenges.map((ch) => (
                    <tr key={ch.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-900/20">
                      <td className="px-4 py-3 font-mono text-neutral-500">#{ch.id}</td>
                      <td className="px-4 py-3 font-semibold">{ch.name}</td>
                      <td className="px-4 py-3">
                        <Badge variant="outline">{ch.difficulty}</Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRemoveChallenge(ch.id)}
                          className="h-7 px-2 text-xs text-red-500 hover:bg-red-500/10 hover:text-red-600"
                        >
                          Исключить
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsChallengesOpen(false)}>
              Закрыть
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: View Participants & Results */}
      <Dialog open={isParticipantsOpen} onOpenChange={setIsParticipantsOpen}>
        <DialogContent className="max-w-2xl rounded-2xl border border-neutral-300 bg-white p-6 shadow-2xl dark:border-neutral-800 dark:bg-neutral-950">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-bold">
              <span>Лидерборд участников:</span>
              <span className="font-extrabold text-amber-500">{selectedChampionship?.name}</span>
            </DialogTitle>
            <DialogDescription>
              Таблица лидеров участников соревнований в реальном времени.
            </DialogDescription>
          </DialogHeader>

          {/* List Participants */}
          <div className="my-4 max-h-[300px] overflow-hidden overflow-y-auto rounded-xl border border-neutral-200 dark:border-neutral-800">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50 font-bold uppercase text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900/50">
                  <th className="px-4 py-2.5">Место</th>
                  <th className="px-4 py-2.5">Имя</th>
                  <th className="px-4 py-2.5">Email</th>
                  <th className="px-4 py-2.5">Очки (Score)</th>
                  <th className="px-4 py-2.5">Дата вступления</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                {loadingModalData ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-neutral-500">
                      Загрузка результатов...
                    </td>
                  </tr>
                ) : participants.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-neutral-500">
                      Нет зарегистрированных участников
                    </td>
                  </tr>
                ) : (
                  participants.map((part, index) => (
                    <tr
                      key={part.id}
                      className="hover:bg-neutral-50/50 dark:hover:bg-neutral-900/20"
                    >
                      <td className="px-4 py-3 font-bold text-neutral-500">
                        {index === 0
                          ? '🥇'
                          : index === 1
                            ? '🥈'
                            : index === 2
                              ? '🥉'
                              : `#${index + 1}`}
                      </td>
                      <td className="px-4 py-3 font-semibold">{part.user.name}</td>
                      <td className="px-4 py-3 font-mono">{part.user.email}</td>
                      <td className="px-4 py-3 text-sm font-bold text-amber-500">
                        {part.score} pts
                      </td>
                      <td className="px-4 py-3 text-neutral-500">
                        {new Date(part.joinedAt).toLocaleDateString('ru-RU')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsParticipantsOpen(false)}>
              Закрыть
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
