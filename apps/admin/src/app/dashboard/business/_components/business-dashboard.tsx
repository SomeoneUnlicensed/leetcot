'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/ui/components/card';
import { Button } from '@repo/ui/components/button';
import { Input } from '@repo/ui/components/input';
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
  Plus,
  SearchIcon,
  Trash2,
  Pencil,
  Command,
  User,
  TrendingUpIcon,
  AtSign,
  Shield,
  ShieldAlert,
} from '@repo/ui/icons';

interface Company {
  id: string;
  name: string;
  domain: string;
  plan: 'ENTERPRISE' | 'PREMIUM' | 'BASIC';
  licensesUsed: number;
  licensesMax: number;
  mrr: number;
  status: 'ACTIVE' | 'SUSPENDED' | 'PENDING';
  contactPerson: string;
  contactEmail: string;
  joinedDate: string;
}

const DEFAULT_COMPANIES: Company[] = [
  {
    id: 'co-1',
    name: 'Яндекс Коты 🐱🚀',
    domain: 'yandex-cats.ru',
    plan: 'ENTERPRISE',
    licensesUsed: 150,
    licensesMax: 150,
    mrr: 350000,
    status: 'ACTIVE',
    contactPerson: 'Василий Усатов',
    contactEmail: 'vasily@yandex-cats.ru',
    joinedDate: '2025-05-10',
  },
  {
    id: 'co-2',
    name: 'СберКот Технологии 🏦🐾',
    domain: 'sbercat-tech.ru',
    plan: 'PREMIUM',
    licensesUsed: 120,
    licensesMax: 150,
    mrr: 240000,
    status: 'ACTIVE',
    contactPerson: 'Анна Муркина',
    contactEmail: 'a.murkina@sbercat-tech.ru',
    joinedDate: '2025-09-01',
  },
  {
    id: 'co-3',
    name: 'ТиньКофф Котс 💛',
    domain: 'tinkoff-cats.ru',
    plan: 'PREMIUM',
    licensesUsed: 80,
    licensesMax: 100,
    mrr: 160000,
    status: 'ACTIVE',
    contactPerson: 'Дмитрий Хвостов',
    contactEmail: 'd.hvostov@tinkoff-cats.ru',
    joinedDate: '2025-11-15',
  },
  {
    id: 'co-4',
    name: 'КотКод Лабс 💻',
    domain: 'kotkod.ru',
    plan: 'BASIC',
    licensesUsed: 35,
    licensesMax: 100,
    mrr: 70000,
    status: 'SUSPENDED',
    contactPerson: 'Елена Лапкина',
    contactEmail: 'hr@kotkod.ru',
    joinedDate: '2026-01-20',
  },
  {
    id: 'co-5',
    name: 'МяуСофт 🐾💿',
    domain: 'meowsoft.com',
    plan: 'ENTERPRISE',
    licensesUsed: 85,
    licensesMax: 200,
    mrr: 220000,
    status: 'ACTIVE',
    contactPerson: 'Николай Когтев',
    contactEmail: 'ceo@meowsoft.com',
    joinedDate: '2025-03-12',
  }
];

export function BusinessDashboard() {
  const [companies, setCompanies] = useState<Company[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('leetcot_companies');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error(e);
        }
      }
    }
    return DEFAULT_COMPANIES;
  });

  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState<'ALL' | 'ENTERPRISE' | 'PREMIUM' | 'BASIC'>('ALL');
  
  // Dialog States
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [domain, setDomain] = useState('');
  const [plan, setPlan] = useState<'ENTERPRISE' | 'PREMIUM' | 'BASIC'>('BASIC');
  const [licensesMax, setLicensesMax] = useState(50);
  const [licensesUsed, setLicensesUsed] = useState(0);
  const [mrr, setMrr] = useState(50000);
  const [status, setStatus] = useState<'ACTIVE' | 'SUSPENDED' | 'PENDING'>('ACTIVE');
  const [contactPerson, setContactPerson] = useState('');
  const [contactEmail, setContactEmail] = useState('');

  useEffect(() => {
    localStorage.setItem('leetcot_companies', JSON.stringify(companies));
  }, [companies]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !domain || !contactPerson || !contactEmail) return;

    const newCompany: Company = {
      id: `co-${Date.now()}`,
      name,
      domain,
      plan,
      licensesUsed: Number(licensesUsed) || 0,
      licensesMax: Number(licensesMax) || 50,
      mrr: Number(mrr) || 50000,
      status,
      contactPerson,
      contactEmail,
      joinedDate: new Date().toISOString().split('T')[0] ?? '',
    };

    setCompanies([newCompany, ...companies]);
    setIsCreateOpen(false);
    resetForm();
  };

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCompany || !name || !domain || !contactPerson || !contactEmail) return;

    const updated = companies.map((co) => {
      if (co.id === selectedCompany.id) {
        return {
          ...co,
          name,
          domain,
          plan,
          licensesUsed: Number(licensesUsed),
          licensesMax: Number(licensesMax),
          mrr: Number(mrr),
          status,
          contactPerson,
          contactEmail,
        };
      }
      return co;
    });

    setCompanies(updated);
    setIsEditOpen(false);
    setSelectedCompany(null);
    resetForm();
  };

  const handleDelete = (id: string) => {
    if (confirm('Вы уверены, что хотите удалить этого корпоративного клиента? 😿')) {
      setCompanies(companies.filter((co) => co.id !== id));
    }
  };

  const openEditDialog = (co: Company) => {
    setSelectedCompany(co);
    setName(co.name);
    setDomain(co.domain);
    setPlan(co.plan);
    setLicensesMax(co.licensesMax);
    setLicensesUsed(co.licensesUsed);
    setMrr(co.mrr);
    setStatus(co.status);
    setContactPerson(co.contactPerson);
    setContactEmail(co.contactEmail);
    setIsEditOpen(true);
  };

  const resetForm = () => {
    setName('');
    setDomain('');
    setPlan('BASIC');
    setLicensesMax(50);
    setLicensesUsed(0);
    setMrr(50000);
    setStatus('ACTIVE');
    setContactPerson('');
    setContactEmail('');
  };

  // Metrics
  const activeCount = companies.filter((c) => c.status === 'ACTIVE').length;
  const totalLicensesMax = companies.reduce((sum, c) => sum + c.licensesMax, 0);
  const totalLicensesUsed = companies.reduce((sum, c) => sum + (c.status === 'ACTIVE' ? c.licensesUsed : 0), 0);
  const totalMrr = companies.reduce((sum, c) => sum + (c.status === 'ACTIVE' ? c.mrr : 0), 0);

  const filteredCompanies = companies.filter((co) => {
    const matchesSearch = co.name.toLowerCase().includes(search.toLowerCase()) || 
                          co.domain.toLowerCase().includes(search.toLowerCase()) ||
                          co.contactPerson.toLowerCase().includes(search.toLowerCase());
    const matchesPlan = planFilter === 'ALL' || co.plan === planFilter;
    return matchesSearch && matchesPlan;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-950/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Активные B2B</CardTitle>
            <Command className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-300">{activeCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Клиентские компании</p>
          </CardContent>
        </Card>

        <Card className="border-blue-500/20 bg-blue-50/50 dark:bg-blue-950/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-blue-600 dark:text-blue-400">Выручка (MRR)</CardTitle>
            <TrendingUpIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-blue-700 dark:text-blue-300">
              {totalMrr.toLocaleString()} ₽
            </div>
            <p className="text-xs text-muted-foreground mt-1">Месячный оборот</p>
          </CardContent>
        </Card>

        <Card className="border-orange-500/20 bg-orange-50/50 dark:bg-orange-950/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-orange-600 dark:text-orange-400">Лицензии</CardTitle>
            <User className="h-4 w-4 text-orange-600 dark:text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-orange-700 dark:text-orange-300">
              {totalLicensesUsed} / {totalLicensesMax}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Активировано сотрудниками</p>
          </CardContent>
        </Card>

        <Card className="border-purple-500/20 bg-purple-50/50 dark:bg-purple-950/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-purple-600 dark:text-purple-400">Всего клиентов</CardTitle>
            <Shield className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-purple-700 dark:text-purple-300">{companies.length}</div>
            <p className="text-xs text-muted-foreground mt-1">База B2B клиентов</p>
          </CardContent>
        </Card>
      </div>

      {/* Controls & Search */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Поиск компании или домена..."
            className="pl-9 bg-background/50"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-lg border bg-card p-1 text-xs">
            {(['ALL', 'ENTERPRISE', 'PREMIUM', 'BASIC'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setPlanFilter(filter)}
                className={`rounded-md px-3 py-1.5 font-medium transition-all ${
                  planFilter === filter
                    ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 shadow-sm'
                    : 'text-muted-foreground hover:text-zinc-900 dark:hover:text-zinc-50'
                }`}
              >
                {filter === 'ALL' && 'Все тарифы'}
                {filter === 'ENTERPRISE' && 'Enterprise'}
                {filter === 'PREMIUM' && 'Premium'}
                {filter === 'BASIC' && 'Basic'}
              </button>
            ))}
          </div>

          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-1 rounded-xl">
                <Plus className="h-4 w-4" />
                Добавить
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg rounded-3xl">
              <DialogHeader>
                <DialogTitle>Добавление B2B Клиента 🏢</DialogTitle>
                <DialogDescription>
                  Зарегистрируйте новую компанию и выделите ей пул лицензий.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4 py-2">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-muted-foreground">Название компании</label>
                    <Input
                      placeholder="Например: Яндекс Коты"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-muted-foreground">Корпоративный домен</label>
                    <Input
                      placeholder="yandex.ru"
                      value={domain}
                      onChange={(e) => setDomain(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-muted-foreground">Тарифный план</label>
                    <select
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      value={plan}
                      onChange={(e) => setPlan(e.target.value as any)}
                    >
                      <option value="BASIC">Basic</option>
                      <option value="PREMIUM">Premium</option>
                      <option value="ENTERPRISE">Enterprise</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-muted-foreground">Всего лицензий</label>
                    <Input
                      type="number"
                      min={1}
                      value={licensesMax}
                      onChange={(e) => setLicensesMax(parseInt(e.target.value) || 50)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-muted-foreground">Выручка (MRR)</label>
                    <Input
                      type="number"
                      min={0}
                      value={mrr}
                      onChange={(e) => setMrr(parseInt(e.target.value) || 50000)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-muted-foreground">Контактное лицо</label>
                    <Input
                      placeholder="Иван Кот"
                      value={contactPerson}
                      onChange={(e) => setContactPerson(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-muted-foreground">Email</label>
                    <Input
                      type="email"
                      placeholder="contact@company.ru"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground">Статус контракта</label>
                  <select
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                  >
                    <option value="ACTIVE">Активен (Active)</option>
                    <option value="SUSPENDED">Приостановлен (Suspended)</option>
                    <option value="PENDING">Ожидает оплаты (Pending)</option>
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
                    Зарегистрировать
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Companies List */}
      <div className="grid gap-6">
        {filteredCompanies.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed p-12 text-center">
            <span className="text-4xl mb-3">🏢💤</span>
            <h3 className="text-lg font-bold">Компании не найдены</h3>
            <p className="text-sm text-muted-foreground max-w-sm mt-1">
              Попробуйте изменить параметры поиска или фильтры.
            </p>
          </div>
        ) : (
          filteredCompanies.map((co) => (
            <Card
              key={co.id}
              className={`overflow-hidden border-l-4 transition-all hover:shadow-md ${
                co.status === 'ACTIVE'
                  ? 'border-l-emerald-500'
                  : co.status === 'SUSPENDED'
                    ? 'border-l-red-500'
                    : 'border-l-orange-500'
              }`}
            >
              <div className="p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{co.name}</h4>
                      {co.status === 'ACTIVE' && (
                        <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200">
                          Контракт активен
                        </Badge>
                      )}
                      {co.status === 'SUSPENDED' && (
                        <Badge className="bg-red-100 text-red-800 dark:bg-red-950/30 dark:text-red-400 border border-red-200">
                          Приостановлен
                        </Badge>
                      )}
                      {co.status === 'PENDING' && (
                        <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-950/30 dark:text-orange-400 border border-orange-200">
                          Ожидает оплаты
                        </Badge>
                      )}
                      <Badge variant="outline" className="border-purple-300 text-purple-600 dark:text-purple-400">
                        Plan: {co.plan}
                      </Badge>
                    </div>

                    <div className="grid gap-x-6 gap-y-2 text-xs md:grid-cols-3 max-w-3xl">
                      <div className="flex items-center gap-1.5 text-muted-foreground font-medium">
                        <AtSign className="h-3.5 w-3.5" />
                        <span>Домен: <b>{co.domain}</b></span>
                      </div>
                      <div className="flex items-center gap-1.5 text-muted-foreground font-medium">
                        👥
                        <span>Лицензии: <b>{co.licensesUsed} / {co.licensesMax}</b></span>
                      </div>
                      <div className="flex items-center gap-1.5 text-muted-foreground font-medium">
                        💰
                        <span>MRR: <b>{co.mrr.toLocaleString()} ₽</b></span>
                      </div>
                      <div className="flex items-center gap-1.5 text-muted-foreground font-medium col-span-2">
                        👤
                        <span>Контакты: <b>{co.contactPerson}</b> ({co.contactEmail})</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-zinc-400 font-medium">
                        📅
                        <span>Дата подключения: {co.joinedDate}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(co)}
                      className="rounded-lg gap-1 border-zinc-300 text-zinc-700 hover:bg-zinc-50"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Редактировать
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(co.id)}
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
      {selectedCompany && (
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="max-w-lg rounded-3xl">
            <DialogHeader>
              <DialogTitle>Редактирование B2B Клиента 🏢</DialogTitle>
              <DialogDescription>
                Измените информацию о компании.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEdit} className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground">Название компании</label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground">Корпоративный домен</label>
                  <Input
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground">Тарифный план</label>
                  <select
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    value={plan}
                    onChange={(e) => setPlan(e.target.value as any)}
                  >
                    <option value="BASIC">Basic</option>
                    <option value="PREMIUM">Premium</option>
                    <option value="ENTERPRISE">Enterprise</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground">Всего лицензий</label>
                  <Input
                    type="number"
                    min={1}
                    value={licensesMax}
                    onChange={(e) => setLicensesMax(parseInt(e.target.value) || 50)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground">Выручка (MRR)</label>
                  <Input
                    type="number"
                    min={0}
                    value={mrr}
                    onChange={(e) => setMrr(parseInt(e.target.value) || 50000)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground">Контактное лицо</label>
                  <Input
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground">Email</label>
                  <Input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground">Статус контракта</label>
                <select
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                >
                  <option value="ACTIVE">Активен (Active)</option>
                  <option value="SUSPENDED">Приостановлен (Suspended)</option>
                  <option value="PENDING">Ожидает оплаты (Pending)</option>
                </select>
              </div>

              <DialogFooter className="pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditOpen(false);
                    setSelectedCompany(null);
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
