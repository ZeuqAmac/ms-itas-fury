@echo off
title MS Ita's Fury - Servidor
echo Iniciando MS Ita's Fury...
echo Se abrira tu navegador en http://localhost:8000
echo Cierra esta ventana (o Ctrl+C) para detener el juego.
echo.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0serve.ps1"
pause
