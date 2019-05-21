
# Drawing Cycle Graphs

This file will document how to use `ge-lib.js` to draw cycle graphs.
This is a first draft, so expect rough edges.

## Setup

To start using the module, load it, plus at least one group:

```js
const GE = require( 'ge-lib.js' );
const Z_5 = GE.Library.loadFromFilesystem( './groups/Z_5.group' );
// or to load all groups, which takes 2-3 seconds:
// GE.Library.loadAllFromFilesystem();
// you can then see all group names with GE.Library.map.keys()
// and fetch individual ones with GE.Library.map.get( basename ).
```

To create a cycle graph, just pass a group object to the `CycleGraph`
constructor:

```js
const cg = new GE.CycleGraph( Z_5 );
```

## Properties

You can then access the following properties of the cycle graph.

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

## Simple example

Using the above properties, the following function dumps a text
representation of a cycle graph's data to the JavaScript console.

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

## Drawing SVGs, PDFs, and PNGs

Features not yet implemented; check back later!
