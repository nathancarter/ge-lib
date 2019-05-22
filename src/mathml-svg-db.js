
// Give this module all the strings of MathML that you care about.
// It will asynchronously generate SVG code for each.
// You can query whether it's complete or not, or get a callback when it is.
// You can then fetch that SVG code or other related attributes.

// First we import MathJax and set it up.
const mj = require( 'mathjax-node' );
mj.start();

// Here is where we will cache all data this module oversees.
const cache = { };

// Here is the function you should call to add MathML to this module.
module.exports.add = ( mathml, cb ) => {
    if ( typeof mathml == 'string' ) {
        if ( cache.hasOwnProperty( mathml ) )
            if ( cb ) cb( cache[mathml] );
        const orig = mathml;
        if ( !/^<math>/.test( mathml ) )
            mathml = `<math>${mathml}</math>`;
        mj.typeset( {
            math : mathml,
            format : 'MathML',
            svg : true
        }, data => {
            cache[orig] = cache[mathml] = data;
            if ( cb ) cb( data );
        } );
    } else if ( mathml instanceof Array ) {
        var counter = 0;
        mathml.map( entry => {
            module.exports.add( entry, data => {
                counter++;
                if ( cb && counter == mathml.length )
                    cb( mathml.map( entry => cache[entry] ) );
            } );
        } );
    }
}

// Once you've stored stuff, you can look it up easily.
module.exports.get = mathml => cache[mathml];
