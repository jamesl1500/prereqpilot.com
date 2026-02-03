'use client';

import { useEffect, useState, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import styles from '@/styles/modules/shared/RouteChangeLoader.module.scss';

const isModifiedEvent = (event: MouseEvent) => {
  return event.metaKey || event.altKey || event.ctrlKey || event.shiftKey;
};

const shouldHandleLink = (anchor: HTMLAnchorElement, currentUrl: URL) => {
  const href = anchor.getAttribute('href');
  if (!href || href.startsWith('#')) return false;
  if (href.startsWith('mailto:') || href.startsWith('tel:')) return false;
  if (anchor.getAttribute('target') === '_blank') return false;
  if (anchor.hasAttribute('download')) return false;
  if (anchor.dataset.noLoading === 'true') return false;

  const nextUrl = new URL(href, currentUrl);
  if (nextUrl.origin !== currentUrl.origin) return false;

  const currentPath = `${currentUrl.pathname}${currentUrl.search}`;
  const nextPath = `${nextUrl.pathname}${nextUrl.search}`;
  return currentPath !== nextPath;
};

export default function RouteChangeLoader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isNavigating, setIsNavigating] = useState(false);
  const navigationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Always reset loader when route changes
  useEffect(() => {
    setIsNavigating(false);
    if (navigationTimeoutRef.current) {
      clearTimeout(navigationTimeoutRef.current);
      navigationTimeoutRef.current = null;
    }
  }, [pathname, searchParams]);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (event.defaultPrevented || isModifiedEvent(event)) return;

      const target = event.target as HTMLElement | null;
      const anchor = target?.closest('a') as HTMLAnchorElement | null;
      if (!anchor) return;

      const currentUrl = new URL(window.location.href);
      if (!shouldHandleLink(anchor, currentUrl)) return;

      setIsNavigating(true);
    };

    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const { history } = window;
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    const startNavigationIfChanged = (url?: string | URL | null) => {
      if (!url) {
        setIsNavigating(true);
        return;
      }

      const nextUrl = new URL(url, window.location.href);
      if (nextUrl.href !== window.location.href) {
        setIsNavigating(true);
      }
    };

    history.pushState = function pushState(state, title, url) {
      startNavigationIfChanged(url ?? null);
      return originalPushState.apply(this, [state, title, url]);
    };

    history.replaceState = function replaceState(state, title, url) {
      startNavigationIfChanged(url ?? null);
      return originalReplaceState.apply(this, [state, title, url]);
    };

    const handlePopState = () => {
      setIsNavigating(true);
      // Ensure we reset after a timeout if pathname doesn't change (e.g., same-site popstate)
      navigationTimeoutRef.current = setTimeout(() => {
        setIsNavigating(false);
      }, 1000);
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      history.pushState = originalPushState;
      history.replaceState = originalReplaceState;
      window.removeEventListener('popstate', handlePopState);
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current);
      }
    };
  }, []);

  if (!isNavigating) return null;

  return (
    <div className={styles.overlay} role="status" aria-live="polite">
      <div className={styles.card}>
        <div className={styles.spinner} aria-hidden="true" />
        <div className={styles.text}>Loading your page…</div>
        <div className={styles.subtext}>Redirecting</div>
      </div>
    </div>
  );
}