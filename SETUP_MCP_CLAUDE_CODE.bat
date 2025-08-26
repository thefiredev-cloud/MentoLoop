@echo off
echo ========================================
echo Claude Code CLI - MCP Setup Script
echo ========================================
echo.

echo Creating configuration directory...
if not exist "%APPDATA%\claude-desktop" mkdir "%APPDATA%\claude-desktop"

echo Copying MCP configuration...
copy /Y "claude_desktop_config.json" "%APPDATA%\claude-desktop\claude_desktop_config.json"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo SUCCESS: MCP configuration installed!
    echo.
    echo Next steps:
    echo 1. Set your environment variables from .env.local
    echo 2. Restart Claude Code CLI
    echo 3. Test with: claude "Check my Convex deployment status"
) else (
    echo.
    echo ERROR: Failed to copy configuration file
    echo Please manually copy claude_desktop_config.json to:
    echo %APPDATA%\claude-desktop\
)

echo.
pause