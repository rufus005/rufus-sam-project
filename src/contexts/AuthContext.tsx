import { createContext, useContext, useEffect, useState, useCallback, useRef, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

/** Auto sign-out after 30 minutes of user inactivity */
const IDLE_TIMEOUT_MS = 30 * 60 * 1000;

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  loading: true,
  signOut: async () => {},
});

/** Hook to access the current auth state (session, user, loading, signOut) */
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initialized = useRef(false);

  /** Sign the user out and clear session state */
  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Sign out error:", error);
    }
  }, []);

  /** Reset idle timer on user interaction; auto sign-out on expiry */
  useEffect(() => {
    if (!session) return;

    const resetTimer = () => {
      if (idleTimer.current) clearTimeout(idleTimer.current);
      idleTimer.current = setTimeout(() => {
        signOut();
      }, IDLE_TIMEOUT_MS);
    };

    const events = ["mousedown", "keydown", "scroll", "touchstart"];
    events.forEach((e) => window.addEventListener(e, resetTimer, { passive: true }));
    resetTimer();

    return () => {
      if (idleTimer.current) clearTimeout(idleTimer.current);
      events.forEach((e) => window.removeEventListener(e, resetTimer));
    };
  }, [session, signOut]);

  /** Subscribe to auth state changes and fetch initial session */
  useEffect(() => {
    // Set up listener first (before getSession) to avoid race conditions
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setLoading(false);
      }
    );

    // Then get initial session
    if (!initialized.current) {
      initialized.current = true;
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
        setLoading(false);
      });
    }

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ session, user: session?.user ?? null, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
