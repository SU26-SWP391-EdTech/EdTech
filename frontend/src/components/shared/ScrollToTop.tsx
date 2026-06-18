import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function ScrollToTop() {
  const { pathname, search, hash } = useLocation();

  useEffect(() => {
    window.requestAnimationFrame(() => {
      if (hash) {
        const target = document.getElementById(hash.slice(1));
        if (target) {
          target.scrollIntoView({ block: 'start' });
          window.scrollBy({ top: -88, left: 0, behavior: 'auto' });
          return;
        }
      }

      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    });
  }, [pathname, search, hash]);

  return null;
}
