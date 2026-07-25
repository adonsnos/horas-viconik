import { getDatabase } from "@netlify/database";

export default async (req) => {
  const db = getDatabase();
  const url = new URL(req.url);
  const id = url.searchParams.get("id");

  if (req.method === "GET") {
    const rows = await db.sql`
      SELECT p.*, c.nombre AS cliente_nombre,
        COALESCE(SUM(e.duracion_segundos) FILTER (WHERE e.duracion_segundos IS NOT NULL), 0) AS segundos_totales
      FROM proyectos p
      LEFT JOIN clientes c ON c.id = p.cliente_id
      LEFT JOIN entradas_tiempo e ON e.proyecto_id = p.id
      GROUP BY p.id, c.nombre
      ORDER BY p.creado_en DESC
    `;
    return Response.json(rows);
  }

  if (req.method === "POST") {
    const b = await req.json();
    const [row] = await db.sql`
      INSERT INTO proyectos (cliente_id, nombre, tipo_servicio, estado, presupuesto_horas, ticket_eur, fecha_inicio, fecha_limite, notas)
      VALUES (${b.cliente_id || null}, ${b.nombre}, ${b.tipo_servicio || "auditoria"}, ${b.estado || "activo"},
              ${b.presupuesto_horas || null}, ${b.ticket_eur || null}, ${b.fecha_inicio || null}, ${b.fecha_limite || null}, ${b.notas || null})
      RETURNING *
    `;
    return Response.json(row);
  }

  if (req.method === "PATCH" && id) {
    const b = await req.json();
    const [row] = await db.sql`
      UPDATE proyectos SET
        nombre = COALESCE(${b.nombre}, nombre),
        cliente_id = COALESCE(${b.cliente_id}, cliente_id),
        tipo_servicio = COALESCE(${b.tipo_servicio}, tipo_servicio),
        estado = COALESCE(${b.estado}, estado),
        presupuesto_horas = COALESCE(${b.presupuesto_horas}, presupuesto_horas),
        ticket_eur = COALESCE(${b.ticket_eur}, ticket_eur),
        fecha_inicio = COALESCE(${b.fecha_inicio}, fecha_inicio),
        fecha_limite = COALESCE(${b.fecha_limite}, fecha_limite),
        notas = COALESCE(${b.notas}, notas)
      WHERE id = ${id}
      RETURNING *
    `;
    return Response.json(row);
  }

  if (req.method === "DELETE" && id) {
    await db.sql`DELETE FROM proyectos WHERE id = ${id}`;
    return Response.json({ ok: true });
  }

  return new Response("Método no permitido", { status: 405 });
};

export const config = { path: "/.netlify/functions/proyectos" };
