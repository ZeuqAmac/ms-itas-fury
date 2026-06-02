# ============================================================
#  serve-lan.ps1 — Sirve el juego en tu RED LOCAL (WiFi) para
#  jugarlo desde el celular. Requiere admin (abre el puerto en
#  el firewall y escucha en todas las interfaces).
#
#  Uso fácil: doble clic en  Jugar-en-celular.cmd
# ============================================================
param([int]$Port = 8000)

$ErrorActionPreference = 'Stop'

# --- Auto-elevar a administrador si hace falta ---
$principal = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
if (-not $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
  Write-Host "Pidiendo permisos de administrador (acepta la ventana de Windows)..." -ForegroundColor Yellow
  $exe = (Get-Process -Id $PID).Path
  Start-Process -FilePath $exe -Verb RunAs -ArgumentList @(
    '-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', "`"$PSCommandPath`"", '-Port', "$Port"
  )
  exit
}

$root = Split-Path -Parent $MyInvocation.MyCommand.Path

# --- Regla de firewall (entrante) para el puerto ---
$ruleName = "MS Ita's Fury"
cmd /c "netsh advfirewall firewall delete rule name=`"$ruleName`"" 2>$null | Out-Null
cmd /c "netsh advfirewall firewall add rule name=`"$ruleName`" dir=in action=allow protocol=TCP localport=$Port" | Out-Null

# --- Detectar la IP de tu PC en la RED LOCAL (ignorando VPNs) ---
$vpn = 'Nord|VPN|Lynx|Tailscale|WireGuard|TAP|Hyper-V|Virtual|Loopback|vEthernet'
$cands = Get-NetIPAddress -AddressFamily IPv4 -ErrorAction SilentlyContinue | Where-Object {
  $_.IPAddress -notmatch '^(127\.|169\.254\.)' -and
  $_.InterfaceAlias -notmatch $vpn -and
  $_.IPAddress -match '^(192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[01])\.)'
}
$ranked = $cands | Sort-Object `
  @{ Expression = { if ($_.PrefixOrigin -eq 'Dhcp') { 0 } else { 1 } } },
  @{ Expression = { if ($_.IPAddress -like '192.168.*') { 0 } elseif ($_.IPAddress -like '172.*') { 1 } else { 2 } } }
$ip = if ($ranked) { ($ranked | Select-Object -First 1).IPAddress } else { $null }
# último recurso: la interfaz con gateway que no sea VPN
if (-not $ip) {
  $ip = (Get-NetIPConfiguration | Where-Object { $_.IPv4DefaultGateway -and $_.InterfaceAlias -notmatch $vpn } |
         Select-Object -First 1).IPv4Address.IPAddress
}
if (-not $ip) { $ip = '<IP-de-tu-PC>' }

$url = "http://$($ip):$Port/"

# --- Iniciar servidor en todas las interfaces ---
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://+:$Port/")
try { $listener.Start() } catch {
  Write-Host "No se pudo abrir el puerto $Port. ¿Otro programa lo usa? Prueba otro puerto." -ForegroundColor Red
  Read-Host "Enter para salir"; exit 1
}

Write-Host ""
Write-Host "==================================================================" -ForegroundColor Green
Write-Host "  MS Ita's Fury esta listo en tu RED LOCAL" -ForegroundColor Green
Write-Host ""
Write-Host "  1) Conecta tu CELULAR a la MISMA red WiFi que esta PC." -ForegroundColor White
Write-Host "  2) En el navegador del celular abre:" -ForegroundColor White
Write-Host ""
Write-Host "        $url" -ForegroundColor Yellow
Write-Host ""
Write-Host "  (Los controles tactiles apareceran solos en el cel.)" -ForegroundColor DarkGray
Write-Host "  Cierra esta ventana (o Ctrl+C) para detener el juego." -ForegroundColor DarkGray
Write-Host "==================================================================" -ForegroundColor Green

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
  } catch { }
}
