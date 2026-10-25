# Speed Rivals — Laboratorio 4

Aplicación web arcade de carreras. Cada jugador termina una carrera, guarda un nombre y una puntuación en Supabase, y cualquier otro navegador puede ver ese resultado en la tabla compartida. No requiere cuentas de usuario ni multijugador en tiempo real.

## Estado actual
- Código guardado en este repositorio público de GitHub.
- La tabla compartida está preparada en `game.js` y el SQL está en `supabase.sql`.
- **Antes de que funcione la persistencia real**, hay que crear un proyecto Supabase, ejecutar el SQL y completar `config.js` con los valores del propio proyecto.
- **Antes de entregar**, también hay que publicar el repositorio en Vercel y tomar las cuatro capturas reales. No inventes capturas ni afirmes que está conectado hasta comprobarlo.

## Paso 1 — Crear la tabla de Supabase
1. Entra a https://supabase.com/dashboard y crea un proyecto.
2. En el proyecto, abre **SQL Editor** → **New query**.
3. Abre el archivo `supabase.sql` de este repositorio, copia todo su contenido, pégalo en SQL Editor y pulsa **Run**.
4. Confirma que la consulta termina sin error.

## Paso 2 — Conectar el juego
1. En Supabase, abre **Project Settings** → **API** (o **Connect**, según la interfaz).
2. Copia la **Project URL** y la **publishable key** (normalmente comienza con `sb_publishable_`; en proyectos antiguos puede aparecer una clave `anon`).
3. En GitHub, abre `config.js` → el lápiz **Edit**.
4. Reemplaza los dos textos `PEGA_AQUI...` por tus valores reales:
   - `window.SUPABASE_URL`: Project URL.
   - `window.SUPABASE_PUBLISHABLE_KEY`: publishable/anon key.
5. Pulsa **Commit changes**.

**Seguridad:** el navegador solo debe usar la clave publishable/anon y políticas RLS. Nunca pegues una clave `sb_secret_` ni una `service_role` en el código, en el chat o en GitHub.

## Paso 3 — Publicar en Vercel
1. Entra a https://vercel.com y elige **Continue with GitHub**.
2. Pulsa **Add New…** → **Project**.
3. Importa el repositorio `Jhonn16ax/proyecto-2j`.
4. Deja la configuración por defecto para una página estática (sin framework ni comando de build) y pulsa **Deploy**.
5. Cuando termine, abre la dirección `*.vercel.app` que Vercel muestre. Comprueba que el juego carga y que el estado superior indica **Supabase conectado**.

## Paso 4 — Probar persistencia y dos usuarios
1. En la página publicada, juega una carrera de 45 segundos.
2. Escribe un nombre de piloto de 2 a 18 caracteres y guarda el resultado. La tabla debe mostrarlo.
3. Sin borrar el resultado, recarga la página: el mismo récord debe seguir en la tabla.
4. Abre la misma URL de Vercel en una ventana privada u otro navegador. Pulsa **Actualizar tabla**: debe aparecer el récord anterior.
5. En el primer navegador, termina otra carrera y guarda un resultado como `PILOTO_A`.
6. En el segundo navegador, pulsa **Actualizar tabla** y captura cómo aparece el resultado de `PILOTO_A`.

## Las cuatro capturas que pide el laboratorio
- **Captura 1:** resultado guardado y visible antes de recargar.
- **Captura 2:** el mismo resultado visible en otro navegador/dispositivo.
- **Captura 3:** el usuario A termina una carrera y guarda su resultado.
- **Captura 4:** el usuario B ve el resultado de A al actualizar la tabla.

Usa capturas reales de tu aplicación publicada. Coloca en el PDF de D2L: URL de Vercel, URL del repositorio GitHub, URL del commit, las cuatro capturas y una frase comparando esta versión con Proyecto 2 (qué función falta y qué implementarías primero).

## Solución de problemas
- Si muestra **Falta configurar Supabase**, revisa `config.js` y confirma que hiciste commit.
- Si no carga la tabla, vuelve a ejecutar `supabase.sql` y revisa que las políticas RLS existan.
- Si cambiaste `config.js`, espera a que Vercel termine el nuevo despliegue y recarga con Ctrl+F5.
- Los resultados solo se comparten si todos abren el mismo despliegue conectado al mismo proyecto Supabase.
