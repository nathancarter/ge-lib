
# Drawing Multiplication Tables

This file will document how to use `ge-lib.js` to draw multiplication
tables. This is a first draft, so expect rough edges.

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

This is still in development; check back later.

<!--

To draw a multiplication table as an SVG, PDF, or PNG, create an instance of
the `MulttableRenderer` class, passing your `Multtable` to the constructor.

```js
const toBeDrawn = new GE.MulttableRenderer( cg );
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

-->

## A complete example

This is still in development; check back later.

<!--

We provide a minimal script that can create an SVG, PDF, or PNG file for the
multiplication table of a group, together with the resulting images.

 * [Script: `examples/multiplication-table.js`](../examples/multiplication-table.js)
 * [Result: `examples/multiplication-table.svg`](../examples/multiplication-table.svg)
 * [Result: `examples/multiplication-table.pdf`](../examples/multiplication-table.pdf)
 * [Result: `examples/multiplication-table.png`](../examples/multiplication-table.png)

-->

## Properties of multiplication table objects

You can access the following properties of the `Multtable` object
(not the `MulttableRenderer` object).

 * To be filled in (documentation not yet complete)

## Old example

The following example was provided before there was a way to actually draw
multiplication tables with `MulttableRenderer`.  It is kept here merely for
reference.

```js
const showMultTable = mt => {
    console.log( `Multiplication Table for "${mt.group.shortName}"`
               + ` (${mt.size}x${mt.size}):` );
    for ( var i = 0 ; i < mt.group.order ; i++ ) {
        const row = mt.elements[i], rowpos = mt.position( i );
        var content = [ ], dims = [ ],
            colors = [ ], borders = [ ], corners = [ ];
        for ( var j = 0 ; j < mt.group.order ; j++ ) {
            const col = mt.elements[j], colpos = mt.position( j );
            const prod = mt.group.mult( row, col );
            content.push( `(${i},${j}): ${prod}` );
            dims.push( `1x1 @ (${rowpos},${colpos})` );
            colors.push( mt.colors[prod] );
            if ( mt.borders ) borders.push( mt.borders[prod] );
            if ( mt.corners ) corners.push( mt.corners[prod] );
        }
        console.log( `\t${content.join( '\t\t' )}` );
        console.log( `\t${dims.join( '\t\t' )}` );
        console.log( `\t${colors.join( '\t' )}` );
        if ( mt.borders ) console.log( `\t${borders.join( '\t\t' )}` );
        if ( mt.corners ) console.log( `\t${corners.join( '\t\t' )}` );
        if ( i < mt.group.order - 1 )
            console.log( `\t${colors.map( _ => '---' ).join( '\t\t\t' )}` );
    }
};
```
