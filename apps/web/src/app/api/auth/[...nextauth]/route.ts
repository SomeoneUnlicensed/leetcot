import { handlers } from '~/server/auth';

export const GET = async (req: Request) => {
  const url = new URL(req.url);
  if (url.pathname.includes('callback/github')) {
    // eslint-disable-next-line no-console
    console.error('[github-callback-debug] full query:', url.search);
  }
  return handlers.GET(req);
};

export const POST = handlers.POST;
