
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
const add = module.exports.add = ( mathml, callback ) => {
    if ( typeof mathml == 'string' ) {
        const orig = mathml;
        if ( cache.hasOwnProperty( orig ) )
            if ( callback ) callback( cache[orig] );
        if ( !/^<math>/.test( mathml ) )
            mathml = `<math>${mathml}</math>`;
        if ( cache.hasOwnProperty( mathml ) )
            if ( callback ) callback( cache[mathml] );
        mathml = splitMathIdentifiers( mathml );
        if ( cache.hasOwnProperty( mathml ) )
            if ( callback ) callback( cache[mathml] );
        mj.typeset( {
            math : mathml,
            format : 'MathML',
            svg : true
        }, data => {
            cache[orig] = cache[mathml] = data;
            if ( callback ) callback( data );
        } );
    } else if ( mathml instanceof Array ) {
        var counter = 0;
        mathml.map( entry => {
            add( entry, data => {
                counter++;
                if ( callback && counter == mathml.length )
                    callback( mathml.map( entry => cache[entry] ) );
            } );
        } );
    }
}

// Once you've stored stuff, you can look it up easily.
// Each object returned will contain these properties:
// - svg (string, SVG code)
// - width (string, "#.###ex")
// - height (same)
// - style (CSS style string that culd be used on an inline SVG)
// - speakText (string, for accessibility technologies (?))
module.exports.get = mathml => cache[mathml];

// This internal function corrects multi-letter <mi>'s by splitting
// them into multiple single-letter <mi>'s, so that they don't get
// rendered by MathJax as non-italic text.
splitMathIdentifiers = ( mathml ) => {
    const re = /<mi>(\w{2,})<\/mi>/i;
    var next;
    while ( next = re.exec( mathml ) ) {
        mathml = mathml.substring( 0, next.index )
               + '<mrow>'
               + next[1].split( '' ).map( char => `<mi>${char}</mi>` )
                                    .join( '' )
               + '</mrow>'
               + mathml.substring( next.index + next[0].length );
    }
    return mathml;
}
