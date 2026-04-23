import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Mail, Shield, CheckCircle, Clock } from "lucide-react";
import { isAdminEmail } from "@/config/admins";

const COOLDOWN_KEY = "admin_magic_link_cooldown";
const COOLDOWN_SECONDS = 60;

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in as admin
  useEffect(() => {
    if (authLoading || !user) return;
    if (isAdminEmail(user.email)) navigate("/admin", { replace: true });
    else navigate("/", { replace: true });
  }, [user, authLoading, navigate]);

  // Restore cooldown from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(COOLDOWN_KEY);
    if (stored) {
      const remaining = Math.max(0, Math.ceil((Number(stored) - Date.now()) / 1000));
      if (remaining > 0) setCooldown(remaining);
    }
  }, []);

  // Countdown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const startCooldown = useCallback(() => {
    const expiresAt = Date.now() + COOLDOWN_SECONDS * 1000;
    localStorage.setItem(COOLDOWN_KEY, String(expiresAt));
    setCooldown(COOLDOWN_SECONDS);
  }, []);

  const handleSendMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Please enter your email");
      return;
    }
    if (cooldown > 0) {
      toast.error(`Please wait ${cooldown}s before requesting another link`);
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/admin`,
      },
    });
    if (error) {
      if (error.message?.toLowerCase().includes("rate limit")) {
        toast.error("Email rate limit exceeded. Please wait a few minutes before trying again.");
        startCooldown();
      } else {
        toast.error(error.message);
      }
    } else {
      setSent(true);
      startCooldown();
      toast.success("Magic link sent! Check your email.");
    }
    setLoading(false);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-foreground/5 via-background to-primary/5 px-4">
      <Card className="w-full max-w-md border-0 shadow-xl">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-foreground shadow-lg">
            <Shield className="h-7 w-7 text-background" />
          </div>
          <CardTitle className="text-2xl">Admin Access</CardTitle>
          <CardDescription>Sign in with a magic link sent to your email</CardDescription>
        </CardHeader>

        {!sent ? (
          <form onSubmit={handleSendMagicLink}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="admin-email">Admin Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="admin-email"
                    type="email"
                    placeholder="admin@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9"
                    required
                  />
                </div>
              </div>
              {cooldown > 0 && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">
                  <Clock className="h-4 w-4 shrink-0" />
                  <span>You can request another link in <strong>{cooldown}s</strong></span>
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                A magic link will be sent to your email. Only users with admin privileges can access the dashboard.
              </p>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full h-11" disabled={loading || cooldown > 0}>
                {loading ? "Sending..." : cooldown > 0 ? `Wait ${cooldown}s` : "Send Magic Link"}
              </Button>
            </CardFooter>
          </form>
        ) : (
          <CardContent className="space-y-4 text-center py-6">
            <CheckCircle className="h-12 w-12 text-accent mx-auto" />
            <div className="space-y-2">
              <p className="font-medium">Magic link sent!</p>
              <p className="text-sm text-muted-foreground">
                Check your inbox at <span className="font-medium text-foreground">{email}</span> and click the link to sign in.
              </p>
            </div>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => { setSent(false); setEmail(""); }}
              disabled={cooldown > 0}
            >
              {cooldown > 0 ? `Use different email (${cooldown}s)` : "Use a different email"}
            </Button>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
