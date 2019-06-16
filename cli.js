#!/usr/bin/env node

// import all this module's functionality
const GE = require( './index' );

// fetch command line arguments
const [ groupName, typeName, ...options ] = process.argv.slice( 2 );

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

// create a renderer for the visualization they requested
const rendererTypeName = vizClassName + 'Renderer';
const renderer = new GE[rendererTypeName]( viz );
console.log( 'Created renderer:', rendererTypeName );

// render the group they requested to out.svg
// (we will make this more flexible later)
renderer.renderSVGFile( 'out.svg' );
console.log( 'Rendered file: out.svg' );
