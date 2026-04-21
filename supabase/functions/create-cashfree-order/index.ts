import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Cashfree LIVE production endpoint - do NOT use sandbox
const CASHFREE_BASE_URL = "https://api.cashfree.com/pg";
const CASHFREE_API_VERSION = "2022-09-01";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // ---- Auth: validate JWT using getClaims (compatible with ES256 signing keys) ----
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey =
      Deno.env.get("SUPABASE_ANON_KEY") ?? Deno.env.get("SUPABASE_PUBLISHABLE_KEY");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseAnonKey || !serviceRoleKey) {
      console.error("Missing Supabase env vars");
      return new Response(JSON.stringify({ error: "Server config error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      console.error("Auth claims error:", claimsError);
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = claimsData.claims.sub as string;
    const userEmail = (claimsData.claims.email as string) || "";

    // ---- Validate Cashfree LIVE credentials ----
    const CASHFREE_APP_ID = Deno.env.get("CASHFREE_APP_ID");
    const CASHFREE_SECRET_KEY = Deno.env.get("CASHFREE_SECRET_KEY");

    if (!CASHFREE_APP_ID || !CASHFREE_SECRET_KEY) {
      console.error("Missing Cashfree credentials");
      return new Response(
        JSON.stringify({ error: "Payment gateway not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!CASHFREE_SECRET_KEY.startsWith("cfsk_ma_prod_")) {
      console.error("Cashfree secret is not a LIVE key");
      return new Response(
        JSON.stringify({ error: "Payment gateway misconfigured (not live)" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(
      `[Cashfree LIVE] App ID prefix: ${CASHFREE_APP_ID.substring(0, 6)}... base=${CASHFREE_BASE_URL}`
    );

    const body = await req.json();
    const { action } = body;

    // ---- Create payment order on Cashfree ----
    if (action === "create_order") {
      const {
        amount,
        customerName,
        customerPhone,
        customerEmail,
        returnUrl,
        shippingAddress,
        cartItems,
      } = body;

      if (!amount || !customerName || !customerPhone || !customerEmail) {
        return new Response(JSON.stringify({ error: "Missing required fields" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Normalize phone: Cashfree expects digits, optional +country code
      const normalizedPhone = String(customerPhone).replace(/[^\d+]/g, "");

      const orderId = `order_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

      const cashfreePayload = {
        order_id: orderId,
        order_amount: Number(amount),
        order_currency: "INR",
        customer_details: {
          customer_id: userId.substring(0, 25),
          customer_name: customerName,
          customer_email: customerEmail || userEmail,
          customer_phone: normalizedPhone,
        },
        order_meta: {
          return_url: `${returnUrl}?order_id={order_id}`,
        },
      };

      const cfResponse = await fetch(`${CASHFREE_BASE_URL}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-client-id": CASHFREE_APP_ID,
          "x-client-secret": CASHFREE_SECRET_KEY,
          "x-api-version": CASHFREE_API_VERSION,
        },
        body: JSON.stringify(cashfreePayload),
      });

      const cfData = await cfResponse.json();

      if (!cfResponse.ok) {
        console.error("Cashfree create order error:", {
          status: cfResponse.status,
          body: cfData,
        });
        return new Response(
          JSON.stringify({ error: cfData.message || "Failed to create payment order" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log("Cashfree order created:", orderId);

      // Persist pending order
      const { data: dbOrder, error: dbError } = await supabase
        .from("orders")
        .insert({
          user_id: userId,
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
        if (itemsError) console.error("DB order items error:", itemsError);
      }

      return new Response(
        JSON.stringify({
          payment_session_id: cfData.payment_session_id,
          cashfree_order_id: orderId,
          db_order_id: dbOrder.id,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ---- Verify payment status with Cashfree ----
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
          "x-api-version": CASHFREE_API_VERSION,
        },
      });

      const cfData = await cfResponse.json();

      if (!cfResponse.ok) {
        console.error("Cashfree verify error:", { status: cfResponse.status, body: cfData });
        return new Response(JSON.stringify({ error: "Failed to verify payment" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const paymentStatus = cfData.order_status;
      const serviceSupabase = createClient(supabaseUrl, serviceRoleKey);

      if (paymentStatus === "PAID") {
        await serviceSupabase
          .from("orders")
          .update({ payment_status: "paid", status: "confirmed" })
          .eq("id", dbOrderId);

        return new Response(
          JSON.stringify({ status: "paid", order_id: dbOrderId }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } else {
        await serviceSupabase
          .from("orders")
          .update({
            payment_status: String(paymentStatus).toLowerCase(),
            status: "payment_failed",
          })
          .eq("id", dbOrderId);

        return new Response(
          JSON.stringify({ status: String(paymentStatus).toLowerCase(), order_id: dbOrderId }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Edge function error:", err);
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
