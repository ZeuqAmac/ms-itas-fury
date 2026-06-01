// ============================================================
//  Pixel — utilidad para dibujar sprites en canvas 2D y añadir
//  contorno (outline) estilo Metal Slug. Compartido por
//  CharacterArt y SceneryArt.
// ============================================================

const Pixel = {
  // draw(p, ctx): p(color, x, y, w, h) pinta un rectángulo.
  // outline = color del contorno, o null para no trazarlo.
  sprite(scene, key, W, H, draw, outline = 0x140f0a) {
    const canvas = document.createElement('canvas');
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext('2d');
    const p = (c, x, y, w, h) => {
      ctx.fillStyle = Pixel.col(c);
      ctx.fillRect(x, y, w, h);
    };
    draw(p, ctx);
    if (outline !== null) Pixel.outline(ctx, W, H, outline);
    if (scene.textures.exists(key)) scene.textures.remove(key);
    scene.textures.addCanvas(key, canvas);
  },

  col(c) { return '#' + (c >>> 0).toString(16).padStart(6, '0'); },

  // pinta el contorno: pixeles transparentes que tocan uno opaco (8-vecinos)
  outline(ctx, W, H, colNum) {
    const img = ctx.getImageData(0, 0, W, H);
    const d = img.data;
    const a = new Uint8ClampedArray(W * H);
    for (let i = 0; i < W * H; i++) a[i] = d[i * 4 + 3];
    const r = (colNum >> 16) & 255, g = (colNum >> 8) & 255, b = colNum & 255;
    const op = (x, y) => (x >= 0 && y >= 0 && x < W && y < H && a[y * W + x] > 0);
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const i = y * W + x;
        if (a[i] !== 0) continue;
        if (op(x - 1, y) || op(x + 1, y) || op(x, y - 1) || op(x, y + 1) ||
            op(x - 1, y - 1) || op(x + 1, y - 1) || op(x - 1, y + 1) || op(x + 1, y + 1)) {
          const j = i * 4;
          d[j] = r; d[j + 1] = g; d[j + 2] = b; d[j + 3] = 255;
        }
      }
    }
    ctx.putImageData(img, 0, 0);
  },
};

window.Pixel = Pixel;
