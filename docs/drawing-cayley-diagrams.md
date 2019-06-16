
# Drawing Cayley Diagrams

This file will document how to use `ge-lib.js` to draw Cayley diagrams.
But it does not yet do so, because that feature is not yet implemented.

This file expects that you have read the
[Basic API](basic-api.md) document.

## Construction

To create a Cayley diagram, just pass a group object to the `CayleyDiagram`
constructor:

```js
const A_4 = GE.Library.loadByName( 'A_4' );
const cd = new GE.CayleyDiagram( A_4 );
```

Some groups come with predefined Cayley diagram layouts that are
aesthetically pleasing.  To construct one of those, pass its name as the
second parameter to the constructor, like this:

```js
const cd = new GE.CayleyDiagram( A_4, 'Truncated tetrahedron' );
```

To figure out what names are valid for a particular group, run code like
this:

```js
console.log( A_4.cayleyDiagrams.map( obj => obj.name ) );
```

Or just use the first one (as long as there is at least one):

```js
const cd = new GE.CayleyDiagram( A_4, A_4.cayleyDiagrams[0].name );
```

## Making an SVG, PDF, or PNG

This has not yet been implemented.

To draw a Cayley diagram as an SVG, PDF, or PNG, create an instance of the
`CayleyDiagramRenderer` class, passing your `CayleyDiagram` to the
constructor.

```js
const toBeDrawn = new GE.CayleyDiagramRenderer( cd );
```

To dump the result to a file, use any one of the following calls.

```js
toBeDrawn.renderSVGFile( 'cayley-diagram.svg' );
toBeDrawn.renderPDFFile( 'cayley-diagram.pdf' );
toBeDrawn.renderPNGFile( 'cayley-diagram.png' );
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

## Options

You can set the following options that will be respected when rendering the
resulting representation of the 3D scene.  Each is specified by calling
`set( 'optionName', value )` in the `CayleyDiagramRenderer` after
constructing it and before calling `renderSVGFile()`, `renderPDFFile()`, or
`renderPNGFile()`.

 * `cameraPos` - same as for Symmetry Objects;
   [see documentation there](drawing-symmetry-objects.md#options)
 * `cameraUp` - same as for Symmetry Objects;
   [see documentation there](drawing-symmetry-objects.md#options)

## A complete example

We provide a minimal script that can create an SVG, PDF, or PNG file for a
Cayley diagram of a group, together with the resulting images.

 * [Script: `examples/cayley-diagram.js`](../examples/cayley-diagram.js)
 * [Result: `examples/cayley-diagram.svg`](../examples/cayley-diagram.svg)
 * [Result: `examples/cayley-diagram.pdf`](../examples/cayley-diagram.pdf)
 * [Result: `examples/cayley-diagram.png`](../examples/cayley-diagram.png)

## Properties of Cayley diagrams

You can access the following properties of the `CayleyDiagram` instance
(not the `CayleyDiagramRenderer` instance).

 * The name of the diagram, if it was one that was built into the group
   definition in Group Explorer, as opposed to auto-generated
    * `cd.diagram_name`
 * The placement of arrowheads along the lines/curves on which they sit
    * `cd.arrowheadPlacement` (defaults to 1)
    * Set this to any value in the range 0 to 1.
    * For example, 0.5 means the midpoint of the curve, and 1 means its end.
 * The following properties are the same for Cayley diagrams as for
   objects of symmetry; see
   [the documentation there](drawing-symmetry-objects.md#properties-of-symmetry-objects)
   for details.
    * `cd.nodes`
    * `cd.lines`
    * `cd.zoomLevel`
    * `cd.lineWidth`
    * `cd.nodeScale`
    * `cd.fogLevel`

## Old example

The following example was provided before there was a way to actually draw
Cayley diagrams with `CayleyDiagramRenderer`.  It is kept here merely for
reference.

```js
const dumpCayleyDiagram = ( cd, precision = 3 ) => {
    const f = n => Number( n ).toFixed( precision );
    console.log( `Cayley diagram for "${cd.group.shortName}":` );
    cd.nodes.map( node => {
        const color = new THREE.Color( node.color );
        console.log( `\t${node.element} @ `
                   + `(${f(node.point.x)},${f(node.point.y)},${f(node.point.z)}), `
                   + `rgb: (${f(color.r)},${f(color.g)},${f(color.b)}), ${node.label}` );
        // node.radius is typically undefined, so not dumping that out here
        if ( node.colorHighlight )
            console.log( `\t\tColor highlight: ${node.colorHighlight}` );
        if ( node.ringHighlight )
            console.log( `\t\tRing highlight: ${node.ringHighlight}` );
        if ( node.squareHighlight )
            console.log( `\t\tSquare highlight: ${node.squareHighlight}` );
    } );
    cd.lines.map( line => {
        const arrow = line.arrowhead ? '->' : '--';
        const cgroup = line.vertices[0].curvedGroup.map( v => v.element ).sort().join( ',' );
        const style = line.style ? `curve in ${cgroup}`
                                 : 'line';
        console.log( `\t${line.arrow}-arrow: `
                   + `${line.vertices[0].element}${arrow}${line.vertices[1].element} `
                   + `${line.color} ${style}` );
        // not reporting line.offset here, but it's the user-edited curvature
    } );
};
```
