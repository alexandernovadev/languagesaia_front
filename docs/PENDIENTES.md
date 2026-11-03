# Glota · Pendientes

Detalles conocidos que no bloquean, para retomar más adelante.

## Imágenes (FLUX · fal.ai)

- **Firma ilegible en algunas imágenes.** FLUX a veces añade una pequeña "firma" o garabato en una esquina (aprendido de las ilustraciones con las que se entrenó). Con los prompts nuevos (escena escrita por la IA + estilo fijo, sin texto) ya casi no aparece texto, pero esto puede salir de vez en cuando.
  - Opción: probar `fal-ai/flux/dev` en `IMAGE_AI.model` (`languagesaia_back/src/config/aiConfig.ts`): más calidad y fidelidad al prompt, algo más lento y caro.
  - Ejemplo visto: palabra *saudade* (2026-11-03).

## IA de texto (Fireworks)

- `qwen3p8-2p4t-a95b` **no es serverless**: sin un despliegue dedicado las peticiones se quedan colgadas. Se usa `qwen3p8-max`.
- Qwen 3.8 en Fireworks es **inestable** (a ratos no responde). Hay respaldo automático a `deepseek-v4p1-flash` (20 s de espera, 5 min de pausa). Vigilar en el log las líneas `[AI] … using fallback`.

## Back: lo que la app ya muestra pero el back no guarda

- **XP, racha y meta diaria**: hoy viven solo en el navegador (`src/lib/progress.ts`). Decidido: guardarlos en el back.
- **Pronunciación de palabras (voz)**: la voz depende de OpenAI, sin créditos. Elegir otro proveedor de TTS.
- **Registro público**: no existe; las cuentas las crea el admin.

## Datos de prueba

- La palabra **"saudade"** (portugués) se creó al probar la IA; decidir si se queda.
