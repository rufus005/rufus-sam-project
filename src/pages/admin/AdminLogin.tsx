import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Mail, Lock, Shield } from "lucide-react";
import { ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_SESSION_KEY } from "@/config/staticAdmin";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { isAdminEmail } from "@/config/admins";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user && isAdminEmail(user.email)) {
      navigate("/admin", { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const trimmedEmail = email.trim().toLowerCase();

    // Hard-gate: only the configured admin email/password is accepted.
    if (trimmedEmail !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
      toast.error("Invalid credentials");
      setLoading(false);
      return;
    }

    try {
      // Try to sign in with Supabase auth so RLS sees a real auth.uid().
      let { error } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password,
      });

      // If account doesn't exist yet, create it. The handle_new_user trigger
      // will auto-grant the 'admin' role because this email is allowlisted.
      if (error && /invalid login credentials/i.test(error.message)) {
        const signUp = await supabase.auth.signUp({
          email: trimmedEmail,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/admin`,
          },
        });
        error = signUp.error ?? null;

        // If signup succeeded but no session (email confirmation enabled), retry sign in.
        if (!error && !signUp.data.session) {
          const retry = await supabase.auth.signInWithPassword({
            email: trimmedEmail,
            password,
          });
          error = retry.error ?? null;
        }
      }

      if (error) {
        toast.error(error.message || "Sign in failed");
        setLoading(false);
        return;
      }

      // Keep legacy session flag for any code still reading it.
      sessionStorage.setItem(ADMIN_SESSION_KEY, "true");
      toast.success("Welcome, Admin!");
      navigate("/admin", { replace: true });
    } catch (err: any) {
      toast.error(err?.message ?? "Sign in failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-foreground/5 via-background to-primary/5 px-4">
      <Card className="w-full max-w-md border-0 shadow-xl">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-foreground shadow-lg">
            <Shield className="h-7 w-7 text-background" />
          </div>
          <CardTitle className="text-2xl">Admin Login</CardTitle>
          <CardDescription>Sign in with your admin credentials</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="admin-email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="admin-email"
                  type="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9"
                  autoComplete="email"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="admin-password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9"
                  autoComplete="current-password"
                  required
                />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full h-11" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
