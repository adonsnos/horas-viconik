import { getDatabase } from "@netlify/database";

export default async (req) => {
  const db = getDatabase();
  const url = new URL(req.url);
  const tipo = url.searchParams.get("tipo") || "proyectos";

  if (tipo === "proyectos") {
    const rows = await db.sql`
      SELECT p.id, p.nombre, p.presupuesto_horas, p.ticket_eur, p.estado, c.nombre AS cliente_nombre,
        COALESCE(SUM(e.duracion_segundos) FILTER (WHERE e.duracion_segundos IS NOT NULL), 0) / 3600.0 AS horas_reales
      FROM proyectos p
      LEFT JOIN clientes c ON c.id = p.cliente_id
      LEFT JOIN entradas_tiempo e ON e.proyecto_id = p.id
      GROUP BY p.id, c.nombre
      ORDER BY horas_reales DESC
    `;
    return Response.json(rows);
  }

  if (tipo === "categorias") {
    const desde = url.searchParams.get("desde");
    const hasta = url.searchParams.get("hasta");
    const rows = desde && hasta
      ? await db.sql`
          SELECT categoria, SUM(duracion_segundos) / 3600.0 AS horas
          FROM entradas_tiempo
          WHERE duracion_segundos IS NOT NULL AND inicio >= ${desde} AND inicio <= ${hasta}
          GROUP BY categoria
          ORDER BY horas DESC
        `
      : await db.sql`
          SELECT categoria, SUM(duracion_segundos) / 3600.0 AS horas
          FROM entradas_tiempo
          WHERE duracion_segundos IS NOT NULL
          GROUP BY categoria
          ORDER BY horas DESC
        `;
    return Response.json(rows);
  }

  if (tipo === "semana") {
    const fecha = url.searchParams.get("fecha") || new Date().toISOString().slice(0, 10);
    const rows = await db.sql`
      SELECT e.*, t.nombre AS tarea_nombre, p.nombre AS proyecto_nombre
      FROM entradas_tiempo e
      JOIN tareas t ON t.id = e.tarea_id
      JOIN proyectos p ON p.id = e.proyecto_id
      WHERE date_trunc('week', e.inicio) = date_trunc('week', ${fecha}::date)
      ORDER BY e.inicio ASC
    `;
    return Response.json(rows);
  }

  if (tipo === "rentabilidad") {
    const rows = await db.sql`
      SELECT p.id, p.nombre, p.ticket_eur, c.nombre AS cliente_nombre,
        COALESCE(SUM(e.duracion_segundos) FILTER (WHERE e.duracion_segundos IS NOT NULL), 0) / 3600.0 AS horas_reales,
        CASE WHEN COALESCE(SUM(e.duracion_segundos), 0) > 0
          THEN p.ticket_eur / (SUM(e.duracion_segundos) / 3600.0)
          ELSE NULL END AS eur_por_hora
      FROM proyectos p
      LEFT JOIN clientes c ON c.id = p.cliente_id
      LEFT JOIN entradas_tiempo e ON e.proyecto_id = p.id
      WHERE p.ticket_eur IS NOT NULL
      GROUP BY p.id, c.nombre
      ORDER BY eur_por_hora ASC NULLS LAST
    `;
    return Response.json(rows);
  }

  return new Response("Tipo de resumen no reconocido", { status: 400 });
};

export const config = { path: "/.netlify/functions/resumen" };
