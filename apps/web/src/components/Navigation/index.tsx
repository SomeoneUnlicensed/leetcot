import { type Session } from '@repo/auth/server';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@repo/ui/components/dropdown-menu';
import { UserAvatar } from '@repo/ui/components/user-avatar';
import { Award, ExternalLink, Play, Settings, Settings2, Trophy, User } from '@repo/ui/icons';
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
  // reference for production mode
  if (process.env.NODE_ENV === 'production') {
    return `https://admin.leetcot.ru`;
  }

  // assume localhost
  return `http://localhost:3001`;
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
  const isChampionshipManager = Boolean(
    session?.user?.role?.includes(RoleTypes.CHAMPIONSHIP_MANAGER) ||
      session?.user?.role?.includes(RoleTypes.ADMIN),
  );
  const TopSectionLinks = (
    <>
      <NavLink title="Задачки" href="/explore" />
      <NavLink title="Алгоритмы" href="/algorithms" />
      {isTeacher ? <NavLink title="Панель учителя" href="/teacher/exams" /> : null}
      {isChampionshipManager ? (
        <NavLink title="Панель чемпионатов" href={`${getAdminUrl()}/dashboard/championships`} />
      ) : null}
    </>
  );

  const NavLinks = (
    <>
      <div className="hidden items-center gap-4 md:flex">{TopSectionLinks}</div>
      <div className="flex flex-col gap-5 pl-2 md:hidden">
        {TopSectionLinks}

        {session?.user ? (
          <>
            <hr />
            <NavLink title="Профиль" href={`/@${session.user.name}`} />
            <NavLink title="Настройки" href={`/@${session.user.name}/edit`} />
            {isAdminOrMod ? <NavLink title="Админ" href={getAdminUrl()} /> : null}
            {isAdminOrMod ? <NavLink title="Песочница задач" href="/challenge-playground" /> : null}
            {isAdminRole ? <NavLink title="Сокращатель ссылок" href="/share" /> : null}
            <SignOutLink className="px-0" />
          </>
        ) : (
          <LoginLink className="px-0 hover:bg-transparent hover:dark:bg-transparent" />
        )}
      </div>
    </>
  );

  return (
    <header className="w-full">
      <NavWrapper>
        <div className="flex w-full items-center justify-between">
          <div className="relative flex items-center gap-4">
            <SkipToCodeEditor />
            <Link
              className="flex items-center space-x-2 focus:outline-none focus-visible:ring-2"
              href="/"
            >
              <pre className="hidden text-[10px] font-bold leading-3 text-pink-500 sm:block">
                {`
 /\\_/\\
( o.o )
 > ^ <
`}
              </pre>

              <div
                className="text-xl leading-5 text-white"
                style={{ fontFamily: '"Dela Gothic One", sans-serif' }}
              >
                ЛитКот{' '}
                <span className="text-muted-foreground bg-muted px-1 align-top font-sans text-xs">
                  БЕТА
                </span>
              </div>
            </Link>
            <div className="hidden items-center md:flex md:gap-4">{NavLinks}</div>
          </div>

          <div className="flex">
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
                  isChampionshipManager={isChampionshipManager}
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
  isChampionshipManager,
}: {
  isAdminOrMod: boolean;
  isAdmin: boolean;
  session: Session | null;
  isTeacher: boolean;
  isChampionshipManager: boolean;
}) {
  return session?.user ? (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          aria-label="profile button"
          className="hidden rounded-lg p-2 duration-300 focus:outline-none focus-visible:ring-2 md:block"
        >
          <UserAvatar src={session.user.image ?? ''} username={session.user.name ?? ''} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="mt-[0.33rem] w-56 rounded-xl bg-white/50 backdrop-blur-sm dark:bg-neutral-950/50"
      >
        <Link className="block" href={`/@${session.user.name}`}>
          <DropdownMenuItem className="focus:bg-accent rounded-lg p-2 duration-300 focus:outline-none dark:hover:bg-neutral-700/50">
            <User className="mr-2 h-4 w-4" />
            <span>Профиль</span>
          </DropdownMenuItem>
        </Link>
        <Link className="block" href={`/@${session.user.name}/edit`}>
          <DropdownMenuItem className="focus:bg-accent rounded-lg p-2 duration-300 focus:outline-none">
            <Settings2 className="mr-2 h-4 w-4" />
            <span>Настройки</span>
          </DropdownMenuItem>
        </Link>
        <DropdownMenuSeparator />
        {isTeacher ? (
          <Link className="block" href="/teacher/exams">
            <DropdownMenuItem className="focus:bg-accent rounded-lg p-2 duration-300 focus:outline-none dark:hover:bg-neutral-700/50">
              <Award className="mr-2 h-4 w-4" />
              <span>Панель учителя</span>
            </DropdownMenuItem>
          </Link>
        ) : null}
        {isChampionshipManager ? (
          <Link className="block" href={`${getAdminUrl()}/dashboard/championships`}>
            <DropdownMenuItem className="focus:bg-accent rounded-lg p-2 duration-300 focus:outline-none dark:hover:bg-neutral-700/50">
              <Trophy className="mr-2 h-4 w-4" />
              <span>Панель чемпионатов</span>
            </DropdownMenuItem>
          </Link>
        ) : null}
        {isAdminOrMod ? (
          <Link className="block" href={getAdminUrl()}>
            <DropdownMenuItem className="focus:bg-accent rounded-lg p-2 duration-300 focus:outline-none dark:hover:bg-neutral-700/50">
              <Settings className="mr-2 h-4 w-4" />
              <span>Админ</span>
            </DropdownMenuItem>
          </Link>
        ) : null}
        {isAdminOrMod ? (
          <Link className="block" href="/challenge-playground">
            <DropdownMenuItem className="focus:bg-accent rounded-lg p-2 duration-300 focus:outline-none dark:hover:bg-neutral-700/50">
              <Play className="mr-2 h-4 w-4" />
              <span>Песочница задач</span>
            </DropdownMenuItem>
          </Link>
        ) : null}
        {isAdmin ? (
          <Link className="block" href="/share">
            <DropdownMenuItem className="focus:bg-accent rounded-lg p-2 duration-300 focus:outline-none dark:hover:bg-neutral-700/50">
              <ExternalLink className="mr-2 h-4 w-4" />
              <span>Сокращатель ссылок</span>
            </DropdownMenuItem>
          </Link>
        ) : null}
        <DropdownMenuSeparator />

        <SignOutLink className="w-full rounded-b-lg rounded-t-sm" />
      </DropdownMenuContent>
    </DropdownMenu>
  ) : (
    <span className="hidden md:flex">
      <LoginLink />
    </span>
  );
}
