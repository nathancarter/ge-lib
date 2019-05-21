
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
// GE.Library.loadFromFilesystem( './groups/Z_10.group' );
// GE.Library.loadFromFilesystem( './groups/A_4.group' );

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
// showGroup( GE.Library.map.get( 'A_4' ) );

//// How to look up a group using IsomorphicGroups:
// const z3mt = [ [ 0, 1, 2 ], [ 1, 2, 0 ], [ 2, 0, 1 ] ];
// const z3copy = new GE.BasicGroup( z3mt );
// const z3orig = GE.IsomorphicGroups.find( z3copy );
// showGroup( z3orig );

//// Utility function for displaying a cycle graph:
const showCycleGraph = ( cg, precision = 3 ) => {
    const f = n => Number( n ).toFixed( precision );
    console.log( `Cycle graph for "${cg.group.shortName}":` );
    console.log( `\tBounding box: (${f(cg.bbox.left)},${f(cg.bbox.top)})--`
               + `(${f(cg.bbox.right)},${f(cg.bbox.bottom)})` );
    console.log( '\tElement positions:' );
    cg.group.elements.map( a => {
        const x = cg.positions[a].x;
        const y = cg.positions[a].y;
        var color = '';
        if ( cg.highlights.background )
            color += ', bkgd:' + cg.highlights.background[a];
        if ( cg.highlights.border )
            color += ', bord:' + cg.highlights.border[a];
        if ( cg.highlights.top )
            color += ', top:' + cg.highlights.top[a];
        console.log( `\t\t${a} is at (${f(x)},${f(y)})${color}` );
    } );
    cg.cyclePaths.map( path => {
        console.log( `\tPart ${path.partIndex}, Cycle ${path.cycleIndex} `
                   + `(${path.cycle.join(',')}), Path ${path.pathIndex}:` );
        console.log( '\t\t' + path.map( point =>
            `(${f(point.x)},${f(point.y)})` ).join( '--' ) );
    } );
};

//// How to create the cycle graph for a group:
// const CG = new GE.CycleGraph( GE.Library.map.get( 'Z_3' ) );
// CG.highlightByBackground( [ [ 0 ], [ 1, 2 ] ] );
// showCycleGraph( CG, 2 );

//// Utility function for displaying a cycle graph:
const showMultTable = mt => {
    console.log( `Multiplication Table for "${mt.group.shortName}"`
               + ` (${mt.size}x${mt.size}):` );
    for ( var i = 0 ; i < mt.group.order ; i++ ) {
        const row = mt.elements[i], rowpos = mt.position( i );
        var content = [ ], dims = [ ],
            colors = [ ], borders = [ ], corners = [ ];
        for ( var j = 0 ; j < mt.group.order ; j++ ) {
            const col = mt.elements[j], colpos = mt.position( j );
            const prod = mt.group.mult( row, col );
            content.push( `(${i},${j}): ${prod}` );
            dims.push( `1x1 @ (${rowpos},${colpos})` );
            colors.push( mt.colors[prod] );
            if ( mt.borders ) borders.push( mt.borders[prod] );
            if ( mt.corners ) corners.push( mt.corners[prod] );
        }
        console.log( `\t${content.join( '\t\t' )}` );
        console.log( `\t${dims.join( '\t\t' )}` );
        console.log( `\t${colors.join( '\t' )}` );
        if ( mt.borders ) console.log( `\t${borders.join( '\t\t' )}` );
        if ( mt.corners ) console.log( `\t${corners.join( '\t\t' )}` );
        if ( i < mt.group.order - 1 )
            console.log( `\t${colors.map( _ => '---' ).join( '\t\t\t' )}` );
    }
};

//// How to create the multiplication table for a group:
// const MT = new GE.Multtable( GE.Library.map.get( 'V_4' ) );
// showMultTable( MT );

//// Utility function for displaying a Cayley graph:
const showCayleyDiagram = ( cd, precision = 3 ) => {
    const f = n => Number( n ).toFixed( precision );
    console.log( `Cayley diagram for "${cd.group.shortName}":` );
    cd.nodes.map( node => {
        const color = new THREE.Color( node.color );
        console.log( `\t${node.element} @ `
                   + `(${f(node.point.x)},${f(node.point.y)},${f(node.point.z)}), `
                   + `rgb: (${f(color.r)},${f(color.g)},${f(color.b)}), ${node.label}` );
        // node.radius is typically undefined, so not dumping that out here
        if ( node.colorHighlight )
            console.log( `\t\tColor highlight: ${node.colorHighlight}` );
        if ( node.ringHighlight )
            console.log( `\t\tRing highlight: ${node.ringHighlight}` );
        if ( node.squareHighlight )
            console.log( `\t\tSquare highlight: ${node.squareHighlight}` );
    } );
    cd.lines.map( line => {
        const arrow = line.arrowhead ? '->' : '--';
        const cgroup = line.vertices[0].curvedGroup.map( v => v.element ).sort().join( ',' );
        const style = line.style ? `curve in ${cgroup}`
                                 : 'line';
        console.log( `\t${line.arrow}-arrow: `
                   + `${line.vertices[0].element}${arrow}${line.vertices[1].element} `
                   + `${line.color} ${style}` );
        // not reporting line.offset here, but it's the user-edited curvature
    } );
};

//// How to create the multiplication table for a group:
GE.Library.loadFromFilesystem( './groups/S_3.group' );
const CD = new GE.CayleyDiagram( GE.Library.map.get( 'S_3' ) );
showCayleyDiagram( CD );
