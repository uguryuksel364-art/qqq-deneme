import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Client-Info, Apikey",
};

const ADMIN_PASSWORD = Deno.env.get("ADMIN_PASSWORD") ?? "bodrum-admin-2024";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const path = url.pathname.replace("/functions/v1/admin", "");

    // Auth: validate admin password from header
    const authHeader = req.headers.get("x-admin-password");
    if (!authHeader || authHeader !== ADMIN_PASSWORD) {
      return new Response(
        JSON.stringify({ error: "Yetkisiz erişim" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = `${SUPABASE_URL}/rest/v1`;
    const headers = {
      apikey: SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    };

    // GET /reservations — list all reservations
    if (path === "/reservations" && req.method === "GET") {
      const resp = await fetch(
        `${supabaseUrl}/reservations?order=created_at.desc`,
        { headers }
      );
      if (!resp.ok) {
        return new Response(
          JSON.stringify({ error: "Rezervasyonlar alınamadı" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const data = await resp.json();
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // PATCH /reservations/:id — update status
    const match = path.match(/^\/reservations\/([a-f0-9-]+)$/);
    if (match && req.method === "PATCH") {
      const id = match[1];
      const body = await req.json();
      const { status } = body as { status: string };

      if (!["pending", "confirmed", "cancelled"].includes(status)) {
        return new Response(
          JSON.stringify({ error: "Geçersiz durum" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const resp = await fetch(
        `${supabaseUrl}/reservations?id=eq.${id}`,
        {
          method: "PATCH",
          headers,
          body: JSON.stringify({ status }),
        }
      );
      if (!resp.ok) {
        return new Response(
          JSON.stringify({ error: "Güncelleme başarısız" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const data = await resp.json();
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // DELETE /reservations/:id
    const delMatch = path.match(/^\/reservations\/([a-f0-9-]+)$/);
    if (delMatch && req.method === "DELETE") {
      const id = delMatch[1];
      const resp = await fetch(`${supabaseUrl}/reservations?id=eq.${id}`, {
        method: "DELETE",
        headers,
      });
      if (!resp.ok) {
        return new Response(
          JSON.stringify({ error: "Silme başarısız" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({ error: "Bilinmeyen endpoint" }),
      { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
