#!/usr/bin/env node

// import all this module's functionality
const GE = require( './index' );

// fetch command line arguments
const [ groupName, typeName, ...rest ] = process.argv.slice( 2 );

// load the group they specified, or quit if you can't figure it out
if ( groupName === undefined ) {
    console.error( 'No group specified.' );
    process.exit( 1 );
}
var group;
try {
    group = GE.Library.loadByName( groupName );
} catch ( e ) {
    console.error( 'Could not load this group:', groupName );
    process.exit( 1 );
}
console.log( 'Loaded group:', group.URL );

// determine which visualization type they specified,
// or quit if you can't figure it out
if ( typeName === undefined ) {
    console.error( 'No visualization type specified.' );
    process.exit( 1 );
}
const key = typeName.toLowerCase();
var type = [
    [ 'CayleyDiagram', 'cd' ],
    [ 'Multtable', 'multiplicationtable', 'mt' ],
    [ 'CycleGraph', 'cg' ],
    [ 'SymmetryObject', 'so', 'os', 'objectofsymmetry' ]
].find( array =>
    array.some( t => t.toLowerCase().substring( 0, key.length ) === key ) );
if ( !type ) {
    console.error( 'Did not understand this visualization type:', typeName );
    process.exit( 1 );
}
const vizClassName = type[0];
const viz = new GE[vizClassName]( group );
console.log( 'Created visualizer:', vizClassName );

// grab all other command-line options and stick them in a dictionary
var options = { };
const validOptionKeys = [
    'outfile'
];
rest.map( arg => {
    const halves = arg.split( '=' );
    if ( halves.length != 2 ) {
        console.warn( 'Cannot understand this, so ignoring it:', arg );
        return;
    }
    if ( validOptionKeys.indexOf( halves[0] ) == -1 ) {
        console.warn( 'Invalid option, so ignoring it:', halves[0] );
        return;
    }
    options[halves[0]] = halves[1];
} );

// fill in option defaults
if ( !options.hasOwnProperty( 'outfile' ) )
    options.outfile = groupName + '.svg';

// ensure options are valid; extract necessary inferences from them
const fileTypeMatch = /(.+)\.(svg|pdf|png)$/i.exec( options.outfile );
if ( !fileTypeMatch ) {
    console.error( 'Not a valid output file type:', options.outfile );
    process.exit( 1 );
}
const fileType = fileTypeMatch[2].toUpperCase();

// create a renderer for the visualization they requested
const rendererTypeName = vizClassName + 'Renderer';
const renderer = new GE[rendererTypeName]( viz );
console.log( 'Created renderer:', rendererTypeName );

// render the group they requested to the file they requested
try {
    renderer[`render${fileType}File`]( options.outfile );
    console.log( 'Rendered file:', options.outfile );
} catch ( e ) {
    console.error( 'Error rendering image:', e );
    process.exit( 1 );
}
