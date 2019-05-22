
const { GroupSVGRenderer } = require( './group-svg-renderer' );

// Now the cycle graph SVG drawing class
class CycleGraphSVG extends GroupSVGRenderer {
    draw () {
        const bbox = this.viz.bbox;
        this.viz.group.elements.map( a => {
            const pos = this.viz.positions[a];
            this.canvas.circle( 100 )
                       .fill( 'none' )
                       .stroke( { color : 'black', width : 3 } )
                       .move( pos.x*100, pos.y*100 );
            this.canvas.insertSVG( this.representation( a ) )
                       .move( pos.x*100, pos.y*100 );
        } );
    }
}

module.exports.CycleGraphSVG = CycleGraphSVG;
