
// Load the GE module
const GE = require( '../index' );

// Create a group
const group = GE.Library.loadByName( 'A_4' );

// Create a multiplication table for it
const MT = new GE.Multtable( group );

// Create a renderer for the multiplication table (can produce SVG, PDF, and PNG)
const renderer = new GE.MulttableRenderer( MT );

// Highlight some stuff, as an example
MT.highlightByBorder( group.conjugacyClasses.map( c => c.toArray() ) );
MT.highlightByCorner( group.orderClasses.map( c => c.toArray() ) );

// To render an SVG/PDF/PNG, uncomment one of the lines below:
// (But only one, lest they clobber one another's data asynchronously.)
renderer.renderSVGFile( 'multiplication-table.svg' );
// renderer.renderPDFFile( 'multiplication-table.pdf' );
// renderer.renderPNGFile( 'multiplication-table.png' );
