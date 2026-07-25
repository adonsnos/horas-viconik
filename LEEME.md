# Horas

Primera versión que construí: Cronómetro en vivo (start/stop), Proyectos con
presupuesto de horas vs. reales, categorías de tarea, Semana e Informes
(horas por categoría + rentabilidad €/hora por proyecto). Estilo propio
(Bebas Neue / DM Sans / DM Mono), optimizada para móvil, sin referencias a Viconik.

Backend real: Netlify Functions + Netlify DB (Postgres). Site ya creado en tu
cuenta de Netlify: `horas-viconik` (ID `bbbd27b8-20e1-4eae-acb9-507e2bf94aed`).

## Desplegar (sin comandos)

1. Sube el contenido de esta carpeta a tu repo de GitHub (sustituyendo lo que hubiera)
2. En Netlify → site `horas-viconik` → Site configuration → Build & deploy →
   Continuous deployment → Link repository → elige el repo
3. Netlify hace `npm install`, aplica la migración de base de datos y despliega, todo solo

Después: dominio (`horas.viconik.com` o el que prefieras) y contraseña de acceso
desde Site configuration → Domain management / Visitor access — mismos pasos de siempre.
