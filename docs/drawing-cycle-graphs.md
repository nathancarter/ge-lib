
# Drawing Cycle Graphs

This file will document how to use `ge-lib.js` to draw cycle graphs.
This is a first draft, so expect rough edges.

This file expects that you have read the
[Basic API](basic-api.md) document.

## Construction

To create a cycle graph, just pass a group object to the `CycleGraph`
constructor:

```js
const cg = new GE.CycleGraph( GE.Library.loadByName( 'Z_5' ) );
```

## Optional highlighting

The content of this section is not necessary to visualize your
cycle graph; you can jump to the next section immediately if your
cycle graph doesn't require highlighting any elements.

You can highlight a partition of the elements using any of the
following methods:

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

To highlight just a subset instead of a partition, treat that subset
as if it were a one-part (usually non-exhaustive) "partition," like so:

```js
const subset = cg.group.subgroups[1];
cg.highlightByBackground( [ subset ] );
```

This puts all elements outside the subset into another part of the
partition, which receives no highlighting.

## Making an SVG

To draw a cycle graph as an SVG, create an instance of the
`CycleGraphSVG` class, passing your `CycleGraph` to the constructor.

```js
const toBeDrawn = new GE.CycleGraphSVG( cg );
```

To dump the result to a file, use any one of the following calls.

```js
CGSVG.renderSVGFile( 'cycle-graph.svg' );
CGSVG.renderPDFFile( 'cycle-graph.pdf' );
CGSVG.renderPNGFile( 'cycle-graph.png' );
```

All are asynchronous and take an optional callback as second argument.
The reason for this is that they begin by doing a bunch of asynchronous
renderings of element names from MathML to SVGs before using the
results to compute best sizes for the resulting renderings.

*Consequently it is important to NOT run more than one of those commands in
immediate succession.*  Since they are asynchronous, they will try to run
simultaneously on the same object (`CGSVG`) and thus will be simultaneously
manipulating its internal state, which can result in incorrect results.

## A complete example

We provide a minimal script that can create an SVG, PDF, or PNG file for the
cycle graph of a group, together with the resulting images.

 * [Script: `examples/cycle-graph.js`](../examples/cycle-graph.js)
 * [Result: `examples/cycle-graph.svg`](../examples/cycle-graph.svg)
 * [Result: `examples/cycle-graph.pdf`](../examples/cycle-graph.pdf)
 * [Result: `examples/cycle-graph.png`](../examples/cycle-graph.png)

## Properties of cycle graph objects

You can access the following properties of the `CycleGraph` object
(not the `CycleGraphSVG` object).

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
      linear approximation to a curve)
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

## Old example

The following example was provided before there was a way to actually draw
cycle graphs with `CycleGraphSVG`.  It is kept here merely for reference.

```js
const dumpCycleGraph = ( cg, precision = 3 ) => {
    const f = n => Number( n ).toFixed( precision );
    console.log( `Cycle graph for "${cg.group.shortName}":` );
    console.log( `\tBounding box: (${f(cg.bbox.left)},${f(cg.bbox.top)})--`
               + `(${f(cg.bbox.right)},${f(cg.bbox.bottom)})` );
    console.log( '\tElement positions:' );
    cg.group.elements.map( a => {
        const x = cg.positions[a].x;
        const y = cg.positions[a].y;
        var color = '';
        if ( cg.highlights.background )
            color += ', bkgd:' + cg.highlights.background[a];
        if ( cg.highlights.border )
            color += ', bord:' + cg.highlights.border[a];
        if ( cg.highlights.top )
            color += ', top:' + cg.highlights.top[a];
        console.log( `\t\t${a} is at (${f(x)},${f(y)})${color}` );
    } );
    cg.cyclePaths.map( path => {
        console.log( `\tPart ${path.partIndex}, Cycle ${path.cycleIndex} `
                   + `(${path.cycle.join(',')}), Path ${path.pathIndex}:` );
        console.log( '\t\t' + path.map( point =>
            `(${f(point.x)},${f(point.y)})` ).join( '--' ) );
    } );
};
```
