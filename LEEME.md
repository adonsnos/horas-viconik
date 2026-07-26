# Horas — con backend y muro de acceso

## El muro de acceso

Contraseña: **CIbhMKCMVzmfhXBA**

(Ya está guardada como variable de entorno `HORAS_PASSWORD` en tu site de Netlify
`horas-viconik` — no hace falta que la configures tú. Puedes cambiarla cuando
quieras desde Site configuration → Environment variables.)

Cómo funciona: una Edge Function (`netlify/edge-functions/gate.js`) intercepta
**todas** las peticiones — tanto la página como cada llamada a la API — antes de
que lleguen a ningún sitio. Sin la cookie de sesión correcta, solo se sirve una
pantalla de acceso con contraseña; ni la app ni los datos son visibles. Es más
fuerte que la protección por contraseña del propio Netlify que probamos antes
(esa fallaba al activarla por API) porque vive en tu propio código y protege
también la API, no solo la página.

Al meter la contraseña correcta se guarda una cookie de sesión (180 días). Hay
también un `/logout` por si alguna vez quieres cerrar sesión desde un dispositivo.

## El backend

- Los datos ya no viven en el navegador (localStorage) — viven en Netlify DB
  (Postgres), online y compartidos entre dispositivos.
- Es una única función (`state.js`) que lee/escribe todo el estado como un
  documento JSON, en vez de una tabla por cada tipo de dato. Para una app de un
  solo usuario esto es más simple y igual de fiable que un esquema relacional
  completo, y ha permitido reutilizar casi toda la lógica del frontend tal cual.
- Si alguna vez quieres pasar a tablas relacionales de verdad (por ejemplo, para
  consultas más finas o si esto creciera a varios usuarios), es un cambio de
  backend aislado — la interfaz no tendría que tocarse.

## Desplegar (sin comandos, como siempre)

1. Sube el contenido de esta carpeta a tu repo de GitHub, sustituyendo lo que hubiera
2. Netlify ya tiene el site conectado — al hacer push, construye solo:
   instala dependencias, aplica la migración de base de datos, despliega la
   función y la Edge Function
3. Entra en tu URL de Netlify (o en `horas.viconik.com` si ya lo configuraste) y
   te pedirá la contraseña de arriba

No hace falta tocar nada de Domain management ni Visitor access esta vez — el
muro ya está en el propio código.
