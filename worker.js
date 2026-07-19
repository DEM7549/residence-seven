// Résidence Seven — Worker Cloudflare
// Sert les fichiers du dossier /public (index.html, admin.html, ...)
// et gère l'API /api/content (lecture publique, écriture protégée par mot de passe)

const KV_KEY = "content";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

async function handleGet(env) {
  try {
    const stored = await env.CONTENT_KV.get(KV_KEY);
    if (stored) {
      return new Response(stored, {
        headers: { "content-type": "application/json; charset=utf-8", ...CORS_HEADERS },
      });
    }
  } catch (e) {
    // KV pas encore configuré : on tombe sur la réponse 404 ci-dessous
  }
  return new Response(
    JSON.stringify({ error: "no_content_yet" }),
    { status: 404, headers: { "content-type": "application/json; charset=utf-8", ...CORS_HEADERS } }
  );
}

async function handlePost(request, env) {
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

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/content") {
      if (request.method === "OPTIONS") {
        return new Response(null, { headers: CORS_HEADERS });
      }
      if (request.method === "GET") {
        return handleGet(env);
      }
      if (request.method === "POST") {
        return handlePost(request, env);
      }
      return new Response(
        JSON.stringify({ error: "method_not_allowed" }),
        { status: 405, headers: { "content-type": "application/json; charset=utf-8", ...CORS_HEADERS } }
      );
    }

    // Tout le reste (index.html, admin.html, etc.) est servi comme fichier statique
    return env.ASSETS.fetch(request);
  },
};
