@echo off
cd /d "%~dp0"
powershell -ExecutionPolicy Bypass -File "start-with-ngrok.ps1"
pause