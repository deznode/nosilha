import { useState, useEffect, useRef } from "react";

/**
 * Returns a key that increments each time the component is restored
 * by React's Activity component (cacheComponents: true).
 *
 * Use as a `key` prop on third-party components (e.g. Headless UI Listbox)
 * whose internal event handlers break after Activity hide/show.
 */
export function useActivityRemountKey(): number {
  const [key, setKey] = useState(0);
  const mounted = useRef(false);

  useEffect(() => {
    if (mounted.current) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Intentional: force remount on Activity restore
      setKey((k) => k + 1);
    }
    mounted.current = true;
  }, []);

  return key;
}
