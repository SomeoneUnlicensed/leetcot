import { type Session } from '@repo/auth/server';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@repo/ui/components/dropdown-menu';
import { UserAvatar } from '@repo/ui/components/user-avatar';
import { Award, ExternalLink, Play, Settings, Settings2, User } from '@repo/ui/icons';
import Link from 'next/link';
import { RoleTypes } from '@repo/db/types';
import { Suspense } from 'react';
import { auth } from '~/server/auth';
import { isAdmin, isAdminOrModerator } from '~/utils/auth-guards';
import { getAllFlags } from '~/utils/feature-flags';
import { Search } from '../search/search';
import { LoginLink } from './login-link';
import { MobileNav } from './mobile-nav';
import { NavLink } from './nav-link';
import { NavWrapper } from './nav-wrapper';
import { getNotificationCount } from './navigation.actions';
import { NotificationLink } from './notification-link';
import { SignOutLink } from './signout-link';
import { SkipToCodeEditor } from './skip-to-code-editor';

export function getAdminUrl() {
  return process.env.NEXT_PUBLIC_ADMIN_URL || '/panel';
}

export async function Navigation() {
  const [session, featureFlags, notificationCount] = await Promise.all([
    auth(),
    getAllFlags(),
    getNotificationCount(),
  ]);
  const isAdminOrMod = isAdminOrModerator(session);
  const isAdminRole = isAdmin(session);

  const isTeacher = Boolean(
    session?.user?.role?.includes(RoleTypes.TEACHER) ||
      session?.user?.role?.includes(RoleTypes.ADMIN),
  );
  const TopSectionLinks = (
    <>
      <NavLink title="Задачки" href="/explore" />
      <NavLink title="Алгоритмы" href="/algorithms" />
      <NavLink title="SQL-рыбалка" href="/sql-fishing" />
      <NavLink title="Go" href="/courses/golang-start" />
      {isTeacher ? <NavLink title="Панель учителя" href="/teacher/exams" /> : null}
    </>
  );

  const NavLinks = (
    <>
      <div className="hidden items-center gap-4 md:flex">{TopSectionLinks}</div>
      <div className="flex w-full flex-col gap-2 md:hidden">
        {TopSectionLinks}

        {session?.user ? (
          <>
            <hr />
            <NavLink title="Профиль" href={`/@${session.user.name}`} />
            <NavLink title="Настройки" href={`/@${session.user.name}/edit`} />
            {isAdminOrMod ? (
              <a
                href={getAdminUrl()}
                className="rounded-full px-3 py-2 text-sm font-semibold text-muted-foreground transition duration-200 hover:bg-white/[0.08] hover:text-foreground"
              >
                Админ
              </a>
            ) : null}
            {isAdminOrMod ? <NavLink title="Песочница задач" href="/challenge-playground" /> : null}
            {isAdminRole ? <NavLink title="Сокращатель ссылок" href="/share" /> : null}
            <SignOutLink className="px-0" />
          </>
        ) : (
          <LoginLink className="w-fit" />
        )}
      </div>
    </>
  );

  return (
    <header className="w-full">
      <NavWrapper>
        <div className="relative flex w-full items-center justify-between overflow-hidden rounded-[1.75rem] border border-white/[0.13] bg-white/[0.055] px-3 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.22),inset_0_-1px_0_rgba(255,255,255,0.06),0_18px_46px_rgba(0,0,0,0.24)] before:pointer-events-none before:absolute before:inset-x-8 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/55 before:to-transparent after:pointer-events-none after:absolute after:-left-24 after:-top-20 after:h-36 after:w-72 after:rounded-full after:bg-pink-300/10 after:blur-3xl">
          <div className="relative z-10 flex min-w-0 items-center gap-3">
            <SkipToCodeEditor />
            <Link
              className="group flex min-w-0 items-center gap-2 rounded-full px-1.5 py-1 transition duration-300 hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-300"
              href="/"
            >
              <pre className="hidden text-[9px] font-bold leading-[10px] text-pink-500 drop-shadow-[0_0_14px_rgba(236,72,153,0.38)] transition duration-300 group-hover:scale-105 group-hover:text-pink-300 sm:block">
                {`
 /\\_/\\
( o.o )
 > ^ <
`}
              </pre>

              <div
                className="whitespace-nowrap text-lg leading-5 text-white drop-shadow-[0_1px_16px_rgba(255,255,255,0.16)] transition duration-300 group-hover:text-pink-50 sm:text-xl"
                style={{ fontFamily: '"Dela Gothic One", sans-serif' }}
              >
                ЛитКот{' '}
                <span className="align-top font-sans text-[10px] font-black uppercase tracking-wide text-pink-200/75 transition duration-300 group-hover:text-pink-100">
                  БЕТА
                </span>
              </div>
            </Link>
            <div className="hidden items-center rounded-full border border-white/[0.08] bg-black/[0.12] p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl md:flex md:gap-1">
              {NavLinks}
            </div>
          </div>

          <div className="relative z-10 flex">
            <div className="flex items-center justify-end gap-2">
              <Suspense>
                <Search />
              </Suspense>
              {session ? <NotificationLink notificationCount={notificationCount} /> : null}
              {featureFlags?.enableLogin ? (
                <LoginButton
                  isAdminOrMod={isAdminOrMod}
                  session={session}
                  isAdmin={isAdminRole}
                  isTeacher={isTeacher}
                />
              ) : null}
              <MobileNav>{NavLinks}</MobileNav>
            </div>
          </div>
        </div>
      </NavWrapper>
    </header>
  );
}

function LoginButton({
  isAdminOrMod,
  isAdmin,
  session,
  isTeacher,
}: {
  isAdminOrMod: boolean;
  isAdmin: boolean;
  session: Session | null;
  isTeacher: boolean;
}) {
  return session?.user ? (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          aria-label="profile button"
          className="hidden rounded-full border border-white/10 bg-white/[0.04] p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition duration-200 hover:-translate-y-0.5 hover:border-pink-300/30 hover:bg-pink-400/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-300 md:block"
        >
          <UserAvatar src={session.user.image ?? ''} username={session.user.name ?? ''} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="mt-2 w-60 rounded-2xl border border-white/10 bg-background/[0.92] p-1.5 shadow-2xl backdrop-blur-xl"
      >
        <Link className="block" href={`/@${session.user.name}`}>
          <DropdownMenuItem className="focus:bg-accent rounded-xl p-2.5 duration-200 focus:outline-none dark:hover:bg-white/[0.08]">
            <User className="mr-2 h-4 w-4" />
            <span>Профиль</span>
          </DropdownMenuItem>
        </Link>
        <Link className="block" href={`/@${session.user.name}/edit`}>
          <DropdownMenuItem className="focus:bg-accent rounded-xl p-2.5 duration-200 focus:outline-none">
            <Settings2 className="mr-2 h-4 w-4" />
            <span>Настройки</span>
          </DropdownMenuItem>
        </Link>
        <DropdownMenuSeparator />
        {isTeacher ? (
          <Link className="block" href="/teacher/exams">
            <DropdownMenuItem className="focus:bg-accent rounded-xl p-2.5 duration-200 focus:outline-none dark:hover:bg-white/[0.08]">
              <Award className="mr-2 h-4 w-4" />
              <span>Панель учителя</span>
            </DropdownMenuItem>
          </Link>
        ) : null}
        {isAdminOrMod ? (
          <a className="block" href={getAdminUrl()}>
            <DropdownMenuItem className="focus:bg-accent rounded-xl p-2.5 duration-200 focus:outline-none dark:hover:bg-white/[0.08]">
              <Settings className="mr-2 h-4 w-4" />
              <span>Админ</span>
            </DropdownMenuItem>
          </a>
        ) : null}
        {isAdminOrMod ? (
          <Link className="block" href="/challenge-playground">
            <DropdownMenuItem className="focus:bg-accent rounded-xl p-2.5 duration-200 focus:outline-none dark:hover:bg-white/[0.08]">
              <Play className="mr-2 h-4 w-4" />
              <span>Песочница задач</span>
            </DropdownMenuItem>
          </Link>
        ) : null}
        {isAdmin ? (
          <Link className="block" href="/share">
            <DropdownMenuItem className="focus:bg-accent rounded-xl p-2.5 duration-200 focus:outline-none dark:hover:bg-white/[0.08]">
              <ExternalLink className="mr-2 h-4 w-4" />
              <span>Сокращатель ссылок</span>
            </DropdownMenuItem>
          </Link>
        ) : null}
        <DropdownMenuSeparator />

        <SignOutLink className="w-full rounded-xl" />
      </DropdownMenuContent>
    </DropdownMenu>
  ) : (
    <span className="hidden md:flex">
      <LoginLink />
    </span>
  );
}
