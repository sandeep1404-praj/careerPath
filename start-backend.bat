@echo off
echo Starting CareerCompass Backend...
echo.

cd backend

echo Installing dependencies...
npm install

echo.
echo Starting server...
echo Make sure MongoDB is running!
echo.
npm run dev

pause 