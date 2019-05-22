
const { GroupSVGRenderer } = require( './group-svg-renderer' );

// Now the cycle graph SVG drawing class
class CycleGraphSVG extends GroupSVGRenderer {
    constructor ( visualizer ) {
        super( visualizer );
        // set up defaults
        this.options = {
            width : 500,
            height : 500,
            radius : 50
        };
    }
    eltXY ( elt ) {
        return {
            x : ( this.viz.positions[elt].x - this.viz.bbox.left )
                * this.get( 'width' )
                / ( this.viz.bbox.right - this.viz.bbox.left ),
            y : ( this.viz.positions[elt].y - this.viz.bbox.top )
                * this.get( 'height' )
                / ( this.viz.bbox.bottom - this.viz.bbox.top )
        }
    }
    draw () {
        const r = this.get( 'radius' );
        this.canvas.size( this.get( 'width' ), this.get( 'height' ) );
        this.viz.group.elements.map( a => {
            const pos = this.eltXY( a );
            this.canvas.circle( 2*r )
                       .fill( 'none' )
                       .stroke( { color : 'black', width : 3 } )
                       .move( pos.x, pos.y );
            this.writeElement( a, pos.x + r, pos.y + r );
        } );
    }
}

module.exports.CycleGraphSVG = CycleGraphSVG;
