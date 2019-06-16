
// Load the GE module
const GE = require( '../index' );

// Create a group
const group = GE.Library.loadByName( 'A_5' );

// Create a Cayley diagram for it
// Either the first named diagram:
const CD = new GE.CayleyDiagram( group, group.cayleyDiagrams[0].name );
// Or a generated diagram:
// const CD = new GE.CayleyDiagram( group );

// Create a renderer for the Cayley diagram (can produce SVG, PDF, and PNG)
const renderer = new GE.CayleyDiagramRenderer( CD );

// Tweak some settings for this particular illustration's best clarity:
CD.nodeScale = 0.75;
renderer.set( 'arrowMargins', 0.1 );
renderer.set( 'showNames', false );

// Since the object we're rendering is 3D, it looks best with some depth:
CD.fogLevel = 0.9;

// Highlight some stuff, as an example
CD.highlightByNodeColor( group.getCosets(
    group.subgroups[35].members, true ).map( c => c.toArray() ) );

// To render an SVG/PDF/PNG, uncomment one of the lines below:
// (But only one, lest they clobber one another's data asynchronously.)
renderer.renderSVGFile( 'cayley-diagram.svg' );
// renderer.renderPDFFile( 'cayley-diagram.pdf' );
// renderer.renderPNGFile( 'cayley-diagram.png' );
