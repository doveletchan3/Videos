@echo off
chcp 65001 >nul
title CTV News Vancouver at Six 自動更新
echo ============================================================
echo   正在自動獲取 CTV News Vancouver at Six 最新溫哥華新聞...
echo ============================================================
echo.
python update_news.py
if errorlevel 1 goto :fail

:success
echo.
echo [OK] 溫哥華六點新聞已成功更新為官方最新節目！
echo 重新整理網頁即可直接觀看。
goto :end

:fail
echo.
echo [ERROR] 獲取更新失敗，請檢查網絡連線或 Python 環境。

:end
echo.
pause
