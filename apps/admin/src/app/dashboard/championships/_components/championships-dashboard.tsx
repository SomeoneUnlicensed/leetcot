'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui/components/card';
import { Button } from '@repo/ui/components/button';
import { Input } from '@repo/ui/components/input';
import { Textarea } from '@repo/ui/components/textarea';
import { Badge } from '@repo/ui/components/badge';
import { Trophy, Plus, Calendar, SearchIcon, Trash2 } from '@repo/ui/icons';
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
  removeParticipantFromChampionship,
  updateParticipantScore,
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

  // Search and status filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ACTIVE' | 'ALL' | 'DRAFT' | 'PAST'>('ALL');

  // Selected championship workspace state
  // null = show empty state, "NEW" = show create form, Championship = show detail view
  const [selectedChampionshipId, setSelectedChampionshipId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'challenges' | 'edit' | 'overview' | 'participants'>(
    'overview',
  );

  // Detailed lists loaded on demand
  const [championshipChallenges, setChampionshipChallenges] = useState<Challenge[]>([]);
  const [availableChallenges, setAvailableChallenges] = useState<Challenge[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loadingWorkspaceData, setLoadingWorkspaceData] = useState(false);

  // Form states for creating/editing
  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formStatus, setFormStatus] = useState('DRAFT');
  const [formStartDate, setFormStartDate] = useState('');
  const [formEndDate, setFormEndDate] = useState('');
  const [formCompanyId, setFormCompanyId] = useState('');

  // Challenge addition state
  const [selectedChallengeId, setSelectedChallengeId] = useState('');

  // Inline participant score editing state
  const [editingParticipantId, setEditingParticipantId] = useState<string | null>(null);
  const [editScoreValue, setEditScoreValue] = useState<number>(0);
  const [isSavingScore, setIsSavingScore] = useState(false);

  // Time remaining calculation helper
  const [timeNow, setTimeNow] = useState<Date | null>(null);

  useEffect(() => {
    setTimeNow(new Date());
    const interval = setInterval(() => {
      setTimeNow(new Date());
    }, 10000);
    return () => clearInterval(interval);
  }, []);

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

  // Find currently selected championship object
  const selectedChampionship = championships.find((c) => c.id === selectedChampionshipId) || null;

  // Load detailed information for the active workspace championship
  const loadWorkspaceDetails = useCallback(
    async (ch: Championship) => {
      setLoadingWorkspaceData(true);
      try {
        const activeChallenges = await getAvailableChallenges();
        setAvailableChallenges(activeChallenges);
        const chChallenges = await getChampionshipChallenges(ch.id);
        setChampionshipChallenges(chChallenges);
        const parts = await getChampionshipParticipants(ch.id);
        setParticipants(parts as Participant[]);
      } catch (err) {
        toast({
          variant: 'destructive',
          title: 'Ошибка',
          description: errMsg(err, 'Не удалось загрузить связанные данные'),
        });
      } finally {
        setLoadingWorkspaceData(false);
      }
    },
    [toast],
  );

  // Whenever selected championship changes, reload its tabs details and reset forms
  useEffect(() => {
    if (selectedChampionship) {
      void loadWorkspaceDetails(selectedChampionship);
      // Pre-populate edit form
      setFormName(selectedChampionship.name);
      setFormSlug(selectedChampionship.slug);
      setFormDescription(selectedChampionship.description);
      setFormStatus(selectedChampionship.status);
      setFormStartDate(new Date(selectedChampionship.startDate).toISOString().slice(0, 16));
      setFormEndDate(new Date(selectedChampionship.endDate).toISOString().slice(0, 16));
      setFormCompanyId(selectedChampionship.companyId || '');
      setEditingParticipantId(null);
    }
  }, [selectedChampionshipId, championships, loadWorkspaceDetails, selectedChampionship]);

  const handleOpenCreate = () => {
    setSelectedChampionshipId('NEW');
    setFormName('');
    setFormSlug('');
    setFormDescription('');
    setFormStatus('DRAFT');
    setFormStartDate(new Date().toISOString().slice(0, 16));
    setFormEndDate(new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 16)); // default 3 days
    setFormCompanyId('');
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

    const start = new Date(formStartDate);
    const end = new Date(formEndDate);

    if (start >= end) {
      toast({
        variant: 'destructive',
        title: 'Ошибка дат',
        description: 'Дата начала должна быть раньше даты окончания',
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
      startDate: start,
      endDate: end,
      companyId: formCompanyId || null,
    };

    try {
      if (selectedChampionship) {
        await updateChampionship(selectedChampionship.id, payload);
        toast({
          variant: 'success',
          title: 'Сохранено',
          description: 'Изменения в чемпионате успешно сохранены',
        });
        await loadData();
      } else {
        const created = await createChampionship(payload);
        toast({
          variant: 'success',
          title: 'Создано',
          description: 'Чемпионат успешно создан',
        });
        await loadData();
        setSelectedChampionshipId(created.id);
        setActiveTab('overview');
      }
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Ошибка сохранения',
        description: errMsg(err, 'Произошла ошибка'),
      });
    }
  };

  // Quick Action triggers
  const handleQuickStatusChange = async (status: string) => {
    if (!selectedChampionship) return;

    let start = new Date(selectedChampionship.startDate);
    let end = new Date(selectedChampionship.endDate);

    if (status === 'ACTIVE') {
      start = new Date();
      // If end date is in the past, push it to 24 hours from now
      if (end <= start) {
        end = new Date(Date.now() + 86400000);
      }
    } else if (status === 'PAST') {
      end = new Date();
      if (start >= end) {
        start = new Date(Date.now() - 86400000);
      }
    }

    const payload = {
      name: selectedChampionship.name,
      slug: selectedChampionship.slug,
      description: selectedChampionship.description,
      status,
      startDate: start,
      endDate: end,
      companyId: selectedChampionship.companyId,
    };

    try {
      await updateChampionship(selectedChampionship.id, payload);
      toast({
        variant: 'success',
        title: 'Статус обновлен',
        description: `Чемпионат переведен в статус ${status === 'ACTIVE' ? 'АКТИВЕН' : status === 'PAST' ? 'ЗАВЕРШЕН' : 'ЧЕРНОВИК'}`,
      });
      await loadData();
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Ошибка переключения',
        description: errMsg(err, 'Не удалось сменить статус'),
      });
    }
  };

  const handleDeleteChampionship = async (id: string) => {
    // eslint-disable-next-line no-alert
    const confirmed = confirm(
      'Вы уверены, что хотите удалить этот чемпионат? Все результаты будут стерты навсегда! 😿',
    );
    if (!confirmed) return;

    try {
      await deleteChampionship(id);
      toast({ variant: 'success', title: 'Удалено', description: 'Чемпионат полностью удален' });
      setSelectedChampionshipId(null);
      loadData();
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Ошибка удаления',
        description: errMsg(err, 'Не удалось удалить чемпионат'),
      });
    }
  };

  const handleAddChallenge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChampionship || !selectedChallengeId) return;

    try {
      await addChallengeToChampionship(selectedChampionship.id, Number(selectedChallengeId));
      toast({ variant: 'success', title: 'Задача добавлена в соревнование' });
      setSelectedChallengeId('');
      if (selectedChampionship) {
        const chChallenges = await getChampionshipChallenges(selectedChampionship.id);
        setChampionshipChallenges(chChallenges);
      }
      loadData();
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Ошибка добавления',
        description: errMsg(err, 'Не удалось добавить задачу'),
      });
    }
  };

  const handleRemoveChallenge = async (challengeId: number) => {
    if (!selectedChampionship) return;

    try {
      await removeChallengeFromChampionship(selectedChampionship.id, challengeId);
      toast({ variant: 'success', title: 'Задача удалена из соревнования' });
      const chChallenges = await getChampionshipChallenges(selectedChampionship.id);
      setChampionshipChallenges(chChallenges);
      loadData();
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Ошибка удаления',
        description: errMsg(err, 'Не удалось исключить задачу'),
      });
    }
  };

  const handleRemoveParticipant = async (participantId: string) => {
    if (!selectedChampionship) return;

    // eslint-disable-next-line no-alert
    const confirmed = confirm(
      'Дисквалифицировать участника? Он будет удален из таблицы лидеров соревнований.',
    );
    if (!confirmed) return;

    try {
      await removeParticipantFromChampionship(selectedChampionship.id, participantId);
      toast({ variant: 'success', title: 'Участник удален' });
      const parts = await getChampionshipParticipants(selectedChampionship.id);
      setParticipants(parts as Participant[]);
      loadData();
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Ошибка удаления',
        description: errMsg(err, 'Не удалось удалить участника'),
      });
    }
  };

  const handleStartEditScore = (part: Participant) => {
    setEditingParticipantId(part.id);
    setEditScoreValue(part.score);
  };

  const handleSaveScore = async (participantId: string) => {
    if (!selectedChampionship) return;
    setIsSavingScore(true);
    try {
      await updateParticipantScore(selectedChampionship.id, participantId, editScoreValue);
      toast({ variant: 'success', title: 'Очки участника изменены' });
      setEditingParticipantId(null);
      const parts = await getChampionshipParticipants(selectedChampionship.id);
      setParticipants(parts as Participant[]);
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: errMsg(err, 'Не удалось изменить очки'),
      });
    } finally {
      setIsSavingScore(false);
    }
  };

  // Filtered championship list
  const filteredChampionships = championships.filter((ch) => {
    const matchesSearch =
      ch.name.toLowerCase().includes(search.toLowerCase()) ||
      ch.slug.toLowerCase().includes(search.toLowerCase());

    if (statusFilter === 'ALL') return matchesSearch;
    return matchesSearch && ch.status === statusFilter;
  });

  // Calculate metrics
  const activeCount = championships.filter((c) => c.status === 'ACTIVE').length;
  const draftCount = championships.filter((c) => c.status === 'DRAFT').length;
  const pastCount = championships.filter((c) => c.status === 'PAST').length;

  return (
    <div className="space-y-6 pb-12">
      {/* Sleek Top Metrics Row */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-zinc-800 bg-zinc-900/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-zinc-400">Всего олимпиад</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-white">{championships.length}</div>
          </CardContent>
        </Card>

        <Card className="border-emerald-900/30 bg-emerald-950/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-emerald-400">Идет сейчас</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-emerald-400">{activeCount}</div>
          </CardContent>
        </Card>

        <Card className="border-amber-900/30 bg-amber-950/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-amber-400">В черновиках</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-amber-400">{draftCount}</div>
          </CardContent>
        </Card>

        <Card className="border-blue-900/30 bg-blue-950/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-blue-400">Завершено</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-blue-400">{pastCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Workspace Layout */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* LEFT COLUMN: Championships list (5 cols) */}
        <div className="space-y-4 lg:col-span-5">
          <div className="space-y-3 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
            {/* Search and Filters */}
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <Input
                placeholder="Поиск по названию/slug..."
                className="border-zinc-800 bg-zinc-950 pl-9 text-sm placeholder:text-zinc-500 focus-visible:ring-1 focus-visible:ring-amber-500"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Segmented Status Selector */}
            <div className="grid grid-cols-4 gap-1 rounded-xl border border-zinc-800 bg-zinc-950 p-1 text-xs">
              <button
                onClick={() => setStatusFilter('ALL')}
                className={`rounded-lg py-1.5 text-center font-medium transition-all ${statusFilter === 'ALL' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white'}`}
              >
                Все
              </button>
              <button
                onClick={() => setStatusFilter('DRAFT')}
                className={`rounded-lg py-1.5 text-center font-medium transition-all ${statusFilter === 'DRAFT' ? 'bg-zinc-800 text-amber-400' : 'text-zinc-400 hover:text-white'}`}
              >
                Черновик
              </button>
              <button
                onClick={() => setStatusFilter('ACTIVE')}
                className={`rounded-lg py-1.5 text-center font-medium transition-all ${statusFilter === 'ACTIVE' ? 'bg-zinc-800 text-emerald-400' : 'text-zinc-400 hover:text-white'}`}
              >
                Идет
              </button>
              <button
                onClick={() => setStatusFilter('PAST')}
                className={`rounded-lg py-1.5 text-center font-medium transition-all ${statusFilter === 'PAST' ? 'bg-zinc-800 text-zinc-300' : 'text-zinc-400 hover:text-white'}`}
              >
                Прошлые
              </button>
            </div>

            {/* Create Button */}
            <Button
              onClick={handleOpenCreate}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 font-extrabold text-black hover:bg-amber-400"
            >
              <Plus className="h-4 w-4" />
              Создать соревнование
            </Button>
          </div>

          {/* Championship List Container */}
          <div className="max-h-[600px] space-y-3 overflow-y-auto pr-1">
            {loading ? (
              <div className="py-10 text-center text-sm text-zinc-500">Загрузка списка...</div>
            ) : filteredChampionships.length === 0 ? (
              <div className="py-10 text-center text-sm text-zinc-500">Ничего не найдено</div>
            ) : (
              filteredChampionships.map((ch) => {
                const isSelected = ch.id === selectedChampionshipId;
                return (
                  <div
                    key={ch.id}
                    onClick={() => {
                      setSelectedChampionshipId(ch.id);
                      setActiveTab('overview');
                    }}
                    className={`cursor-pointer rounded-2xl border p-4 text-left transition-all ${
                      isSelected
                        ? 'border-amber-500 bg-amber-500/5 shadow-[0_0_15px_rgba(245,158,11,0.05)]'
                        : 'border-zinc-800 bg-zinc-900/20 hover:border-zinc-700 hover:bg-zinc-900/40'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold leading-tight text-white">{ch.name}</h4>
                        <div className="font-mono text-[10px] text-zinc-500">{ch.slug}</div>
                      </div>

                      {/* Badge status */}
                      <Badge
                        className={
                          ch.status === 'ACTIVE'
                            ? 'border border-emerald-500/20 bg-emerald-500/10 text-[10px] text-emerald-400'
                            : ch.status === 'PAST'
                              ? 'bg-zinc-800 text-[10px] text-zinc-400'
                              : 'border border-amber-500/20 bg-amber-500/10 text-[10px] text-amber-400'
                        }
                      >
                        {ch.status === 'ACTIVE'
                          ? 'Идет'
                          : ch.status === 'PAST'
                            ? 'Завершен'
                            : 'Черновик'}
                      </Badge>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-xs text-zinc-400">
                      <div>
                        {ch.company ? (
                          <span className="font-semibold text-zinc-300">{ch.company.name}</span>
                        ) : (
                          <span className="italic text-zinc-500">Глобальный</span>
                        )}
                      </div>
                      <div className="flex gap-3 text-[11px]">
                        <span>
                          🎯 <strong>{ch._count?.challenges || 0}</strong> зад.
                        </span>
                        <span>
                          👥 <strong>{ch._count?.participants || 0}</strong> уч.
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: WORKSPACE VIEW (7 cols) */}
        <div className="lg:col-span-7">
          {/* 1. Empty State */}
          {selectedChampionshipId === null && (
            <Card className="flex h-full min-h-[450px] flex-col items-center justify-center border-zinc-800 bg-zinc-900/10 p-12 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900">
                <Trophy className="h-8 w-8 text-zinc-600" />
              </div>
              <h3 className="mb-1 text-lg font-bold text-white">Панель управления</h3>
              <p className="max-w-sm text-sm text-zinc-500">
                Выберите чемпионат из списка слева или создайте новый, чтобы настроить задачи,
                управлять участниками и запускать соревнования.
              </p>
            </Card>
          )}

          {/* 2. Creation Form State */}
          {selectedChampionshipId === 'NEW' && (
            <Card className="space-y-6 border-zinc-800 bg-zinc-900/40 p-6">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                <div>
                  <h3 className="text-lg font-extrabold text-white">Новое соревнование</h3>
                  <p className="text-xs text-zinc-400">
                    Создание нового инстанса чемпионата ЛитКот
                  </p>
                </div>
                <Button
                  variant="ghost"
                  onClick={() => setSelectedChampionshipId(null)}
                  className="text-xs text-zinc-400 hover:text-white"
                >
                  Отмена
                </Button>
              </div>

              <form onSubmit={handleSaveChampionship} className="space-y-4 text-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label
                      htmlFor="new-ch-name"
                      className="text-xs font-bold uppercase text-zinc-400"
                    >
                      Название
                    </label>
                    <Input
                      id="new-ch-name"
                      required
                      value={formName}
                      onChange={(e) => {
                        setFormName(e.target.value);
                        // Auto-generate slug
                        setFormSlug(
                          e.target.value
                            .toLowerCase()
                            .replace(/[^a-zа-я0-9-_ ]/g, '')
                            .replace(/\s+/g, '-'),
                        );
                      }}
                      placeholder="Осенний Кубок ЛитКот"
                      className="border-zinc-800 bg-zinc-950 text-white"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label
                      htmlFor="new-ch-slug"
                      className="text-xs font-bold uppercase text-zinc-400"
                    >
                      Slug URL-префикс
                    </label>
                    <Input
                      id="new-ch-slug"
                      required
                      value={formSlug}
                      onChange={(e) => setFormSlug(e.target.value)}
                      placeholder="autumn-cup-2026"
                      className="border-zinc-800 bg-zinc-950 text-white"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="new-ch-desc"
                    className="text-xs font-bold uppercase text-zinc-400"
                  >
                    Правила и описание
                  </label>
                  <Textarea
                    id="new-ch-desc"
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Опишите регламент, правила набора баллов и призы..."
                    className="h-28 resize-none border-zinc-800 bg-zinc-950 text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label
                      htmlFor="new-ch-start"
                      className="text-xs font-bold uppercase text-zinc-400"
                    >
                      Дата и время начала
                    </label>
                    <Input
                      id="new-ch-start"
                      type="datetime-local"
                      required
                      value={formStartDate}
                      onChange={(e) => setFormStartDate(e.target.value)}
                      className="border-zinc-800 bg-zinc-950 text-white"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label
                      htmlFor="new-ch-end"
                      className="text-xs font-bold uppercase text-zinc-400"
                    >
                      Дата и время окончания
                    </label>
                    <Input
                      id="new-ch-end"
                      type="datetime-local"
                      required
                      value={formEndDate}
                      onChange={(e) => setFormEndDate(e.target.value)}
                      className="border-zinc-800 bg-zinc-950 text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label
                      htmlFor="new-ch-status"
                      className="text-xs font-bold uppercase text-zinc-400"
                    >
                      Начальный статус
                    </label>
                    <select
                      id="new-ch-status"
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value)}
                      className="h-10 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 text-sm text-white focus-visible:outline-none"
                    >
                      <option value="DRAFT">Черновик (Редактирование)</option>
                      <option value="ACTIVE">Активен (Сразу идет)</option>
                      <option value="PAST">Завершен (Архив)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label
                      htmlFor="new-ch-company"
                      className="text-xs font-bold uppercase text-zinc-400"
                    >
                      Организатор
                    </label>
                    <select
                      id="new-ch-company"
                      value={formCompanyId}
                      onChange={(e) => setFormCompanyId(e.target.value)}
                      className="h-10 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 text-sm text-white focus-visible:outline-none"
                    >
                      <option value="">-- Глобальное соревнование --</option>
                      {companies.map((co) => (
                        <option key={co.id} value={co.id}>
                          {co.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="submit"
                    className="rounded-xl bg-amber-500 px-6 font-extrabold text-black hover:bg-amber-400"
                  >
                    Создать чемпионат
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {/* 3. Detailed Workspace View */}
          {selectedChampionshipId !== null &&
          selectedChampionshipId !== 'NEW' &&
          selectedChampionship ? (
            <Card className="flex flex-col overflow-hidden border-zinc-800 bg-zinc-900/40">
              {/* Workspace Header */}
              <div className="border-b border-zinc-800 bg-zinc-950/20 p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-xl font-black text-white">{selectedChampionship.name}</h3>
                      <Badge
                        className={
                          selectedChampionship.status === 'ACTIVE'
                            ? 'border border-emerald-500/20 bg-emerald-500/10 text-xs text-emerald-400'
                            : selectedChampionship.status === 'PAST'
                              ? 'bg-zinc-800 text-xs text-zinc-400'
                              : 'border border-amber-500/20 bg-amber-500/10 text-xs text-amber-400'
                        }
                      >
                        {selectedChampionship.status === 'ACTIVE'
                          ? 'АКТИВЕН'
                          : selectedChampionship.status === 'PAST'
                            ? 'ЗАВЕРШЕН'
                            : 'ЧЕРНОВИК'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-zinc-400">
                      <span>
                        Slug:{' '}
                        <strong className="font-mono text-zinc-300">
                          /{selectedChampionship.slug}
                        </strong>
                      </span>
                      <span>•</span>
                      <span>
                        Компания:{' '}
                        <strong>
                          {selectedChampionship.company
                            ? selectedChampionship.company.name
                            : 'Глобальный'}
                        </strong>
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-red-900/30 text-red-400 hover:bg-red-950/20 hover:text-red-300"
                      onClick={() => handleDeleteChampionship(selectedChampionship.id)}
                    >
                      <Trash2 className="mr-1.5 h-4 w-4" />
                      Удалить
                    </Button>
                  </div>
                </div>

                {/* Tab Navigation */}
                <div className="mt-6 flex gap-1 border-b border-zinc-800">
                  <button
                    onClick={() => setActiveTab('overview')}
                    className={`border-b-2 px-4 py-2 text-xs font-bold transition-all ${
                      activeTab === 'overview'
                        ? 'border-amber-500 text-white'
                        : 'border-transparent text-zinc-400 hover:text-white'
                    }`}
                  >
                    Обзор и Ход
                  </button>
                  <button
                    onClick={() => setActiveTab('challenges')}
                    className={`border-b-2 px-4 py-2 text-xs font-bold transition-all ${
                      activeTab === 'challenges'
                        ? 'border-amber-500 text-white'
                        : 'border-transparent text-zinc-400 hover:text-white'
                    }`}
                  >
                    Задачи ({championshipChallenges.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('participants')}
                    className={`border-b-2 px-4 py-2 text-xs font-bold transition-all ${
                      activeTab === 'participants'
                        ? 'border-amber-500 text-white'
                        : 'border-transparent text-zinc-400 hover:text-white'
                    }`}
                  >
                    Участники ({participants.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('edit')}
                    className={`border-b-2 px-4 py-2 text-xs font-bold transition-all ${
                      activeTab === 'edit'
                        ? 'border-amber-500 text-white'
                        : 'border-transparent text-zinc-400 hover:text-white'
                    }`}
                  >
                    Настройки
                  </button>
                </div>
              </div>

              {/* Workspace Content */}
              <div className="min-h-[350px] flex-1 p-6">
                {loadingWorkspaceData ? (
                  <div className="flex h-48 items-center justify-center text-sm text-zinc-500">
                    Загрузка деталей чемпионата...
                  </div>
                ) : (
                  <>
                    {/* TAB 1: OVERVIEW & PROGRESS */}
                    {activeTab === 'overview' && (
                      <div className="space-y-6">
                        {/* Interactive Timeline & Action Box */}
                        <div className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-950/20 p-5">
                          <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase text-zinc-400">
                            <Calendar className="h-3.5 w-3.5 text-amber-500" />
                            Статус и Временная Шкала
                          </h4>

                          {/* Time calculation details */}
                          {(() => {
                            if (!timeNow) return null;
                            const start = new Date(selectedChampionship.startDate);
                            const end = new Date(selectedChampionship.endDate);
                            const totalMs = end.getTime() - start.getTime();

                            if (selectedChampionship.status === 'DRAFT') {
                              return (
                                <div className="space-y-4">
                                  <p className="text-sm text-zinc-300">
                                    Соревнование находится в режиме <strong>черновика</strong>.
                                    Участники не видят этот чемпионат. Вы можете наполнять его
                                    задачами.
                                  </p>
                                  <div className="flex gap-2">
                                    <Button
                                      size="sm"
                                      onClick={() => handleQuickStatusChange('ACTIVE')}
                                      className="bg-emerald-500 font-bold text-black hover:bg-emerald-400"
                                    >
                                      Запустить сейчас
                                    </Button>
                                  </div>
                                </div>
                              );
                            }

                            if (selectedChampionship.status === 'PAST') {
                              return (
                                <div className="space-y-3">
                                  <p className="text-sm text-zinc-400">
                                    Соревнование официально <strong>завершено</strong>.
                                  </p>
                                  <div className="text-xs text-zinc-500">
                                    Период: {start.toLocaleString('ru-RU')} —{' '}
                                    {end.toLocaleString('ru-RU')}
                                  </div>
                                  <div className="flex gap-2">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleQuickStatusChange('ACTIVE')}
                                      className="border-zinc-800 text-xs hover:bg-zinc-800"
                                    >
                                      Возобновить соревнование
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleQuickStatusChange('DRAFT')}
                                      className="border-zinc-800 text-xs text-amber-400 hover:bg-zinc-800"
                                    >
                                      Вернуть в черновик
                                    </Button>
                                  </div>
                                </div>
                              );
                            }

                            // ACTIVE STATE
                            const elapsedMs = timeNow.getTime() - start.getTime();
                            const remainingMs = end.getTime() - timeNow.getTime();

                            if (elapsedMs < 0) {
                              // Starts in future
                              const daysToStart = Math.ceil(-elapsedMs / 86400000);
                              return (
                                <div className="space-y-3">
                                  <div className="flex items-center justify-between text-xs">
                                    <span className="text-zinc-400">Ожидание старта</span>
                                    <span className="font-bold text-amber-400">
                                      Начнется через {daysToStart} дн.
                                    </span>
                                  </div>
                                  <div className="h-1.5 w-full overflow-hidden rounded-full border border-zinc-800 bg-zinc-900">
                                    <div className="h-full w-1/12 animate-pulse bg-amber-500" />
                                  </div>
                                  <p className="text-xs text-zinc-500">
                                    Старт запланирован на:{' '}
                                    <strong>{start.toLocaleString('ru-RU')}</strong>
                                  </p>
                                  <div className="flex gap-2 pt-1">
                                    <Button
                                      size="sm"
                                      onClick={() => handleQuickStatusChange('ACTIVE')}
                                      className="bg-emerald-500 font-bold text-black hover:bg-emerald-400"
                                    >
                                      Запустить прямо сейчас
                                    </Button>
                                  </div>
                                </div>
                              );
                            }

                            if (remainingMs < 0) {
                              // Active but passed end date
                              return (
                                <div className="space-y-3">
                                  <div className="text-sm font-bold text-amber-400">
                                    Срок проведения вышел, но статус все еще равен АКТИВЕН.
                                  </div>
                                  <p className="text-xs text-zinc-500">
                                    Рекомендуется перевести чемпионат в статус ЗАВЕРШЕН, чтобы
                                    зафиксировать таблицу лидеров.
                                  </p>
                                  <div className="flex gap-2">
                                    <Button
                                      size="sm"
                                      onClick={() => handleQuickStatusChange('PAST')}
                                      className="bg-zinc-800 font-bold text-white hover:bg-zinc-700"
                                    >
                                      Завершить официально
                                    </Button>
                                  </div>
                                </div>
                              );
                            }

                            // Running currently
                            const percent = Math.min(100, Math.max(0, (elapsedMs / totalMs) * 100));
                            const hoursRemaining = Math.ceil(remainingMs / 3600000);
                            const daysRemaining = Math.floor(hoursRemaining / 24);

                            return (
                              <div className="space-y-3">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-zinc-400">
                                    Прогресс времени проведения:
                                  </span>
                                  <span className="font-bold text-emerald-400">
                                    {daysRemaining > 0
                                      ? `Осталось ${daysRemaining} дн.`
                                      : `Осталось ${hoursRemaining} ч.`}
                                  </span>
                                </div>
                                <div className="h-2 w-full overflow-hidden rounded-full border border-zinc-800 bg-zinc-900">
                                  <div
                                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-1000"
                                    style={{ width: `${percent}%` }}
                                  />
                                </div>
                                <div className="flex justify-between font-mono text-[10px] text-zinc-500">
                                  <span>Старт: {start.toLocaleString('ru-RU')}</span>
                                  <span>Конец: {end.toLocaleString('ru-RU')}</span>
                                </div>
                                <div className="flex gap-2 pt-2">
                                  <Button
                                    size="sm"
                                    onClick={() => handleQuickStatusChange('PAST')}
                                    className="border border-zinc-800 bg-zinc-900 font-bold text-zinc-400 hover:text-white"
                                  >
                                    Остановить досрочно
                                  </Button>
                                </div>
                              </div>
                            );
                          })()}
                        </div>

                        {/* Automatic Warning Panel for Managers */}
                        {(() => {
                          const warnings: string[] = [];
                          if (championshipChallenges.length === 0) {
                            warnings.push(
                              'В соревнование не добавлены задачи. Участники не увидят контента для решения.',
                            );
                          }
                          const start = new Date(selectedChampionship.startDate);
                          const end = new Date(selectedChampionship.endDate);
                          const now = new Date();

                          if (selectedChampionship.status === 'ACTIVE' && end < now) {
                            warnings.push(
                              'Период проведения закончился, но статус олимпиады до сих пор числится как "Активен". Переведите её в статус "Завершен".',
                            );
                          }
                          if (selectedChampionship.status === 'ACTIVE' && start > now) {
                            warnings.push(
                              'Олимпиада активна, хотя плановое время старта еще не наступило (начнется позже).',
                            );
                          }

                          if (warnings.length === 0) return null;

                          return (
                            <div className="space-y-2 rounded-2xl border border-amber-900/30 bg-amber-950/10 p-4">
                              <h5 className="text-xs font-bold uppercase tracking-wide text-amber-400">
                                ⚠️ Рекомендации по подготовке к проведению
                              </h5>
                              <ul className="list-inside list-disc space-y-1 text-xs text-amber-300">
                                {warnings.map((w, idx) => (
                                  <li key={idx}>{w}</li>
                                ))}
                              </ul>
                            </div>
                          );
                        })()}

                        {/* Rules / Description details */}
                        <div className="space-y-1">
                          <h5 className="text-xs font-bold uppercase text-zinc-500">
                            Ре регламент и описание чемпионата
                          </h5>
                          <div className="max-h-48 overflow-y-auto whitespace-pre-line rounded-2xl border border-zinc-800 bg-zinc-900/10 p-4 text-xs leading-relaxed text-zinc-300">
                            {selectedChampionship.description || 'Описание не заполнено.'}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* TAB 2: CHALLENGES */}
                    {activeTab === 'challenges' && (
                      <div className="space-y-6">
                        {/* Quick Add Form */}
                        <form onSubmit={handleAddChallenge} className="flex items-end gap-2">
                          <div className="flex-1 space-y-1.5 text-left">
                            <label
                              htmlFor="challenge-select"
                              className="text-xs font-bold uppercase text-zinc-400"
                            >
                              Добавить задачу из активных на платформе
                            </label>
                            <select
                              id="challenge-select"
                              value={selectedChallengeId}
                              onChange={(e) => setSelectedChallengeId(e.target.value)}
                              className="h-10 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 text-sm text-white focus:border-amber-500 focus-visible:outline-none"
                            >
                              <option value="">-- Выберите задачу --</option>
                              {availableChallenges
                                .filter(
                                  (avail) =>
                                    !championshipChallenges.some(
                                      (linked) => linked.id === avail.id,
                                    ),
                                )
                                .map((ch) => (
                                  <option key={ch.id} value={ch.id}>
                                    [{ch.difficulty}] {ch.name} (ID: #{ch.id})
                                  </option>
                                ))}
                            </select>
                          </div>
                          <Button
                            type="submit"
                            className="h-10 rounded-xl bg-amber-500 px-5 font-extrabold text-black hover:bg-amber-400"
                          >
                            Добавить
                          </Button>
                        </form>

                        {/* Linked Challenges Table */}
                        <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/20">
                          <table className="w-full text-left text-xs">
                            <thead>
                              <tr className="border-b border-zinc-800 bg-zinc-950/50 font-bold uppercase tracking-wider text-zinc-400">
                                <th className="px-4 py-3">ID</th>
                                <th className="px-4 py-3">Название</th>
                                <th className="px-4 py-3">Сложность</th>
                                <th className="px-4 py-3 text-right">Действия</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-800 text-zinc-300">
                              {championshipChallenges.length === 0 ? (
                                <tr>
                                  <td colSpan={4} className="py-8 text-center italic text-zinc-500">
                                    В этом соревновании пока нет задач. Добавьте первую сверху!
                                  </td>
                                </tr>
                              ) : (
                                championshipChallenges.map((ch) => (
                                  <tr
                                    key={ch.id}
                                    className="transition-colors hover:bg-zinc-900/10"
                                  >
                                    <td className="px-4 py-3 font-mono text-zinc-500">#{ch.id}</td>
                                    <td className="px-4 py-3 font-bold text-white">{ch.name}</td>
                                    <td className="px-4 py-3">
                                      <Badge
                                        variant="outline"
                                        className="border-zinc-800 text-[10px] font-bold uppercase text-zinc-400"
                                      >
                                        {ch.difficulty}
                                      </Badge>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => handleRemoveChallenge(ch.id)}
                                        className="h-7 px-2 text-xs text-red-400 hover:bg-red-950/20 hover:text-red-300"
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
                      </div>
                    )}

                    {/* TAB 3: PARTICIPANTS & LEADERBOARD */}
                    {activeTab === 'participants' && (
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold uppercase text-zinc-400">
                            Рейтинговая таблица участников в реальном времени
                          </h4>
                          <span className="text-xs text-zinc-500">
                            Всего: <strong>{participants.length}</strong> уч.
                          </span>
                        </div>

                        {/* Leaderboard list */}
                        <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/20">
                          <table className="w-full text-left text-xs">
                            <thead>
                              <tr className="border-b border-zinc-800 bg-zinc-950/50 font-bold uppercase tracking-wider text-zinc-400">
                                <th className="w-16 px-4 py-3">Место</th>
                                <th className="px-4 py-3">Имя</th>
                                <th className="px-4 py-3">Email</th>
                                <th className="w-32 px-4 py-3">Очки</th>
                                <th className="px-4 py-3 text-right">Действия</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-800 text-zinc-300">
                              {participants.length === 0 ? (
                                <tr>
                                  <td colSpan={5} className="py-8 text-center italic text-zinc-500">
                                    Нет зарегистрированных участников.
                                  </td>
                                </tr>
                              ) : (
                                participants.map((part, index) => {
                                  const isEditing = editingParticipantId === part.id;
                                  return (
                                    <tr
                                      key={part.id}
                                      className="transition-colors hover:bg-zinc-900/10"
                                    >
                                      <td className="px-4 py-3 font-bold text-zinc-400">
                                        {index === 0
                                          ? '🥇'
                                          : index === 1
                                            ? '🥈'
                                            : index === 2
                                              ? '🥉'
                                              : `#${index + 1}`}
                                      </td>
                                      <td className="px-4 py-3 font-bold text-white">
                                        {part.user.name || 'Аноним'}
                                      </td>
                                      <td className="px-4 py-3 font-mono text-zinc-400">
                                        {part.user.email}
                                      </td>
                                      <td className="px-4 py-3 font-bold text-amber-400">
                                        {isEditing ? (
                                          <div className="flex items-center gap-1.5">
                                            <Input
                                              type="number"
                                              value={editScoreValue}
                                              onChange={(e) =>
                                                setEditScoreValue(Number(e.target.value))
                                              }
                                              className="h-7 w-16 border-zinc-800 bg-zinc-950 px-1 text-center text-xs text-white"
                                            />
                                            <button
                                              disabled={isSavingScore}
                                              onClick={() => handleSaveScore(part.id)}
                                              className="rounded bg-emerald-500 p-1 font-bold text-black hover:bg-emerald-400 disabled:opacity-50"
                                            >
                                              ✓
                                            </button>
                                            <button
                                              onClick={() => setEditingParticipantId(null)}
                                              className="rounded bg-zinc-800 p-1 text-zinc-400 hover:text-white"
                                            >
                                              ✕
                                            </button>
                                          </div>
                                        ) : (
                                          <span className="flex items-center gap-1">
                                            {part.score} pts
                                            <button
                                              onClick={() => handleStartEditScore(part)}
                                              className="ml-1 cursor-pointer text-[10px] text-zinc-500 underline opacity-0 transition-opacity hover:text-white group-hover:opacity-100"
                                            >
                                              (ред.)
                                            </button>
                                          </span>
                                        )}
                                      </td>
                                      <td className="space-x-1.5 px-4 py-3 text-right">
                                        {!isEditing && (
                                          <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => handleStartEditScore(part)}
                                            className="h-6 border border-zinc-800 px-1.5 text-[10px] text-zinc-400 hover:text-white"
                                          >
                                            Баллы
                                          </Button>
                                        )}
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          onClick={() => handleRemoveParticipant(part.id)}
                                          className="h-6 px-1.5 text-[10px] text-red-400 hover:bg-red-950/20 hover:text-red-300"
                                        >
                                          Исключить
                                        </Button>
                                      </td>
                                    </tr>
                                  );
                                })
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* TAB 4: EDIT PARAMETERS & SETTINGS */}
                    {activeTab === 'edit' && (
                      <form
                        onSubmit={handleSaveChampionship}
                        className="space-y-4 text-left text-sm"
                      >
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label
                              htmlFor="ch-name"
                              className="text-xs font-bold uppercase text-zinc-400"
                            >
                              Название соревнования
                            </label>
                            <Input
                              id="ch-name"
                              required
                              value={formName}
                              onChange={(e) => setFormName(e.target.value)}
                              className="border-zinc-800 bg-zinc-950 text-white"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label
                              htmlFor="ch-slug"
                              className="text-xs font-bold uppercase text-zinc-400"
                            >
                              Slug префикс URL
                            </label>
                            <Input
                              id="ch-slug"
                              required
                              value={formSlug}
                              onChange={(e) => setFormSlug(e.target.value)}
                              className="border-zinc-800 bg-zinc-950 text-white"
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label
                            htmlFor="ch-desc"
                            className="text-xs font-bold uppercase text-zinc-400"
                          >
                            Регламент / Описание
                          </label>
                          <Textarea
                            id="ch-desc"
                            value={formDescription}
                            onChange={(e) => setFormDescription(e.target.value)}
                            className="h-28 resize-none border-zinc-800 bg-zinc-950 text-white"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label
                              htmlFor="ch-start"
                              className="text-xs font-bold uppercase text-zinc-400"
                            >
                              Дата начала
                            </label>
                            <Input
                              id="ch-start"
                              type="datetime-local"
                              required
                              value={formStartDate}
                              onChange={(e) => setFormStartDate(e.target.value)}
                              className="border-zinc-800 bg-zinc-950 text-white"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label
                              htmlFor="ch-end"
                              className="text-xs font-bold uppercase text-zinc-400"
                            >
                              Дата окончания
                            </label>
                            <Input
                              id="ch-end"
                              type="datetime-local"
                              required
                              value={formEndDate}
                              onChange={(e) => setFormEndDate(e.target.value)}
                              className="border-zinc-800 bg-zinc-950 text-white"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label
                              htmlFor="ch-status"
                              className="text-xs font-bold uppercase text-zinc-400"
                            >
                              Статус
                            </label>
                            <select
                              id="ch-status"
                              value={formStatus}
                              onChange={(e) => setFormStatus(e.target.value)}
                              className="h-10 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 text-sm text-white focus-visible:outline-none"
                            >
                              <option value="DRAFT">Черновик</option>
                              <option value="ACTIVE">Идет (Активен)</option>
                              <option value="PAST">Завершен</option>
                            </select>
                          </div>

                          <div className="space-y-1.5">
                            <label
                              htmlFor="ch-company"
                              className="text-xs font-bold uppercase text-zinc-400"
                            >
                              Организатор
                            </label>
                            <select
                              id="ch-company"
                              value={formCompanyId}
                              onChange={(e) => setFormCompanyId(e.target.value)}
                              className="h-10 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 text-sm text-white focus-visible:outline-none"
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

                        <div className="flex justify-end gap-2 pt-4">
                          <Button
                            type="submit"
                            className="rounded-xl bg-amber-500 px-6 font-extrabold text-black hover:bg-amber-400"
                          >
                            Сохранить изменения
                          </Button>
                        </div>
                      </form>
                    )}
                  </>
                )}
              </div>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  );
}
