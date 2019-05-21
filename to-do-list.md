
# To-do list

## Cycle graphs

 * Transfer the knowledge in `showCycleGraph` into an `.md` file.
 * Write a `CycleGraphSVG` class that accepts a `CycleGraph` in its
   constructor, much like `DisplayCycleGraph` does, and that can
   render to a string or to a file.
 * Write a utility for converting an SVG on disk to a PDF or PNG
   by calling the `rsvg-convert` command-line utility.
 * Write a utility for converting an SVG string to a PDF or PNG
   by exporting to a temp file, delegating to the file conversion
   function, and then loading the result.

## Multiplication tables

 * Transfer the knowledge in `showMultTable` into an `.md` file.
 * Write a `MultiplicationTableSVG` class that accepts a `Multtable`
   in its constructor, much like `DisplayMulttable` does, and that
   can render to a string or to a file.
 * To complete the API for everything you can do in GE with MTs:
    * Add to the `.md` doc the
      `multtable.organizeBySubgroup(index)` function.
    * Add to the `.md` doc the constants that can be assigned to
      `multtable.colors`: `Multtable.COLORATION_RAINBOW`,
      `Multtable.COLORATION_GRAYSCALE`, and
      `Multtable.COLORATION_NONE`.
    * Add to the `.md` doc these functions, each of which accepts
      a partition of the group elements:
      `multtable.highlightByBackground()`,
      `multtable.highlightByBorder()`, and
      `multtable.highlightByCorner()`

## Cayley diagrams

 * Transfer the knowledge in `showCayleyDiagram` into an `.md` file.
 * Write a `CycleDiagramSVG` class that accepts a `CayleyDiagram` in
   its constructor, much like `DisplayDiagram` does, and that can
   render to a string or to a file.
 * To complete the API for everything you can do in GE with CDs:
    * Add to the `.md` doc how to create a named CD (and to get the
      list of named CDs for a group).  Create by passing the name to
      the `CayleyDiagram` constructor.  Get the list of names by
      `group.cayleyDiagrams.map( d => d.name )`.
    * Add to the `.md` doc how to specify the strategies for
      generating a CD (setStrategies() on an array of rows of the
      generating table, each row is a length-4 array containing the
      generator, layout (0/1/2=linear/circular/rotated), direction
      (0/1/2=X/Y/Z or YZ/XZ/XY), and nesting level (0..nrows-1)).
    * Add to the `.md` doc how to specify the arrows the diagram
      shows:
```js
cayleyDiagram.removeLines();
cayleyDiagram.addLines( generator ); // repeat as needed
cayleyDiagram.setLineColors();
```
    * Add to the `.md` doc how to specify whether arrows mean
      left vs. right multiplication: by default,
      `cd._right_multiplication` is true; you can set it to false.
    * Add to the `.md` doc how to specify whether to chunk: by
      default, `cd.chunk` is undefined; you can set it to an index
      into the strategy table.
 * Add features to the `CayleyDiagramSVG` class that support the
   following features that we support in 3D diagrams in GE.  Try
   to do so in a way that is re-usabale for symmetry objects later.
```js
cayleyDiagram.zoomLevel
cayleyDiagram.lineWidth
cayleyDiagram.nodeScale
cayleyDiagram.fogLevel
cayleyDiagram.labelSize
cayleyDiagram.arrowheadPlacement
cayleyDiagram.arrowColors
displayDiagram.camera.matrix.toArray()
```

## Symmetry objects

 * Transfer the knowledge in `showSymmetryObject` into an `.md` file.
   In particular, make it clear how to fetch the list of names of all
   symmetry objects for a group, and how to create one from each
   name on the list.
 * Write a `SymmetryObjectSVG` class that accepts a `SymmetryObject`
   in its constructor, much like `DisplayCycleGraph` does, and that
   can render to a string or to a file.
 * Add to the `.md` doc all information from Cayley diagrams that is
   still relevant here (zoom, line thickness, node radius, fog).

## Known issues

 * `mathml2text` does not work because no `XSLTProcessor` is
   available.  I couldn't find an equivalent tool on npm,
   though some things are close to what's needed.  (The best
   one seems to process strings instead of XML trees and/or
   DOM hierarchies.)

## Random notes

 * To convert an SVG to a PDF:
```sh
# Assuming you've installed librsvg using apt-get/brew/etc.:
rsvg-convert -f pdf -o myfile.pdf myfile.svg
```

 * Note that I tried installing the following node package, but
   it has build errors that many people are experiencing, so it
   doesn't seem ready yet for prime time.
   https://www.npmjs.com/package/rsvg
