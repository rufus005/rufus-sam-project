import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Cashfree LIVE production endpoint - do NOT use sandbox
const CASHFREE_BASE_URL = "https://api.cashfree.com/pg";
const CASHFREE_API_VERSION = "2022-09-01";

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // ---- Auth: validate JWT using getClaims (compatible with ES256 signing keys) ----
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return jsonResponse({ error: "Unauthorized" }, 401);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey =
      Deno.env.get("SUPABASE_ANON_KEY") ?? Deno.env.get("SUPABASE_PUBLISHABLE_KEY");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseAnonKey || !serviceRoleKey) {
      console.error("Missing Supabase env vars");
      return jsonResponse({ error: "Server configuration error" }, 500);
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const serviceSupabase = createClient(supabaseUrl, serviceRoleKey);

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      console.error("Auth claims error:", claimsError);
      return jsonResponse({ error: "Unauthorized" }, 401);
    }
    const userId = claimsData.claims.sub as string;
    const userEmail = (claimsData.claims.email as string) || "";

    // ---- Validate Cashfree LIVE credentials ----
    const CASHFREE_APP_ID = Deno.env.get("CASHFREE_APP_ID");
    const CASHFREE_SECRET_KEY = Deno.env.get("CASHFREE_SECRET_KEY");

    if (!CASHFREE_APP_ID || !CASHFREE_SECRET_KEY) {
      console.error("Missing Cashfree credentials");
      return jsonResponse({ error: "Payment gateway not configured" }, 500);
    }

    if (!CASHFREE_SECRET_KEY.startsWith("cfsk_ma_prod_")) {
      console.error("Cashfree secret is not a LIVE key");
      return jsonResponse({ error: "Payment gateway misconfigured" }, 500);
    }

    const body = await req.json();
    const { action } = body;

    // ---- Create payment order on Cashfree ----
    if (action === "create_order") {
      const {
        customerName,
        customerPhone,
        customerEmail,
        returnUrl,
        shippingAddress,
        cartItems,
      } = body;

      if (!customerName || !customerPhone || !customerEmail) {
        return jsonResponse({ error: "Missing required fields" }, 400);
      }

      if (!Array.isArray(cartItems) || cartItems.length === 0) {
        return jsonResponse({ error: "Cart is empty" }, 400);
      }

      // ---- SERVER-SIDE PRICE COMPUTATION ----
      // Never trust client-supplied amounts. Look up canonical product prices
      // from the database and compute the total here.
      const productIds = cartItems
        .map((it: any) => it?.product_id)
        .filter((id: unknown): id is string => typeof id === "string");

      if (productIds.length !== cartItems.length) {
        return jsonResponse({ error: "Invalid cart payload" }, 400);
      }

      const { data: dbProducts, error: prodErr } = await serviceSupabase
        .from("products")
        .select("id, price, name, image_url, is_active")
        .in("id", productIds);

      if (prodErr || !dbProducts) {
        console.error("Failed to load products for price validation:", prodErr);
        return jsonResponse({ error: "Unable to validate cart" }, 500);
      }

      const priceMap = new Map<string, { price: number; name: string; image: string | null; active: boolean }>(
        dbProducts.map((p: any) => [
          p.id,
          { price: Number(p.price), name: p.name, image: p.image_url, active: p.is_active },
        ])
      );

      let serverTotal = 0;
      const safeOrderItems: Array<{
        product_id: string;
        product_name: string;
        product_image: string | null;
        price: number;
        quantity: number;
      }> = [];

      for (const item of cartItems) {
        const meta = priceMap.get(item.product_id);
        if (!meta || !meta.active) {
          return jsonResponse({ error: "Cart contains an unavailable product" }, 400);
        }
        const qty = Math.max(1, Math.floor(Number(item.quantity) || 0));
        if (!qty || qty > 999) {
          return jsonResponse({ error: "Invalid quantity in cart" }, 400);
        }
        serverTotal += meta.price * qty;
        safeOrderItems.push({
          product_id: item.product_id,
          product_name: meta.name,
          product_image: meta.image,
          price: meta.price,
          quantity: qty,
        });
      }

      // Round to 2 decimals (INR paisa precision)
      serverTotal = Math.round(serverTotal * 100) / 100;

      if (serverTotal <= 0) {
        return jsonResponse({ error: "Invalid order total" }, 400);
      }

      // Normalize phone: Cashfree expects digits, optional +country code
      const normalizedPhone = String(customerPhone).replace(/[^\d+]/g, "");

      const orderId = `order_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

      const cashfreePayload = {
        order_id: orderId,
        order_amount: serverTotal,
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
        // Generic message — do not leak Cashfree internals to the client
        return jsonResponse(
          { error: "Payment could not be initiated. Please try again." },
          400
        );
      }

      console.log("Cashfree order created:", orderId);

      // Persist pending order with the SERVER-computed total
      const { data: dbOrder, error: dbError } = await supabase
        .from("orders")
        .insert({
          user_id: userId,
          total: serverTotal,
          shipping_address: shippingAddress,
          status: "pending",
          payment_intent_id: orderId,
          payment_status: "unpaid",
        })
        .select()
        .single();

      if (dbError) {
        console.error("DB order insert error:", dbError);
        return jsonResponse({ error: "Failed to create order record" }, 500);
      }

      const orderItemsRows = safeOrderItems.map((it) => ({
        order_id: dbOrder.id,
        ...it,
      }));

      const { error: itemsError } = await supabase.from("order_items").insert(orderItemsRows);
      if (itemsError) console.error("DB order items error:", itemsError);

      return jsonResponse({
        payment_session_id: cfData.payment_session_id,
        cashfree_order_id: orderId,
        db_order_id: dbOrder.id,
      });
    }

    // ---- Verify payment status with Cashfree ----
    if (action === "verify_payment") {
      const { cashfreeOrderId, dbOrderId } = body;

      if (!cashfreeOrderId || !dbOrderId) {
        return jsonResponse({ error: "Missing order IDs" }, 400);
      }

      // ---- OWNERSHIP CHECK: prevent IDOR ----
      // Confirm the dbOrderId belongs to the authenticated user before any update.
      const { data: ownerRow, error: ownerErr } = await serviceSupabase
        .from("orders")
        .select("user_id, payment_intent_id")
        .eq("id", dbOrderId)
        .maybeSingle();

      if (ownerErr) {
        console.error("Ownership lookup error:", ownerErr);
        return jsonResponse({ error: "Unable to verify order" }, 500);
      }

      if (!ownerRow || ownerRow.user_id !== userId) {
        console.warn("verify_payment ownership mismatch", {
          userId,
          dbOrderId,
          actualOwner: ownerRow?.user_id,
        });
        return jsonResponse({ error: "Forbidden" }, 403);
      }

      // Also ensure the Cashfree order id matches the one stored on this DB order,
      // so a user cannot reuse an unrelated paid Cashfree order to confirm this one.
      if (ownerRow.payment_intent_id && ownerRow.payment_intent_id !== cashfreeOrderId) {
        console.warn("verify_payment cashfree id mismatch", {
          dbOrderId,
          stored: ownerRow.payment_intent_id,
          provided: cashfreeOrderId,
        });
        return jsonResponse({ error: "Forbidden" }, 403);
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
        return jsonResponse({ error: "Failed to verify payment" }, 400);
      }

      const paymentStatus = cfData.order_status;

      if (paymentStatus === "PAID") {
        await serviceSupabase
          .from("orders")
          .update({ payment_status: "paid", status: "confirmed" })
          .eq("id", dbOrderId);

        return jsonResponse({ status: "paid", order_id: dbOrderId });
      } else {
        await serviceSupabase
          .from("orders")
          .update({
            payment_status: String(paymentStatus).toLowerCase(),
            status: "payment_failed",
          })
          .eq("id", dbOrderId);

        return jsonResponse({
          status: String(paymentStatus).toLowerCase(),
          order_id: dbOrderId,
        });
      }
    }

    return jsonResponse({ error: "Invalid action" }, 400);
  } catch (err) {
    // Log full detail server-side; return only a generic message to the client
    console.error("Edge function error:", err);
    return jsonResponse({ error: "An internal error occurred" }, 500);
  }
});
