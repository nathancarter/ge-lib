
// This module provides a base class for all those classes that
// will render a group to an SVG, in any way (Multiplication
// Table, Cayley Diagram, Cycle Graph, or Symmetry Object).
// It handles such things as converting element names to SVG
// format, creating SVG canvases, etc.

// We want to be able to create and manipulate SVGs in node.js:
const SVG = require( './svg-utils' );
// We want to be able to convert MathML to SVGs:
const MMLDB = require( './mathml-svg-db' );

// The main class of this module:
class GroupSVGRenderer {
    // The visualizer will be something like a CayleyDiagram,
    // CycleGraph, Multtable, or SymmetryObject instance.
    constructor ( visualizer ) {
        this.viz = visualizer;
        this.canvas = SVG.create();
        this.representationsComputed = false;
        this.options = { };
    }
    // Use these functions to set or get options that subclasses
    // may respect while drawing the SVG.
    set ( key, value ) {
        if ( key instanceof Object )
            return Object.assign( this.options, key );
        this.options[key] = value;
    }
    get ( key ) {
        if ( key == 'margins' ) return {
            left : this.options.marginLeft,
            top : this.options.marginTop,
            right : this.options.marginRight,
            bottom : this.options.marginBottom
        }
        return this.options[key];
    }
    // Resize canvas absolutely or relatively:
    resizeTo ( w, h ) { this.set( { width : w, height : h } ); }
    resizeBy ( f ) {
        this.resizeTo( this.get( 'width' ) * f, this.get( 'height' ) * f );
    }
    // Once the thing is rendered, you can ask for it in SVG
    // format.
    svg () { return this.canvas.svg(); }
    // Asynchronous conversion of all group element names to SVG
    // code.  You only need to do this once, unless you change
    // the underlying representations in this.viz.group.  In that
    // case, there is no harm in calling this again.
    computeRepresentations ( callback ) {
        MMLDB.add( this.viz.group.representation, () => {
            this.representationsComputed = true;
            if ( callback ) callback();
        } );
    }
    // Convert a group element to SVG code.
    // If you haven't run computeAllNames() and let it finish its
    // callback, this will throw an error.
    representation ( a ) {
        return this.representationData( a ).svg;
    }
    // Same as previous, but returns all representation data, not
    // just the SVG code.
    representationData ( a ) {
        if ( !this.representationsComputed )
            throw 'Cannot fetch element representation '
                + 'if computeRepresentations() has not finished.';
        return MMLDB.get( this.viz.group.representation[a] );
    }
    // Complete ad-hoc estimate of how big the text for a
    // representation is, in abstract SVG user units.  If I ever
    // later figure out the correct way to do this, I can drop
    // these magic constants.
    representationSize ( a ) {
        const data = this.representationData( a );
        return {
            w : parseFloat( data.width ) * 8,
            h : parseFloat( data.height ) * 8
        };
    }
    // Write the representation of an element centered on a given
    // point on the canvas.
    // Because font size can be screwed up in conversion to PDF,
    // you may wish to set( 'fontScale', 0.75 ) or so before this,
    // if your resulting SVG is going to be converted to PDF.
    // (It won't look right as an SVG, but will look right after
    // conversion to PDF.)
    writeElement ( a, x, y ) {
        const scale = this.get( 'fontScale' ) || 1.0;
        const size = this.representationSize( a );
        const name = this.representation( a );
        return this.canvas.insertSVG( name )
                          .move( x - size.w / 2 * scale,
                                 y - size.h / 2 * scale );
    }
    // Render group to SVG asynchronously, calling the internal
    // draw() method to fill the canvas with the group's
    // representation.  Subclasses should just implement draw().
    render ( callback ) {
        this.computeRepresentations( () => {
            this.canvas.size( this.get( 'width' ), this.get( 'height' ) );
            this.canvas.clear();
            this.draw();
            if ( callback ) callback( this.svg() );
        } );
    }
    // Default draw method is just a stub.  Subclasses write this.
    draw () { }
    // Convenience function for looking up whether an element is
    // highlighted in a particular way.
    getHighlight ( type, elt ) {
        return this.viz.hasOwnProperty( 'highlights' )
            && this.viz.highlights.hasOwnProperty( type ) ?
               this.viz.highlights[type][elt] : undefined;
    }
}

module.exports.GroupSVGRenderer = GroupSVGRenderer;
