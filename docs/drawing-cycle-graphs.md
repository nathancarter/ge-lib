
# Drawing Cycle Graphs

This file documents how to use `ge-lib.js` to draw cycle graphs.

This file expects that you have read the [Basic API](basic-api.md) document.

## Construction

To create a cycle graph, just pass a group object to the `CycleGraph`
constructor:

```js
const cg = new GE.CycleGraph( GE.Library.loadByName( 'Z_5' ) );
```

## Optional highlighting

The content of this section is not necessary to visualize your cycle graph;
you can jump to the next section immediately if your cycle graph doesn't
require highlighting any elements.

You can highlight a partition of the elements using any of the following
methods:

```js
var partition;
// highlight background to show conjugacy classes
partition = cg.group.conjugacyClasses.map( cl => cl.toArray() );
cg.highlightByBackground( partition );
// highlight border to show order classes
partition = cg.group.orderClasses.map( cl => cl.toArray() );
cg.highlightByBorder( partition );
// you can also highlightByTop()
```

To highlight just a subset instead of a partition, treat that subset as if
it were a one-part (usually non-exhaustive) "partition," like so:

```js
const subset = cg.group.subgroups[1];
cg.highlightByBackground( [ subset ] );
```

This puts all elements outside the subset into another part of the
partition, which receives no highlighting.

## Making an SVG, PDF, or PNG

To draw a cycle graph as an SVG, PDF, or PNG, create an instance of the
`CycleGraphRenderer` class, passing your `CycleGraph` to the constructor.

```js
const toBeDrawn = new GE.CycleGraphRenderer( cg );
```

To dump the result to a file, use any one of the following calls.

```js
toBeDrawn.renderSVGFile( 'cycle-graph.svg' );
toBeDrawn.renderPDFFile( 'cycle-graph.pdf' );
toBeDrawn.renderPNGFile( 'cycle-graph.png' );
```

All are asynchronous and take an optional callback as second argument. The
reason for this is that they begin by doing a bunch of asynchronous
renderings of element names from MathML to SVGs before using the results to
compute best sizes for the resulting renderings.

*Consequently it is important to NOT run more than one of those commands in
immediate succession.*  Since they are asynchronous, they will try to run
simultaneously on the same object (`toBeDrawn`) and thus will be
simultaneously manipulating its internal state, which can result in
incorrect results.

## A complete example

We provide a minimal script that can create an SVG, PDF, or PNG file for the
cycle graph of a group, together with the resulting images.

 * [Script: `examples/cycle-graph.js`](../examples/cycle-graph.js)
 * [Result: `examples/cycle-graph.svg`](../examples/cycle-graph.svg)
 * [Result: `examples/cycle-graph.pdf`](../examples/cycle-graph.pdf)
 * [Result: `examples/cycle-graph.png`](../examples/cycle-graph.png)

## Properties of cycle graph objects

You can access the following properties of the `CycleGraph` object (not the
`CycleGraphRenderer` object).

 * Its bounding box
    * `cg.bbox.left`
    * `cg.bbox.top`
    * `cg.bbox.right`
    * `cg.bbox.bottom`
 * The position of any given element in the group (which is an index
   from 0 to the size of the group minus one)
    * `cg.positions[element].x`
    * `cg.positions[element].y`
 * Any highlighting that each element may have (can be undefined)
    * `cg.highlights.background[element]`
    * `cg.highlights.border[element]`
    * `cg.highlights.top[element]`
 * The list of paths drawn beneath the elements in the cycle graph
   is `cg.cyclePaths`, with the following data on each path
    * The number of points in the path and the coordinates of each
      (because each path is just a lot of line segments, a piecewise
      linear approximation to a curve, which the renderer reconstructs
      into a cubic Bézier curve by fitting a model to the data)
       * `cg.cyclePaths[i].length`
       * `cg.cyclePaths[i][j].x`
       * `cg.cyclePaths[i][j].y`
    * The index of the part in the partition of the group into which
      this path falls (although technically the cycle graph's "petals"
      partition the group without its identity element)
       * `cg.cyclePaths[i].partIndex`
    * The index of the cycle within one part of the partition (because
      each "petal" may have many cycles within it)
       * `cg.cyclePaths[i].cycleIndex`
    * The index of the path within its cycle (because each cycle may
      have many vertices, and we place a path to connect each
      successive pair)
       * `cg.cyclePaths[i].pathIndex`
