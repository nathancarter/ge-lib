
// Import everything from ge-lib into this big module.
Object.assign( module.exports, require( './src/ge-lib' ) );

// Import the renderers and name them.
module.exports.CycleGraphRenderer =
    require( './src/cycle-graph-renderer' ).CycleGraphRenderer;
module.exports.MulttableRenderer =
    require( './src/multtable-renderer' ).MulttableRenderer;
module.exports.SymmetryObjectRenderer =
    require( './src/symmetry-object-renderer' ).SymmetryObjectRenderer;

// Import the MathML SVG database module and name it.
module.exports.MathMLSVGDB = require( './src/mathml-svg-db' );
