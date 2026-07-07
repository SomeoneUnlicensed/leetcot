'use client';

import { useEffect, useRef, useState } from 'react';

// Registers the <altcha-widget> custom element. Must only run in the browser —
// importing it at module scope would blow up during Next.js SSR of this
// 'use client' file, since `customElements` doesn't exist in Node.
type AltchaWidgetElement = HTMLElement & {
  verify: () => Promise<{ payload: string } | null>;
};

declare module 'react' {
  // eslint-disable-next-line @typescript-eslint/no-namespace -- required syntax for augmenting the global JSX namespace
  namespace JSX {
    interface IntrinsicElements {
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-qualifier -- these must stay globally-qualified names for declaration emission (TS4033)
      'altcha-widget': React.DetailedHTMLProps<
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-qualifier -- see above
        React.HTMLAttributes<AltchaWidgetElement>,
        AltchaWidgetElement
      > & {
        auto?: string;
        challenge?: string;
        display?: string;
        hidefooter?: boolean;
        hidelogo?: boolean;
        name?: string;
      };
    }
  }
}

/**
 * Solves the invisible proof-of-work challenge in the background (no user
 * interaction) and exposes the resulting payload for the caller to attach to
 * a submission. Protects `/api/execute` from scripted mass-submission abuse
 * without adding any friction for real users.
 */
export function useAltchaPayload() {
  const widgetRef = useRef<AltchaWidgetElement | null>(null);
  const [payload, setPayload] = useState<string | null>(null);

  useEffect(() => {
    // @ts-expect-error -- side-effect-only import (registers the custom
    // element); the package's types aren't resolvable as a dynamic import
    // under this project's moduleResolution setting.
    void import('altcha');
  }, []);

  useEffect(() => {
    const el = widgetRef.current;
    if (!el) return;

    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ payload: string | null; state: string }>).detail;
      setPayload(detail.state === 'verified' ? detail.payload : null);
    };

    el.addEventListener('statechange', handler);
    return () => el.removeEventListener('statechange', handler);
  }, []);

  const getPayload = async (): Promise<string | null> => {
    if (payload) return payload;
    const result = await widgetRef.current?.verify();
    return result?.payload ?? null;
  };

  return { getPayload, widgetRef };
}
