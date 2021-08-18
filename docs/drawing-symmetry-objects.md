
# Drawing Symmetry Objects

This file documents how to use `ge-lib.js` to draw symmetry objects.

This file expects that you have read the
[Basic API](basic-api.md) document.

## Construction

To create a symmetry object, you must call the static `generate` function in
the `SymmetryObject` class, passing the group and the name of one of its
built-in objects of symmetry.

```js
const A_5 = GE.Library.loadByName( 'A_5' );
const so = GE.SymmetryObject.generate( A_5, 'Icosahedron' );
```

Since it may not be obvious what the names are for each group's symmetry
objects, you can find them as follows.

```js
console.log( myGroup.symmetryObjects.map( obj => obj.name ) );
```

Or just use the first one (as long as there is at least one):

```js
const Z_3 = GE.Library.loadByName( 'Z_3' );
const so = GE.SymmetryObject.generate( Z_3, Z_3.symmetryObjects[0].name );
```

## Making an SVG, PDF, or PNG

To draw a symmetry object as an SVG, PDF, or PNG, create an instance of the
`SymmetryObjectRenderer` class, passing your `SymmetryObject` to the
constructor.

```js
const toBeDrawn = new GE.SymmetryObjectRenderer( so );
```

To dump the result to a file, use any one of the following calls.

```js
toBeDrawn.renderSVGFile( 'symmetry-object.svg' );
toBeDrawn.renderPDFFile( 'symmetry-object.pdf' );
toBeDrawn.renderPNGFile( 'symmetry-object.png' );
```

All are asynchronous and take an optional callback as second argument. The
reason for this is that they are instances of a class that typically begins
each rendering by doing a bunch of asynchronous renderings of element names
from MathML to SVGs so that the results can be used to compute best sizes
for the resulting renderings.  For symmetry objects, this is not relevant,
but they still fit the same API as the rest of this repository.

*Consequently it is important to NOT run more than one of those commands in
immediate succession.*  Since they are asynchronous, they will try to run
simultaneously on the same object (`toBeDrawn`) and thus will be
simultaneously manipulating its internal state, which can result in
incorrect results.

## Options

You can set the following options that will be respected when rendering the
resulting representation of the 3D scene.  Each is specified by calling
`set( 'optionName', value )` in the `SymmetryObjectRenderer` after
constructing it and before calling `renderSVGFile()`, `renderPDFFile()`, or
`renderPNGFile()`.

 * `cameraPos` - the default is undefined, which means that the renderer
   will make a sensible guess of where a good place to put the camera is.
   If you want to control it yourself, pass an object with `x`, `y`, and `z`
   attributes, as in `set( 'cameraPos', { x : 2, y : 3, z : 4 } );`.
 * `cameraUp` - If you provide no `cameraPos`, then in addition to guessing a
   sensible camera position, a sensible camera "up" vector is also inferred.
   If you provide a `cameraPos` but do not provide an up vector, then
   (0,1,0) is assumed.  If you like, you may also provide `cameraUp` in the
   same format as `cameraPos`.  This setting is ignored if you do not provide
   `cameraPos`.
 * `arrowMargins` - If you provide a nonnegative floating point value here
   (default is 0.05) then arrows (lines or curves, with or without arrows)
   between vertices will not quite touch the vertices, but leave this much
   space instead.  This helps with legibility if the vertices are labeled,
   and also helps give a sense of depth if the diagram is 3D.

## A complete example

We provide a minimal script that can create an SVG, PDF, or PNG file for a
symmetry object for a group, together with the resulting images.

 * [Script: `examples/symmetry-object.js`](../examples/symmetry-object.js)
 * [Result: `examples/symmetry-object.svg`](../examples/symmetry-object.svg)
 * [Result: `examples/symmetry-object.pdf`](../examples/symmetry-object.pdf)
 * [Result: `examples/symmetry-object.png`](../examples/symmetry-object.png)

## Properties of symmetry objects

You can access the following properties of the `SymmetryObject` instance
(not the `SymmetryObjectRenderer` instance).

 * The vertices (or "nodes") in the symmetry object
    * `so.nodes`, each with these properties:
       * `so.nodes[i].color` - an HTML color string, such as `"#ff0000"`
       * `so.nodes[i].point` - an instance of `Vector3` from the
         [three.js](https://threejs.org) library, which has three main
         attributes:
          * `so.nodes[i].point.x`
          * `so.nodes[i].point.y`
          * `so.nodes[i].point.z`
       * `so.nodes[i].radius` - the radius of the sphere to be drawn at
         this vertex/node
 * The lines in the symmetry object, which are badly named, because they
   are actually piecewise linear paths, which can therefore be used to
   represent curves, not just lines (though the renderer reconstructs
   this data into a cubic Bézier curve by fitting a model to the data,
   so it's not drawn as piecewise linear)
    * `so.lines`, each with these properties:
       * `so.lines[i].vertices` - the list of vertices on the path (just
         two for a line segment, or more for a nonlinear path), each of
         which is a `Vector3`, thus having these properties:
          * `so.lines[i].vertices[j].x`
          * `so.lines[i].vertices[j].y`
          * `so.lines[i].vertices[j].z`
       * `so.lines[i].color` - an HTML color string, such as `"#000000"`
 * The zoom level of the camera, looking at the 3D diagram
    * `so.zoomLevel` (defaults to 1)
    * Values between 0 and 1 zoom out so that the symmetry object is viewed
      with a large empty space around it, and values greater than 1 zoom
      in; typically even 1.5 will clip some parts of the object outside the
      borders of the resulting image.
 * The thickness of the lines drawn in the diagram
    * `so.lineWidth` (defaults to 7)
    *  Any value larger than 0 is acceptable.
       The results are directly proportional to the value provided.
 * The scaling factor to apply to each node in the diagram
    * `so.nodeScale` (defaults to 1)
    *  The default keeps the nodes/vertices exactly the same size they are
       defined in the diagram when it's loaded from the group object or
       generated.  If you provide a different factor here, it will scale the
       nodes by multiplying their radius by this factor.
       Values should be positive.
 * The amount of fog that appears in the 3D scene
    * `so.fogLevel` (defaults to 0)
    * Between 0 and 1, 0 meaning no fog and 1 meaning maximal fog.
      Fog causes more distant parts of the scene to fade into the background
      and can be helpful for indicating depth in a static image.
      3D objects often look better with this between 0.75 and 0.9.

## Old example

The following example was provided before there was a way to actually draw
symmetry objects with `SymmetryObjectRenderer`.  It is kept here merely for
reference.

```js
const dumpSymmetryObject = ( so, precision = 3 ) => {
    const f = n => Number( n ).toFixed( precision );
    console.log( `Symmetry object ${so.name} for "${so.group.shortName}":` );
    so.nodes.map( node => {
        console.log( `\t${node.color} (${f(node.point.x)},${f(node.point.y)},${f(node.point.z)}) `
                   + `r=${node.radius}` );
    } );
    so.lines.map( line => {
        console.log( `\t${line.color} ` + line.vertices.map( pt =>
            `(${f(pt.point.x)},${f(pt.point.y)},${f(pt.point.z)})`
        ).join( line.arrowhead ? '->' : '--' ) );
    } );
};
```
