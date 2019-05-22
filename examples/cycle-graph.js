
// Load the GE module
const GE = require( '../index' );

// Create a group
const group = GE.Library.loadByName( 'S_3 x Z_4' );

// Create a cycle graph for it
const CG = new GE.CycleGraph( group );

// Create a SVG-renderer for the cycle graph
const CGSVG = new GE.CycleGraphSVG( CG );

// Highlight some stuff
CG.highlightByBackground( group.conjugacyClasses.map( c => c.toArray() ) );
CG.highlightByTop( group.orderClasses.map( c => c.toArray() ) );

// To render an SVG version:
CGSVG.setupSizeForSVG( () => {
    CGSVG.renderToFile( 'cycle-graph.svg' );
} );
