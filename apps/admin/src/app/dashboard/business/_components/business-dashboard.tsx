'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui/components/card';
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
} from '@repo/ui/components/dialog';
import { Plus, SearchIcon, Trash2, User, Shield, AtSign, Command } from '@repo/ui/icons';
import { useToast } from '@repo/ui/components/use-toast';
import {
  getCompanies,
  createCompany,
  deleteCompany,
  getCompanyEmployees,
  addEmployee,
  removeEmployee,
  toggleCompanyAdmin,
} from '../business.actions';

function errMsg(err: unknown, fallback: string): string {
  if (err instanceof Error) return err.message;
  return fallback;
}

interface Company {
  id: string;
  name: string;
  domain: string;
  status: string;
  createdAt: Date;
  _count?: {
    employees: number;
  };
}

interface Employee {
  id: string;
  name: string;
  email: string;
  companyRole: string | null;
  createdAt: Date;
}

export function BusinessDashboard() {
  const { toast } = useToast();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Dialog States
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEmployeesOpen, setIsEmployeesOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);

  // Form Fields
  const [newCompanyName, setNewCompanyName] = useState('');
  const [newCompanyDomain, setNewCompanyDomain] = useState('');
  const [newEmployeeEmail, setNewEmployeeEmail] = useState('');
  const [submittingEmployee, setSubmittingEmployee] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getCompanies();
      setCompanies(data);
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Ошибка загрузки',
        description: errMsg(err, 'Не удалось загрузить список компаний'),
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompanyName || !newCompanyDomain) return;

    try {
      await createCompany(newCompanyName, newCompanyDomain);
      toast({
        variant: 'success',
        title: 'Успешно',
        description: 'Компания успешно добавлена',
      });
      setIsCreateOpen(false);
      setNewCompanyName('');
      setNewCompanyDomain('');
      loadData();
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Ошибка создания',
        description: errMsg(err, 'Не удалось создать компанию'),
      });
    }
  };

  const handleDeleteCompany = async (id: string) => {
    // eslint-disable-next-line no-alert
    const confirmed = confirm(
      'Вы уверены, что хотите удалить эту компанию? Все сотрудники будут отвязаны. 😿',
    );
    if (!confirmed) {
      return;
    }

    try {
      await deleteCompany(id);
      toast({
        variant: 'success',
        title: 'Удалено',
        description: 'Компания успешно удалена',
      });
      loadData();
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Ошибка удаления',
        description: errMsg(err, 'Не удалось удалить компанию'),
      });
    }
  };

  const openEmployeesDialog = async (company: Company) => {
    setSelectedCompany(company);
    setIsEmployeesOpen(true);
    setLoadingEmployees(true);
    setNewEmployeeEmail('');
    try {
      const data = await getCompanyEmployees(company.id);
      setEmployees(data);
    } catch {
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: 'Не удалось загрузить сотрудников компании',
      });
    } finally {
      setLoadingEmployees(false);
    }
  };

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCompany || !newEmployeeEmail || submittingEmployee) return;

    try {
      setSubmittingEmployee(true);
      await addEmployee(selectedCompany.id, newEmployeeEmail.trim());
      toast({
        variant: 'success',
        title: 'Сотрудник добавлен',
        description: `Пользователь ${newEmployeeEmail} привязан к компании`,
      });
      setNewEmployeeEmail('');
      // Reload employees list
      const data = await getCompanyEmployees(selectedCompany.id);
      setEmployees(data);
      loadData();
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Ошибка добавления',
        description: errMsg(err, 'Не удалось привязать сотрудника'),
      });
    } finally {
      setSubmittingEmployee(false);
    }
  };

  const handleRemoveEmployee = async (userId: string) => {
    if (!selectedCompany) return;

    try {
      await removeEmployee(userId);
      toast({
        variant: 'success',
        title: 'Сотрудник удален',
        description: 'Пользователь отвязан от компании',
      });
      // Reload employees list
      const data = await getCompanyEmployees(selectedCompany.id);
      setEmployees(data);
      loadData();
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Ошибка удаления',
        description: errMsg(err, 'Не удалось отвязать сотрудника'),
      });
    }
  };

  const handleToggleAdmin = async (userId: string, currentRole: string | null) => {
    if (!selectedCompany) return;
    const makeAdmin = currentRole !== 'ADMIN';

    try {
      await toggleCompanyAdmin(userId, makeAdmin);
      toast({
        variant: 'success',
        title: 'Роль обновлена',
        description: makeAdmin
          ? 'Сотрудник назначен администратором компании'
          : 'Права администратора сняты',
      });
      // Reload employees list
      const data = await getCompanyEmployees(selectedCompany.id);
      setEmployees(data);
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Ошибка изменения прав',
        description: errMsg(err, 'Не удалось обновить роль сотрудника'),
      });
    }
  };

  const filteredCompanies = companies.filter((co) => {
    return (
      co.name.toLowerCase().includes(search.toLowerCase()) ||
      co.domain.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-950/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              Всего компаний
            </CardTitle>
            <Command className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-300">
              {companies.length}
            </div>
            <p className="text-muted-foreground mt-1 text-xs">Зарегистрированные B2B клиенты</p>
          </CardContent>
        </Card>

        <Card className="border-blue-500/20 bg-blue-50/50 dark:bg-blue-950/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold text-blue-600 dark:text-blue-400">
              Всего сотрудников
            </CardTitle>
            <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-blue-700 dark:text-blue-300">
              {companies.reduce((sum, c) => sum + (c._count?.employees || 0), 0)}
            </div>
            <p className="text-muted-foreground mt-1 text-xs">Привязанных пользователей</p>
          </CardContent>
        </Card>
      </div>

      {/* Control Panel */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
          <Input
            placeholder="Поиск по названию или домену..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-fuchsia-600 to-pink-600 font-bold text-white hover:from-fuchsia-500 hover:to-pink-500"
        >
          <Plus className="h-4 w-4" />
          Добавить компанию
        </Button>
      </div>

      {/* Companies List */}
      <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50 text-xs font-bold uppercase tracking-wider text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900/50">
                <th className="px-6 py-3.5">Компания</th>
                <th className="px-6 py-3.5">Домен</th>
                <th className="px-6 py-3.5">Статус</th>
                <th className="px-6 py-3.5">Сотрудники</th>
                <th className="px-6 py-3.5">Дата регистрации</th>
                <th className="px-6 py-3.5 text-right">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 text-sm dark:divide-neutral-800">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-neutral-500">
                    Загрузка списка компаний...
                  </td>
                </tr>
              ) : filteredCompanies.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-neutral-500">
                    Компании не найдены
                  </td>
                </tr>
              ) : (
                filteredCompanies.map((co) => (
                  <tr
                    key={co.id}
                    className="transition-colors hover:bg-neutral-50/50 dark:hover:bg-neutral-900/20"
                  >
                    <td className="px-6 py-4 font-semibold text-neutral-900 dark:text-neutral-100">
                      {co.name}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-neutral-500">{co.domain}</td>
                    <td className="px-6 py-4">
                      <Badge className="border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        {co.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 font-medium">
                        <User className="h-3.5 w-3.5 text-neutral-400" />
                        <span>{co._count?.employees || 0}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-neutral-500">
                      {new Date(co.createdAt).toLocaleDateString('ru-RU')}
                    </td>
                    <td className="space-x-2 px-6 py-4 text-right">
                      <Button size="sm" variant="outline" onClick={() => openEmployeesDialog(co)}>
                        Сотрудники
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDeleteCompany(co.id)}
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

      {/* Dialog: Create Company */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-md rounded-2xl border border-neutral-300 bg-white p-6 shadow-2xl dark:border-neutral-800 dark:bg-neutral-950">
          <form onSubmit={handleCreateCompany}>
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Добавить новую компанию</DialogTitle>
              <DialogDescription>
                Создайте карточку компании. Сотрудники смогут связываться с ней по почтовому домену.
              </DialogDescription>
            </DialogHeader>

            <div className="my-6 space-y-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="company-name"
                  className="text-xs font-bold uppercase text-neutral-500"
                >
                  Название компании
                </label>
                <Input
                  id="company-name"
                  required
                  placeholder="Например: Яндекс Коты"
                  value={newCompanyName}
                  onChange={(e) => setNewCompanyName(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="company-domain"
                  className="text-xs font-bold uppercase text-neutral-500"
                >
                  Домен почты
                </label>
                <Input
                  id="company-domain"
                  required
                  placeholder="Например: yandex.ru"
                  value={newCompanyDomain}
                  onChange={(e) => setNewCompanyDomain(e.target.value)}
                />
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button type="button" variant="ghost" onClick={() => setIsCreateOpen(false)}>
                Отмена
              </Button>
              <Button
                type="submit"
                className="bg-gradient-to-r from-fuchsia-600 to-pink-600 font-bold text-white"
              >
                Создать
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog: Manage Employees */}
      <Dialog open={isEmployeesOpen} onOpenChange={setIsEmployeesOpen}>
        <DialogContent className="max-w-3xl rounded-2xl border border-neutral-300 bg-white p-6 shadow-2xl dark:border-neutral-800 dark:bg-neutral-950">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-bold">
              <span>Сотрудники компании:</span>
              <span className="font-extrabold text-fuchsia-500">{selectedCompany?.name}</span>
            </DialogTitle>
            <DialogDescription>
              Управляйте привязкой пользователей к компании и выдавайте доступы администратора.
            </DialogDescription>
          </DialogHeader>

          {/* Add Employee Form */}
          <form onSubmit={handleAddEmployee} className="my-4 flex items-end gap-2">
            <div className="flex-1 space-y-1.5">
              <label
                htmlFor="employee-email"
                className="flex items-center gap-1 text-xs font-bold uppercase text-neutral-500"
              >
                <AtSign className="h-3 w-3" />
                Email пользователя для добавления
              </label>
              <Input
                id="employee-email"
                type="email"
                required
                placeholder="user@domain.com"
                value={newEmployeeEmail}
                onChange={(e) => setNewEmployeeEmail(e.target.value)}
              />
            </div>
            <Button
              type="submit"
              disabled={submittingEmployee}
              className="bg-zinc-900 font-bold text-white hover:opacity-90 dark:bg-zinc-100 dark:text-zinc-950"
            >
              Добавить
            </Button>
          </form>

          {/* Employees List */}
          <div className="max-h-[300px] overflow-hidden overflow-y-auto rounded-xl border border-neutral-200 dark:border-neutral-800">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50 font-bold uppercase text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900/50">
                  <th className="px-4 py-2.5">Имя</th>
                  <th className="px-4 py-2.5">Email</th>
                  <th className="px-4 py-2.5">Роль в компании</th>
                  <th className="px-4 py-2.5 text-right">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                {loadingEmployees ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-neutral-500">
                      Загрузка сотрудников...
                    </td>
                  </tr>
                ) : employees.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-neutral-500">
                      Нет привязанных сотрудников
                    </td>
                  </tr>
                ) : (
                  employees.map((emp) => (
                    <tr
                      key={emp.id}
                      className="hover:bg-neutral-50/50 dark:hover:bg-neutral-900/20"
                    >
                      <td className="px-4 py-3 font-semibold">{emp.name}</td>
                      <td className="px-4 py-3 font-mono">{emp.email}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          {emp.companyRole === 'ADMIN' ? (
                            <Badge className="border border-fuchsia-500/20 bg-fuchsia-500/10 text-fuchsia-600">
                              <Shield className="mr-1 h-3 w-3" />
                              Администратор
                            </Badge>
                          ) : (
                            <Badge variant="secondary">Сотрудник</Badge>
                          )}
                        </div>
                      </td>
                      <td className="space-x-2 px-4 py-3 text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleToggleAdmin(emp.id, emp.companyRole)}
                          className="h-7 px-2 text-xs"
                        >
                          {emp.companyRole === 'ADMIN' ? 'Снять админа' : 'Сделать админом'}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRemoveEmployee(emp.id)}
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
            <Button variant="outline" onClick={() => setIsEmployeesOpen(false)}>
              Закрыть
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
