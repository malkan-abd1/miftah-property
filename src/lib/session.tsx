import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Session = {
  token: string;
  code: string;
  workspaceName: string;
  role: "manager" | "employee";
  name: string;
};

const KEY = "meftah.session";

type Ctx = {
  session: Session | null;
  ready: boolean;
  setSession: (s: Session | null) => void;
};

const SessionContext = createContext<Ctx>({ session: null, ready: false, setSession: () => {} });

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSessionState] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setSessionState(JSON.parse(raw) as Session);
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      session,
      ready,
      setSession: (s) => {
        setSessionState(s);
        if (s) localStorage.setItem(KEY, JSON.stringify(s));
        else localStorage.removeItem(KEY);
      },
    }),
    [session, ready],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  return useContext(SessionContext);
}
