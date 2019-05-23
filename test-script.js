
/*
 * This file is not part of the ge-lib.js project in any real sense.
 *
 * It is not part of the module that clients will import.
 * It is not an actual unit-testing script.
 * It is merely here as part of development to make it easy to quickly
 * check to be sure the latest features do what's expected.
 *
 * We expect that eventually this script will go away, replaced by
 * either real unit testing, real examples suitable for clients to
 * read and use, or both.
 *
 * It is in this repository just to be sure we do not lose any
 * important information, but it is not well-organized or very
 * readable.
 */

//// How to load the library:
const GE = require( './ge-lib.js' );

//// How to load all groups (takes 2-3 seconds)
// GE.Library.loadAllFromFilesystem();

//// How to load individual groups (these are just examples):
// GE.Library.loadByName( 'Z_10' );
// GE.Library.loadByName( 'A_4' );

//// Utility function for displaying a group:
const showGroup = g => {
    console.log( `Name: ${g.shortName}` );
    g.elements.map( a => {
        console.log( g.elements.map( b =>
            g.mult( a, b )
            // GE.mathml2text( g.representation[g.mult( a, b )] )
        ).join( ' ' ) );
    } );
};

//// How to fetch a group
// showGroup( GE.Library.getByName( 'A_4' ) );

//// How to look up a group using IsomorphicGroups:
// const z3mt = [ [ 0, 1, 2 ], [ 1, 2, 0 ], [ 2, 0, 1 ] ];
// const z3copy = new GE.BasicGroup( z3mt );
// const z3orig = GE.IsomorphicGroups.find( z3copy );
// showGroup( z3orig );

//// Utility function for displaying a Cayley graph:

console.log( GE.Library.allGroupNamesInFilesystem() );
