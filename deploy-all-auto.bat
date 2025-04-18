@echo off
cd /d "%~dp0"
echo === GIẢI NÉN FRONTEND VÀ BACKEND ===

REM Xoá thư mục .git trong binance-proxy nếu có (để tránh lỗi submodule)
IF EXIST "binance-proxy\.git" (
    echo Đang xoá .git trong binance-proxy...
    rmdir /s /q "binance-proxy\.git"
)

REM Giải nén binance-proxy.zip vào thư mục ./binance-proxy
mkdir binance-proxy
powershell -Command "Expand-Archive -Force 'binance-proxy.zip' 'binance-proxy'"

echo === ĐẨY FRONTEND LÊN GITHUB PAGES ===

cd /d "%~dp0"
IF EXIST ".git" (
    rmdir /s /q .git
)

git init
git remote add origin https://github.com/ntd0312/Binance.git
git branch -M main
git add .
git commit -m "Deploy frontend from script"
git push -f origin main

echo === ĐẨY BACKEND LÊN GITHUB (Render sẽ tự động deploy) ===

cd binance-proxy
IF EXIST ".git" (
    rmdir /s /q .git
)

git init
git remote add origin https://github.com/ntd0312/binance-proxy.git
git branch -M main
git add .
git commit -m "Auto deploy backend from batch"
git push -f origin main
cd ..

echo === HOÀN TẤT! ===
=== start https://github.com/ntd0312/Binance/actions/ ===
pause
