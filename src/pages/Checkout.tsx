import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Check, ShoppingCart, MapPin, CreditCard, Banknote, ShieldCheck } from "lucide-react";
import { formatPrice } from "@/lib/currency";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const RAZORPAY_KEY = "rzp_test_XXXXXXXXXXXXXXX"; // Replace with your Razorpay test key

const STEPS = [
  { label: "Cart Summary", icon: ShoppingCart },
  { label: "Address", icon: MapPin },
  { label: "Payment", icon: CreditCard },
];

export default function Checkout() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { items, cartTotal, clearCart } = useCart();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"razorpay" | "cod">("razorpay");
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    streetAddress: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
  });

  if (!user) {
    return (
      <Layout>
        <div className="container py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Please sign in to checkout</h1>
          <Button asChild><Link to="/login">Sign In</Link></Button>
        </div>
      </Layout>
    );
  }

  if (items.length === 0) {
    return (
      <Layout>
        <div className="container py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
          <Button asChild><Link to="/products">Shop Now</Link></Button>
        </div>
      </Layout>
    );
  }

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName || !form.phone || !form.streetAddress || !form.city || !form.postalCode) {
      toast({ title: "Please fill in all required fields", variant: "destructive" });
      return;
    }
    setStep(2);
  };

  const placeOrder = async (paymentId: string, paymentStatus: string) => {
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        total: cartTotal,
        shipping_address: {
          full_name: form.fullName,
          phone: form.phone,
          street_address: form.streetAddress,
          city: form.city,
          state: form.state,
          postal_code: form.postalCode,
          country: form.country,
        },
        status: "pending",
        payment_intent_id: paymentId,
        payment_status: paymentStatus,
      })
      .select()
      .single();

    if (orderError) throw orderError;

    const orderItems = items.map((item) => ({
      order_id: order.id,
      product_id: item.product_id,
      product_name: item.product.name,
      product_image: item.product.image_url,
      price: item.product.price,
      quantity: item.quantity,
    }));

    const { error: itemsError } = await supabase.from("order_items").insert(orderItems);
    if (itemsError) throw itemsError;

    await clearCart.mutateAsync();
    navigate(`/order-confirmation/${order.id}`);
  };

  const handleCOD = async () => {
    setLoading(true);
    try {
      await placeOrder("cod_" + Date.now(), "cod");
      toast({ title: "Order placed successfully! Pay on delivery." });
    } catch (err: any) {
      toast({ title: "Order failed", description: err.message, variant: "destructive" });
    }
    setLoading(false);
  };

  const handleRazorpay = async () => {
    setLoading(true);
    try {
      const amountInPaise = Math.round(cartTotal * 100);
      const options = {
        key: RAZORPAY_KEY,
        amount: amountInPaise,
        currency: "INR",
        name: "Rufus Sam Store",
        description: `Order of ${items.length} item(s)`,
        handler: async (response: any) => {
          try {
            await placeOrder(response.razorpay_payment_id, "paid");
            toast({ title: "Payment successful! Order placed." });
          } catch (err: any) {
            toast({ title: "Order failed", description: err.message, variant: "destructive" });
          }
        },
        prefill: { name: form.fullName, email: user.email ?? "", contact: form.phone },
        theme: { color: "hsl(217, 91%, 60%)" },
        modal: { ondismiss: () => setLoading(false) },
      };
      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", async (response: any) => {
        try {
          await placeOrder(response.error.metadata?.payment_id ?? "failed", "failed");
          toast({ title: "Payment failed, order saved.", variant: "destructive" });
        } catch (err: any) {
          toast({ title: "Order failed", description: err.message, variant: "destructive" });
        }
        setLoading(false);
      });
      rzp.open();
    } catch (err: any) {
      toast({ title: "Payment error", description: err.message, variant: "destructive" });
      setLoading(false);
    }
  };

  const handlePayment = () => {
    if (paymentMethod === "cod") handleCOD();
    else handleRazorpay();
  };

  return (
    <Layout>
      <div className="container py-8 md:py-12 max-w-4xl">
        {/* Stepper */}
        <div className="flex items-center justify-center mb-10">
          {STEPS.map((s, i) => (
            <div key={s.label} className="flex items-center">
              <button
                onClick={() => i < step && setStep(i)}
                disabled={i > step}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
                  i === step
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                    : i < step
                    ? "bg-accent text-accent-foreground cursor-pointer"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {i < step ? <Check className="h-4 w-4" /> : <s.icon className="h-4 w-4" />}
                <span className="hidden sm:inline">{s.label}</span>
              </button>
              {i < STEPS.length - 1 && (
                <div className={`w-8 sm:w-16 h-0.5 mx-2 rounded-full transition-colors ${i < step ? "bg-accent" : "bg-border"}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Cart Summary */}
        {step === 0 && (
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-6">Review Your Order</h1>
            <div className="rounded-2xl border bg-card divide-y">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-4 p-4 md:p-5">
                  <div className="h-16 w-16 rounded-lg bg-muted overflow-hidden shrink-0">
                    <img
                      src={item.product.image_url || "/placeholder.svg"}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{item.product.name}</p>
                    <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-bold text-sm">{formatPrice(item.product.price * item.quantity)}</p>
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center mt-6 p-5 bg-primary/5 rounded-2xl border border-primary/10">
              <span className="text-lg font-bold">Total</span>
              <span className="text-xl font-bold text-primary">{formatPrice(cartTotal)}</span>
            </div>
            <Button className="w-full mt-6 h-12" size="lg" onClick={() => setStep(1)}>
              Continue to Address
            </Button>
          </div>
        )}

        {/* Step 2: Address */}
        {step === 1 && (
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-6">Shipping Address</h1>
            <form onSubmit={handleAddressSubmit} className="space-y-4 max-w-lg bg-card p-6 md:p-8 rounded-2xl border">
              <div>
                <Label htmlFor="fullName">Full Name *</Label>
                <Input id="fullName" value={form.fullName} onChange={set("fullName")} required className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input id="phone" type="tel" value={form.phone} onChange={set("phone")} required className="mt-1.5" placeholder="+91..." />
              </div>
              <div>
                <Label htmlFor="streetAddress">Street Address *</Label>
                <Input id="streetAddress" value={form.streetAddress} onChange={set("streetAddress")} required className="mt-1.5" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input id="city" value={form.city} onChange={set("city")} required className="mt-1.5" />
                </div>
                <div>
                  <Label htmlFor="state">State</Label>
                  <Input id="state" value={form.state} onChange={set("state")} className="mt-1.5" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="postalCode">Pincode *</Label>
                  <Input id="postalCode" value={form.postalCode} onChange={set("postalCode")} required className="mt-1.5" />
                </div>
                <div>
                  <Label htmlFor="country">Country</Label>
                  <Input id="country" value={form.country} onChange={set("country")} className="mt-1.5" />
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <Button type="button" variant="outline" className="h-12" onClick={() => setStep(0)}>Back</Button>
                <Button type="submit" className="flex-1 h-12">Continue to Payment</Button>
              </div>
            </form>
          </div>
        )}

        {/* Step 3: Payment */}
        {step === 2 && (
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-6">Payment</h1>
            <div className="max-w-lg space-y-5">
              {/* Order summary card */}
              <div className="rounded-2xl border bg-card p-5 space-y-3">
                <h3 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">Order Details</h3>
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{item.product.name} × {item.quantity}</span>
                    <span className="font-medium">${(item.product.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <div className="border-t pt-3 flex justify-between font-bold">
                  <span>Total</span>
                  <span className="text-primary">${cartTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Shipping address card */}
              <div className="rounded-2xl border bg-card p-5 space-y-1">
                <h3 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">Shipping To</h3>
                <p className="font-medium">{form.fullName}</p>
                <p className="text-sm text-muted-foreground">{form.phone}</p>
                <p className="text-sm text-muted-foreground">
                  {form.streetAddress}, {form.city}
                  {form.state && `, ${form.state}`} {form.postalCode}, {form.country}
                </p>
              </div>

              {/* Payment method selection */}
              <div className="rounded-2xl border bg-card p-5 space-y-3">
                <h3 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">Payment Method</h3>
                <div className="space-y-2">
                  <label
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      paymentMethod === "razorpay" ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value="razorpay"
                      checked={paymentMethod === "razorpay"}
                      onChange={() => setPaymentMethod("razorpay")}
                      className="sr-only"
                    />
                    <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      paymentMethod === "razorpay" ? "border-primary" : "border-muted-foreground"
                    }`}>
                      {paymentMethod === "razorpay" && <div className="h-2.5 w-2.5 rounded-full bg-primary" />}
                    </div>
                    <CreditCard className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium text-sm">Pay with Razorpay</p>
                      <p className="text-xs text-muted-foreground">Credit/Debit Card, UPI, Net Banking</p>
                    </div>
                  </label>
                  <label
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      paymentMethod === "cod" ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value="cod"
                      checked={paymentMethod === "cod"}
                      onChange={() => setPaymentMethod("cod")}
                      className="sr-only"
                    />
                    <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      paymentMethod === "cod" ? "border-primary" : "border-muted-foreground"
                    }`}>
                      {paymentMethod === "cod" && <div className="h-2.5 w-2.5 rounded-full bg-primary" />}
                    </div>
                    <Banknote className="h-5 w-5 text-accent" />
                    <div>
                      <p className="font-medium text-sm">Cash on Delivery</p>
                      <p className="text-xs text-muted-foreground">Pay when you receive your order</p>
                    </div>
                  </label>
                </div>
              </div>

              <div className="flex gap-4">
                <Button variant="outline" className="h-12" onClick={() => setStep(1)}>Back</Button>
                <Button className="flex-1 h-12" size="lg" onClick={handlePayment} disabled={loading}>
                  {loading
                    ? "Processing..."
                    : paymentMethod === "cod"
                    ? "Place Order (COD)"
                    : `Pay $${cartTotal.toFixed(2)}`}
                </Button>
              </div>

              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>{paymentMethod === "razorpay" ? "🔒 Razorpay Test Mode — No real charges" : "💰 Cash on Delivery — Pay when received"}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
