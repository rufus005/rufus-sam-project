import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Mail, Shield, CheckCircle } from "lucide-react";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const navigate = useNavigate();

  const handleSendMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Please enter your email");
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
      toast.error(error.message);
    } else {
      setSent(true);
      toast.success("Magic link sent! Check your email.");
    }
    setLoading(false);
  };

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
              <p className="text-xs text-muted-foreground">
                A magic link will be sent to your email. Only users with admin privileges can access the dashboard.
              </p>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full h-11" disabled={loading}>
                {loading ? "Sending..." : "Send Magic Link"}
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
            >
              Use a different email
            </Button>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
