
const { ThreeRenderer } = require( './three-renderer' );

// Now the Cayley diagram drawing class.
// (Note that while this class can render many different formats,
// it constructs an SVG internally, then produces all other
// formats by conversion after the fact.)
class CayleyDiagramRenderer extends ThreeRenderer {
    constructor ( visualizer ) {
        super( visualizer );
    }
    setupSizeForSVG ( callback ) {
        this.setup();
        super.setupSizeForSVG( callback );
    }
    setupSizeForPDF ( callback ) {
        this.setup();
        super.setupSizeForSVG( callback );
    }
    setup () {
        this.viz.lines.map( line => {
            for ( var i = 0 ; i < line.vertices.length - 1 ; i++ ) {
                const arrowhead = line.arrowhead
                               && i == line.vertices.length - 2;
                this.addLine( line.vertices[i].point.x,
                              line.vertices[i].point.y,
                              line.vertices[i].point.z,
                              line.vertices[i+1].point.x,
                              line.vertices[i+1].point.y,
                              line.vertices[i+1].point.z,
                              new THREE.Color( line.color ),
                              arrowhead,
                              line.style == 1 );
            }
        } );
        this.viz.nodes.map( node => {
            const radius = node.radius === undefined ?
                0.3 / Math.sqrt( this.viz.nodes.length ) :
                node.radius;
            const brighten = color =>
                typeof( color ) == 'undefined' ? undefined :
                color.replace( '53%, 30%', '100%, 80%' );
            this.addVertex( node.point.x, node.point.y, node.point.z,
                            radius, new THREE.Color( '#cccccc' ),
                            node.element, {
                                background : brighten( node.colorHighlight ),
                                ring : brighten( node.ringHighlight ),
                                square : brighten( node.squareHighlight )
                            } );
        } );
        if ( this.viz.isGenerated )
            this.yzscale = -1;
    }
}

module.exports.CayleyDiagramRenderer = CayleyDiagramRenderer;
