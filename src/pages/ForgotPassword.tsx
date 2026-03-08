import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { toast } from "sonner";
import { Mail, ArrowLeft, ShoppingBag, KeyRound, RefreshCw, Lock } from "lucide-react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"email" | "otp" | "newpass" | "done">("email");
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) { toast.error("Please enter your email"); return; }
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) {
      toast.error(error.message);
    } else {
      setStep("otp");
      setResendCooldown(60);
      toast.success("OTP sent to your email!");
    }
    setLoading(false);
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) {
      toast.error(error.message);
    } else {
      setResendCooldown(60);
      toast.success("OTP resent to your email.");
    }
    setLoading(false);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) { toast.error("Please enter the full 6-digit OTP"); return; }
    setLoading(true);
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: "email",
    });
    if (error) {
      toast.error("Invalid or expired OTP. Please try again.");
      setOtp("");
    } else {
      setStep("newpass");
      toast.success("OTP verified! Set your new password.");
    }
    setLoading(false);
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      toast.error(error.message);
    } else {
      setStep("done");
      toast.success("Password updated successfully!");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 px-4">
      <Card className="w-full max-w-md border-0 shadow-xl">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
            <ShoppingBag className="h-7 w-7 text-primary" />
          </div>
          <CardTitle className="text-2xl">
            {step === "email" && "Reset password"}
            {step === "otp" && "Verify your email"}
            {step === "newpass" && "Set new password"}
            {step === "done" && "Password updated!"}
          </CardTitle>
          <CardDescription>
            {step === "email" && "Enter your email to receive a verification code"}
            {step === "otp" && "Enter the 6-digit code sent to your email"}
            {step === "newpass" && "Choose a strong new password"}
            {step === "done" && "Your password has been reset successfully"}
          </CardDescription>
        </CardHeader>

        {step === "email" && (
          <form onSubmit={handleSendOtp}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input id="email" type="email" placeholder="you@example.com" value={email}
                    onChange={(e) => setEmail(e.target.value)} className="pl-9" required />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full h-11" disabled={loading}>
                {loading ? "Sending..." : "Send OTP"}
              </Button>
              <Link to="/login" className="text-sm text-primary hover:underline inline-flex items-center gap-1">
                <ArrowLeft className="h-3 w-3" /> Back to login
              </Link>
            </CardFooter>
          </form>
        )}

        {step === "otp" && (
          <form onSubmit={handleVerifyOtp}>
            <CardContent className="space-y-5">
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
                <button type="button" onClick={handleResendOtp}
                  disabled={resendCooldown > 0 || loading}
                  className="inline-flex items-center gap-1 text-primary hover:underline disabled:text-muted-foreground disabled:no-underline">
                  <RefreshCw className="h-3 w-3" />
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend OTP"}
                </button>
                <span className="text-muted-foreground">|</span>
                <button type="button" onClick={() => { setStep("email"); setOtp(""); }}
                  className="text-primary hover:underline">Change email</button>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full h-11" disabled={loading || otp.length !== 6}>
                {loading ? "Verifying..." : "Verify OTP"}
              </Button>
            </CardFooter>
          </form>
        )}

        {step === "newpass" && (
          <form onSubmit={handleUpdatePassword}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input id="new-password" type="password" placeholder="••••••••" value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)} className="pl-9" required minLength={6} />
                </div>
                <p className="text-xs text-muted-foreground">Must be at least 6 characters</p>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full h-11" disabled={loading}>
                {loading ? "Updating..." : "Update Password"}
              </Button>
            </CardFooter>
          </form>
        )}

        {step === "done" && (
          <CardFooter className="flex flex-col gap-3 pt-2">
            <Button className="w-full h-11" asChild>
              <Link to="/login">Go to Sign in</Link>
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
