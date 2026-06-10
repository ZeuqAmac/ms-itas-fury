# MS Ita's Fury — Notas del proyecto (CLAUDE.md)

Juego **run-and-gun estilo Metal Slug, ambientado en Sinaloa**, hecho con
**Phaser 3** (cargado por CDN). Protagonista: **Ita Ita**. Compañero: **Lucky**
(perro artillero, tipo vehículo de MS). Enemigos: **chairos** (pantalón azul,
chaleco guindo). Todo el arte de juego se **genera por código** (pixel-art);
las imágenes originales solo se usan como póster en menús.

## Despliegue (en línea)
- **Repo:** https://github.com/ZeuqAmac/ms-itas-fury  (rama `main`)
- **Live (Netlify):** https://msitafury.netlify.app/
- **Actualizar:** `git push` a `main` → Netlify **republica solo** (build vacío,
  publish dir = raíz). Rollback desde el panel de Netlify (Deploys → publicar
  un deploy anterior).
- El arte se genera por código → el deploy no incluye imágenes (rápido).

## Cómo correr (importante)
- **No hay Node ni Python** en esta máquina. No se usa npm ni bundler.
- Phaser viene por **CDN** en `index.html`. Scripts cargados como `<script>`
  clásicos (las clases se exponen en `window.*`).
- Para jugar: doble clic en **`Jugar.cmd`** → levanta un mini servidor
  PowerShell (`serve.ps1`, `System.Net.HttpListener`) en `http://localhost:8000`.
  Se necesita servidor porque el navegador bloquea cargar imágenes desde `file://`.
- Al probar cambios: **Ctrl+F5** para evitar caché.

## Arquitectura
```
index.html              Carga Phaser (CDN) + scripts en orden
src/main.js             Config de Phaser + GAME_STATE global (level, lives, score)
src/data/config.js      CONST, COLORS, WEAPONS, LEVELS (con theme), paleta
src/art/CharacterArt.js Sprites pixel-art por código (Ita, Choco, Lucky, Chairo) + anims
src/art/SceneryArt.js   Capas de fondo (catedral, mercado, malecón/faro...) + parallax
src/art/PickupArt.js    Cajas de pertrechos pixel-art (una por arma/ítem)
src/entities/Player.js  Ita: movimiento, salto, disparo, armas, polvo, casquillos
src/entities/Chairo.js  Enemigo: IA (camina/dispara), animación de muerte
src/entities/Lucky.js   Compañero: flota, auto-dispara al enemigo más cercano
src/scenes/BootScene.js Genera texturas/arte y arranca
src/scenes/MenuScene.js Título (usa ita_poster) → Selección de personaje
src/scenes/CharacterSelectScene.js  Tarjetas de personaje (CHARACTERS) — extensible
src/scenes/GameScene.js Gameplay: mundo, colisiones, HUD, progresión, efectos
src/scenes/EndScene.js  Victoria / game over
manifest.webmanifest    PWA: nombre, iconos, display standalone, landscape
sw.js                   Service worker (instalable + offline)
icon-*.png              Iconos PWA (generados por tools/make_icons.py)
tools/crop.ps1          Recorta sprites de imágenes fuente (.NET System.Drawing)
tools/cutout.ps1        (Obsoleto) intento de quitar fondo por flood-fill
assets/                 Imágenes originales (Ita Ita.png, Lucky.png) + recortes
```

## Convenciones / decisiones clave (no romper)
- **Callbacks de colisión = independientes del orden.** Phaser pasa los
  argumentos en distinto orden según sea sprite-vs-grupo o grupo-vs-grupo.
  SIEMPRE identificar objetos por tipo: `const enemy = a instanceof Chairo ? a : b`.
  (Esto causó 2 crashes; ya resuelto en `GameScene.js`.)
- **Arte por código:** se dibuja a baja resolución y el motor lo escala con
  nearest-neighbor (`pixelArt: true`). Cada personaje = varios frames →
  anims en `this.anims` (global). Outlines/sombras para look MS.
- **Cuerpos de colisión** más chicos que el sprite, definidos en cada entidad.
- **Niveles** en `LEVELS` (config.js); cada uno con `theme`
  ('culiacan'|'jardin'|'malecon'|'sierra'), `enemies` (con `type` opcional:
  'pistola'|'bazuca'|'machete'), `pows` (prisioneros), `pickups` (armas | 'vida' |
  'lucky' | 'tanque'), `gaps`, `hazards`, `platforms`, `boss`, `width`.

## Controles
Mover ← → / A D · Saltar W / Espacio · Disparar J / Z · Granada K · Pausa P · Silencio M
- **Apuntar:** ↑ ↓ (combinadas con izq/der dan diagonales). Las balas salen en
  la dirección apuntada (8 vías, estilo Metal Slug). El tanque dispara fijo.
- **Cuchillazo:** mismo botón de tiro cuando el enemigo está pegado (auto).
- **Esquivar (rodada):** ↓ / stick-abajo **en el piso** => rueda con i-frames
  (en el aire, ↓ apunta hacia abajo). Tiene cooldown. (`Player.startDodge`.)
- **Móvil:** **joystick** analógico (abajo-izq.) — mover izq/der y **apuntar**
  empujándolo arriba/abajo — + botones TIRO, SALTO y 💣 a la derecha.
  En escritorio se fuerzan con `?touch=1` en la URL.
- **Gamepad** (GameSir X2 y mandos estándar): stick/cruceta mueve y apunta,
  **A** salta, **X/RB/RT/B** dispara, **Y/LB** granada, **Start** pausa,
  **Back** silencio. (`GameScene.setupGamepad`; Phaser `input.gamepad`.)

## Armas (config.js → WEAPONS)
Escuadra (∞), Cuerno de Chivo, Escopeta Recortada, Bazuca (explosiva).
Al acabar munición vuelve a Escuadra.

---

## ✅ Hecho hoy (2026-05-31)
1. **Juego base** jugable: 2 niveles, movimiento/salto/disparo, armas
   recogibles, Lucky compañero, chairos, meta, HUD, menú y pantallas finales.
2. **Crash al recibir/dar balazo** — RESUELTO. Causa: orden de argumentos de
   los callbacks de colisión de Phaser. Solución: discriminar por `instanceof`.
3. **Personajes en pixel-art por código** (sin fondo): Ita, Lucky y chairos,
   con animación cuadro por cuadro (idle, correr, saltar) y muerte de chairos.
   (Se descartó recortar el fondo de las fotos: demasiado complejo sin IA.)
4. **Fondos parallax sinaloenses**: Catedral de Culiacán + Mercado Garmendia
   (Nivel 1) y Jardín Botánico/palmeras (Nivel 2), inspirados en fotos reales.
5. **Efectos**: explosiones por capas, fogonazos, polvo al correr/aterrizar,
   casquillos, balas con estela, squash/stretch.

## ✅ Hecho (segunda iteración)
6. **Outlines + sombreado estilo MS** en personajes (sistema `Pixel.js`:
   canvas 2D + contorno automático). Aplicado también a props del escenario.
7. **Granada** con forma de piña (textura propia) y giro al lanzarla.
8. **Lucky camina** (con gravedad), salta para seguir a Ita y sigue disparando.
9. **Niveles más largos** (6200 / 7000) con **plataformas one-way** tipo azotea
   (muro de soporte + repisa), integradas al fondo; recompensas en lo alto.
10. **Casas** sinaloenses como decoración/soporte en el fondo.
11. **Soporte móvil**: escalado responsive (Scale.FIT, multi-touch) + **controles
    táctiles** en pantalla (cruceta, salto, tiro, granada) que aparecen en
    dispositivos táctiles. En escritorio se fuerzan con `?touch=1` en la URL.
    Aviso de "gira el teléfono" en vertical. Falta hosting/red local para jugar
    en el cel (siguiente paso si se quiere).

## ✅ Hecho (tercera iteración)
12. **Móvil**: `serve-lan.ps1` + `Jugar-en-celular.cmd` para jugar por WiFi
    (detecta IP local ignorando VPNs, abre firewall). Probado y funcionando.
13. **Sonido sintetizado por código** (`src/audio/Sound.js`, Web Audio, sin
    archivos): efectos (disparo, explosión, salto, daño, recoger, win/gameover)
    + música chiptune en loop. Silencio con tecla **M** o botón 🔊 en el HUD.
    El audio arranca con el primer toque/tecla (política del navegador).

14. **Mapas dinámicos/diferenciados**: suelo en segmentos con **huecos/pozos**
    (caída = pierdes vida), **peligros** por tema (🔥 brasas en Culiacán, 💧 agua
    en el Malecón) que dañan al tocarlos, y tinte de suelo por nivel. Lucky
    regresa solo si cae; chairos que caen se eliminan. (`buildGround`,
    `buildHazards` en GameScene; `gaps`/`hazards` en config.js).

15. **Ita Ita rediseñada** (sprite más fiel a la original: melena larga ondulada,
    sonrisa, chaleco negro + top teal, guantes, AK con madera) y **portada**
    rehecha (título banner, Ita Ita + Lucky, placas de nombre, tagline).

16. **Jefes finales** (`src/entities/Boss.js`, arte en CharacterArt `_buildBoss`):
    aparecen al pasar `boss.triggerX`; IA que mantiene distancia, voleas de balas,
    **modo furia** bajo 50% HP (más rápido/más balas) y refuerzos (chairos).
    Barra de vida en HUD. Derrotarlo = completa el nivel (ya no hay bandera de meta
    en niveles con jefe). N1: **EL PATRÓN** (1200 HP) · N2: **EL GENERAL** (1600 HP).

## ✅ Hecho (cuarta iteración 2026-06-02)
17. **PWA instalable**: `manifest.webmanifest` + `sw.js` (service worker:
    navegación network-first, CDN cache-first, resto stale-while-revalidate) +
    iconos generados por código (`tools/make_icons.py`, PNG en Python puro:
    `icon-192/512.png`, `apple-touch-icon.png`). Botón "Instalar app" en
    `index.html` (usa `beforeinstallprompt`). `serve.ps1`/`serve-lan.ps1` ahora
    sirven `.webmanifest`. Objetivo: instalar como app y quitar la barra del
    navegador (que tapaba los controles).
18. **Fix móvil (¡clave!)**: el lienzo ya NO se corta tras la barra de
    direcciones. `index.html` mide el alto VISIBLE real (`visualViewport`/
    `innerHeight` → variable `--app-height`, con `100dvh` de respaldo) y reajusta
    Phaser (`scale.refresh`) al rotar o mostrar/ocultar la barra.
19. **Selección de personaje** (`src/scenes/CharacterSelectScene.js`,
    `CHARACTERS` en config.js): tarjetas extensibles (toca para elegir, doble
    toque/Enter para jugar). Incluye Ita y el Tanque; Lucky y "¿?" bloqueados
    (placeholders para futuros personajes). Menú → Selección → Juego.
20. **Tanque jugable "El Slug"** (`CharacterArt._buildTank`, modo en `Player`):
    `enterTank/exitTank`, blindaje propio (barra en HUD), cañón explosivo
    (`WEAPONS.canon`), orugas animadas, salto corto. Se obtiene como pickup
    `tanque` en los niveles o eligiéndolo en la selección. Al agotarse el
    blindaje, Ita sale a pie.
21. **Ita más fiel a la referencia**: melena castaña más voluminosa/ondulada,
    ombligo a la vista (chaleco abierto), mejor sombreado.
22. **Escenario más Metal Slug**: props de guerra (sacos terreros, tambos con
    franja de peligro, escombros) + **viñeta atmosférica** cinemática, cuidando
    la identidad sinaloense.
23. **Herramienta de dev** `tools/render.js`: previsualiza el arte por código en
    PNG (mock de canvas en Node). Salida en `tools/preview/` (ignorada por git).

## ✅ Hecho (quinta iteración 2026-06-02)
24. **La Choco jugable** (Prisionera 4027): nuevo personaje a pie con su arte
    pixel-art por código (`CharacterArt._drawChoco`: melena rubia rizada, top
    negro, overol amarillo, subfusil) + anims (`choco-idle/run/jump`). `Player`
    ahora usa `this.skin` (ita|choco) para texturas/anims a pie. Tarjeta en
    `CHARACTERS` (se quitó el placeholder "¿?").
25. **Cuchillazo a quemarropa** (Ita y La Choco): mismo botón de tiro. Si hay un
    enemigo enfrente y muy cerca (`meleeRange`), se apuñala en vez de disparar
    (estilo Metal Slug). `Player.tryMelee` + efecto `GameScene.meleeSlash` +
    sonido `slash`. Un tajo liquida a un chairo; también daña al jefe.
26. **Cañonazo del tanque**: en el tanque, el botón de granada lanza un proyectil
    explosivo pesado (`Player.fireCannonBlast`, sonido `cannon`) en vez de la
    granada piña. HUD muestra "💥 CAÑONAZO".
27. **Continuar donde moriste**: al morir con vidas restantes, revives en el
    último suelo firme SIN reiniciar el nivel (enemigos abatidos, armas y jefe
    conservan su estado). `GameScene.respawnPlayer` + seguimiento de `safeX/safeY`.

## ✅ Hecho (sexta iteración 2026-06-02)
28. **Cuchillazo más visible**: nueva textura `slash` (medialuna estilo MS) +
    efecto `GameScene.meleeSlash` reescrito (medialuna opaca que barre, destello,
    chispas y "¡SHK!"). Alcance subido (`meleeRange` 70).
29. **Joystick táctil**: el movimiento en móvil ahora es un **stick analógico**
    (abajo-izquierda) en vez de los botones ◀▶. `GameScene.buildTouchControls`
    + `_moveJoy` (sigue el dedo, umbral a izq/der). Botones de acción a la derecha.
30. **Nivel 2 rediseñado — Malecón de Mazatlán** (tema `malecon`, distinto del 1):
    fondo nuevo de playa (mar con oleaje, las tres islas, **faro**, barandal del
    malecón, palmeras, sombrillas, pangas) en `SceneryArt._buildMalecon` + sprites
    nuevos. Suelo arenoso (`ground_malecon`). Layout con **muchas plataformas a
    distintas alturas** (repisas bajas al ras del agua y miradores altos sobre el
    faro) y más canales de mar para brincar.

## ✅ Hecho (séptima iteración 2026-06-02)
31. **Soporte de gamepad** (GameSir X2 y mandos estándar): Phaser `input.gamepad`
    habilitado en `main.js`. Se lee por **SONDEO cada frame** (más confiable que
    el evento `down` entre mandos): A=salto, X/RB/RT/B=tiro, Y/LB=granada,
    Start=pausa, Back=silencio (botones discretos con flanco `_padJust`).
    Menús y selección de personaje también sondean el control. Indicador 🎮 en
    el HUD que brilla cuando el navegador detecta un mando.
32. **Disparo direccional (8 vías)**: `Player.aimAngle()` calcula el ángulo de
    tiro según stick/cruceta (↑ dispara arriba; ↑+→ diagonal; abajo sólo en el
    aire). `tryShoot` usa el ángulo para balas, fogonazo y casquillos. El stick
    táctil ahora también apunta (`touch.up/down` desde el joystick). Una flecha
    (`aim_arrow`) muestra hacia dónde apuntas. El tanque mantiene el cañón fijo.
33. **Cajas de armas con diseño** (`src/art/PickupArt.js`): cada pickup es una
    caja de pertrechos de madera con marco metálico, franja de color por arma e
    **icono del arma/ítem** (AK, escopeta, RPG, botiquín+cruz, hueso de Lucky,
    tanque). Reemplaza la caja genérica con letra. `spawnPickup` usa
    `pickup_<tipo>` + resplandor de color que pulsa.

## ✅ Hecho (octava iteración 2026-06-02)
34. **Esquive (rodada con i-frames)**: presionar **abajo en el piso** ejecuta
    una rodada — impulso horizontal, giro (barrel roll), estela fantasma
    (`GameScene.dodgeFx`), polvo y sonido `roll` — con **invulnerabilidad**
    durante el movimiento y un cooldown corto. En el aire, abajo sigue apuntando
    hacia abajo. (`Player.startDodge` / `updateDodge`; disparador en `update`.)

## ✅ Hecho (novena iteración 2026-06-03)
35. **Pose de apuntar arriba** (estilo Metal Slug): Ita y La Choco tienen frame
    `up` (recto, parado) y ciclo `updiag0..3` (diagonal con **piernas corriendo**,
    reusa el ciclo del run) con el arma levantada (CharacterArt
    `_drawIta`/`_drawChoco`). `Player` reproduce `<skin>-up` parado y
    `<skin>-updiag` al moverse apuntando arriba. Se conserva la flecha
    `aim_arrow` como indicador fino.
36. **Controles en pantalla se ocultan con gamepad**: `buildTouchControls`
    registra los objetos (`touchControls`/`touchZones`) y `setTouchVisible`
    los muestra/oculta. `drawHUD` los oculta cuando `input.gamepad.total > 0`
    (y los regresa si se desconecta el control).

## ✅ Arreglos (2026-06-03)
37. **Bajarse del tanque** (`Player.dismountTank`, botón **abajo**): evita quedar
    atrapado si el tanque no alcanza a cruzar un hueco. HUD muestra "↓ bajar".
    Además, en el Nivel 2 el pickup del tanque se movió a la recta despejada
    hacia el jefe (x 4700→5300) y el último canal de mar se angostó (190→150).
38. **Audio robusto**: `SFX.unlock()` (reanuda contexto + música) se llama en cada
    gesto (toque/tecla/`touchstart`) reintentando hasta `running`, al togglear
    silencio, al conectar/usar el **gamepad** y en las transiciones de menú.
    Soluciona el "había que subir/bajar el volumen para que sonara".

## ✅ Hecho (décima iteración 2026-06-10)
39. **Presentación estilo Metal Slug**: intro de misión "MISSION N → ¡START!"
    (`GameScene.missionIntro`), "MISSION COMPLETE" al ganar, marcador arcade
    en el HUD (`SCORE 0000000` con relleno de ceros) y popups de puntos
    (+100/+150/+200/+1000) al abatir enemigos/jefes.
40. **Prisioneros rescatables (POWs)**: señores de rancho atados con soga
    (arte `pow_tied/free` en CharacterArt); tocarlos los libera → +500 puntos
    y recompensa al azar (arma, granadas o vida), celebran y se van corriendo.
    Config: `pows: [{x}]` por nivel; `spawnPow`/`rescuePow` en GameScene.
41. **Variedad de enemigos** (`type` en `enemies` de config): **chairo bazuca**
    (bandana roja, tubo RPG; mantiene distancia y lanza cohetes lentos con
    estela que explotan al impacto) y **chairo machete** (greñudo; corre y
    embiste, más daño al contacto). `CHAIRO_TYPES` en Chairo.js; arte por
    variante en `_drawChairo`.
42. **Nivel 3 "La Sierra Brava"** (tema `sierra`): fondo nuevo con doble
    cordillera parallax, pinos, magueyes, cabañas con ventanas iluminadas y
    suelo de terracería (`ground_sierra`); barrancas, brasas, riscos y
    miradores. Mezcla fuerte de los 3 tipos de chairo.
43. **Jefe volador "EL HALCÓN"** (helicóptero artillado, `boss_halcon` en
    CharacterArt, rotor animado): flota sin gravedad, flanquea a Ita cambiando
    de costado, ametralla en abanico desde el cañón de mentón, **suelta bombas**
    cuando te tiene debajo (`spawnHeloBomb`) y pide refuerzos; en furia va más
    rápido y manda machetes. Al morir cae girando entre explosiones.
    (`cfg.flying` en Boss.js / `updateFlying`.)

## 🔜 Por hacer / ideas
- **Más variedad de jefes/ataques** (saltos, embestidas, proyectiles especiales).
- **Más enemigos / variedad**: chairo con cuerno y otros tipos.
- **Más niveles / variedad de escenarios** (nuevos temas, peligros y props).
- **Pantalla de puntajes / récord** (guardar mejor puntaje con localStorage).
- **Enemigos en plataformas** (ahora solo andan en el suelo).
- **Balance**: dificultad, cantidad de enemigos, vida.
- **Niveles 2 y 3**: revisar a fondo (probados poco).
- **Mejoras de jugabilidad**: agacharse, recarga.
- (Opcional) animación de disparo dedicada para Ita (frame de brazo distinto).
- (Opcional) outline a los landmarks grandes (catedral/mercado) si se ven planos.
