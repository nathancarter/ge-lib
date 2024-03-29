
# Drawing Multiplication Tables

This file documents how to use `ge-lib.js` to draw multiplication tables.

This file expects that you have read the
[Basic API](basic-api.md) document.

## Construction

To create a multiplication table, just pass a group object to the
`Multtable` constructor:

```js
const mt = new GE.Multtable( GE.Library.loadByName( 'Z_5' ) );
```

## Optional highlighting

You can highlight group elements or partitions in multiplication tables in
exactly the same way that you can highlight them in cycle graphs.  We do not
repeat the documentation here; see [the relevant portion of the cycle graph
documentation](drawing-cycle-graphs.md#optional-highlighting).

The only difference is that multiplication tables permit highlighting by
cell corners rather than tops; these are the relevant three functions.

```js
mt.highlightByBackground( partition ); // or [ subset ]
mt.highlightByBorder( partition ); // or [ subset ]
mt.highlightByCorner( partition ); // or [ subset ]
```

## Making an SVG, PDF, or PNG

To draw a multiplication table as an SVG, PDF, or PNG, create an instance of
the `MulttableRenderer` class, passing your `Multtable` to the constructor.

```js
const toBeDrawn = new GE.MulttableRenderer( mt );
```

To dump the result to a file, use any one of the following calls.

```js
toBeDrawn.renderSVGFile( 'multiplication-table.svg' );
toBeDrawn.renderPDFFile( 'multiplication-table.pdf' );
toBeDrawn.renderPNGFile( 'multiplication-table.png' );
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
multiplication table of a group, together with the resulting images.

 * [Script: `examples/multiplication-table.js`](../examples/multiplication-table.js)
 * [Result: `examples/multiplication-table.svg`](../examples/multiplication-table.svg)
 * [Result: `examples/multiplication-table.pdf`](../examples/multiplication-table.pdf)
 * [Result: `examples/multiplication-table.png`](../examples/multiplication-table.png)

## Properties of multiplication table objects

You can access the following properties of the `Multtable` object
(not the `MulttableRenderer` object).

 * The elements of the group, in the order they appear across the top row
   of the table (which is the same order in which they appear down its
   leftmost column as well)
    * `mt.elements`
 * How to separate the cosets of a chosen subgroup
    * `mt.separation` - the distance to separate cosets,
      0 for no separation, 1 to separate them by the size of a single table
      cell, or any other number
    * `mt.stride` - the order of the coset by which we're separating.
      Ensure that the coset's elements are the first `mt.stride` entries in
      `mt.elements`.  An easy way to do so is with the following function.
```js
// if 0 <= i < group.subgroups.length:
mt.organizeBySubgroup( group.subgroups[i] );
```
 * The color scheme to use for cell backgrounds, from a choice of three:
    * Set `mt.colors = Multtable.COLORATION_RAINBOW` for the default
      behavior, which colors elements from red through purple hues.
    * Set `mt.colors = Multtable.COLORATION_GRAYSCALE` to use shades
      of gray instead.
    * Set `mt.colors = Multtable.COLORATION_NONE` to use no background
      colors for cells.
