
// Import everything from ge-lib into this big module.
Object.assign( module.exports, require( './src/ge-lib' ) );

// Import everything from cycle-graph-svg into this big module,
// but that is essentially just one class, CycleGraphSVG.
Object.assign( module.exports, require( './src/cycle-graph-svg' ) );

// Import the MathML SVG database module and name it.
module.exports.MathMLSVGDB = require( './src/mathml-svg-db' );
