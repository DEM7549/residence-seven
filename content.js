// API du contenu de Résidence Seven
// GET  /api/content  -> renvoie le contenu actuel (public, pas d'auth nécessaire)
// POST /api/content  -> écrit le nouveau contenu (protégé par mot de passe, header Authorization: Bearer <ADMIN_PASSWORD>)
//
// Nécessite dans Cloudflare Pages > Settings > Functions:
//   - une KV Namespace bindée sous le nom  CONTENT_KV
//   - une variable d'environnement (secret)  ADMIN_PASSWORD

const KV_KEY = "content";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function onRequestOptions() {
  return new Response(null, { headers: CORS_HEADERS });
}

export async function onRequestGet({ env }) {
  try {
    const stored = await env.CONTENT_KV.get(KV_KEY);
    if (stored) {
      return new Response(stored, {
        headers: { "content-type": "application/json; charset=utf-8", ...CORS_HEADERS },
      });
    }
  } catch (e) {
    // Si le KV n'est pas encore configuré, on tombe sur l'erreur ci-dessous.
  }
  return new Response(
    JSON.stringify({ error: "no_content_yet" }),
    { status: 404, headers: { "content-type": "application/json; charset=utf-8", ...CORS_HEADERS } }
  );
}

export async function onRequestPost({ request, env }) {
  const auth = request.headers.get("authorization") || "";
  const expected = `Bearer ${env.ADMIN_PASSWORD || ""}`;

  if (!env.ADMIN_PASSWORD || auth !== expected) {
    return new Response(
      JSON.stringify({ error: "unauthorized" }),
      { status: 401, headers: { "content-type": "application/json; charset=utf-8", ...CORS_HEADERS } }
    );
  }

  let body;
  try {
    body = await request.text();
    JSON.parse(body); // valide que c'est bien du JSON
  } catch (e) {
    return new Response(
      JSON.stringify({ error: "invalid_json" }),
      { status: 400, headers: { "content-type": "application/json; charset=utf-8", ...CORS_HEADERS } }
    );
  }

  try {
    await env.CONTENT_KV.put(KV_KEY, body);
  } catch (e) {
    return new Response(
      JSON.stringify({ error: "kv_not_configured", detail: String(e) }),
      { status: 500, headers: { "content-type": "application/json; charset=utf-8", ...CORS_HEADERS } }
    );
  }

  return new Response(
    JSON.stringify({ ok: true }),
    { headers: { "content-type": "application/json; charset=utf-8", ...CORS_HEADERS } }
  );
}
