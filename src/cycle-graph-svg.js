
const { GroupSVGRenderer } = require( './group-svg-renderer' );
const geom = require( './geometry' );

// Now the cycle graph SVG drawing class
class CycleGraphSVG extends GroupSVGRenderer {
    // set up default values for options
    constructor ( visualizer ) {
        super( visualizer );
        this.options = {
            width : 500,
            height : 500,
            radius : 25,
            marginLeft : 30,
            marginTop : 30,
            marginRight : 30,
            marginBottom : 30
        };
    }
    // Two functions for convenient transformations from cycle graph
    // coordinates to coordinates within the SVG we're constructing.
    // First, given a point in CG space, find it in SVG space.
    ptXY ( pt ) {
        const w = this.get( 'width' );
        const h = this.get( 'height' );
        const m = this.get( 'margins' );
        return {
            x : ( pt.x - this.viz.bbox.left )
              * ( w - m.left - m.right )
              / ( this.viz.bbox.right - this.viz.bbox.left )
              + m.left,
            y : ( pt.y - this.viz.bbox.top )
              * ( h - m.top - m.bottom )
              / ( this.viz.bbox.bottom - this.viz.bbox.top )
              + m.top
        }
    }
    // Then a convenience version
    eltXY ( elt ) { return this.ptXY( this.viz.positions[elt] ); }
    // Compute the minimum radius needed to contain all element names
    minimumRadius () {
        return this.viz.group.elements.map( a => {
            const dims = this.representationSize( a );
            return Math.max( dims.w, dims.h );
        } ).reduce( ( a, b ) => Math.max( a, b ) ) * 0.6;
        // 0.6 because circle diameter = 1.2 * name size, for margin
    }
    // Expand the margins to be just bigger than the current radius.
    setMarginsFromRadius () {
        const m = this.get( 'radius' ) * 1.25;
        this.set( {
            marginLeft : m,
            marginTop : m,
            marginRight : m,
            marginBottom : m
        } );
    }
    // Assuming the diagram will keep its current aspect ratio, compute
    // the scale factor that should be applied to the diagram width and
    // height, keeping the same margin and radius settings, to ensure
    // that every pair of nodes has a bit of space between them.
    // (If the group is trivial, return scale factor 1.)
    minimumScaleFactor () {
        if ( this.viz.positions.length < 2 ) return 1;
        const closestPair = geom.closestPair( this.viz.positions );
        const p1 = this.ptXY( closestPair.point1 );
        const p2 = this.ptXY( closestPair.point2 );
        const svgdist = geom.distance( p1, p2 );
        const goal = this.get( 'radius' ) * 2.5;
        const noMarginFactor = goal / svgdist;
        const w = this.get( 'width' );
        const h = this.get( 'height' );
        const m = this.get( 'margins' );
        const xfactor = ( noMarginFactor
                        * ( w - m.left - m.right ) + m.left + m.right ) / w;
        const yfactor = ( noMarginFactor
                        * ( h - m.top - m.bottom ) + m.top + m.bottom ) / h;
        return Math.max( xfactor, yfactor );
    }
    // Combine the above functions into conveniences for the client.
    setupSizeForSVG () {
        this.set( 'radius', this.minimumRadius() * 0.8 );
        this.setMarginsFromRadius();
        this.resizeBy( this.minimumScaleFactor() );
        this.set( 'fontScale', 1 );
    }
    setupSizeForPDF () {
        this.setupSizeForSVG();
        this.set( 'fontScale', 0.75 );
    }
    // The main drawing routine for cycle graphs.
    draw () {
        const lineWidth = this.get( 'lineWidth' )
                       || this.get( 'width' ) / 300;
        // Draw all paths first, beneath the nodes.  Always black.
        this.viz.cyclePaths.map( path => {
            for ( var i = 0 ; i < path.length - 1 ; i++ ) {
                const from = this.ptXY( path[i] );
                const to = this.ptXY( path[i+1] );
                this.canvas.line( from.x, from.y, to.x, to.y )
                           .stroke( { width : lineWidth, color : 'black' } );
            }
        } );
        // Draw all nodes next.  Pay attention to radius and highlights.
        const r = this.get( 'radius' );
        this.viz.group.elements.map( a => {
            const pos = this.eltXY( a );
            // draw background
            const bgColor = this.getHighlight( 'background', a );
            this.canvas.circle( 2*r )
                       .fill( bgColor || 'white' )
                       .stroke( 'none' )
                       .move( pos.x - r, pos.y - r );
            // draw outline
            const borderColor = this.getHighlight( 'border', a );
            this.canvas.circle( 2*r )
                       .fill( 'none' )
                       .stroke( borderColor ?
                                { color : borderColor, width : lineWidth * 2 } :
                                { color : 'black', width : lineWidth } )
                       .move( pos.x - r, pos.y - r );
            // write name
            this.writeElement( a, pos.x, pos.y );
        } );
    }
}

module.exports.CycleGraphSVG = CycleGraphSVG;
