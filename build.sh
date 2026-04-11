#!/bin/bash
echo "Building Perimeter App..."
pyinstaller --noconfirm --onedir --windowed --add-data "templates:templates" --name "Perimeter" app.py
echo "Build complete! Check the 'dist/Perimeter' folder."
