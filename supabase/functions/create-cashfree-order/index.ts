import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate user
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { action } = body;

    const CASHFREE_APP_ID = Deno.env.get("CASHFREE_APP_ID")!;
    const CASHFREE_SECRET_KEY = Deno.env.get("CASHFREE_SECRET_KEY")!;
    const CASHFREE_BASE_URL = "https://sandbox.cashfree.com/pg";

    if (action === "create_order") {
      const { amount, customerName, customerPhone, customerEmail, returnUrl, shippingAddress, cartItems } = body;

      if (!amount || !customerName || !customerPhone || !customerEmail) {
        return new Response(JSON.stringify({ error: "Missing required fields" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const orderId = `order_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

      const cashfreePayload = {
        order_id: orderId,
        order_amount: Number(amount),
        order_currency: "INR",
        customer_details: {
          customer_id: user.id.substring(0, 25),
          customer_name: customerName,
          customer_email: customerEmail,
          customer_phone: customerPhone,
        },
        order_meta: {
          return_url: returnUrl + "?order_id={order_id}",
        },
      };

      const cfResponse = await fetch(`${CASHFREE_BASE_URL}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-client-id": CASHFREE_APP_ID,
          "x-client-secret": CASHFREE_SECRET_KEY,
          "x-api-version": "2023-08-01",
        },
        body: JSON.stringify(cashfreePayload),
      });

      const cfData = await cfResponse.json();

      if (!cfResponse.ok) {
        console.error("Cashfree create order error:", cfData);
        return new Response(
          JSON.stringify({ error: cfData.message || "Failed to create payment order" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Store order in our DB with pending status
      const { data: dbOrder, error: dbError } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          total: amount,
          shipping_address: shippingAddress,
          status: "pending",
          payment_intent_id: orderId,
          payment_status: "unpaid",
        })
        .select()
        .single();

      if (dbError) {
        console.error("DB order insert error:", dbError);
        return new Response(JSON.stringify({ error: "Failed to create order record" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Insert order items
      if (cartItems && cartItems.length > 0) {
        const orderItems = cartItems.map((item: any) => ({
          order_id: dbOrder.id,
          product_id: item.product_id,
          product_name: item.product_name,
          product_image: item.product_image,
          price: item.price,
          quantity: item.quantity,
        }));

        const { error: itemsError } = await supabase.from("order_items").insert(orderItems);
        if (itemsError) {
          console.error("DB order items error:", itemsError);
        }
      }

      return new Response(
        JSON.stringify({
          payment_session_id: cfData.payment_session_id,
          cashfree_order_id: orderId,
          db_order_id: dbOrder.id,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (action === "verify_payment") {
      const { cashfreeOrderId, dbOrderId } = body;

      if (!cashfreeOrderId || !dbOrderId) {
        return new Response(JSON.stringify({ error: "Missing order IDs" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const cfResponse = await fetch(`${CASHFREE_BASE_URL}/orders/${cashfreeOrderId}`, {
        method: "GET",
        headers: {
          "x-client-id": CASHFREE_APP_ID,
          "x-client-secret": CASHFREE_SECRET_KEY,
          "x-api-version": "2023-08-01",
        },
      });

      const cfData = await cfResponse.json();

      if (!cfResponse.ok) {
        console.error("Cashfree verify error:", cfData);
        return new Response(JSON.stringify({ error: "Failed to verify payment" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const paymentStatus = cfData.order_status;

      // Use service role to update order status
      const serviceSupabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      );

      if (paymentStatus === "PAID") {
        await serviceSupabase
          .from("orders")
          .update({ payment_status: "paid", status: "confirmed" })
          .eq("id", dbOrderId);

        return new Response(
          JSON.stringify({ status: "paid", order_id: dbOrderId }),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      } else {
        await serviceSupabase
          .from("orders")
          .update({ payment_status: paymentStatus.toLowerCase(), status: "payment_failed" })
          .eq("id", dbOrderId);

        return new Response(
          JSON.stringify({ status: paymentStatus.toLowerCase(), order_id: dbOrderId }),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Edge function error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
