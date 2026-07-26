// Muro de seguridad: se ejecuta en TODAS las rutas (páginas y API) antes que
// nada. Sin cookie de sesión válida, no se sirve ni la app ni los datos —
// solo una pantalla de acceso con contraseña.

export default async (request, context) => {
  const url = new URL(request.url);

  // El login y el logout deben ser accesibles siempre, sin sesión previa
  if (url.pathname === "/api/login" || url.pathname === "/api/logout") {
    return context.next();
  }

  const password = Netlify.env.get("HORAS_PASSWORD") || "";
  const expected = password ? await sha256(password) : null;
  const cookieHeader = request.headers.get("cookie") || "";
  const match = cookieHeader.match(/(?:^|;\s*)horas_session=([^;]+)/);
  const token = match ? match[1] : null;

  if (expected && token === expected) {
    return context.next();
  }

  if (url.pathname.startsWith("/api/")) {
    return new Response(JSON.stringify({ error: "No autorizado" }), {
      status: 401,
      headers: { "content-type": "application/json" },
    });
  }

  return new Response(loginPage(url.searchParams.get("error")), {
    status: 401,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
};

async function sha256(text) {
  const data = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function loginPage(error) {
  return `<!DOCTYPE html>
<html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Horas — Acceso</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{min-height:100vh;display:flex;align-items:center;justify-content:center;background:#F3EFE8;font-family:-apple-system,'Segoe UI',sans-serif}
  form{background:#fff;padding:36px 32px;border-radius:22px;box-shadow:0 10px 40px rgba(38,33,29,.14);width:320px;max-width:90vw}
  h1{font-size:21px;margin-bottom:4px;font-weight:800;color:#26211D}
  p{font-size:13px;color:#8f887e;margin-bottom:20px}
  input{width:100%;padding:13px 14px;border:1.5px solid #E9E1D3;border-radius:12px;font-size:15px;margin-bottom:12px;background:#FAF7F1}
  input:focus{outline:none;border-color:#26211D}
  button{width:100%;padding:13px;border:none;border-radius:999px;background:#26211D;color:#fff;font-weight:700;font-size:14px;cursor:pointer}
  .err{color:#D14F4F;font-size:12.5px;margin-bottom:12px;font-weight:600}
</style></head>
<body>
  <form method="POST" action="/api/login">
    <h1>Horas</h1>
    <p>Acceso privado</p>
    ${error ? '<div class="err">Contraseña incorrecta</div>' : ""}
    <input type="password" name="password" placeholder="Contraseña" autofocus required>
    <button type="submit">Entrar</button>
  </form>
</body></html>`;
}

export const config = { path: "/*" };
