#!/usr/bin/env node

// import all this module's functionality
const GE = require( './index' );

// define syntax help to print if they go wrong
const usage = () => console.log(
    'ge-lib drawing tool\n'
  + '-------------------\n'
  + '\n'
  + 'Usage:\n'
  + '  - npm run ge-draw\n'
  + '      Prints this help message\n'
  + '  - npm run ge-draw <group> <type> [options]\n'
  + '      Render a visualization of the given group.\n'
  + '      The visualization will be of the given type.\n'
  + '      Valid types are Cayley diagram, multiplication table,\n'
  + '      symmetry object, and cycle graph.  Case insensitive,\n'
  + '      shortcuts permitted.\n'
  + '      Output goes to the file <group>.svg.\n'
  + '      Example: npm run ge-draw Z_4 mult\n'
  + '      See below for other options.\n'
  + '  - npm run ge-draw list\n'
  + '      Do not draw anything.  Instead, list all valid names\n'
  + '      of groups that can be passed to ge-draw, then exit.\n'
  + '\n'
  + 'Options:\n'
  + '  (Documentation forthcoming.)\n'
);

// fetch command line arguments
const [ groupName, typeName, ...rest ] = process.argv.slice( 2 );

// if they just asked for the group list, give it and quit
if ( groupName == 'list' ) {
    GE.Library.allGroupNamesInFilesystem().map( path =>
        console.log( path.split( '/' ).pop() ) );
    process.exit( 0 );
}

// load the group they specified, or quit if you can't figure it out
if ( groupName === undefined ) {
    console.error( 'No group specified.' );
    usage();
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
    usage();
    process.exit( 1 );
}
const key = typeName.toLowerCase().replace( / /g, '' );
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
