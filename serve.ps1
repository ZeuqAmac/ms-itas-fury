# ============================================================
#  Servidor local para jugar MS Ita's Fury
#  Uso:  click derecho > "Ejecutar con PowerShell"
#        o en una terminal:  .\serve.ps1
#  Luego abre:  http://localhost:8000
# ============================================================
param([int]$Port = 8000)

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$prefix = "http://localhost:$Port/"

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add($prefix)
try { $listener.Start() } catch {
  Write-Host "No se pudo abrir el puerto $Port. ¿Ya está en uso? Prueba: .\serve.ps1 -Port 8080" -ForegroundColor Red
  exit 1
}

Write-Host "==============================================" -ForegroundColor Yellow
Write-Host " MS Ita's Fury  ->  $prefix" -ForegroundColor Yellow
Write-Host " Sirviendo: $root" -ForegroundColor DarkYellow
Write-Host " Abre esa URL en tu navegador. Ctrl+C para detener." -ForegroundColor Yellow
Write-Host "==============================================" -ForegroundColor Yellow

# Intenta abrir el navegador automáticamente
Start-Process $prefix | Out-Null

$mime = @{
  '.html'='text/html; charset=utf-8'; '.js'='application/javascript; charset=utf-8';
  '.css'='text/css'; '.png'='image/png'; '.jpg'='image/jpeg'; '.json'='application/json';
  '.webmanifest'='application/manifest+json; charset=utf-8'; '.ico'='image/x-icon';
}

while ($listener.IsListening) {
  try {
    $ctx = $listener.GetContext()
    $rel = [System.Uri]::UnescapeDataString($ctx.Request.Url.AbsolutePath.TrimStart('/'))
    if ([string]::IsNullOrEmpty($rel)) { $rel = 'index.html' }
    $path = Join-Path $root $rel

    if (Test-Path $path -PathType Leaf) {
      $bytes = [System.IO.File]::ReadAllBytes($path)
      $ext = [System.IO.Path]::GetExtension($path).ToLower()
      if ($mime.ContainsKey($ext)) { $ctx.Response.ContentType = $mime[$ext] }
      $ctx.Response.ContentLength64 = $bytes.Length
      $ctx.Response.OutputStream.Write($bytes, 0, $bytes.Length)
    } else {
      $ctx.Response.StatusCode = 404
      $msg = [System.Text.Encoding]::UTF8.GetBytes("404: $rel")
      $ctx.Response.OutputStream.Write($msg, 0, $msg.Length)
    }
    $ctx.Response.OutputStream.Close()
  } catch {
    # cliente cerró la conexión; seguimos
  }
}
