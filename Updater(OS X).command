#!/bin/bash
cd ~/Github/HundredRabbits/Dotgrid/
electron-packager . Dotgrid --platform=darwin --arch=x64 --out ~/Desktop/ --overwrite --electron-version=1.7.5 --icon=icon.icns
mv -v ~/Desktop/Dotgrid-darwin-x64/Dotgrid.app /Applications/
rm -r ~/Desktop/Dotgrid-darwin-x64/
open -a "Dotgrid"