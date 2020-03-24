#!/bin/bash

rm -r 'release'
mkdir 'release'
cp 'index.html' 'release/index.html'
cp 'README.txt' 'release/README.txt'
~/Applications/butler push ~/Repositories/Hundredrabbits/Dotgrid/release hundredrabbits/dotgrid:osx-64
~/Applications/butler push ~/Repositories/Hundredrabbits/Dotgrid/release hundredrabbits/dotgrid:linux-64
~/Applications/butler push ~/Repositories/Hundredrabbits/Dotgrid/release hundredrabbits/dotgrid:windows-64
~/Applications/butler status hundredrabbits/dotgrid
rm -r 'release'