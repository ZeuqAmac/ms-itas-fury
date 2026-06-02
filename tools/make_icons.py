#!/usr/bin/env python3
# ============================================================
#  make_icons.py — genera los iconos PWA (sin dependencias):
#  emblema sinaloense (estrella dorada sobre guinda) en PNG.
#  Encoder PNG en Python puro (zlib + struct). Salida: raíz.
# ============================================================
import zlib, struct, math, os

OUT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def png(path, w, h, px):
    raw = bytearray()
    for y in range(h):
        raw.append(0)  # filtro None por scanline
        row = y * w * 4
        raw.extend(px[row:row + w * 4])
    comp = zlib.compress(bytes(raw), 9)
    def chunk(tag, data):
        c = struct.pack('>I', len(data)) + tag + data
        return c + struct.pack('>I', zlib.crc32(tag + data) & 0xffffffff)
    ihdr = struct.pack('>IIBBBBB', w, h, 8, 6, 0, 0, 0)
    with open(path, 'wb') as f:
        f.write(b'\x89PNG\r\n\x1a\n')
        f.write(chunk(b'IHDR', ihdr))
        f.write(chunk(b'IDAT', comp))
        f.write(chunk(b'IEND', b''))

def lerp(a, b, t):
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))

def draw(size):
    w = h = size
    px = bytearray(w * h * 4)
    cx = cy = size / 2.0
    top = (0x9a, 0x20, 0x33)
    bot = (0x3c, 0x0a, 0x14)
    # estrella de 5 puntas
    R = size * 0.40
    r = size * 0.165
    pts = []
    for i in range(10):
        ang = -math.pi / 2 + i * math.pi / 5
        rad = R if i % 2 == 0 else r
        pts.append((cx + math.cos(ang) * rad, cy + math.sin(ang) * rad))

    def in_poly(x, y, poly):
        inside = False
        n = len(poly)
        j = n - 1
        for i in range(n):
            xi, yi = poly[i]
            xj, yj = poly[j]
            if ((yi > y) != (yj > y)) and (x < (xj - xi) * (y - yi) / (yj - yi) + xi):
                inside = not inside
            j = i
        return inside

    gold = (0xff, 0xce, 0x3a)
    goldHi = (0xff, 0xe7, 0x8a)
    ink = (0x2b, 0x0a, 0x10)
    for y in range(h):
        ty = y / (h - 1)
        base = lerp(top, bot, ty)
        for x in range(w):
            # viñeta radial
            dx = (x - cx) / cx
            dy = (y - cy) / cy
            vig = max(0.0, 1.0 - (dx * dx + dy * dy) * 0.55)
            col = tuple(int(c * (0.55 + 0.45 * vig)) for c in base)
            a = 255
            # estrella con contorno
            if in_poly(x, y, pts):
                # contorno: cercanía al borde via muestreo simple
                edge = not (in_poly(x - 3, y, pts) and in_poly(x + 3, y, pts)
                            and in_poly(x, y - 3, pts) and in_poly(x, y + 3, pts))
                if edge:
                    col = ink
                else:
                    sh = 0.78 + 0.22 * (1.0 - y / h)
                    g = lerp(gold, goldHi, max(0.0, 1.0 - (y - cy + R) / (2 * R)))
                    col = tuple(int(c * sh) for c in g)
            i = (y * w + x) * 4
            px[i] = col[0]; px[i + 1] = col[1]; px[i + 2] = col[2]; px[i + 3] = a
    return w, h, px

for s, name in [(512, 'icon-512.png'), (192, 'icon-192.png'), (180, 'apple-touch-icon.png')]:
    w, h, px = draw(s)
    png(os.path.join(OUT, name), w, h, px)
    print('wrote', name)
