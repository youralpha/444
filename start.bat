@echo off
echo Starting PERIMETR System...

echo 1. Starting Backend...
start cmd /k "pip install -r requirements.txt && python app.py"

echo 2. Starting Frontend...
start cmd /k "cd frontend && npm install && npm run dev"

echo Done! The app should open at http://localhost:5173 shortly.
