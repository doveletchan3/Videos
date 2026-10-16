@echo off
chcp 65001 >nul
echo ============================================================
echo   正在自動獲取 CTV News Vancouver at Six 最新一期溫哥華新聞...
echo ============================================================
python update_news.py
if %ERRORLEVEL% equ 0 (
    echo.
    echo ✅ 溫哥華六點新聞列表已成功更新為官方最新節目！
    echo 刷新網頁即可直接觀看。
) else (
    echo.
    echo ❌ 獲取更新失敗，請檢查網絡連線或 Python 環境。
)
echo.
pause
