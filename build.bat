@echo off
echo Building Perimeter App for Windows...
pyinstaller --noconfirm --onedir --windowed --add-data "templates;templates" --name "Perimeter" app.py
echo Build complete! Check the 'dist/Perimeter' folder for your executable.
pause
