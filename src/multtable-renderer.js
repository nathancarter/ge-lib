
const { GroupRenderer } = require( './group-renderer' );
const geom = require( './geometry' );

// Now the multiplication table drawing class.
// (Note that while this class can render many different formats,
// it constructs an SVG internally, then produces all other
// formats by conversion after the fact.)
class MulttableRenderer extends GroupRenderer {
    // Compute the minimum cell size needed to contain all element names
    minimumCellSize () {
        return this.viz.group.elements.map( a => {
            const dims = this.representationSize( a );
            return Math.max( dims.w, dims.h );
        } ).reduce( ( a, b ) => Math.max( a, b ) ) * 1.1; // add 10% margin
    }
    // Given an element, find the position of its cell, which can be
    // interpreted in either of two (synonymous) ways:
    // - the left edge of that element's cell in the top row of the table
    // - the top edge of that element's cell in the left col of the table
    elementPosition ( a ) {
        return this.viz.position( a ) * this.get( 'width' ) / this.viz.size;
    }
    // Choose a sensible minimum size based on the current font scale.
    chooseGoodSize () {
        this.set( 'cellSize', this.minimumCellSize() );
        this.set( 'width', this.viz.size * this.get( 'cellSize' ) );
        this.set( 'height', this.viz.size * this.get( 'cellSize' ) );
    }
    // Convenience function for looking up whether an element is
    // highlighted in a particular way.
    getHighlight ( type, elt ) {
        if ( type == 'background' ) return this.viz.colors[elt];
        const key = `${type}s`;
        return this.viz[key] === undefined ? undefined : this.viz[key][elt];
    }
    // The main drawing routine for multiplication tables.
    draw () {
        const size = this.get( 'cellSize' );
        const lw = this.get( 'lineWidth' ) || this.get( 'width' ) / 500;
        // loop through table rows
        this.viz.elements.map( ( rowelt, rowidx ) => {
            const rowpos = this.elementPosition( rowelt );
            // loop through table columns
            this.viz.elements.map( ( colelt, colidx ) => {
                const colpos = this.elementPosition( colelt );
                // compute element in that cell
                const prod = this.viz.group.mult( rowelt, colelt );
                // draw cell background
                const bgColor = this.getHighlight( 'background', prod );
                this.canvas.rect( size, size )
                           .fill( bgColor || 'white' )
                           .stroke( { width : lw, color : 'black' } )
                           .move( colpos, rowpos );
                // if needed, draw border highlight
                const borderColor = this.getHighlight( 'border', prod );
                if ( borderColor ) {
                    const borderWidth = lw * 2;
                    this.canvas.rect( size - borderWidth - lw, size - borderWidth - lw )
                               .fill( 'none' )
                               .stroke( { color : borderColor, width : borderWidth } )
                               .move( colpos + borderWidth / 2 + lw / 2,
                                      rowpos + borderWidth / 2 + lw / 2 );
                }
                // if needed, draw corner highlight
                const corColor = this.getHighlight( 'corner', prod );
                if ( corColor ) {
                    const cw = size / 3;
                    this.canvas.path( `M0 0 ${cw} 0 0 ${cw} Z` )
                               .fill( corColor )
                               .stroke( { width : lw, color : 'black' } )
                               .move( colpos, rowpos );
                }
                // write name
                this.writeElement( prod, colpos + size / 2, rowpos + size / 2 );
            } );
        } );
    }
}

module.exports.MulttableRenderer = MulttableRenderer;
