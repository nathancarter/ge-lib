
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
        if ( !this.representationsComputed )
            throw 'Cannot fetch element representation '
                + 'if computeRepresentations() has not finished.';
        return MMLDB.get( this.viz.group.representation[a] ).svg;
    }
    // Render group to SVG asynchronously, calling the internal
    // draw() method to fill the canvas with the group's
    // representation.  Subclasses should just implement draw().
    render ( callback ) {
        this.computeRepresentations( () => {
            this.canvas.clear();
            this.draw();
            if ( callback ) callback( this.svg() );
        } );
    }
    // Default draw method is just a stub.  Subclasses write this.
    draw () { }
}

module.exports.GroupSVGRenderer = GroupSVGRenderer;
