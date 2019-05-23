
// Load the GE module
const GE = require( '../index' );

// Create a group
const group = GE.Library.loadByName( 'A_5' );

// Create a Symmetry Object for it
const SO = GE.SymmetryObject.generate( group, group.symmetryObjects[0].name );

// Create a renderer for the symmetry object (can produce SVG, PDF, and PNG)
const renderer = new GE.SymmetryObjectRenderer( SO );

// Because the object we're rendering is 3D, it looks best with some fog:
renderer.set( 'fogLevel', 0.75 );

// To render an SVG/PDF/PNG, uncomment one of the lines below:
// (But only one, lest they clobber one another's data asynchronously.)
renderer.renderSVGFile( 'symmetry-object.svg' );
// renderer.renderPDFFile( 'symmetry-object.pdf' );
// renderer.renderPNGFile( 'symmetry-object.png' );
