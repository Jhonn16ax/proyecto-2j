# Speed Rivals — Laboratorio 4 CMP1001

Juego arcade de carreras 2D para navegador. Incluye controles de teclado/táctiles, obstáculos, puntaje, tiempo de carrera y tabla de récords compartida usando Supabase.

## Archivos
- `index.html`: página del juego.
- `styles.css`: diseño adaptable a computadora y móvil.
- `game.js`: lógica de la carrera y conexión con Supabase.
- `config.js`: URL y clave publicable de Supabase.
- `supabase.sql`: tabla y políticas de acceso.

## 1. Crear la base de datos
1. Entra a https://supabase.com y crea un proyecto.
2. Abre **SQL Editor** > **New query**.
3. Copia todo el contenido de `supabase.sql` y pulsa **Run**.
4. En Project Settings / Data API (o botón Connect), copia **Project URL** y **publishable key** (`sb_publishable_...`).

## 2. Conectar el juego
Abre `config.js` y reemplaza:
- `PEGA_AQUI_TU_PROJECT_URL` por la Project URL.
- `PEGA_AQUI_TU_PUBLISHABLE_KEY` por la clave publicable.

No uses una clave `sb_secret_...` en el navegador ni la subas a GitHub.

## 3. Probar en tu computadora
Abre `index.html` en el navegador. Si la conexión está bien, arriba dirá “Supabase conectado”. Para evitar problemas con el navegador, también puedes usar la extensión Live Server de VS Code.

## 4. Publicar en GitHub y Vercel
Este proyecto es HTML/CSS/JavaScript estático: no necesita build command ni framework. En Vercel, importa este repositorio desde GitHub y pulsa **Deploy**.

## 5. Pruebas para las cuatro capturas del laboratorio
1. **Antes de recargar:** termina una carrera, escribe un nombre y guarda el récord. Captura la tabla con el nuevo resultado.
2. **Otro navegador:** abre el dominio de Vercel en ventana privada u otro navegador y muestra que el mismo récord sigue ahí.
3. **Usuario A hace algo:** en un navegador, termina una carrera y guarda el récord con un nombre como `PILOTO_A`.
4. **Usuario B lo ve:** en otro navegador, pulsa “Actualizar tabla” y captura el récord de `PILOTO_A`.

El PDF pide cuatro capturas: las dos primeras demuestran persistencia y las dos últimas que la acción de A aparece para B. La actualización puede ser manual; no se necesita tiempo real.

## Notas
- Esta versión guarda los resultados de forma compartida en Supabase una vez que configures las credenciales y ejecutes el SQL.
- El juego no implementa cuentas individuales ni multijugador en tiempo real, porque el Laboratorio 4 no los exige.
- La tabla pública usa nombres de piloto y puntajes inventados. No introduzcas datos personales.
