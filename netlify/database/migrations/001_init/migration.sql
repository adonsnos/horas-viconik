-- Horas — almacenamiento como documento único (JSON), sencillo y suficiente
-- para una app de un solo usuario. Un único registro guarda todo el estado.

CREATE TABLE app_data (
  id INTEGER PRIMARY KEY DEFAULT 1,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  actualizado_en TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT single_row CHECK (id = 1)
);

INSERT INTO app_data (id, data) VALUES (1, '{}'::jsonb);
