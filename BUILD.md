## Build

Don't forget to ```npm cache clean```!

### Build Linux64 / Darwin64 / Windows64(Offsite)

```
cd /xxiivv/Nataniev/public/public.projects/sources/Dotgrid/

git pull

rm -r /xxiivv/Nataniev/public/public.projects/builds/Dotgrid-linux-x64/ 
rm /xxiivv/Nataniev/public/public.projects/builds/dotgrid_lin64.zip
electron-packager . Dotgrid --platform=linux --arch=x64 --out /xxiivv/Nataniev/public/public.projects/builds --overwrite --electron-version=1.7.5 --icon=icon.ico

rm -r /xxiivv/Nataniev/public/public.projects/builds/Dotgrid-win32-x64/ 
rm /xxiivv/Nataniev/public/public.projects/builds/dotgrid_win64.zip
electron-packager . Dotgrid --platform=win32 --arch=x64 --out /xxiivv/Nataniev/public/public.projects/builds --overwrite --electron-version=1.7.5 --icon=icon.ico

rm -r /xxiivv/Nataniev/public/public.projects/builds/Dotgrid-darwin-x64/
rm /xxiivv/Nataniev/public/public.projects/builds/dotgrid_osx64.zip
electron-packager . Dotgrid --platform=darwin --arch=x64 --out /xxiivv/Nataniev/public/public.projects/builds --overwrite --electron-version=1.7.5 --icon=icon.icns

cd /xxiivv/Nataniev/public/public.projects/builds/

~/butler push /xxiivv/Nataniev/public/public.projects/builds/Dotgrid-linux-x64/ hundredrabbits/dotgrid:linux-64
~/butler push /xxiivv/Nataniev/public/public.projects/builds/Dotgrid-win32-x64/ hundredrabbits/dotgrid:windows-64
~/butler push /xxiivv/Nataniev/public/public.projects/builds/Dotgrid-darwin-x64/ hundredrabbits/dotgrid:osx-64

~/butler status hundredrabbits/dotgrid

rm -r /xxiivv/Nataniev/public/public.projects/builds/Dotgrid-darwin-x64/
rm -r /xxiivv/Nataniev/public/public.projects/builds/Dotgrid-linux-x64/
rm -r /xxiivv/Nataniev/public/public.projects/builds/Dotgrid-win32-x64/
```


### Build Linux64 / Darwin64 / Windows64(Local)
```
cd /Users/VillaMoirai/Desktop/
rm -r /Users/VillaMoirai/Desktop/Dotgrid-darwin-x64/ 
rm -r /Users/VillaMoirai/Desktop/Dotgrid-linux-x64/ 
rm -r /Users/VillaMoirai/Desktop/Dotgrid-win32-x64/ 

cd /Users/VillaMoirai/Github/HundredRabbits/Dotgrid/
electron-packager . Dotgrid --platform=darwin --arch=x64 --out /Users/VillaMoirai/Desktop/ --overwrite --electron-version=1.7.5 --icon=icon.icns

cd /Users/VillaMoirai/Github/HundredRabbits/Dotgrid/
electron-packager . Dotgrid --platform=linux --arch=x64 --out /Users/VillaMoirai/Desktop/ --overwrite --electron-version=1.7.5 --icon=icon.ico

cd /Users/VillaMoirai/Github/HundredRabbits/Dotgrid/
electron-packager . Dotgrid --platform=win32 --arch=x64 --out /Users/VillaMoirai/Desktop/ --overwrite --electron-version=1.7.5 --icon=icon.ico
```

### Build 
```
cd /Users/VillaMoirai/Desktop/
rm -r /Users/VillaMoirai/Desktop/Dotgrid-darwin-x64/ 
rm -r /Users/VillaMoirai/Desktop/Ronin-darwin-x64/ 
rm -r /Users/VillaMoirai/Desktop/Left-darwin-x64/ 
rm -r /Users/VillaMoirai/Desktop/Marabu-darwin-x64/ 

cd /Users/VillaMoirai/Github/HundredRabbits/Dotgrid/
electron-packager . Dotgrid --platform=darwin --arch=x64 --out /Users/VillaMoirai/Desktop/ --overwrite --electron-version=1.7.5 --icon=icon.icns

cd /Users/VillaMoirai/Github/HundredRabbits/Ronin/
electron-packager . Ronin --platform=darwin --arch=x64 --out /Users/VillaMoirai/Desktop/ --overwrite --electron-version=1.7.5 --icon=icon.icns

cd /Users/VillaMoirai/Github/HundredRabbits/Left/
electron-packager . Left --platform=darwin --arch=x64 --out /Users/VillaMoirai/Desktop/ --overwrite --electron-version=1.7.5 --icon=icon.icns

cd /Users/VillaMoirai/Github/HundredRabbits/Marabu/
electron-packager . Marabu --platform=darwin --arch=x64 --out /Users/VillaMoirai/Desktop/ --overwrite --electron-version=1.7.5 --icon=icon.icns
```



