# Dotgrid

Dotgrid is a simple vector drawing application. 

<img src='https://raw.githubusercontent.com/hundredrabbits/Dotgrid/master/PREVIEW.jpg' width="600"/>

## Guide

Clicking on the canvas will insert control points, up to 3CPs. CPs can be moved with the arrows. Clicking one of the path icons, or pressing one of the shortcuts, will draw a stroke between them. The newly created segment's handles can be moved by clicking and dragging them.

## Controls

### Segments

- `a` Draw Arc(counter-clockwise).
- `s` Draw Arc(clockwise).
- `d` Draw Line.
- `f` Draw Bezier.
- `g` Close Path.
- `h` Fill Path.

### Parametric

- `arrows` Move last control point.
- `click/drag` Translate target control point.
- `click+alt` Erase target control point.

### Shortcuts

- `]` Increase stroke size.
- `[` Reduce stroke size.
- `/` Toggle linecap.
- `space` Mirror.
- `escape` Remove control points.
- `~` Double canvas size.

### System 

- `ctrl+n` New canvas.
- `ctrl+s` Export canvas.
- `ctrl+z` Delete last segment.
- `ctrl+shift+backspace` Reset.

## Hacker Mode(Cheatmode)

- `tab` Toggle interface.
- `1204` Will add a control point at x:12,y:4.

## Etc

- You can change the theme by dragging a [.thm](https://github.com/hundredrabbits/Themes) file onto the application.
- You can support this project through [Patreon](https://patreon.com/100).
- See the [LICENSE](LICENSE.md) file for license rights and limitations (MIT).
