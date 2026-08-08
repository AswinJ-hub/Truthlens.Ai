import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';

interface RouterState {
  path: string;
  navigate: (to: string) => void;
}

const RouterContext = createContext<RouterState | undefined>(undefined);

function currentPath() {
  const hash = window.location.hash.replace(/^#/, '');
  return hash || '/';
}

export function RouterProvider({ children }: { children: ReactNode }) {
  const [path, setPath] = useState<string>(currentPath());

  useEffect(() => {
    const onHash = () => setPath(currentPath());
    window.addEventListener('hashchange', onHash);
    if (!window.location.hash) {
      window.history.replaceState({}, '', '#/');
    }
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const navigate = useCallback((to: string) => {
    if (to.startsWith('http')) {
      window.open(to, '_blank');
      return;
    }
    const target = to.startsWith('/') ? to : `/${to}`;
    if (target === currentPath()) return;
    window.location.hash = target;
    window.scrollTo(0, 0);
  }, []);

  return (
    <RouterContext.Provider value={{ path, navigate }}>
      {children}
    </RouterContext.Provider>
  );
}

export function useRouter() {
  const ctx = useContext(RouterContext);
  if (!ctx) throw new Error('useRouter must be used within RouterProvider');
  return ctx;
}
