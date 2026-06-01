@echo off
title MS Ita's Fury - Jugar en celular (red local)
echo Preparando el servidor para tu red local (WiFi)...
echo Acepta la ventana de administrador de Windows que aparecera.
echo.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0serve-lan.ps1"
