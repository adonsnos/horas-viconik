// Comprueba la contraseña contra la variable de entorno HORAS_PASSWORD.
// Si es correcta, deja una cookie de sesión (hash de la contraseña, nunca
// la contraseña en sí) y redirige a la app.

export default async (req) => {
  if (req.method !== "POST") return new Response("Método no permitido", { status: 405 });

  const contentType = req.headers.get("content-type") || "";
  let password = "";
  if (contentType.includes("application/x-www-form-urlencoded")) {
    password = new URLSearchParams(await req.text()).get("password") || "";
  } else {
    try { password = (await req.json()).password || ""; } catch (e) {}
  }

  const expected = process.env.HORAS_PASSWORD || "";

  if (!expected || password !== expected) {
    return new Response(null, { status: 302, headers: { Location: "/?error=1" } });
  }

  const token = await sha256(expected);
  const headers = new Headers();
  headers.set("Location", "/");
  headers.append(
    "Set-Cookie",
    `horas_session=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=15552000`
  );
  return new Response(null, { status: 302, headers });
};

async function sha256(text) {
  const data = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export const config = { path: "/.netlify/functions/login" };
