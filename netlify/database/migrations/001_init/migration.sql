-- HORAS · Viconik — esquema inicial

CREATE TABLE clientes (
  id SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  activo BOOLEAN NOT NULL DEFAULT true,
  creado_en TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE proyectos (
  id SERIAL PRIMARY KEY,
  cliente_id INTEGER REFERENCES clientes(id) ON DELETE SET NULL,
  nombre TEXT NOT NULL,
  tipo_servicio TEXT NOT NULL DEFAULT 'auditoria', -- diagnostico | auditoria | seguimiento | curso | otro
  estado TEXT NOT NULL DEFAULT 'activo', -- activo | pausado | cerrado
  presupuesto_horas NUMERIC(8,2),
  ticket_eur NUMERIC(10,2),
  fecha_inicio DATE,
  fecha_limite DATE,
  notas TEXT,
  creado_en TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE tareas (
  id SERIAL PRIMARY KEY,
  proyecto_id INTEGER NOT NULL REFERENCES proyectos(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  categoria TEXT NOT NULL DEFAULT 'otro', -- auditoria | prospeccion | produccion_contenido | administracion | formacion | otro
  estado TEXT NOT NULL DEFAULT 'pendiente', -- pendiente | en_curso | completada
  prioridad TEXT NOT NULL DEFAULT 'media', -- alta | media | baja
  horas_estimadas NUMERIC(6,2),
  orden INTEGER NOT NULL DEFAULT 0,
  creado_en TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE entradas_tiempo (
  id SERIAL PRIMARY KEY,
  tarea_id INTEGER NOT NULL REFERENCES tareas(id) ON DELETE CASCADE,
  proyecto_id INTEGER NOT NULL REFERENCES proyectos(id) ON DELETE CASCADE,
  categoria TEXT NOT NULL DEFAULT 'otro',
  inicio TIMESTAMP NOT NULL,
  fin TIMESTAMP, -- NULL mientras el cronómetro está en marcha
  duracion_segundos INTEGER, -- se rellena al parar; permite entradas manuales sin cronómetro
  nota TEXT,
  manual BOOLEAN NOT NULL DEFAULT false,
  creado_en TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tareas_proyecto ON tareas(proyecto_id);
CREATE INDEX idx_entradas_tarea ON entradas_tiempo(tarea_id);
CREATE INDEX idx_entradas_proyecto ON entradas_tiempo(proyecto_id);
CREATE INDEX idx_entradas_inicio ON entradas_tiempo(inicio);
-- Garantiza que solo puede haber un cronómetro en marcha a la vez
CREATE UNIQUE INDEX idx_entrada_activa_unica ON entradas_tiempo((1)) WHERE fin IS NULL;
