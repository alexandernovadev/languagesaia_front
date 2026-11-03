# LanguagesAI · Estudio del sistema de diseño

> Estudio hecho el 2026-11-03 para el nuevo front, construido desde cero.
> Cada sección tiene su página interactiva en `docs/design-system/`. Ábrelas en el navegador.

| # | Página | Qué muestra |
|---|---|---|
| 1 | [01-paleta.html](design-system/01-paleta.html) | Fondo grafito, pasteles OKLCH, contraste WCAG, colores por módulo y nivel |
| 2 | [02-tipografia.html](design-system/02-tipografia.html) | Las 3 parejas comparadas (se eligió la B), escala y lector |
| 3 | [03-formas.html](design-system/03-formas.html) | Esquinas, relieve 3D, bordes, espacios, tamaños táctiles |
| 4 | [04-animacion.html](design-system/04-animacion.html) | Curvas, duraciones, pulsar, acierto/fallo, espera de IA, streaming |
| 5 | [05-personalidad.html](design-system/05-personalidad.html) | Sonidos sintetizados, confeti, +XP, combo, racha, vibración |
| 6 | [06-robots.html](design-system/06-robots.html) | El escuadrón de robots superhéroes con sus 7 estados de ánimo (v5, **aprobada**) |

`design-system/robots-parts/*.js` son los SVG por piezas de cada robot. Son la fuente para el componente `<Robot />`.

---

## 0. Principios

- **Inspiración, no copia.** Tomamos los principios de **Duolingo** y **Busuu**: botones gorditos en 3D que se hunden al pulsar, el color siempre comunica (verde = bien, rosa = mal), tarjetas tranquilas y celebraciones generosas. Todo lo visual es original.
- **Sin Radix ni shadcn.** Todo se hace a mano con **CSS Modules y variables CSS**.
- **Solo modo oscuro**, pero un oscuro *lindo*: grafito cálido con pasteles encima.
- **El color se gana su sitio.** La menta solo significa acierto y el rosa solo significa error.
- **Un archivo padre.** Igual que `aiConfig.ts` en el back, todos los tokens viven en un solo archivo.

---

## 1. Color

### Fondo: "grafito"
Proceso: el primer índigo casi negro quedó **demasiado oscuro**. El lila pastel no gustó. Probamos grises claros y quedaron **demasiado claros**. Se eligió el **grafito**.

| Token | Hex | Uso |
|---|---|---|
| `bg-0` | `#202024` | Fondo de la app |
| `bg-1` | `#29292E` | Tarjetas |
| `bg-2` | `#333338` | Tarjeta elevada / hover |
| `bg-3` | `#3E3E44` | Inputs, chips |
| `line` | `#4A4A51` | Bordes |
| `text` | `#F7F7F9` | Texto principal |
| `text-2` | `#D4D4DA` | Texto secundario |
| `text-3` | `#B0B0B9` | Texto suave (cumple AA) |
| `ink` | `#1A1A1E` | Texto **sobre** pastel |

### Pasteles en armonía (OKLCH)
Todos tienen la misma luminosidad (L ≈ 0.84) y el mismo croma (C ≈ 0.085). Así ninguno "grita" más que otro. La mantequilla sube a L 0.89 porque el amarillo se ve sucio si se oscurece.
Cada color tiene 3 variantes:
- **base**
- **deep** (L − 0.20): el borde inferior 3D de los botones.
- **soft** (14 % alfa): fondos tintados.

| Color | base | deep | Significado |
|---|---|---|---|
| Lila | `#CBBDF9` | `#8E7CC2` | **Marca**, Expresiones |
| Cielo | `#9BD2FA` | `#4E94C3` | Info, Palabras |
| Menta | `#91DEBC` | `#3CA17B` | **Solo acierto**, Anki |
| Mantequilla | `#ECDC92` | `#AF9B3E` | Aviso, Exámenes |
| Melocotón | `#F9BB92` | `#BF7946` | Historias, IA |
| Rosa | `#F6B2B9` | `#BD6F79` | **Solo error** |

**Niveles MCER:** A1 menta → A2 cielo → B1 lila → B2 mantequilla → C1 melocotón → C2 rosa.
Todo el texto `ink` sobre pastel y todo el texto claro sobre grafito pasa **WCAG AA**.

---

## 2. Tipografía

Se compararon tres parejas:

| Opción | Títulos + texto | Resultado |
|---|---|---|
| A · Redonda | Fredoka + Nunito | La más amable, pero Nunito cansa en textos largos |
| **B · Gordita** | **Baloo 2 + Lexend** | ✅ **Elegida** |
| C · Legible | Nunito Black + Atkinson | La más clara, pero la menos simpática |

**Por qué B:** Lexend está diseñada para leer con fluidez, así que es ideal para el lector de historias. Baloo 2 es gordita y alegre para botones y "¡Correcto!". Además, la diferencia entre títulos y texto deja una jerarquía muy clara.
- **Noto Sans** se usa para la **IPA**, porque cubre los símbolos fonéticos.
- Las fuentes están autoalojadas con `@fontsource-variable/lexend`, `@fontsource-variable/baloo-2` y `@fontsource/noto-sans`. No se usa Google Fonts en producción.
- **Escala** 1.25, base 16: `48 / 36 / 28 / 22 / 19 (lector) / 16 / 14 / 12`.
- **Lector:** 19 px, interlineado 1.75, unos 62 caracteres por línea.

---

## 3. Formas

- **Esquinas "Burbuja":** `r-sm 14` · `r-md 22` · `r-lg 30` · `full 999`.
- **Relieve 3D "Sutil":** un borde inferior de 2 px en el color `deep`. **No hay sombras difuminadas.**
- **Borde** de 2 px en todo.
- **Espaciado** en una rejilla de 4 px: `4, 8, 12, 16, 20, 24, 32, 40, 48, 64`.
- **Tamaños táctiles:** 40 / 48 / 56, con un **mínimo de 48** en móvil.

---

## 4. Animación — "Juguetona"

| Token | Valor |
|---|---|
| `spring` | `cubic-bezier(.34, 1.56, .64, 1)` |
| press | 80 ms: escala .95 y 2 px hacia abajo (el 3D se "hunde") |
| hover | 150 ms |
| base | 250 ms |
| pantallas / giro de tarjeta | 400 ms |
| celebración | 700 ms |

- **El rebote es solo para lo que se toca y para las celebraciones.** La navegación y el texto usan movimiento suave (ease-out).
- **Acierto:** "pop" a 1.08 y unas 18 piezas de confeti pastel. **Fallo:** sacudida de 7 px.
- **Espera de IA** (tarda de 40 a 70 s), con cuatro elementos:
  - un blob que respira
  - consejos que rotan
  - un esqueleto de carga
  - los segundos transcurridos
- **Streaming:** cada palabra aparece con un fundido y hay un cursor parpadeante.
- Se respeta `prefers-reduced-motion`.

---

## 5. Personalidad

### Sonidos (sintetizados con Web Audio, sin archivos)
| Sonido | Cuándo |
|---|---|
| Toque | Pulsar cualquier botón |
| Acierto | Respuesta correcta (dos notas triangulares que suben) |
| Fallo | Respuesta incorrecta (suave, nunca castiga) |
| Combo | 3 aciertos seguidos (arpegio) |
| Girar tarjeta | Tarjeta Anki (ruido filtrado) |
| Lección completa | Terminar una lección o subir la racha |
| IA lista | La IA terminó de generar |

El sonido se puede apagar con un interruptor global.

### Efectos
- **Confeti:** 18 piezas al acertar y más al terminar una lección.
- **+XP flotante:** sube y se desvanece desde donde acertaste.
- **Destellos:** al subir de nivel o de racha.
- **Racha encendida:** pulso de brillo al aumentar.
- **Combo:** muestra "¡3 seguidas!".
- **Vibración:** un toque corto al acertar y uno doble al fallar. Solo funciona en Android, porque iOS web no lo permite.

---

## 6. Personajes — el escuadrón de robots superhéroes

Inspirado en el *estilo* de la película *Robots* (robots humanoides, de chapa y tornillo, entrañables) pero con **héroes originales**. Hay **un héroe por módulo** y cada uno es **totalmente distinto** en silueta, piezas, ropa y forma de moverse.

| Héroe | Módulo | Concepto | Rasgos |
|---|---|---|---|
| **Lumi** | Palabras | Erudito | Gafas, bufanda, pluma, libro con cinta marcapáginas, orbe de letras, cejas LED, coderas |
| **Nubo** | Expresiones | **Chica** analista de campo, morada | Moños con gomas, mechones, auriculares con micro, monóculo HUD, lupa, tablet, falda, mochila con rotor |
| **Tula** | Historias | **Chica** exploradora | Cara de porcelana con pecas y pestañas, gafas de aviador, mapa con cinta roja, bandolera, farol con núcleo de luz |
| **Bruno** | Exámenes | Guardián y entrenador corpulento | Casco, **cejas blindadas**, **boca LED**, silbato, cronómetro, nudillos blindados, tanques con manómetros |
| **Menti** | Anki | Ninja diminuto de un ojo | **Párpados** expresivos, diafragma de cámara, bandana, tarjetas orbitando, **antena con glifo** (♥ ★ ? … z) |

### 7 estados de ánimo
`idle` · `wave` · `happy` · `party` · `think` · `sad` · `sleep`. Se controlan con el atributo `data-mood`.

### Técnica
- **SVG hecho a mano, por piezas**, con un esqueleto completo: hombro → codo → mano y cadera → rodilla → pie. Cada pieza tiene su pivote (`transform-box: view-box` y `transform-origin` en línea).
- Las poses de los brazos se calcularon con **IK de dos articulaciones**. Por ejemplo, Lumi tiene los brazos cortos y no llega a la barbilla, así que al pensar **se rasca la cabeza**.
- **Los 12 principios de Disney:**
  - anticipación
  - acción superpuesta (antebrazo +60 ms, espinilla +30 ms, cabeza +80 ms)
  - follow-through
  - squash & stretch
  - acción secundaria
  - transferencia de peso
  - doble parpadeo cada 9 s
- **Capas de detalle:**
  - volumen (sombras y brillos)
  - fabricación (costuras, pespuntes, tornillos, paneles, suelas con dibujo)
  - expresión (cejas por estado, dos brillos por ojo, rubor, lengua, lágrima, boca que respira)
- **Voz:** cada héroe tiene un multiplicador de tono para los sonidos.
- **Verificación:** cada pose se comprobó renderizando fotogramas congelados en Chrome headless (5 robots × 7 estados) antes de aprobarla.

### Historia de iteraciones
1. **v1:** todos eran el mismo robot recoloreado. Nota del usuario: **3/10**.
2. **v2:** cinco diseños totalmente distintos.
3. **v3:** animación de cuerpo completo (piernas, hombros, el otro brazo).
4. **v4:** Nubo se rediseñó desde cero como chica exploradora y analítica, morada.
5. **v5:** pulido de "perfeccionismo" con muchas capas y expresiones en los cinco. **Aprobada: "es lo mejor que he visto".** Es el listón de calidad.

---

## 7. Plan de implementación en el front

1. **Tokens:** un archivo padre de variables CSS y la carga de las fuentes.
2. **Componentes base desde cero:** Button 3D, Card, Input, Chip, LevelBadge, ProgressBar, FlashCard, AIThinking, StreamingText, Toast.
3. **Personalidad:** un servicio de sonido (Web Audio), confeti, +XP y vibración.
4. **`<Robot hero="nubo" mood="happy" />`:** se porta desde `robots-parts/*.js`.
5. **Página `/catalogo`:** muestra todo funcionando dentro de la app.
