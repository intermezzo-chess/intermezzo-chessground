import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';
import { Chessground as createChessground } from '@lichess-org/chessground';
import type { Api } from '@lichess-org/chessground/api';
import type { Config } from '@lichess-org/chessground/config';
import { diffConfig } from './diffConfig';
import type { ChessgroundProps } from './types';

// Layout effects never run during server rendering; using a plain `useEffect` there avoids
// React's "useLayoutEffect does nothing on the server" warning while keeping the pre-paint
// timing (avoids a flash of an empty container) on the client.
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

function extractConfig(props: ChessgroundProps): Config {
  const { className: _className, style: _style, onReady: _onReady, ...config } = props;
  return config;
}

function warnIfZeroSize(container: HTMLElement): void {
  // Accessed via `globalThis` (rather than the bare `process` identifier) so this doesn't
  // require `@types/node` — this is a browser library, but most bundlers (Vite, webpack,
  // Next.js) still replace `process.env.NODE_ENV` at build time across the whole bundle,
  // including dependencies, so this check works for the overwhelming majority of consumers.
  const nodeEnv = (globalThis as { process?: { env?: { NODE_ENV?: string } } }).process?.env
    ?.NODE_ENV;
  if (nodeEnv === 'production') return;

  const rect = container.getBoundingClientRect();
  if (rect.width === 0 && rect.height === 0) {
    console.warn(
      '[@intermezzo/chessground-react] The board container has zero width/height. Did you ' +
        'forget to size it, e.g. <Chessground style={{ width: 400, height: 400 }} />?',
    );
  }
}

/**
 * Headless primitive behind `<Chessground>`. Constructs a chessground instance once against
 * the given container element, keeps it in sync with `props` on every subsequent render via
 * `api.set()` (never by recreating the instance — see `diffConfig`), and destroys it on
 * unmount. Exported for consumers who want to manage their own container element/layout
 * instead of using the pre-built `<Chessground>` component.
 *
 * Returns `null` until the container ref is attached and the instance has been constructed.
 */
export function useChessground<T extends HTMLElement = HTMLElement>(
  containerRef: RefObject<T | null>,
  props: ChessgroundProps,
): Api | null {
  const [api, setApi] = useState<Api | null>(null);
  const apiRef = useRef<Api | null>(null);
  const appliedConfigRef = useRef<Config | undefined>(undefined);

  // Mount-only: construct the chessground instance exactly once against this container.
  // It is never recreated here on prop changes — see the update effect below, which either
  // calls `api.set()` or (for the rare viewOnly/drawable.visible case) recreates explicitly.
  // This effect's closure is only ever invoked on the render that mounts it, so reading
  // `props.onReady` here directly (no ref needed) is safe and always up to date.
  useIsomorphicLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const initialConfig = extractConfig(props);
    const instance = createChessground(container, initialConfig);
    appliedConfigRef.current = initialConfig;
    apiRef.current = instance;
    setApi(instance);
    warnIfZeroSize(container);
    props.onReady?.(instance);

    return () => {
      instance.destroy();
      apiRef.current = null;
      appliedConfigRef.current = undefined;
      setApi(null);
    };
  }, [containerRef]);

  // Runs after every render, deliberately without a dependency array: `ChessgroundProps`
  // mirrors chessground's ~50-field `Config` one-for-one, so enumerating changed fields as
  // hook dependencies isn't practical. `diffConfig` itself does the real work of figuring out
  // what (if anything) actually changed since the last applied config.
  useIsomorphicLayoutEffect(() => {
    const instance = apiRef.current;
    const container = containerRef.current;
    if (!instance || !container) return;

    const nextConfig = extractConfig(props);
    const { config, needsRecreate } = diffConfig(appliedConfigRef.current, nextConfig);

    if (needsRecreate) {
      instance.destroy();
      const fresh = createChessground(container, nextConfig);
      appliedConfigRef.current = nextConfig;
      apiRef.current = fresh;
      setApi(fresh);
      warnIfZeroSize(container);
      props.onReady?.(fresh);
      return;
    }

    if (Object.keys(config).length > 0) {
      instance.set(config);
    }
    appliedConfigRef.current = nextConfig;
  });

  return api;
}
