import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Mail, Lock, ShoppingBag, KeyRound } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"password" | "otp">("password");
  const [otpSent, setOtpSent] = useState(false);
  const navigate = useNavigate();

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Welcome back!");
      navigate("/");
    }
    setLoading(false);
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) { toast.error("Please enter your email"); return; }
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) {
      toast.error(error.message);
    } else {
      setOtpSent(true);
      toast.success("OTP sent to your email!");
    }
    setLoading(false);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: "email",
    });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Welcome back!");
      navigate("/");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 px-4">
      <Card className="w-full max-w-md border-0 shadow-xl">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/25">
            <ShoppingBag className="h-7 w-7 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl">Welcome back</CardTitle>
          <CardDescription>Sign in to your Rufus Sam account</CardDescription>
        </CardHeader>

        {/* Mode Toggle */}
        <div className="px-6 pb-2">
          <div className="flex rounded-xl bg-secondary/50 p-1">
            <button
              type="button"
              onClick={() => { setMode("password"); setOtpSent(false); }}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                mode === "password" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"
              }`}
            >
              <Lock className="h-3.5 w-3.5 inline mr-1.5" />Password
            </button>
            <button
              type="button"
              onClick={() => setMode("otp")}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                mode === "otp" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"
              }`}
            >
              <KeyRound className="h-3.5 w-3.5 inline mr-1.5" />Email OTP
            </button>
          </div>
        </div>

        {mode === "password" ? (
          <form onSubmit={handlePasswordLogin}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input id="email" type="email" placeholder="you@example.com" value={email}
                    onChange={(e) => setEmail(e.target.value)} className="pl-9" required />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link to="/forgot-password" className="text-xs text-primary hover:underline">Forgot password?</Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input id="password" type="password" placeholder="••••••••" value={password}
                    onChange={(e) => setPassword(e.target.value)} className="pl-9" required />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full h-11" disabled={loading}>
                {loading ? "Signing in..." : "Sign in"}
              </Button>
              <p className="text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link to="/register" className="text-primary hover:underline font-medium">Create one</Link>
              </p>
            </CardFooter>
          </form>
        ) : !otpSent ? (
          <form onSubmit={handleSendOtp}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input id="otp-email" type="email" placeholder="you@example.com" value={email}
                    onChange={(e) => setEmail(e.target.value)} className="pl-9" required />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">We'll send a one-time login code to your email.</p>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full h-11" disabled={loading}>
                {loading ? "Sending..." : "Send OTP"}
              </Button>
              <p className="text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link to="/register" className="text-primary hover:underline font-medium">Create one</Link>
              </p>
            </CardFooter>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp}>
            <CardContent className="space-y-4">
              <div className="p-3 rounded-xl bg-accent/10 border border-accent/20 text-sm text-center">
                OTP sent to <span className="font-medium">{email}</span>
              </div>
              <div className="space-y-2">
                <Label htmlFor="otp-code">Enter OTP Code</Label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input id="otp-code" placeholder="123456" value={otp} maxLength={6}
                    onChange={(e) => setOtp(e.target.value)} className="pl-9 text-center tracking-widest text-lg" required />
                </div>
              </div>
              <button type="button" onClick={() => setOtpSent(false)} className="text-xs text-primary hover:underline w-full text-center">
                Change email or resend OTP
              </button>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full h-11" disabled={loading}>
                {loading ? "Verifying..." : "Verify & Sign in"}
              </Button>
            </CardFooter>
          </form>
        )}
      </Card>
    </div>
  );
}
