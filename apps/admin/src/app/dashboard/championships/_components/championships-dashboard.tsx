'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/ui/components/card';
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
  DialogTrigger,
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
} from '@repo/ui/icons';

interface Championship {
  id: string;
  name: string;
  slug: string;
  description: string;
  prizePool: string;
  startDate: string;
  endDate: string;
  status: 'ACTIVE' | 'UPCOMING' | 'FINISHED';
  participantsCount: number;
  challengesCount: number;
}

const DEFAULT_CHAMPIONSHIPS: Championship[] = [];

export function ChampionshipDashboard() {
  const [championships, setChampionships] = useState<Championship[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('leetcot_championships');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error(e);
        }
      }
    }
    return DEFAULT_CHAMPIONSHIPS;
  });

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'UPCOMING' | 'FINISHED'>('ALL');
  
  // Dialog States
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedChampionship, setSelectedChampionship] = useState<Championship | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [prizePool, setPrizePool] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState<'ACTIVE' | 'UPCOMING' | 'FINISHED'>('UPCOMING');
  const [challengesCount, setChallengesCount] = useState(5);

  useEffect(() => {
    localStorage.setItem('leetcot_championships', JSON.stringify(championships));
  }, [championships]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !description || !startDate || !endDate) return;

    const newChampionship: Championship = {
      id: `ch-${Date.now()}`,
      name,
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      description,
      prizePool: prizePool || 'Без призового фонда',
      startDate,
      endDate,
      status,
      participantsCount: status === 'ACTIVE' ? Math.floor(Math.random() * 50) + 10 : 0,
      challengesCount: Number(challengesCount) || 5,
    };

    setChampionships([newChampionship, ...championships]);
    setIsCreateOpen(false);
    resetForm();
  };

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChampionship || !name || !description || !startDate || !endDate) return;

    const updated = championships.map((ch) => {
      if (ch.id === selectedChampionship.id) {
        return {
          ...ch,
          name,
          description,
          prizePool,
          startDate,
          endDate,
          status,
          challengesCount: Number(challengesCount) || 5,
        };
      }
      return ch;
    });

    setChampionships(updated);
    setIsEditOpen(false);
    setSelectedChampionship(null);
    resetForm();
  };

  const handleDelete = (id: string) => {
    if (confirm('Вы уверены, что хотите удалить это соревнование? 😿')) {
      setChampionships(championships.filter((ch) => ch.id !== id));
    }
  };

  const openEditDialog = (ch: Championship) => {
    setSelectedChampionship(ch);
    setName(ch.name);
    setDescription(ch.description);
    setPrizePool(ch.prizePool);
    setStartDate(ch.startDate);
    setEndDate(ch.endDate);
    setStatus(ch.status);
    setChallengesCount(ch.challengesCount);
    setIsEditOpen(true);
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setPrizePool('');
    setStartDate('');
    setEndDate('');
    setStatus('UPCOMING');
    setChallengesCount(5);
  };

  // Metrics
  const activeCount = championships.filter((c) => c.status === 'ACTIVE').length;
  const upcomingCount = championships.filter((c) => c.status === 'UPCOMING').length;
  const totalParticipants = championships.reduce((sum, c) => sum + c.participantsCount, 0);

  const filteredChampionships = championships.filter((ch) => {
    const matchesSearch = ch.name.toLowerCase().includes(search.toLowerCase()) || 
                          ch.description.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || ch.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-950/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Активные</CardTitle>
            <Trophy className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-300">{activeCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Идут прямо сейчас</p>
          </CardContent>
        </Card>

        <Card className="border-blue-500/20 bg-blue-50/50 dark:bg-blue-950/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-blue-600 dark:text-blue-400">Анонсировано</CardTitle>
            <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-blue-700 dark:text-blue-300">{upcomingCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Скоро начнутся</p>
          </CardContent>
        </Card>

        <Card className="border-orange-500/20 bg-orange-50/50 dark:bg-orange-950/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-orange-600 dark:text-orange-400">Участники</CardTitle>
            <Award className="h-4 w-4 text-orange-600 dark:text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-orange-700 dark:text-orange-300">
              {totalParticipants.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Котов приняли участие</p>
          </CardContent>
        </Card>

        <Card className="border-purple-500/20 bg-purple-50/50 dark:bg-purple-950/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-purple-600 dark:text-purple-400">Всего соревнований</CardTitle>
            <CheckCircle className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-purple-700 dark:text-purple-300">{championships.length}</div>
            <p className="text-xs text-muted-foreground mt-1">За все время</p>
          </CardContent>
        </Card>
      </div>

      {/* Controls & Search */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Поиск по названию или описанию..."
            className="pl-9 bg-background/50"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-lg border bg-card p-1 text-xs">
            {(['ALL', 'ACTIVE', 'UPCOMING', 'FINISHED'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setStatusFilter(filter)}
                className={`rounded-md px-3 py-1.5 font-medium transition-all ${
                  statusFilter === filter
                    ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 shadow-sm'
                    : 'text-muted-foreground hover:text-zinc-900 dark:hover:text-zinc-50'
                }`}
              >
                {filter === 'ALL' && 'Все'}
                {filter === 'ACTIVE' && 'Активные'}
                {filter === 'UPCOMING' && 'Предстоящие'}
                {filter === 'FINISHED' && 'Завершенные'}
              </button>
            ))}
          </div>

          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-1 rounded-xl">
                <Plus className="h-4 w-4" />
                Создать
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg rounded-3xl">
              <DialogHeader>
                <DialogTitle>Создание Чемпионата 🏆</DialogTitle>
                <DialogDescription>
                  Заполните информацию о новом соревновании на платформе ЛитКот.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4 py-2">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground">Название соревнования</label>
                  <Input
                    placeholder="Например: Осенний Хакатон 2026 🐱"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground">Описание</label>
                  <Textarea
                    placeholder="Подробное описание правил, призов и условий..."
                    className="min-h-[80px]"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-muted-foreground">Призовой фонд</label>
                    <Input
                      placeholder="Например: 200 000 ₽"
                      value={prizePool}
                      onChange={(e) => setPrizePool(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-muted-foreground">Кол-во задач</label>
                    <Input
                      type="number"
                      min={1}
                      value={challengesCount}
                      onChange={(e) => setChallengesCount(parseInt(e.target.value) || 5)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-muted-foreground">Дата начала</label>
                    <Input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-muted-foreground">Дата окончания</label>
                    <Input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground">Начальный статус</label>
                  <select
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                  >
                    <option value="UPCOMING">Анонсировано (Предстоящее)</option>
                    <option value="ACTIVE">Активно (Идет сейчас)</option>
                    <option value="FINISHED">Завершено</option>
                  </select>
                </div>

                <DialogFooter className="pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsCreateOpen(false);
                      resetForm();
                    }}
                  >
                    Отмена
                  </Button>
                  <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                    Создать чемпионат
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Championships Cards / Table */}
      <div className="grid gap-6">
        {filteredChampionships.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed p-12 text-center">
            <span className="text-4xl mb-3">🐱💤</span>
            <h3 className="text-lg font-bold">Соревнования не найдены</h3>
            <p className="text-sm text-muted-foreground max-w-sm mt-1">
              Попробуйте изменить параметры поиска или фильтры, либо создайте новое соревнование.
            </p>
          </div>
        ) : (
          filteredChampionships.map((ch) => (
            <Card
              key={ch.id}
              className={`overflow-hidden border-l-4 transition-all hover:shadow-md ${
                ch.status === 'ACTIVE'
                  ? 'border-l-emerald-500'
                  : ch.status === 'UPCOMING'
                    ? 'border-l-blue-500'
                    : 'border-l-zinc-300 dark:border-l-zinc-800'
              }`}
            >
              <div className="p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{ch.name}</h4>
                      {ch.status === 'ACTIVE' && (
                        <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200">
                          Идет сейчас
                        </Badge>
                      )}
                      {ch.status === 'UPCOMING' && (
                        <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-950/30 dark:text-blue-400 border border-blue-200">
                          Скоро
                        </Badge>
                      )}
                      {ch.status === 'FINISHED' && (
                        <Badge className="bg-zinc-100 text-zinc-800 dark:bg-zinc-950/30 dark:text-zinc-400 border border-zinc-200">
                          Завершено
                        </Badge>
                      )}
                      <Badge variant="outline" className="border-purple-300 text-purple-600 dark:text-purple-400">
                        {ch.challengesCount} задач
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{ch.description}</p>
                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted-foreground mt-2 font-medium">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {ch.startDate} — {ch.endDate}
                      </span>
                      <span className="flex items-center gap-1 text-orange-600 dark:text-orange-400">
                        <Award className="h-3.5 w-3.5" />
                        Фонд: {ch.prizePool}
                      </span>
                      {ch.status !== 'UPCOMING' && (
                        <span className="flex items-center gap-1">
                          👤 Участников: {ch.participantsCount} котов
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(ch)}
                      className="rounded-lg gap-1 border-zinc-300 text-zinc-700 hover:bg-zinc-50"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Редактировать
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(ch.id)}
                      className="rounded-lg gap-1 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Удалить
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Edit Dialog */}
      {selectedChampionship && (
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="max-w-lg rounded-3xl">
            <DialogHeader>
              <DialogTitle>Редактирование Чемпионата 🏆</DialogTitle>
              <DialogDescription>
                Измените информацию о соревновании. Изменения сохраняются локально.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEdit} className="space-y-4 py-2">
              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground">Название соревнования</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground">Описание</label>
                <Textarea
                  className="min-h-[80px]"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground">Призовой фонд</label>
                  <Input
                    value={prizePool}
                    onChange={(e) => setPrizePool(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground">Кол-во задач</label>
                  <Input
                    type="number"
                    min={1}
                    value={challengesCount}
                    onChange={(e) => setChallengesCount(parseInt(e.target.value) || 5)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground">Дата начала</label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground">Дата окончания</label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground">Статус</label>
                <select
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                >
                  <option value="UPCOMING">Анонсировано (Предстоящее)</option>
                  <option value="ACTIVE">Активно (Идет сейчас)</option>
                  <option value="FINISHED">Завершено</option>
                </select>
              </div>

              <DialogFooter className="pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditOpen(false);
                    setSelectedChampionship(null);
                    resetForm();
                  }}
                >
                  Отмена
                </Button>
                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  Сохранить изменения
                  </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
