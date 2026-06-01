# MS Ita's Fury 🔫🐶

Un **Metal Slug sinaloense** hecho con [Phaser 3](https://phaser.io/).
Protagonista: **Ita Ita**. Compañero: **Lucky** (perro artillero, tipo vehículo de Metal Slug).
Enemigos: los **chairos** (pantalón azul + chaleco guindo).

## ▶ Cómo jugar

**La forma fácil:** doble clic en **`Jugar.cmd`**.
Se abre tu navegador en `http://localhost:8000` y arranca el juego.

> Se usa un mini servidor local porque el navegador bloquea la carga de
> imágenes cuando abres el HTML directo con `file://`. No instala nada:
> solo usa PowerShell, que ya viene en Windows.

**Alternativa manual** (en una terminal dentro de la carpeta):

```powershell
.\serve.ps1            # puerto 8000 por defecto
.\serve.ps1 -Port 8080 # si el 8000 está ocupado
```

Para detener: cierra la ventana o `Ctrl+C`.

## 📱 Jugar en el celular (misma red WiFi)

Doble clic en **`Jugar-en-celular.cmd`**. Acepta la ventana de administrador
(hace falta para abrir el puerto en el firewall). Te mostrará una URL como
`http://192.168.1.71:8000/`. En tu **celular** (conectado a la **misma WiFi**)
abre esa URL en el navegador. Los **controles táctiles** aparecen solos.

> ⚠️ Si tienes una **VPN activa** (NordVPN, etc.) puede bloquear la conexión
> de la red local: desactívala o activa la opción de "permitir red local /
> invisibilidad en LAN" mientras juegas en el cel.

Para probar los controles táctiles **en la PC**: abre `http://localhost:8000/?touch=1`.

## 🌐 Compartir con amigos

El juego son varios archivos (no un solo `.html`), así que para que tus amigos
lo jueguen lo mejor es **subirlo a un hosting estático gratis** y mandarles el
link (funciona en PC y celular):

- **itch.io** (ideal para juegos): comprime la carpeta en `.zip` y súbela; te da
  una página jugable. 
- **Netlify Drop** (`app.netlify.com/drop`): arrastras la carpeta y listo, link al instante.
- **GitHub Pages**: si usas git, publicas la carpeta como sitio.

Alternativa rápida (solo Windows): mándales la **carpeta en ZIP** y que corran
`Jugar.cmd`. Funciona, pero es menos práctico que un link.

## 🎮 Controles

| Acción     | Teclas                  |
|------------|-------------------------|
| Mover      | ← →  /  A D             |
| Saltar     | ↑ / W / Espacio         |
| Disparar   | J  /  Z                 |
| Granada    | K                       |
| Pausa      | P                       |
| Silencio   | M  (o el botón 🔊)      |

## 🧩 Mecánicas

- **Armas** (cajas en el escenario): Escuadra (infinita), Cuerno de Chivo,
  Escopeta Recortada y Bazuca. Al acabarse la munición vuelves a la Escuadra.
- **Vida (+):** cajas verdes que curan.
- **Lucky:** caja "LUCKY". Te sigue y dispara solo al enemigo más cercano.
  Tiene su propia vida; si se la acaban, se va (puedes recogerlo otra vez).
- **Meta 🏁:** llega al final del nivel para avanzar. Hay 2 niveles.

## 📁 Estructura

```
index.html              Carga Phaser (CDN) + scripts
serve.ps1 / Jugar.cmd   Servidor local para probar
assets/                 ita.png, lucky.png (recortados de las imágenes originales)
tools/crop.ps1          Script para recortar sprites de las imágenes fuente
src/
  main.js               Config de Phaser y estado global
  data/config.js        Constantes, armas y niveles
  entities/             Player (Ita), Chairo, Lucky
  scenes/               Boot, Menu, Game, End
```

## 🔧 Ajustar el arte

Los personajes se recortaron de `Ita Ita.png` y `Lucky.png` con `tools/crop.ps1`:

```powershell
.\tools\crop.ps1 -Src "Ita Ita.png" -Dst "assets\ita.png" -X 120 -Y 128 -W 470 -H 1173
```

Cambia X/Y/W/H para reencuadrar.
