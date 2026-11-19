import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const maxBodyLength = 16_384;

Deno.serve(async (request: Request) => {
  if (request.method === "OPTIONS")
    return new Response("ok", { headers: cors });
  if (request.method !== "POST")
    return Response.json(
      { error: "Method not allowed" },
      { status: 405, headers: cors },
    );
  const authorization = request.headers.get("Authorization");
  if (!authorization)
    return Response.json(
      { error: "Sign in required" },
      { status: 401, headers: cors },
    );

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const aiKey = Deno.env.get("OPENAI_API_KEY");
  if (!supabaseUrl || !anonKey || !aiKey)
    return Response.json(
      { error: "AI service is not configured" },
      { status: 503, headers: cors },
    );

  const supabase = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authorization } },
  });
  const { data: userData, error: authError } = await supabase.auth.getUser();
  if (authError || !userData.user)
    return Response.json(
      { error: "Invalid session" },
      { status: 401, headers: cors },
    );

  const declaredLength = Number(request.headers.get("content-length"));
  if (declaredLength > maxBodyLength) {
    return Response.json(
      { error: "Request body is too large" },
      { status: 413, headers: cors },
    );
  }

  let rawBody: string;
  try {
    rawBody = await request.text();
  } catch {
    return Response.json(
      { error: "Invalid request body" },
      { status: 400, headers: cors },
    );
  }
  if (rawBody.length > maxBodyLength) {
    return Response.json(
      { error: "Request body is too large" },
      { status: 413, headers: cors },
    );
  }

  let input: unknown;
  try {
    input = JSON.parse(rawBody);
  } catch {
    return Response.json(
      { error: "Invalid JSON" },
      { status: 400, headers: cors },
    );
  }
  const text =
    typeof input === "object" &&
    input !== null &&
    !Array.isArray(input) &&
    "text" in input &&
    typeof input.text === "string"
      ? input.text.trim()
      : "";
  if (!text || text.length > 4000) {
    return Response.json(
      { error: "Enter a list of up to 4,000 characters" },
      { status: 400, headers: cors },
    );
  }

  const { data: allowed, error: quotaError } =
    await supabase.rpc("consume_ai_request");
  if (quotaError)
    return Response.json(
      { error: "AI request could not be authorized" },
      { status: 500, headers: cors },
    );
  if (!allowed)
    return Response.json(
      {
        error:
          "Daily AI list limit reached. You can still edit and submit your list manually.",
      },
      { status: 429, headers: cors },
    );

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${aiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: Deno.env.get("OPENAI_MODEL") ?? "gpt-4o-mini",
      temperature: 0.1,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            'You help Nigerian households organize grocery requests. Extract only items explicitly requested. Never invent a price, brand, quantity, or unit. Normalize common metric units when clear. Preserve uncertain wording and add a note asking for clarification. Output JSON only: {"items":[{"item_name":string,"quantity":number,"unit":string,"preferred_brand":string|null,"substitution_allowed":boolean}],"note":string}. Use quantity 1 and unit \'item\' only when the user gave no quantity. Do not infer that a substitution is allowed.',
        },
        { role: "user", content: text },
      ],
    }),
  });
  if (!response.ok)
    return Response.json(
      { error: "The AI service could not interpret this list" },
      { status: 502, headers: cors },
    );
  const payload = await response.json();
  let parsed: { items?: unknown; note?: unknown };
  try {
    parsed = JSON.parse(payload.choices?.[0]?.message?.content ?? "{}");
  } catch {
    return Response.json(
      { error: "The AI returned an unreadable result" },
      { status: 502, headers: cors },
    );
  }
  if (!Array.isArray(parsed.items) || parsed.items.length > 100)
    return Response.json(
      { error: "No valid shopping items were found" },
      { status: 422, headers: cors },
    );

  const items = parsed.items
    .map((row: Record<string, unknown>) => ({
      item_name: String(row.item_name ?? "")
        .trim()
        .slice(0, 160),
      quantity: Number(row.quantity),
      unit: String(row.unit ?? "item")
        .trim()
        .slice(0, 32),
      preferred_brand: row.preferred_brand
        ? String(row.preferred_brand).trim().slice(0, 100)
        : null,
      substitution_allowed: row.substitution_allowed === true,
    }))
    .filter(
      (row: { item_name: string; quantity: number; unit: string }) =>
        row.item_name &&
        Number.isFinite(row.quantity) &&
        row.quantity > 0 &&
        row.quantity <= 100000 &&
        row.unit,
    );
  return Response.json(
    {
      items,
      note: String(
        parsed.note ??
          "Review the list and correct anything that does not look right.",
      ),
    },
    { headers: { ...cors, "Cache-Control": "no-store" } },
  );
});
