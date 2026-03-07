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
import { Check, ShoppingCart, MapPin, CreditCard } from "lucide-react";

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
  const [form, setForm] = useState({
    fullName: "",
    streetAddress: "",
    city: "",
    state: "",
    postalCode: "",
    country: "US",
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
    if (!form.fullName || !form.streetAddress || !form.city || !form.postalCode) {
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

  const handlePayment = async () => {
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
        prefill: {
          name: form.fullName,
          email: user.email ?? "",
        },
        theme: {
          color: "hsl(217, 91%, 60%)",
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
          },
        },
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

  return (
    <Layout>
      <div className="container py-8 max-w-4xl">
        {/* Stepper */}
        <div className="flex items-center justify-center mb-10">
          {STEPS.map((s, i) => (
            <div key={s.label} className="flex items-center">
              <button
                onClick={() => i < step && setStep(i)}
                disabled={i > step}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  i === step
                    ? "bg-primary text-primary-foreground"
                    : i < step
                    ? "bg-accent text-accent-foreground cursor-pointer"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {i < step ? <Check className="h-4 w-4" /> : <s.icon className="h-4 w-4" />}
                <span className="hidden sm:inline">{s.label}</span>
              </button>
              {i < STEPS.length - 1 && (
                <div className={`w-8 sm:w-16 h-0.5 mx-1 ${i < step ? "bg-accent" : "bg-border"}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Cart Summary */}
        {step === 0 && (
          <div>
            <h1 className="text-2xl font-bold mb-6">Cart Summary</h1>
            <div className="border rounded-lg divide-y">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-4 p-4">
                  <img
                    src={item.product.image_url || "/placeholder.svg"}
                    alt={item.product.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div className="flex-1">
                    <p className="font-medium">{item.product.name}</p>
                    <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-semibold">${(item.product.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center mt-6 p-4 bg-muted rounded-lg">
              <span className="text-lg font-bold">Total</span>
              <span className="text-lg font-bold">${cartTotal.toFixed(2)}</span>
            </div>
            <Button className="w-full mt-6" size="lg" onClick={() => setStep(1)}>
              Continue to Address
            </Button>
          </div>
        )}

        {/* Step 2: Address */}
        {step === 1 && (
          <div>
            <h1 className="text-2xl font-bold mb-6">Shipping Address</h1>
            <form onSubmit={handleAddressSubmit} className="space-y-4 max-w-lg">
              <div>
                <Label htmlFor="fullName">Full Name *</Label>
                <Input id="fullName" value={form.fullName} onChange={set("fullName")} required />
              </div>
              <div>
                <Label htmlFor="streetAddress">Street Address *</Label>
                <Input id="streetAddress" value={form.streetAddress} onChange={set("streetAddress")} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input id="city" value={form.city} onChange={set("city")} required />
                </div>
                <div>
                  <Label htmlFor="state">State</Label>
                  <Input id="state" value={form.state} onChange={set("state")} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="postalCode">Postal Code *</Label>
                  <Input id="postalCode" value={form.postalCode} onChange={set("postalCode")} required />
                </div>
                <div>
                  <Label htmlFor="country">Country</Label>
                  <Input id="country" value={form.country} onChange={set("country")} />
                </div>
              </div>
              <div className="flex gap-4 pt-2">
                <Button type="button" variant="outline" onClick={() => setStep(0)}>Back</Button>
                <Button type="submit" className="flex-1">Continue to Payment</Button>
              </div>
            </form>
          </div>
        )}

        {/* Step 3: Payment */}
        {step === 2 && (
          <div>
            <h1 className="text-2xl font-bold mb-6">Payment</h1>
            <div className="max-w-lg space-y-6">
              <div className="border rounded-lg p-6 space-y-3">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Order Details</h3>
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>{item.product.name} × {item.quantity}</span>
                    <span>${(item.product.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <div className="border-t pt-3 flex justify-between font-bold">
                  <span>Total</span>
                  <span>${cartTotal.toFixed(2)}</span>
                </div>
              </div>

              <div className="border rounded-lg p-6 space-y-1">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Shipping To</h3>
                <p className="font-medium">{form.fullName}</p>
                <p className="text-sm text-muted-foreground">
                  {form.streetAddress}, {form.city}
                  {form.state && `, ${form.state}`} {form.postalCode}, {form.country}
                </p>
              </div>

              <div className="flex gap-4">
                <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                <Button className="flex-1" size="lg" onClick={handlePayment} disabled={loading}>
                  {loading ? "Processing..." : `Pay $${cartTotal.toFixed(2)} with Razorpay`}
                </Button>
              </div>

              <p className="text-xs text-center text-muted-foreground">
                🔒 Razorpay Test Mode — No real charges will be made
              </p>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
