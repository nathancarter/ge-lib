
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
        const scale = this.minimumCellSize();
        this.set( 'width', this.viz.size * scale );
        this.set( 'height', this.viz.size * scale );
    // Convenience function for looking up whether an element is
    // highlighted in a particular way.
    getHighlight ( type, elt ) {
        if ( type == 'background' ) return this.viz.colors[elt];
        const key = `${type}s`;
        return this.viz[key] === undefined ? undefined : this.viz[key][elt];
    }
    // The main drawing routine for multiplication tables.
    draw () {
        const w = this.get( 'width' );
        const h = w;
        // stub...come back later
        this.canvas.line( 0, 0, w, h )
                   .fill( 'none' )
                   .stroke( { color : 'blue', width : 5 } );
        this.canvas.line( 0, h, w, 0 )
                   .fill( 'none' )
                   .stroke( { color : 'blue', width : 5 } );
    }
}

module.exports.MulttableRenderer = MulttableRenderer;
