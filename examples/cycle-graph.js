
// Load the GE module
const GE = require( '../index' );

// Create a group
const group = GE.Library.loadByName( 'S_3 x Z_4' );

// Create a cycle graph for it
const CG = new GE.CycleGraph( group );

// Create a renderer for the cycle graph (can produce SVG, PDF, and PNG)
const renderer = new GE.CycleGraphRenderer( CG );

// Highlight some stuff, as an example
CG.highlightByBackground( group.conjugacyClasses.map( c => c.toArray() ) );
CG.highlightByTop( group.orderClasses.map( c => c.toArray() ) );

// To render an SVG/PDF/PNG, uncomment one of the lines below:
// (But only one, lest they clobber one another's data asynchronously.)
renderer.renderSVGFile( 'cycle-graph.svg' );
// renderer.renderPDFFile( 'cycle-graph.pdf' );
// renderer.renderPNGFile( 'cycle-graph.png' );
