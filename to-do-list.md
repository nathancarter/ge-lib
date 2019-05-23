
# To-do list

## Cayley diagrams

 * Finish `CycleDiagramRenderer`:
    * Support curved lines
    * Consider replacing spheres with disc billboards before you proceed
      with any of the rest of this stuff
    * Add labels
    * Support highlighting node backgrounds
    * Support highlighting nodes by ring
    * Support highlighting nodes by square
 * Complete the "Properties of Cayley Diagrams" section of the documetation.
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
 * Document those features that Cayley diagrams share with Symmetry
   Objects, such as zoom, line width, etc.
 * Add features to the `CayleyDiagramRenderer` class that support the
   following features that we support in 3D diagrams in GE.  Try
   to do so in a way that is re-usabale for symmetry objects later.
```js
cayleyDiagram.labelSize
cayleyDiagram.arrowheadPlacement
cayleyDiagram.arrowColors
```

## Finding groups

Don't forget to document the rest of the `GE.IsomorphicGroups` features
as well.

## Known issues

 * `mathml2text` does not work because no `XSLTProcessor` is
   available.  I couldn't find an equivalent tool on npm,
   though some things are close to what's needed.  (The best
   one seems to process strings instead of XML trees and/or
   DOM hierarchies.)  Thankfully so far I haven't needed this,
   because `mathjax-node` has been doing everthing I need.
