
// SVGDOM is a module for creating a fake browser window
// whose document contains an SVG root node.
const SVGDOM = module.exports.SVGDOM = require( 'svgdom' );

// SVG.js is a module for drawing SVGs.  Great!
const SVGjs = module.exports.SVGjs = require( '@svgdotjs/svg.js' );

// Creating a new SVG with SVG.js and SVGDOM takes several steps.
// So I'm packaging them up in one method here for easier use.
module.exports.create = () => {
    const window = new SVGDOM.Window();
    const document = window.document;
    SVGjs.registerWindow( window, document );
    return SVGjs.SVG( document.documentElement );
}

// Extend SVGDOM.Node with a new feature that SVG.js expects it to have.
// This is apparently a breaking change from SVG.js 2.7 to 3.0 that
// has not yet been supported in SVGDOM (?).
// I'm not sure I've implemented this 100% correctly, but it lets me
// implement the insertSVG() routine later in this module, which isn't
// possible without this, so I'm content.
Object.defineProperty( SVGDOM.Node.prototype, 'firstElementChild', {
    get : function () {
        return this.childNodes.find( node =>
            node.nodeType == SVGDOM.Node.ELEMENT_NODE );
    }
} );

// I'd like a convenience function so that, within any SVG Element,
// I can insert another SVG as a child.  The following function adds
// that convenience.
SVGjs.Element.prototype.insertSVG = function ( svgCode ) {
    return this.nested().svg( svgCode );
};
