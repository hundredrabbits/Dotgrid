# Dotgrid

<img src="https://raw.githubusercontent.com/hundredrabbits/100r.co/master/media/content/characters/dotgrid.hello.png" width="300"/>

Dotgrid is a <strong>grid-based vector drawing software</strong> designed to create logos, icons and type. It supports layers, the full SVG specs and additional effects such as mirroring and radial drawing. Dotgrid exports to both PNG and SVG files.
  
The <a href="http://github.com/hundredrabbits/Orca" target="_blank" rel="noreferrer" class="external ">application</a> was initially created for internal use, and later made available as a free and <a href="https://github.com/hundredrabbits/Dotgrid" target="_blank" rel="noreferrer" class="external ">open source</a> software.

Learn more by reading the <a href="https://github.com/Hundredrabbits/Dotgrid" target="_blank" rel="noreferrer" class="external ">manual</a>, or have a look at a <a href="https://www.youtube.com/watch?v=Xt1zYHhpypk" target="_blank" rel="noreferrer" class="external ">tutorial video</a>. If you need <b>help</b>, visit the <a href="https://hundredrabbits.itch.io/dotgrid/community" target="_blank" rel="noreferrer" class="external ">Community</a>.

<img src='https://raw.githubusercontent.com/hundredrabbits/Dotgrid/master/PREVIEW.jpg' width="600"/>

## Guide

View the [guide](https://100r.co/pages/dotgrid.html#introduction).

## Electron Build

```
cd desktop
npm install
npm start
```

## UDP Controls

Dotgrid can be controlled by UDP via the port `49161`. It expects messages up to 6 characters.

- **layer** `0/1/2`
- **type** `l/c/r/z` (`l`:line, `c`:clock-wise arc, `r`: cc-wise arc, `z`: close, `.`:clear, `*`: draw)
- **from** `0-z``0-z`
- **to** `0-z``0-z`

## Extras

- This application supports the [Ecosystem Theme](https://github.com/hundredrabbits/Themes).
- Support this project through [Patreon](https://patreon.com/100).
- See the [License](LICENSE.md) file for license rights and limitations (MIT).
- Pull Requests are welcome!
