import { useCallback, useEffect, useState } from 'react';

export const HIDDEN_STORAGE_KEY = 'screen-counter:hidden';

export interface UseHiddenResult {
  hidden: boolean;
  hide: () => void;
}

export function useHidden(): UseHiddenResult {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    try {
      if (window.localStorage.getItem(HIDDEN_STORAGE_KEY) === '1') {
        setHidden(true);
      }
    } catch {
      // localStorage may be unavailable (Safari private mode, sandboxed iframe).
      // Falling back to a non-persistent visible badge is acceptable.
    }
  }, []);

  const hide = useCallback(() => {
    setHidden(true);
    try {
      window.localStorage.setItem(HIDDEN_STORAGE_KEY, '1');
    } catch {
      // Ignored — see above.
    }
  }, []);

  return { hidden, hide };
}
