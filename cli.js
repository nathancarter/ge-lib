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
  + '  - npm run ge-draw <group> list\n'
  + '      Do not draw anything.  Instead, list useful details\n'
  + '      about the specified group.\n'
  + '\n'
  + 'Options:\n'
  + '  - outfile\n'
  + '      The name of the file in which to save the output.\n'
  + '      Must end in .svg, .pdf, or .png.\n'
  + '  - cameraPos\n'
  + '      The location of the camera when viewing a 3D object.\n'
  + '      Must be valid JSON describing an [x,y,z] array.\n'
  + '      The camera always looks at the origin.\n'
  + '  - cameraUp\n'
  + '      The vector in 3D space that is "up" to the camera.\n'
  + '      Must be valid JSON describing an [x,y,z] array.\n'
  + '      The camera always looks at the origin.\n'
  + '  - zoomLevel\n'
  + '      How much to zoom in if viewing a 3D object (default 1).\n'
  + '      Valid values are positive floating point numbers.\n'
  + '  - lineWidth\n'
  + '      Thickness of lines in a 3D scene (default 7).\n'
  + '      Valid values are positive floating point numbers.\n'
  + '  - nodeScale\n'
  + '      Scaling factor applied to each node in a 3D object.\n'
  + '      It is multiplicative, with default 1, no change.\n'
  + '      Valid values are positive floating point numbers.\n'
  + '  - fogLevel\n'
  + '      Amount of white fog to include in a 3D scene, to\n'
  + '      show depth in 3D objects.\n'
  + '      Valid values are floats in the interval [0,1].\n'
  + '  - elements\n'
  + '      The order in which to include the group elements in a\n'
  + '      multiplication table.  This should be the JSON for an\n'
  + '      array containing a permutation of 0,1,...,n-1, where n\n'
  + '      is the order of the group, with 0 in the first position.\n'
  + '  - separation\n'
  + '      In a multiplication table, if a subgroup size is given,\n'
  + '      this is the amount of space to leave in between cosets\n'
  + '      of that subgroup, to show a quotient operation.\n'
  + '      May be any nonnegative value; one unit is the width of\n'
  + '      a single cell of the table.  Only works if stride is\n'
  + '      also specified (the subgroup size).\n'
  + '  - stride\n'
  + '      In a multiplication table, this can be used to specify\n'
  + '      the size of a subgroup by which to quotient the table.\n'
  + '      This means that the subgroup and its cosets will be\n'
  + '      visually chunked with space between to separate them.\n'
  + '      You should provide here a positive integer that divides\n'
  + '      the group order and is the size of a subgroup by which\n'
  + '      you\'ve organized the table (using "elements").  If not,\n'
  + '      this will not behave sensibly.  See "separation."\n'
  + '  - coloration\n'
  + '      Scheme for colorizing a multiplication table.  One of:\n'
  + '      rainbow, grayscale, none.  (Default is rainbow.)\n'
  + '  - arrows\n'
  + '      In a Cayley diagram, you may set this value to a JSON\n'
  + '      array of the elements that should be drawn as arrows\n'
  + '      in the diagram.\n'
  + '  - arrowColors\n'
  + '      In a Cayley diagram, you may set this value to a JSON\n'
  + '      array of strings of HTML colors (e.g., "red", "#ffcc00")\n'
  + '      to set the colors of the arrows in the diagram.  This\n'
  + '      must have the same length as the number of arrow types.\n'
  + '  - arrowheadPlacement\n'
  + '      In a Cayley diagram, this can be any number in the\n'
  + '      range [0,1].  It indicates the point on an arrow where\n'
  + '      the arrowhead will be placed, 0 for the source, 1 for\n'
  + '      the destination, 0.5 for the midpoint, etc.\n'
  + '  - showNames\n'
  + '      In a Cayley diagram, whether to include element names.\n'
  + '      Defaults to true, but you can also use "false."\n'
  + '  - arrowMargins\n'
  + '      In a Cayley diagram, how much space to leave around the\n'
  + '      nodes of a diagram as a margin, so that arrows between\n'
  + '      nodes do not obscure nodes or their element names.\n'
  + '      Positive floating point values only.  Default: 0.05.\n'
  + '  - highlight-background\n'
  + '      In multiplication tables and cycle graphs, this can\n'
  + '      add highlighting to the background of a cell/vertex.\n'
  + '      Acceptable values include:\n'
  + '       - Any subset of the group\'s elements, as a JSON array,\n'
  + '         such as [3,4,6].\n'
  + '       - Any partition of the group\'s elements or a subset\n'
  + '         thereof, as a JSON array, such as [[0,1],[4,5],[8]].\n'
  + '  - highlight-border\n'
  + '      In multiplication tables and cycle graphs, this is just\n'
  + '      like highlight-background, but works on cell/vertex\n'
  + '      borders instead.\n'
  + '  - highlight-corner\n'
  + '      In multiplication tables, this is just like\n'
  + '      highlight-background, but works on cell corners instead.\n'
  + '  - highlight-top\n'
  + '      In cycle graphs, this is just like\n'
  + '      highlight-background, but works on vertex tops instead.\n'
  + '  - highlight-node\n'
  + '      In Cayley diagrams, this is just like\n'
  + '      highlight-background does in multiplication tables.\n'
  + '  - highlight-ring\n'
  + '      In Cayley diagrams, this is just like highlight-node,\n'
  + '      but creates a colored ring around the node instead.\n'
  + '  - highlight-square\n'
  + '      In Cayley diagrams, this is just like highlight-node,\n'
  + '      but creates a colored square around the node instead.\n'
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
const viz = new GE[vizClassName]( group );
console.log( 'Created visualizer:', vizClassName );

// create a renderer for the visualization they requested
const rendererTypeName = vizClassName + 'Renderer';
const renderer = new GE[rendererTypeName]( viz );
console.log( 'Created renderer:', rendererTypeName );

// grab all other command-line options and stick them in a dictionary
var options = { };
const validOptionKeys = [
    'outfile', 'cameraPos', 'cameraUp', 'zoomLevel', 'lineWidth',
    'nodeScale', 'fogLevel', 'separation', 'stride', 'elements',
    'coloration', 'arrows', 'arrowColors', 'arrowheadPlacement',
    'showNames', 'arrowMargins',
    'highlight-background', 'highlight-border', 'highlight-corner',
    'highlight-top', 'highlight-node', 'highlight-ring',
    'highlight-square'
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
// highlighting
const getHighlightingPartition = key => {
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
    renderer[`render${fileType}File`]( options.outfile );
    console.log( 'Rendered file:', options.outfile );
} catch ( e ) {
    console.error( 'Error rendering image:', e );
    process.exit( 1 );
}
