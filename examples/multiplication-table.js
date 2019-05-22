
// Load the GE module
const GE = require( '../index' );

// Create a group
const group = GE.Library.loadByName( 'A_4' );

// Create a multiplication table for it
const MT = new GE.Multtable( group );

// --------
// --------
// The code below does not yet work.  It will soon; development in progress.
// --------
// --------

// // Create a renderer for the multiplication table (can produce SVG, PDF, and PNG)
// const renderer = new GE.MulttableRenderer( MT );
//
// // Highlight some stuff, as an example
// CG.highlightByBackground( group.conjugacyClasses.map( c => c.toArray() ) );
// CG.highlightByCorner( group.orderClasses.map( c => c.toArray() ) );
//
// // To render an SVG/PDF/PNG, uncomment one of the lines below:
// // (But only one, lest they clobber one another's data asynchronously.)
// renderer.renderSVGFile( 'multiplication-table.svg' );
// // renderer.renderPDFFile( 'multiplication-table.pdf' );
// // renderer.renderPNGFile( 'multiplication-table.png' );
