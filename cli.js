#!/usr/bin/env node

// import all this module's functionality
const GE = require( './index' );

// define syntax help to print if they go wrong
const usage = () =>
    console.log( String( require( 'fs' ).readFileSync(
        require( 'path' ).join( __dirname, 'cli-usage.txt' ) ) ) );

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

// if they just asked me to list all the info I have about a group,
// do that now and quit
if ( typeName == 'list' ) {
    console.log( 'Listing data about this group:', group.URL );
    console.log( 'Cayley Diagrams:' );
    if ( group.cayleyDiagrams.length == 0 )
        console.log( '\tno built-in diagrams' );
    else
        group.cayleyDiagrams.map( cd => console.log( `\t${cd.name}` ) );
    console.log( 'Symmetry Objects:' );
    if ( group.symmetryObjects.length == 0 )
        console.log( '\tnone' );
    else
        group.symmetryObjects.map( so => console.log( `\t${so.name}` ) );
    console.log( 'Elements:' );
    for ( var i = 0 ; i < group.order ; i++ )
        console.log( `\t${i}. ${GE.mathml2text( group.representation[i] )}` );
    console.log( 'Subgroups:' );
    group.subgroups.map( ( subgroup, index ) =>
        console.log( `\t${index}. ${subgroup.members.toArray()}` ) );
    process.exit( 0 );
}

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
var viz = new GE[vizClassName]( group );
console.log( 'Created visualizer:', vizClassName );

// grab all other command-line options and stick them in a dictionary
var options = { };
const validOptionKeys = [
    'outfile', 'cameraPos', 'cameraUp', 'zoomLevel', 'lineWidth',
    'nodeScale', 'fogLevel', 'separation', 'stride', 'elements',
    'coloration', 'arrows', 'arrowColors', 'arrowheadPlacement',
    'showNames', 'arrowMargins',
    'highlight-background', 'highlight-border', 'highlight-corner',
    'highlight-top', 'highlight-node', 'highlight-ring',
    'highlight-square', 'brighten', 'diagram', 'object'
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

// before any other options happen, if they specified a diagram by name,
// throw out the old one and replace it with the named one.
if ( vizClassName == 'CayleyDiagram' && options.hasOwnProperty( 'diagram' ) ) {
    if ( !group.cayleyDiagrams.some( d => d.name == options.diagram ) ) {
        console.error( 'No such diagram:', options.diagram );
        process.exit( 1 );
    }
    viz = new GE.CayleyDiagram( group, options.diagram );
}
// same thing for symmetry objects
if ( vizClassName == 'SymmetryObject' && options.hasOwnProperty( 'object' ) ) {
    if ( !group.symmetryObjects.some( d => d.name == options.object ) ) {
        console.error( 'No such symmetry object:', options.object );
        process.exit( 1 );
    }
    viz = new GE.SymmetyObject( group, options.object );
}

// create a renderer for the visualization they requested
const rendererTypeName = vizClassName + 'Renderer';
const renderer = new GE[rendererTypeName]( viz );
console.log( 'Created renderer:', rendererTypeName );

// fill in option defaults
if ( !options.hasOwnProperty( 'outfile' ) )
    options.outfile = groupName + '.svg';

// ensure options are valid; extract necessary inferences from them
// outfile
const fileTypeMatch = /(.+)\.(svg|pdf|png)$/i.exec( options.outfile );
if ( !fileTypeMatch ) {
    console.error( 'Not a valid output file type:', options.outfile );
    process.exit( 1 );
}
const fileType = fileTypeMatch[2].toUpperCase();
const is3D = vizClassName == 'CayleyDiagram' || vizClassName == 'SymmetryObject';
// cameraPos
if ( is3D && options.hasOwnProperty( 'cameraPos' ) ) {
    const p = JSON.parse( options.cameraPos );
    if ( !( p instanceof Array ) || p.length != 3
      || p.some( x => typeof( x ) != 'number' ) ) {
        console.error( 'Invalid camera position:', options.cameraPos );
        process.exit( 1 );
    }
    renderer.set( 'cameraPos', { x : p[0], y : p[1], z : p[2] } );
}
// cameraUp
if ( is3D && options.hasOwnProperty( 'cameraUp' ) ) {
    const v = JSON.parse( options.cameraUp );
    if ( !( v instanceof Array ) || v.length != 3
      || v.some( x => typeof( x ) != 'number' ) ) {
        console.error( 'Invalid camera up vector:', options.cameraUp );
        process.exit( 1 );
    }
    renderer.set( 'cameraUp', { x : v[0], y : v[1], z : v[2] } );
}
// zoomLevel
if ( is3D && options.hasOwnProperty( 'zoomLevel' ) ) {
    const z = JSON.parse( options.zoomLevel );
    if ( typeof( z ) != 'number' || z <= 0 ) {
        console.error( 'Invalid zoom level:', options.zoomLevel );
        process.exit( 1 );
    }
    viz.zoomLevel = z;
}
// lineWidth
if ( is3D && options.hasOwnProperty( 'lineWidth' ) ) {
    const w = JSON.parse( options.lineWidth );
    if ( typeof( w ) != 'number' || w <= 0 ) {
        console.error( 'Invalid line width:', options.lineWidth );
        process.exit( 1 );
    }
    viz.lineWidth = w;
}
// nodeScale
if ( is3D && options.hasOwnProperty( 'nodeScale' ) ) {
    const s = JSON.parse( options.nodeScale );
    if ( typeof( s ) != 'number' || s <= 0 ) {
        console.error( 'Invalid node scale:', options.nodeScale );
        process.exit( 1 );
    }
    viz.nodeScale = s;
}
// fogLevel
if ( is3D && options.hasOwnProperty( 'fogLevel' ) ) {
    const f = JSON.parse( options.fogLevel );
    if ( typeof( f ) != 'number' || f < 0 || f > 1 ) {
        console.error( 'Invalid fog level:', options.fogLevel );
        process.exit( 1 );
    }
    viz.fogLevel = f;
}
// separation
if ( vizClassName == 'Multtable' && options.hasOwnProperty( 'separation' ) ) {
    const s = JSON.parse( options.separation );
    if ( typeof( s ) != 'number' || s <= 0 ) {
        console.error( 'Invalid separation:', options.separation );
        process.exit( 1 );
    }
    viz.separation = s;
}
// stride
if ( vizClassName == 'Multtable' && options.hasOwnProperty( 'stride' ) ) {
    const s = JSON.parse( options.stride );
    if ( typeof( s ) != 'number' || s != Math.floor( s ) || s < 1
      || s >= group.order || group.order % s != 0 ) {
        console.error( 'Invalid stride:', options.stride );
        process.exit( 1 );
    }
    viz.stride = s;
}
// elements
if ( vizClassName == 'Multtable' && options.hasOwnProperty( 'elements' ) ) {
    const elts = JSON.parse( options.elements );
    if ( !( elts instanceof Array ) || elts.length != group.order
      || group.elements.some( elt => elts.indexOf( elt ) == -1 )
      || elts[0] != 0 ) {
        console.error( 'Invalid elements array:', options.elements );
        process.exit( 1 );
    }
    viz.elements = elts;
}
// coloration
if ( vizClassName == 'Multtable' && options.hasOwnProperty( 'coloration' ) ) {
    if ( options.coloration == 'rainbow' ) {
        viz.colors = GE.Multtable.COLORATION_RAINBOW;
    } else if ( options.coloration == 'grayscale' ) {
        viz.colors = GE.Multtable.COLORATION_GRAYSCALE;
    } else if ( options.coloration == 'none' ) {
        viz.colors = GE.Multtable.COLORATION_NONE;
    } else {
        console.error( 'Invalid coloration:', options.coloration );
        process.exit( 1 );
    }
}
// arrows
if ( vizClassName == 'CayleyDiagram' && options.hasOwnProperty( 'arrows' ) ) {
    const arrs = JSON.parse( options.arrows );
    if ( !( arrs instanceof Array )
      || arrs.some( arr => group.elements.indexOf( arr ) == -1 ) ) {
        console.error( 'Invalid arrows list:', options.arrows );
        process.exit( 1 );
    }
    viz.removeLines();
    arrs.map( arr => viz.addLines( arr ) );
    viz.setLineColors();
}
// arrowColors
if ( vizClassName == 'CayleyDiagram' && options.hasOwnProperty( 'arrowColors' ) ) {
    const cols = JSON.parse( options.arrowColors );
    if ( !( cols instanceof Array ) ) {
        console.error( 'Invalid arrow colors list:', options.arrowColors );
        process.exit( 1 );
    }
    viz.arrowColors = cols;
    viz.setLineColors();
}
// arrowheadPlacement
if ( vizClassName == 'CayleyDiagram' && options.hasOwnProperty( 'arrowheadPlacement' ) ) {
    const p = JSON.parse( options.arrowheadPlacement );
    if ( typeof( p ) != 'number' || p < 0 || p > 1 ) {
        console.error( 'Invalid arrowhead placement:', options.arrowheadPlacement );
        process.exit( 1 );
    }
    viz.arrowheadPlacement = p;
}
// showNames
if ( vizClassName == 'CayleyDiagram' && options.hasOwnProperty( 'showNames' ) ) {
    if ( options.showNames != 'true' && options.showNames != 'false' ) {
        console.error( 'Invalid choice for showing names:', options.showNames );
        process.exit( 1 );
    }
    renderer.set( 'showNames', options.showNames == 'true' );
}
// arrowMargin
if ( vizClassName == 'CayleyDiagram' && options.hasOwnProperty( 'arrowMargins' ) ) {
    const m = JSON.parse( options.arrowMargins );
    if ( typeof( m ) != 'number' || m < 0 ) {
        console.error( 'Invalid arrow margin:', options.arrowMargins );
        process.exit( 1 );
    }
    renderer.set( 'arrowMargins', m );
}
// brighten
if ( vizClassName == 'CayleyDiagram' && options.hasOwnProperty( 'brighten' ) ) {
    const b = JSON.parse( options.brighten );
    if ( typeof( b ) != 'number' || b < 0 || b > 1 ) {
        console.error( 'Invalid brightening value:', options.brighten );
        process.exit( 1 );
    }
    renderer.set( 'brightHighlights', b );
}
// highlighting
const getHighlightingPartition = key => {
    // support subgroup highlighting by index:
    if ( /^[0-9]+$/.test( options[key] ) ) {
        if ( options[key] >= group.subgroups.length ) {
            console.error( 'Invalid subgroup index:', options[key] );
            process.exit( 1 );
        }
        return [ group.subgroups[options[key]].members.toArray() ];
    }
    // support highlighting by conjugacy classes:
    const simpler = options[key].toLowerCase().replace( / /g, '' );
    if ( simpler == 'conjugacyclasses'.substring( 0, simpler.length ) )
        return group.conjugacyClasses.map( c => c.toArray() );
    // support highlighting by order classes:
    if ( simpler == 'orderclasses'.substring( 0, simpler.length ) )
        return group.orderClasses.map( c => c.toArray() );
    // support highlighting by cosets of a subgroup:
    var match = /^(r|ri|rig|righ|right|l|le|lef|left)-([0-9]+)$/.exec( simpler );
    if ( match ) {
        const index = parseInt( match[2] );
        if ( index >= group.subgroups.length ) {
            console.error( 'Invalid subgroup index:', index );
            process.exit( 1 );
        }
        return group.getCosets( group.subgroups[index].members,
                                match[1][0] == 'l' ).map( c => c.toArray() );
    }
    // support raw JSON of subsets or partial partitions:
    var arr = JSON.parse( options[key] );
    if ( !( arr instanceof Array ) ) {
        console.error( `${key} must be an array:`, options[key] );
        process.exit( 1 );
    }
    if ( !( arr[0] instanceof Array ) ) arr = [ arr ];
    if ( arr.some( inner =>
            inner.some( elt => group.elements.indexOf( elt ) == -1 ) ) ) {
        console.error( `${key} must contain only group elements:`,
            options[key] );
        process.exit( 1 );
    }
    return arr;
}
if ( ( vizClassName == 'Multtable' || vizClassName == 'CycleGraph' )
  && options.hasOwnProperty( 'highlight-background' ) )
    viz.highlightByBackground(
        getHighlightingPartition( 'highlight-background' ) );
if ( ( vizClassName == 'Multtable' || vizClassName == 'CycleGraph' )
  && options.hasOwnProperty( 'highlight-border' ) )
    viz.highlightByBorder(
        getHighlightingPartition( 'highlight-border' ) );
if ( vizClassName == 'Multtable'
  && options.hasOwnProperty( 'highlight-corner' ) )
    viz.highlightByCorner(
        getHighlightingPartition( 'highlight-corner' ) );
if ( vizClassName == 'CycleGraph'
  && options.hasOwnProperty( 'highlight-top' ) )
    viz.highlightByTop(
        getHighlightingPartition( 'highlight-top' ) );
if ( vizClassName == 'CayleyDiagram'
  && options.hasOwnProperty( 'highlight-node' ) )
    viz.highlightByNodeColor(
        getHighlightingPartition( 'highlight-node' ) );
if ( vizClassName == 'CayleyDiagram'
  && options.hasOwnProperty( 'highlight-ring' ) )
    viz.highlightByRingAroundNode(
        getHighlightingPartition( 'highlight-ring' ) );
if ( vizClassName == 'CayleyDiagram'
  && options.hasOwnProperty( 'highlight-square' ) )
    viz.highlightBySquareAroundNode(
        getHighlightingPartition( 'highlight-square' ) );

// render the group they requested to the file they requested
try {
    renderer[`render${fileType}File`]( options.outfile, () =>
        console.log( 'Done.' ) );
    console.log( 'Rendering file:', options.outfile );
} catch ( e ) {
    console.error( 'Error rendering image:', e );
    process.exit( 1 );
}
