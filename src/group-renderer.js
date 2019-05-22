
// This module provides a base class for all those classes that
// will render a group to an SVG/PDF/PNG, in any way (Multiplication
// Table, Cayley Diagram, Cycle Graph, or Symmetry Object).
// It handles such things as converting element names to SVG
// format, creating SVG canvases, converting SVGs to PDFs or PNGs,
// etc.

// We want to be able to create and manipulate SVGs in node.js:
const SVG = require( './svg-utils' );
// We want to be able to convert MathML to SVGs:
const MMLDB = require( './mathml-svg-db' );
// We will occasionally write intermediate results to temp files:
const tempfile = require( 'tempfile' )
// We will occasionally run conversion routines in CLI scripts:
const { exec } = require( 'child_process' );

// The main class of this module:
class GroupRenderer {
    // The visualizer will be something like a CayleyDiagram,
    // CycleGraph, Multtable, or SymmetryObject instance.
    constructor ( visualizer ) {
        this.viz = visualizer;
        this.canvas = SVG.create();
        this.representationsComputed = false;
        this.options = { };
    }
    // Use these functions to set or get options that subclasses
    // may respect while drawing.
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
        const scale = this.get( 'fontScale' ) || 1.0;
        return {
            w : parseFloat( data.width ) * 8 * scale,
            h : parseFloat( data.height ) * 8 * scale
        };
    }
    // Write the representation of an element centered on a given
    // point on the canvas.
    writeElement ( a, x, y ) {
        const scale = this.get( 'fontScale' ) || 1.0;
        const size = this.representationSize( a );
        const name = this.representation( a );
        return this.canvas.insertSVG( name )
                          .move( x - size.w / 2, y - size.h / 2 );
    }
    // Render group to an SVG string asynchronously, calling the
    //  internal draw() method to fill the canvas with the group's
    // representation.  Subclasses should just implement draw().
    renderSVGString ( callback ) {
        this.computeRepresentations( () => {
            this.canvas.size( this.get( 'width' ), this.get( 'height' ) );
            this.canvas.clear();
            this.draw();
            if ( callback ) callback( this.svg() );
        } );
    }
    // Same as previous, but save to a file, then call callback.
    // Callback is still passed the SVG code that was saved to the file.
    // Be sure that the filename you pass ends with .svg or your
    // operating system may be confused about its contents!
    renderSVGFile ( filename, callback ) {
        this.setupSizeForSVG( () => {
            this.renderSVGString( svg => {
                require( 'fs' ).writeFile( filename, svg, err => {
                    if ( err ) throw err;
                    if ( callback ) callback ( svg );
                } )
            } );
        } );
    }
    // Same as previous, but save to a temp SVG file, then call a shell
    // script to convert to the desired PDF file, then call the callback
    // with the SVG code.
    // Be sure that the filename you pass ends with .pdf or your
    // operating system may be confused about its contents!
    //
    // You may ask:
    // Why use a command-line script when there is a node module for
    // rsvg?  Because I tried installing it, but got build errors, and
    // the GitHub issue tracker says many other people are in the same
    // boat.  So that package doesn't seem mature enough to use yet.
    // For reference later, if/when it gets more usable, it is here:
    // https://www.npmjs.com/package/rsvg
    renderPDFFile ( filename, callback ) {
        this.setupSizeForPDF( () => {
            this.renderSVGString( svg => {
                const tmpfile = tempfile( '.svg' );
                require( 'fs' ).writeFile( tmpfile, svg, err => {
                    if ( err ) throw err;
                    const cmd =
                        `rsvg-convert -f pdf -o ${filename} ${tmpfile}`;
                    exec( cmd, ( err, stdout, stderr ) => {
                        if ( err ) throw err;
                        if ( callback ) callback ( svg );
                    } );
                } );
            } );
        } );
    }
    // Same as previous, but save to a temp PDF file, then call a shell
    // script to convert to the desired PNG file, then callback with the
    // SVG code.
    // Be sure that the filename you pass ends with .png or your
    // operating system may be confused about its contents!
    renderPNGFile ( filename, callback ) {
        const tmpfile = tempfile( '.pdf' );
        this.renderPDFFile( tmpfile, svg => {
            const cmd = `convert ${tmpfile} ${filename}`;
            exec( cmd, ( err, stdout, stderr ) => {
                if ( err ) throw err;
                if ( callback ) callback ( svg );
            } );
        } );
    }
    // Since the conversion from SVG to PDF doesn't seem to preserve
    // font sizes perfectly, we need two functions, one for setting up
    // renderer size expecting SVG output (regular font size) and one
    // expecting PDF output (slightly smaller font size).  Subclasses
    // should just implement chooseGoodSize().
    setupSizeForSVG ( callback ) {
        this.computeRepresentations( () => {
            this.set( 'fontScale', 1 );
            this.chooseGoodSize();
            if ( callback ) callback();
        } );
    }
    setupSizeForPDF ( callback ) {
        this.computeRepresentations( () => {
            this.set( 'fontScale', 0.75 );
            this.chooseGoodSize();
            if ( callback ) callback();
        } );
    }
    chooseGoodSize () { }
    // Default draw method is just a stub.  Subclasses write this.
    draw () { }
}

module.exports.GroupRenderer = GroupRenderer;
