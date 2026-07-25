import { getDatabase } from "@netlify/database";

export default async (req) => {
  const db = getDatabase();
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  const proyectoId = url.searchParams.get("proyecto_id");

  if (req.method === "GET") {
    const rows = proyectoId
      ? await db.sql`
          SELECT t.*,
            COALESCE(SUM(e.duracion_segundos) FILTER (WHERE e.duracion_segundos IS NOT NULL), 0) AS segundos_totales
          FROM tareas t
          LEFT JOIN entradas_tiempo e ON e.tarea_id = t.id
          WHERE t.proyecto_id = ${proyectoId}
          GROUP BY t.id
          ORDER BY t.orden ASC, t.creado_en ASC
        `
      : await db.sql`
          SELECT t.*, p.nombre AS proyecto_nombre,
            COALESCE(SUM(e.duracion_segundos) FILTER (WHERE e.duracion_segundos IS NOT NULL), 0) AS segundos_totales
          FROM tareas t
          JOIN proyectos p ON p.id = t.proyecto_id
          LEFT JOIN entradas_tiempo e ON e.tarea_id = t.id
          GROUP BY t.id, p.nombre
          ORDER BY t.creado_en DESC
        `;
    return Response.json(rows);
  }

  if (req.method === "POST") {
    const b = await req.json();
    const [row] = await db.sql`
      INSERT INTO tareas (proyecto_id, nombre, categoria, estado, prioridad, horas_estimadas, orden)
      VALUES (${b.proyecto_id}, ${b.nombre}, ${b.categoria || "otro"}, ${b.estado || "pendiente"},
              ${b.prioridad || "media"}, ${b.horas_estimadas || null}, ${b.orden || 0})
      RETURNING *
    `;
    return Response.json(row);
  }

  if (req.method === "PATCH" && id) {
    const b = await req.json();
    const [row] = await db.sql`
      UPDATE tareas SET
        nombre = COALESCE(${b.nombre}, nombre),
        categoria = COALESCE(${b.categoria}, categoria),
        estado = COALESCE(${b.estado}, estado),
        prioridad = COALESCE(${b.prioridad}, prioridad),
        horas_estimadas = COALESCE(${b.horas_estimadas}, horas_estimadas),
        orden = COALESCE(${b.orden}, orden)
      WHERE id = ${id}
      RETURNING *
    `;
    return Response.json(row);
  }

  if (req.method === "DELETE" && id) {
    await db.sql`DELETE FROM tareas WHERE id = ${id}`;
    return Response.json({ ok: true });
  }

  return new Response("Método no permitido", { status: 405 });
};

export const config = { path: "/.netlify/functions/tareas" };
