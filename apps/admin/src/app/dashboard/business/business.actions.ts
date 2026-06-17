'use server';

import { auth } from '~/server/auth';
import { prisma } from '@repo/db';
import { assertAdmin } from '~/utils/auth-guards';
import { revalidatePath } from 'next/cache';

export async function getCompanies() {
  const session = await auth();
  assertAdmin(session);

  return prisma.company.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: { employees: true },
      },
    },
  });
}

export async function createCompany(name: string, domain: string) {
  const session = await auth();
  assertAdmin(session);

  if (!name || !domain) {
    throw new Error('Название и домен обязательны');
  }

  const existing = await prisma.company.findUnique({
    where: { domain },
  });

  if (existing) {
    throw new Error('Компания с таким доменом уже существует');
  }

  const company = await prisma.company.create({
    data: {
      name,
      domain,
      status: 'ACTIVE',
    },
  });

  revalidatePath('/dashboard/business');
  return company;
}

export async function deleteCompany(id: string) {
  const session = await auth();
  assertAdmin(session);

  // Unlink all users associated with the company
  await prisma.user.updateMany({
    where: { companyId: id },
    data: { companyId: null, companyRole: null },
  });

  // Delete the company
  await prisma.company.delete({
    where: { id },
  });

  revalidatePath('/dashboard/business');
}

export async function getCompanyEmployees(companyId: string) {
  const session = await auth();
  assertAdmin(session);

  return prisma.user.findMany({
    where: { companyId },
    orderBy: { name: 'asc' },
  });
}

export async function addEmployee(companyId: string, email: string) {
  const session = await auth();
  assertAdmin(session);

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error('Пользователь с такой почтой не зарегистрирован в системе');
  }

  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: {
      companyId,
      companyRole: 'EMPLOYEE',
    },
  });

  revalidatePath('/dashboard/business');
  return updatedUser;
}

export async function removeEmployee(userId: string) {
  const session = await auth();
  assertAdmin(session);

  await prisma.user.update({
    where: { id: userId },
    data: {
      companyId: null,
      companyRole: null,
    },
  });

  revalidatePath('/dashboard/business');
}

export async function toggleCompanyAdmin(userId: string, makeAdmin: boolean) {
  const session = await auth();
  assertAdmin(session);

  await prisma.user.update({
    where: { id: userId },
    data: {
      companyRole: makeAdmin ? 'ADMIN' : 'EMPLOYEE',
    },
  });

  revalidatePath('/dashboard/business');
}
