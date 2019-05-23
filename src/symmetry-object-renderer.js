
const { ThreeRenderer } = require( './three-renderer' );

// Now the symmetry object drawing class.
// (Note that while this class can render many different formats,
// it constructs an SVG internally, then produces all other
// formats by conversion after the fact.)
class SymmetryObjectRenderer extends ThreeRenderer {
    constructor ( visualizer ) {
        super( visualizer );
        this.viz.lines.map( line => {
            for ( var i = 0 ; i < line.vertices.length - 1 ; i++ )
                this.addLine( line.vertices[i].point.x,
                              line.vertices[i].point.y,
                              line.vertices[i].point.z,
                              line.vertices[i+1].point.x,
                              line.vertices[i+1].point.y,
                              line.vertices[i+1].point.z,
                              line.color );
        } );
        this.viz.nodes.map( node =>
            this.addVertex( node.point.x, node.point.y, node.point.z,
                            node.radius, node.color ) );
    }
}

module.exports.SymmetryObjectRenderer = SymmetryObjectRenderer;
