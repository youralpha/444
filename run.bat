@echo off
echo ====================================================
echo Choose an option:
echo 1) Run Development Server
echo 2) Build Desktop App
echo ====================================================
set /p choice="Enter your choice (1 or 2): "

cd perimetr

echo Installing dependencies...
call npm install

if "%choice%"=="1" (
    echo Running Development Server...
    call npm run tauri dev
) else if "%choice%"=="2" (
    echo Building Desktop App...
    call npm run tauri build
) else (
    echo Invalid choice. Exiting.
)
