import { NextRequest } from 'next/server';
import { handlers } from '~/server/auth';

export const GET = async (req: NextRequest) => {
  if (req.nextUrl.pathname.includes('callback/github') && req.nextUrl.searchParams.has('iss')) {
    // GitHub now returns an "iss" (issuer) response parameter, but this
    // provider is not a real OIDC provider with discoverable/trustworthy
    // issuer metadata - @auth/core validates iss against our own guessed
    // provider.issuer value, which never reliably matches and breaks every
    // GitHub sign-in with CallbackRouteError. Drop the parameter before it
    // reaches @auth/core; it carries no verifiable security value here.
    const url = req.nextUrl.clone();
    url.searchParams.delete('iss');
    req = new NextRequest(url, req);
  }
  return await handlers.GET(req);
};

export const POST = handlers.POST;
