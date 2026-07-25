# HORAS · Viconik

App interna de control de horas por tarea/proyecto. Sitio Netlify ya creado:

- Nombre: `horas-viconik`
- Site ID: `bbbd27b8-20e1-4eae-acb9-507e2bf94aed`
- URL provisional: https://horas-viconik.netlify.app

## Por qué no está ya desplegada

Mi entorno de ejecución no tiene salida a internet (no puedo hacer `npm install` ni `netlify deploy`).
He creado el site en tu cuenta de Netlify y he dejado todo el código listo. Faltan dos pasos que solo se
pueden hacer con red: desplegar y añadir el subdominio.

## Paso 1 — Desplegar (2 minutos)

Desde tu ordenador, con Node instalado:

```bash
cd horas-viconik
npm install -g netlify-cli   # si no lo tienes ya
netlify link --id bbbd27b8-20e1-4eae-acb9-507e2bf94aed
netlify deploy --prod
```

Eso instala dependencias, aplica la migración de base de datos automáticamente (Netlify DB se
aprovisiona solo al desplegar, no hay que crear nada a mano) y sube la app.

Alternativa sin CLI: sube esta carpeta a un repo de GitHub y conecta ese repo al site
`horas-viconik` desde el panel de Netlify (Site settings → Build & deploy → Link repository).
Así cada cambio futuro se despliega solo, igual que haces con el site principal.

## Paso 2 — Subdominio horas.viconik.com

1. En Netlify: Site settings → Domain management → Add a domain → `horas.viconik.com`
2. En Zoho DNS (donde tienes viconik.com): añade un registro
   - Tipo: `CNAME`
   - Nombre: `horas`
   - Valor: `horas-viconik.netlify.app`
3. Netlify emite el certificado SSL solo, en unos minutos.

## Paso 3 — Muro de acceso

Intenté activar la protección por contraseña del site vía API y tu plan/configuración actual
la rechazó (error 422 — probablemente requiere confirmarlo desde el panel la primera vez).
Hazlo tú directamente, es un único clic:

Site settings → Visitor access → Password protection → actívala y pon tu contraseña.

Con eso el site entero (app + funciones + datos) queda detrás de contraseña, accesible solo por ti.
Si prefieres en su lugar usar Netlify Identity (como en `/interno/`) en vez de contraseña simple,
dímelo y lo monto así.

## Estructura

```
netlify/functions/       API (clientes, proyectos, tareas, tiempo, resumen)
netlify/database/migrations/  esquema de la base de datos (se aplica solo al desplegar)
public/index.html        la app (todo el frontend en un archivo)
```
