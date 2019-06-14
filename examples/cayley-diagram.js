
// Load the GE module
const GE = require( '../index' );

// Create a group
const group = GE.Library.loadByName( 'A_5' );

// Create a Cayley diagram for it
// Either the first named diagram:
// const CD = new GE.CayleyDiagram( group, group.cayleyDiagrams[0].name );
// Or a generated diagram:
const CD = new GE.CayleyDiagram( group, group.cayleyDiagrams[0].name );

// Create a renderer for the Cayley diagram (can produce SVG, PDF, and PNG)
const renderer = new GE.CayleyDiagramRenderer( CD );
renderer.set( 'arrowMargins', 0.1 );
renderer.set( 'fogLevel', 0.75 );
renderer.set( 'nodeScale', 0.75 );
renderer.set( 'lineWidth', 8 );
renderer.set( 'arrowheadSize', 0.2 );
renderer.set( 'showNames', false );

// If the object we're rendering is 3D, it looks best with some fog:
// renderer.set( 'fogLevel', 0.75 );

// To render an SVG/PDF/PNG, uncomment one of the lines below:
// (But only one, lest they clobber one another's data asynchronously.)
renderer.renderSVGFile( 'cayley-diagram.svg' );
// renderer.renderPDFFile( 'cayley-diagram.pdf' );
// renderer.renderPNGFile( 'cayley-diagram.png' );
