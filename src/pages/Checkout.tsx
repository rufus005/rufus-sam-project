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

export default function Checkout() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { items, cartTotal, clearCart } = useCart();
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName || !form.streetAddress || !form.city || !form.postalCode) {
      toast({ title: "Please fill in all required fields", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      // Create order
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
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
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

      // Clear cart
      await clearCart.mutateAsync();

      navigate(`/order-confirmation/${order.id}`);
    } catch (err: any) {
      toast({ title: "Order failed", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  return (
    <Layout>
      <div className="container py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">Shipping Address</h2>
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
            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? "Placing Order..." : `Place Order — $${cartTotal.toFixed(2)}`}
            </Button>
          </form>

          <div className="border rounded-lg p-6 h-fit">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>{item.product.name} × {item.quantity}</span>
                  <span>${(Number(item.product.price) * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="border-t mt-4 pt-4 flex justify-between font-bold">
              <span>Total</span>
              <span>${cartTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
