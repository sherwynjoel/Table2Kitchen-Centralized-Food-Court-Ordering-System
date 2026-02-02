@echo off
echo Starting Table2Kitchen Server for Mall Deployment...
echo ===================================================

:: Check if build exists (simple check for .next folder)
if not exist ".next" (
    echo Building application for production...
    call npm run build
) else (
    echo Build found. Starting...
    echo (If you updated code, run 'npm run build' manually first)
)

echo.
echo Server is starting...
echo ACCESS URL: http://%ComputerName%:3000  OR  Check IP below
ipconfig | findstr "IPv4"
echo ===================================================

:: Set production environment
set NODE_ENV=production
call npm start

pause
