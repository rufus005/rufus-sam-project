import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Mail, ShoppingBag, KeyRound, RefreshCw, Lock } from "lucide-react";

/** Extracts a user-friendly error message from Supabase auth errors */
function getAuthErrorMessage(error: { message: string }): string {
  const msg = error.message.toLowerCase();
  if (msg.includes("invalid login credentials")) return "Incorrect email or password. Please try again.";
  if (msg.includes("email not confirmed")) return "Your email is not verified. Please check your inbox.";
  if (msg.includes("rate limit")) return "Too many attempts. Please wait a few minutes.";
  if (msg.includes("user not found")) return "No account found with this email.";
  if (msg.includes("network")) return "Network error. Please check your connection.";
  return error.message;
}

export default function Login() {
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [tab, setTab] = useState("password");
  const navigate = useNavigate();

  /** Redirect already-authenticated users to home */
  useEffect(() => {
    if (user) navigate("/", { replace: true });
  }, [user, navigate]);

  /** Countdown timer for OTP resend cooldown */
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  /** Handle password-based login with error handling */
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) { toast.error("Please fill in all fields"); return; }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) {
        toast.error(getAuthErrorMessage(error));
        if (error.message.toLowerCase().includes("rate limit")) setResendCooldown(60);
      } else {
        toast.success("Welcome back!");
        navigate("/");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    }
    setLoading(false);
  };

  /** Send a one-time password to the user's email */
  const sendOtp = async () => {
    if (!email.trim()) { toast.error("Please enter your email"); return; }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({ email: email.trim() });
      if (error) {
        toast.error(getAuthErrorMessage(error));
        if (error.message.toLowerCase().includes("rate limit")) setResendCooldown(60);
      } else {
        setOtpSent(true);
        setResendCooldown(60);
        toast.success("A 6-digit OTP has been sent to your email.");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    }
    setLoading(false);
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    await sendOtp();
  };

  /** Resend OTP with cooldown enforcement */
  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    await sendOtp();
  };

  /** Verify the 6-digit OTP entered by the user */
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) { toast.error("Please enter the full 6-digit OTP"); return; }
    setLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({ email: email.trim(), token: otp, type: "email" });
      if (error) {
        toast.error("Invalid or expired OTP. Please try again.");
        setOtp("");
      } else {
        toast.success("Welcome back!");
        navigate("/");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
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
          <CardDescription>Sign in to your Dynamic Universal Marketing account</CardDescription>
        </CardHeader>

        <Tabs value={tab} onValueChange={(v) => { setTab(v); setOtpSent(false); setOtp(""); }} className="w-full">
          <div className="px-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="password">
                <Lock className="h-4 w-4 mr-1.5" />
                Password
              </TabsTrigger>
              <TabsTrigger value="otp">
                <KeyRound className="h-4 w-4 mr-1.5" />
                OTP
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Password Tab */}
          <TabsContent value="password">
            <form onSubmit={handlePasswordLogin}>
              <CardContent className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="pw-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="pw-email" type="email" placeholder="you@example.com" value={email}
                      onChange={(e) => setEmail(e.target.value)} className="pl-9" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="pw-password">Password</Label>
                    <Link to="/forgot-password" className="text-xs text-primary hover:underline">Forgot password?</Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="pw-password" type="password" placeholder="••••••••" value={password}
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
          </TabsContent>

          {/* OTP Tab */}
          <TabsContent value="otp">
            {!otpSent ? (
              <form onSubmit={handleSendOtp}>
                <CardContent className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="otp-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input id="otp-email" type="email" placeholder="you@example.com" value={email}
                        onChange={(e) => setEmail(e.target.value)} className="pl-9" required />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">We'll send a 6-digit verification code to your email. The code expires in 5 minutes.</p>
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                  <Button type="submit" className="w-full h-11" disabled={loading}>
                    <KeyRound className="h-4 w-4 mr-2" />
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
                <CardContent className="space-y-5 pt-4">
                  <div className="p-3 rounded-xl bg-accent/10 border border-accent/20 text-sm text-center">
                    OTP sent to <span className="font-medium">{email}</span>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-center block">Enter 6-digit OTP</Label>
                    <div className="flex justify-center">
                      <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                        <InputOTPGroup>
                          <InputOTPSlot index={0} />
                          <InputOTPSlot index={1} />
                          <InputOTPSlot index={2} />
                          <InputOTPSlot index={3} />
                          <InputOTPSlot index={4} />
                          <InputOTPSlot index={5} />
                        </InputOTPGroup>
                      </InputOTP>
                    </div>
                    <p className="text-xs text-muted-foreground text-center">Code expires in 5 minutes</p>
                  </div>
                  <div className="flex items-center justify-center gap-4 text-xs">
                    <button type="button" onClick={handleResendOtp} disabled={resendCooldown > 0 || loading}
                      className="inline-flex items-center gap-1 text-primary hover:underline disabled:text-muted-foreground disabled:no-underline">
                      <RefreshCw className="h-3 w-3" />
                      {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend OTP"}
                    </button>
                    <span className="text-muted-foreground">|</span>
                    <button type="button" onClick={() => { setOtpSent(false); setOtp(""); }}
                      className="text-primary hover:underline">Change email</button>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                  <Button type="submit" className="w-full h-11" disabled={loading || otp.length !== 6}>
                    {loading ? "Verifying..." : "Verify & Sign in"}
                  </Button>
                </CardFooter>
              </form>
            )}
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
