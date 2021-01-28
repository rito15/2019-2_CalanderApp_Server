:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
::::::::: 깃헙 웹 - 로컬 리포지토리 연결 배치파일 :::::::::
:::::::::                                         :::::::::
::::::::: 준비물                                  :::::::::
::::::::: 1. github.com에 리포지토리 만들기       :::::::::
::::::::: 2. 해당 URL(https~.git) 복사            :::::::::
:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

@echo off

chcp 65001
cls

set /p url="깃헙 URL(https~.git) > "

cd .

git init

git add .

git commit -m "init"

git branch -M main

git remote add origin %url%

git push -u origin main
echo.==============================
echo. 깃헙 리포지토리 연결 완료 !
echo.==============================

pause > nul
