import { getDatabase } from "@netlify/database";

export default async (req) => {
  const db = getDatabase();
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  const activo = url.searchParams.get("activo");
  const proyectoId = url.searchParams.get("proyecto_id");
  const desde = url.searchParams.get("desde");
  const hasta = url.searchParams.get("hasta");

  // --- Cronómetro activo actual ---
  if (req.method === "GET" && activo) {
    const rows = await db.sql`
      SELECT e.*, t.nombre AS tarea_nombre, p.nombre AS proyecto_nombre
      FROM entradas_tiempo e
      JOIN tareas t ON t.id = e.tarea_id
      JOIN proyectos p ON p.id = e.proyecto_id
      WHERE e.fin IS NULL
      LIMIT 1
    `;
    return Response.json(rows[0] || null);
  }

  // --- Listado de entradas (con filtros opcionales) ---
  if (req.method === "GET") {
    let rows;
    if (proyectoId && desde && hasta) {
      rows = await db.sql`
        SELECT e.*, t.nombre AS tarea_nombre, p.nombre AS proyecto_nombre
        FROM entradas_tiempo e
        JOIN tareas t ON t.id = e.tarea_id
        JOIN proyectos p ON p.id = e.proyecto_id
        WHERE e.proyecto_id = ${proyectoId} AND e.inicio >= ${desde} AND e.inicio <= ${hasta}
        ORDER BY e.inicio DESC
      `;
    } else if (proyectoId) {
      rows = await db.sql`
        SELECT e.*, t.nombre AS tarea_nombre, p.nombre AS proyecto_nombre
        FROM entradas_tiempo e
        JOIN tareas t ON t.id = e.tarea_id
        JOIN proyectos p ON p.id = e.proyecto_id
        WHERE e.proyecto_id = ${proyectoId}
        ORDER BY e.inicio DESC
      `;
    } else if (desde && hasta) {
      rows = await db.sql`
        SELECT e.*, t.nombre AS tarea_nombre, p.nombre AS proyecto_nombre
        FROM entradas_tiempo e
        JOIN tareas t ON t.id = e.tarea_id
        JOIN proyectos p ON p.id = e.proyecto_id
        WHERE e.inicio >= ${desde} AND e.inicio <= ${hasta}
        ORDER BY e.inicio DESC
      `;
    } else {
      rows = await db.sql`
        SELECT e.*, t.nombre AS tarea_nombre, p.nombre AS proyecto_nombre
        FROM entradas_tiempo e
        JOIN tareas t ON t.id = e.tarea_id
        JOIN proyectos p ON p.id = e.proyecto_id
        ORDER BY e.inicio DESC
        LIMIT 300
      `;
    }
    return Response.json(rows);
  }

  // --- Iniciar cronómetro / crear entrada manual ---
  if (req.method === "POST") {
    const b = await req.json();

    const [tarea] = await db.sql`SELECT proyecto_id, categoria FROM tareas WHERE id = ${b.tarea_id}`;
    if (!tarea) return new Response("Tarea no encontrada", { status: 404 });

    if (b.manual) {
      const inicio = new Date(b.inicio);
      const fin = new Date(b.fin);
      const duracion = Math.max(0, Math.round((fin - inicio) / 1000));
      const [row] = await db.sql`
        INSERT INTO entradas_tiempo (tarea_id, proyecto_id, categoria, inicio, fin, duracion_segundos, nota, manual)
        VALUES (${b.tarea_id}, ${tarea.proyecto_id}, ${b.categoria || tarea.categoria}, ${inicio.toISOString()}, ${fin.toISOString()}, ${duracion}, ${b.nota || null}, true)
        RETURNING *
      `;
      return Response.json(row);
    }

    // Iniciar cronómetro: si hay uno activo, se para automáticamente antes
    const [activaAntes] = await db.sql`SELECT id, inicio FROM entradas_tiempo WHERE fin IS NULL LIMIT 1`;
    if (activaAntes) {
      const duracionPrevia = Math.max(0, Math.round((Date.now() - new Date(activaAntes.inicio)) / 1000));
      await db.sql`UPDATE entradas_tiempo SET fin = NOW(), duracion_segundos = ${duracionPrevia} WHERE id = ${activaAntes.id}`;
    }

    const [row] = await db.sql`
      INSERT INTO entradas_tiempo (tarea_id, proyecto_id, categoria, inicio, nota, manual)
      VALUES (${b.tarea_id}, ${tarea.proyecto_id}, ${b.categoria || tarea.categoria}, NOW(), ${b.nota || null}, false)
      RETURNING *
    `;
    return Response.json(row);
  }

  // --- Parar cronómetro / editar entrada ---
  if (req.method === "PATCH" && id) {
    const b = await req.json();

    if (b.accion === "parar") {
      const [entrada] = await db.sql`SELECT inicio FROM entradas_tiempo WHERE id = ${id}`;
      if (!entrada) return new Response("Entrada no encontrada", { status: 404 });
      const duracion = Math.max(0, Math.round((Date.now() - new Date(entrada.inicio)) / 1000));
      const [row] = await db.sql`
        UPDATE entradas_tiempo SET fin = NOW(), duracion_segundos = ${duracion}, nota = COALESCE(${b.nota}, nota)
        WHERE id = ${id}
        RETURNING *
      `;
      return Response.json(row);
    }

    // Edición manual de una entrada existente
    let duracion = null;
    if (b.inicio && b.fin) {
      duracion = Math.max(0, Math.round((new Date(b.fin) - new Date(b.inicio)) / 1000));
    }
    const [row] = await db.sql`
      UPDATE entradas_tiempo SET
        inicio = COALESCE(${b.inicio ? new Date(b.inicio).toISOString() : null}, inicio),
        fin = COALESCE(${b.fin ? new Date(b.fin).toISOString() : null}, fin),
        duracion_segundos = COALESCE(${duracion}, duracion_segundos),
        categoria = COALESCE(${b.categoria}, categoria),
        nota = COALESCE(${b.nota}, nota)
      WHERE id = ${id}
      RETURNING *
    `;
    return Response.json(row);
  }

  if (req.method === "DELETE" && id) {
    await db.sql`DELETE FROM entradas_tiempo WHERE id = ${id}`;
    return Response.json({ ok: true });
  }

  return new Response("Método no permitido", { status: 405 });
};

export const config = { path: "/.netlify/functions/tiempo" };
