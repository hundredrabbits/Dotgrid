# Dotgrid

[Dotgrid](http://wiki.xxiivv.com/dotgrid) is a simple vector drawing application that works directly [in the browser](https://hundredrabbits.github.io/Dotgrid/).

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

Dotgrid can be controlled by UDP via the port `49160`. It expects messages of 6 characters.

- **layer** `0/1/2`
- **type** `l/a/r/c`
- **from** `0-z``0-z`
- **to** `0-z``0-z`

## Extras

- This application supports the [Ecosystem Theme](https://github.com/hundredrabbits/Themes).
- Support this project through [Patreon](https://patreon.com/100).
- See the [License](LICENSE.md) file for license rights and limitations (MIT).
- Pull Requests are welcome!
