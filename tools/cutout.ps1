# ============================================================
#  cutout.ps1 — quita el fondo de un PNG por flood-fill desde
#  los bordes (region grow por gradiente local, 4-conexo).
#  Recorta al bounding box opaco. PowerShell puro (sin compilar).
#
#  Uso:
#    .\tools\cutout.ps1 -Src "assets\ita.png" -Dst "assets\ita_cut.png" -Tol 45
# ============================================================
param(
  [Parameter(Mandatory=$true)][string]$Src,
  [Parameter(Mandatory=$true)][string]$Dst,
  [int]$Tol = 45,
  [double]$BottomKeep = 0.40   # fracción central inferior que NO se siembra (pies)
)

Add-Type -AssemblyName System.Drawing

$srcFull = (Resolve-Path $Src).Path
$dstFull = $Dst
if (-not [System.IO.Path]::IsPathRooted($dstFull)) {
  $dstFull = Join-Path (Split-Path -Parent $srcFull) $Dst
}

$bmp  = [System.Drawing.Bitmap]::new($srcFull)
$w = $bmp.Width; $h = $bmp.Height
$rect = [System.Drawing.Rectangle]::new(0, 0, $w, $h)
$fmt  = [System.Drawing.Imaging.PixelFormat]::Format32bppArgb
$out  = $bmp.Clone($rect, $fmt)
$bmp.Dispose()

$data   = $out.LockBits($rect, [System.Drawing.Imaging.ImageLockMode]::ReadWrite, $fmt)
$stride = $data.Stride
$bytes  = $stride * $h
$buf    = New-Object 'byte[]' $bytes
[System.Runtime.InteropServices.Marshal]::Copy($data.Scan0, $buf, 0, $bytes)

$vis   = New-Object 'bool[]' ($w * $h)
$stack = [System.Collections.Generic.Stack[int]]::new()

# --- Sembrar bordes (arriba + lados completos, abajo solo extremos) ---
for ($x = 0; $x -lt $w; $x++) { $i = $x;            if (-not $vis[$i]) { $vis[$i] = $true; $stack.Push($i) } }
for ($y = 0; $y -lt $h; $y++) {
  $i = $y * $w;       if (-not $vis[$i]) { $vis[$i] = $true; $stack.Push($i) }
  $i = $y * $w + $w-1; if (-not $vis[$i]) { $vis[$i] = $true; $stack.Push($i) }
}
$keepFrom = [int]($w * (0.5 - $BottomKeep / 2))
$keepTo   = [int]($w * (0.5 + $BottomKeep / 2))
$rowBase  = ($h - 1) * $w
for ($x = 0; $x -lt $w; $x++) {
  if ($x -lt $keepFrom -or $x -gt $keepTo) {
    $i = $rowBase + $x; if (-not $vis[$i]) { $vis[$i] = $true; $stack.Push($i) }
  }
}

$wm1 = $w - 1; $hm1 = $h - 1

# --- Flood fill 4-conexo ---
while ($stack.Count -gt 0) {
  $idx = $stack.Pop()
  $x = $idx % $w
  $y = ($idx - $x) / $w        # división exacta (evita el redondeo de [int])
  $p = $y * $stride + $x * 4
  $b = $buf[$p]; $g = $buf[$p+1]; $r = $buf[$p+2]
  $buf[$p+3] = 0

  if ($x -lt $wm1) { $n = $idx+1; if (-not $vis[$n]) { $np=$p+4
      if (([math]::Abs($buf[$np]-$b)+[math]::Abs($buf[$np+1]-$g)+[math]::Abs($buf[$np+2]-$r)) -le $Tol) { $vis[$n]=$true; $stack.Push($n) } } }
  if ($x -gt 0)   { $n = $idx-1; if (-not $vis[$n]) { $np=$p-4
      if (([math]::Abs($buf[$np]-$b)+[math]::Abs($buf[$np+1]-$g)+[math]::Abs($buf[$np+2]-$r)) -le $Tol) { $vis[$n]=$true; $stack.Push($n) } } }
  if ($y -lt $hm1) { $n = $idx+$w; if (-not $vis[$n]) { $np=$p+$stride
      if (([math]::Abs($buf[$np]-$b)+[math]::Abs($buf[$np+1]-$g)+[math]::Abs($buf[$np+2]-$r)) -le $Tol) { $vis[$n]=$true; $stack.Push($n) } } }
  if ($y -gt 0)   { $n = $idx-$w; if (-not $vis[$n]) { $np=$p-$stride
      if (([math]::Abs($buf[$np]-$b)+[math]::Abs($buf[$np+1]-$g)+[math]::Abs($buf[$np+2]-$r)) -le $Tol) { $vis[$n]=$true; $stack.Push($n) } } }
}

# --- Bounding box opaco ---
$minx=$w; $miny=$h; $maxx=-1; $maxy=-1
for ($y = 0; $y -lt $h; $y++) {
  $row = $y * $stride
  for ($x = 0; $x -lt $w; $x++) {
    if ($buf[$row + $x*4 + 3] -gt 20) {
      if ($x -lt $minx) { $minx=$x }; if ($x -gt $maxx) { $maxx=$x }
      if ($y -lt $miny) { $miny=$y }; if ($y -gt $maxy) { $maxy=$y }
    }
  }
}

[System.Runtime.InteropServices.Marshal]::Copy($buf, 0, $data.Scan0, $bytes)
$out.UnlockBits($data)

if ($maxx -lt $minx) {
  $out.Save($dstFull, [System.Drawing.Imaging.ImageFormat]::Png)
} else {
  $pad = 4
  $minx = [math]::Max(0, $minx-$pad); $miny = [math]::Max(0, $miny-$pad)
  $maxx = [math]::Min($wm1, $maxx+$pad); $maxy = [math]::Min($hm1, $maxy+$pad)
  $crop = [System.Drawing.Rectangle]::new($minx, $miny, $maxx-$minx+1, $maxy-$miny+1)
  $cropped = $out.Clone($crop, $fmt)
  $cropped.Save($dstFull, [System.Drawing.Imaging.ImageFormat]::Png)
  $cropped.Dispose()
}
$out.Dispose()
Write-Output "OK -> $dstFull  ($($maxx-$minx+1)x$($maxy-$miny+1))  tol=$Tol"
