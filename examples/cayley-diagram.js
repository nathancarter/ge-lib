
// Load the GE module
const GE = require( '../index' );

// Create a group
const group = GE.Library.loadByName( 'A_4' );

// Create a Cayley diagram for it
const CD = new GE.CayleyDiagram( group, group.cayleyDiagrams[0].name );

console.log( group.cayleyDiagrams.map( d => d.name ) );

// // Create a renderer for the Cayley diagram (can produce SVG, PDF, and PNG)
// const renderer = new GE.CayleyDiagramRenderer( CD );
//
// // Because the object we're rendering is 3D, it looks best with some fog:
// renderer.set( 'fogLevel', 0.75 );
//
// // To render an SVG/PDF/PNG, uncomment one of the lines below:
// // (But only one, lest they clobber one another's data asynchronously.)
// renderer.renderSVGFile( 'cayley-diagram.svg' );
// // renderer.renderPDFFile( 'cayley-diagram.pdf' );
// // renderer.renderPNGFile( 'cayley-diagram.png' );
