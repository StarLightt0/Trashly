@echo off
title Trashly - Platform Edukasi Pengelolaan Sampah
color 0A

echo ========================================================
echo        TRASHLY - WASTE EDUCATION PLATFORM
echo     React (Client) + Node.js Express + MySQL
echo ========================================================
echo.
echo [1/2] Menjalankan Backend Express API (Port 5000)...
start "Trashly Backend (Port 5000)" cmd /k "cd server && npm run dev"

timeout /t 2 /nobreak >nul

echo [2/2] Menjalankan Frontend React Vite (Port 3000)...
start "Trashly Frontend (Port 3000)" cmd /k "cd client && npm run dev"

echo.
echo ========================================================
echo  Server Backend: http://127.0.0.1:5000
echo  Website Frontend: http://localhost:3000 (atau http://127.0.0.1:3000)
echo  
echo  *Catatan: Pastikan Laragon/XAMPP (MySQL) sudah di-Start!
echo  *Akun Demo: demo@trashly.id | Password: password123
echo ========================================================
echo.
pause
