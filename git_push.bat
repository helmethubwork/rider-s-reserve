@echo off
cd /d "%~dp0"

echo ========================================
echo   HELMET HUB - Git Push to GitHub
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

:: Commit. --allow-empty means we still create a commit when nothing changed,
:: which gives Vercel a fresh push event to react to. Without it, a run that
:: finds no changes leaves Vercel sitting on the previous build.
set MSG=chore: trigger deployment
echo Committing: %MSG%
git commit --allow-empty -m "%MSG%"

:: Push
echo.
echo Pushing to GitHub...
git push origin main

echo.
echo ========================================
echo   Pushed. Vercel should build in ~1 min
echo.
echo   If NO new deployment appears:
echo     Vercel - Settings - Git - check the
echo     repository is still connected.
echo ========================================
echo.
pause
