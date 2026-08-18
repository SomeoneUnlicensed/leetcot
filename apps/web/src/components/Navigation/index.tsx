import { type Session } from '@repo/auth/server';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@repo/ui/components/dropdown-menu';
import { UserAvatar } from '@repo/ui/components/user-avatar';
import { Settings } from '@repo/ui/icons';
import Image from 'next/image';
import Link from 'next/link';
import { auth } from '~/server/auth';
import { isAdminOrModerator } from '~/utils/auth-guards';
import { getAllFlags } from '~/utils/feature-flags';
import { LoginLink } from './login-link';
import { MobileNav } from './mobile-nav';
import { NavLink } from './nav-link';
import { NavWrapper } from './nav-wrapper';
import { SignOutLink } from './signout-link';

export function getAdminUrl() {
  return process.env.NEXT_PUBLIC_ADMIN_URL || '/panel';
}

export async function Navigation() {
  const [session, featureFlags] = await Promise.all([auth(), getAllFlags()]);
  const isAdminOrMod = isAdminOrModerator(session);

  const TopSectionLinks = (
    <>
      <NavLink title="Дебаг-Симулятор" href="/debug-simulator" />
      <NavLink title="Лидерборд" href="/leaderboard" />
    </>
  );

  const NavLinks = (
    <>
      <div className="hidden items-center gap-1 md:flex">{TopSectionLinks}</div>
      <div className="flex w-full flex-col gap-2 md:hidden">
        {TopSectionLinks}

        {session?.user ? (
          <>
            <hr className="border-border" />
            {isAdminOrMod ? (
              <a
                href={getAdminUrl()}
                className="text-muted-foreground hover:text-foreground rounded-full px-3 py-2 text-sm font-semibold transition duration-200 hover:bg-black/[0.04]"
              >
                Админ
              </a>
            ) : null}
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
        <div className="flex w-full items-center justify-between">
          <div className="flex min-w-0 items-center gap-6">
            <Link
              className="focus-visible:ring-primary flex shrink-0 items-center rounded-full focus:outline-none focus-visible:ring-2"
              href="/"
            >
              <Image
                src="/lentatech-logo-color.png"
                alt="Lenta tech"
                width={140}
                height={28}
                className="h-6 w-auto sm:h-7"
                priority
              />
            </Link>
            <div className="hidden items-center md:flex">{NavLinks}</div>
          </div>

          <div className="flex items-center gap-2">
            {featureFlags?.enableLogin ? (
              <LoginButton isAdminOrMod={isAdminOrMod} session={session} />
            ) : null}
            <MobileNav>{NavLinks}</MobileNav>
          </div>
        </div>
      </NavWrapper>
    </header>
  );
}

function LoginButton({
  isAdminOrMod,
  session,
}: {
  isAdminOrMod: boolean;
  session: Session | null;
}) {
  return session?.user ? (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          aria-label="profile button"
          className="border-border hover:border-primary/40 hover:bg-primary/5 focus-visible:ring-primary hidden rounded-full border p-1.5 transition-colors duration-200 focus:outline-none focus-visible:ring-2 md:block"
        >
          <UserAvatar src={session.user.image ?? ''} username={session.user.name ?? ''} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="mt-2 w-60 rounded-2xl border bg-white p-1.5 shadow-2xl"
      >
        {isAdminOrMod ? (
          <a className="block" href={getAdminUrl()}>
            <DropdownMenuItem className="focus:bg-accent rounded-xl p-2.5 duration-200 focus:outline-none">
              <Settings className="mr-2 h-4 w-4" />
              <span>Админ</span>
            </DropdownMenuItem>
          </a>
        ) : null}
        {isAdminOrMod ? <DropdownMenuSeparator /> : null}
        <SignOutLink className="w-full rounded-xl" />
      </DropdownMenuContent>
    </DropdownMenu>
  ) : (
    <span className="hidden md:flex">
      <LoginLink />
    </span>
  );
}
