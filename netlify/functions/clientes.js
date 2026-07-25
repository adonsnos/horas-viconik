import { getDatabase } from "@netlify/database";

export default async (req) => {
  const db = getDatabase();

  if (req.method === "GET") {
    const rows = await db.sql`SELECT * FROM clientes ORDER BY nombre ASC`;
    return Response.json(rows);
  }

  if (req.method === "POST") {
    const body = await req.json();
    const [row] = await db.sql`
      INSERT INTO clientes (nombre)
      VALUES (${body.nombre})
      RETURNING *
    `;
    return Response.json(row);
  }

  return new Response("Método no permitido", { status: 405 });
};

export const config = { path: "/.netlify/functions/clientes" };
