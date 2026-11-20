@echo off
rem Double-click this file to store the Kaggle tokens for runner.ps1 (it runs setup-tokens.ps1).
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0setup-tokens.ps1"
echo.
pause
