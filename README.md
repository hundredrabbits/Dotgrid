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

- `ctrl+n` New canvas.
- `ctrl+s` Export canvas.
- `ctrl+z` Delete last segment.

## Hacker Mode(Cheatmode)

- `tab` Toggle interface.
- `1204` Will add a control point at x:12,y:4.

## License

See the [LICENSE](LICENSE.md) file for license rights and limitations (CC).
