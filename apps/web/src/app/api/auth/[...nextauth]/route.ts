import { handlers } from '~/server/auth';

export const GET = async (req: Request) => {
  const url = new URL(req.url);
  if (url.pathname.includes('callback/github') && url.searchParams.has('iss')) {
    // GitHub now returns an "iss" (issuer) response parameter, but this
    // provider is not a real OIDC provider with discoverable/trustworthy
    // issuer metadata - @auth/core validates iss against our own guessed
    // provider.issuer value, which never reliably matches and breaks every
    // GitHub sign-in with CallbackRouteError. Drop the parameter before it
    // reaches @auth/core; it carries no verifiable security value here.
    url.searchParams.delete('iss');
    req = new Request(url, req);
  }
  return handlers.GET(req);
};

export const POST = handlers.POST;
