
// Import everything from ge-lib into this big module.
Object.assign( module.exports, require( './src/ge-lib' ) );


// Import the MathML SVG database module and name it.
module.exports.MathMLSVGDB = require( './src/mathml-svg-db' );
