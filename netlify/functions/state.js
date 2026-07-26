import { getDatabase } from "@netlify/database";

// Guarda y devuelve todo el estado de la app como un único documento JSON.
// Es una app de un solo usuario: no hace falta un esquema relacional para esto,
// y así el backend puede ser un espejo casi directo de lo que ya había en
// localStorage, sin reescribir toda la lógica del frontend.

export default async (req) => {
  const db = getDatabase();

  if (req.method === "GET") {
    const [row] = await db.sql`SELECT data FROM app_data WHERE id = 1`;
    return Response.json(row ? row.data : {});
  }

  if (req.method === "PUT") {
    const body = await req.json();
    await db.sql`
      UPDATE app_data SET data = ${JSON.stringify(body)}::jsonb, actualizado_en = NOW()
      WHERE id = 1
    `;
    return Response.json({ ok: true });
  }

  return new Response("Método no permitido", { status: 405 });
};

export const config = { path: "/.netlify/functions/state" };
