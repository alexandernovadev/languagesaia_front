# Glota · Pendientes

Detalles conocidos que no bloquean, para retomar más adelante.

## Imágenes (FLUX · fal.ai)

- **Firma ilegible en algunas imágenes.** FLUX a veces añade una pequeña "firma" o garabato en una esquina (aprendido de las ilustraciones con las que se entrenó). Con los prompts nuevos (escena escrita por la IA + estilo fijo, sin texto) ya casi no aparece texto, pero esto puede salir de vez en cuando.
  - Opción: probar `fal-ai/flux/dev` en `IMAGE_AI.model` (`languagesaia_back/src/config/aiConfig.ts`): más calidad y fidelidad al prompt, algo más lento y caro.
  - Ejemplo visto: palabra *saudade* (2026-11-03).

## IA de texto (Fireworks)

- Principal **`deepseek-v4p1-flash`**, respaldo **`kimi-k3`** (Qwen 3.8 era lento / se colgaba). Detalle completo, tiempos y qué modelos sirven: `languagesaia_back/docs/MODELOS-IA.md`.
- Vigilar en el log del back las líneas `[AI] … using fallback`.

## Lecciones (fase 2)

- Ejercicios con voz: **escuchar y escribir**, **escuchar y elegir**, **hablar**.
- **Test de nivel** adaptativo (A1–C2).
- Generar ejercicios son dos llamadas a la IA (escribir y revisar): unos 25 s. Si el principal cae y entra el respaldo, 60–90 s. Lo que ya está en el banco (`exercises`) sale al instante.
- Pasar los errores de una lección a **Repasar** como tarjetas.

## Back: lo que la app ya muestra pero el back no guarda

- **Registro público**: no existe; las cuentas las crea el admin.

## Datos de prueba

- La palabra **"saudade"** (portugués) se creó al probar la IA; decidir si se queda.

## Listening propasal 
// ESTO AQUI SERA VITAL , el listenig es el pilar mas fundamentasl y este listeing 
esta fificil y intermedio, hya que jugar con eso, divider el video intenta capturar
evaluar el eoiod algo , se nos tiene que ocuurit
https://www.youtube.com/watch?v=wWSSJ5aDvW4