@echo off
cd /d "%~dp0"

echo ========================================
echo   HELMET HUB — Git Push to GitHub
echo ========================================
echo.

:: Clean any stale git locks
if exist ".git\index.lock" (
    echo Cleaning index lock...
    del /f ".git\index.lock"
)
if exist ".git\HEAD.lock" (
    echo Cleaning HEAD lock...
    del /f ".git\HEAD.lock"
)

:: Show what changed
echo Changed files:
git status --short
echo.

:: Stage everything
echo Adding all changes...
git add -A

:: Commit with fixed message (no prompt needed)
set MSG=fix: static filters, bottom nav reveals on scroll, swipeable feature cards
echo Committing: %MSG%
git commit -m "%MSG%"

:: Push
echo.
echo Pushing to GitHub...
git push origin main

echo.
echo ========================================
echo   Done! Vercel will auto-deploy in ~1 min
echo   Check: https://vercel.com/dashboard
echo ========================================
echo.
pause
