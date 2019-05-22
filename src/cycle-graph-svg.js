
// SVGDOM is a module for creating a fake browser window
// whose document contains an SVG root node.  The variable
// SGN stands for SVGDOM's Global Namespace.
const svgdom = require( 'svgdom' );

// Extend svgdom.Node with a new feature that svg.js expects it to have:
Object.defineProperty( svgdom.Node.prototype, 'firstElementChild', {
    get : function () {
        return this.childNodes.find( node =>
            node.nodeType == svgdom.Node.ELEMENT_NODE );
    }
} );

// SVG.js is a module for drawing SVGs.  Great!
const svgjs = require( '@svgdotjs/svg.js' );
const { SVG, registerWindow } = svgjs;

// Make SVGs able to import other SVGs:
svgjs.Element.prototype.insertSVG = function ( svgCode ) {
    return this.nested().svg( svgCode );
};

// How to create a new SVG canvas
createSVGCanvas = () => {
    const window = new svgdom.Window();
    const document = window.document;
    registerWindow( window, document );
    return SVG( document.documentElement );
}

// We can also convert MathML into SVGs.  Nice!
const MMLDB = require( './mathml-svg-db' );

// Now the cycle graph SVG drawing class
class CycleGraphSVG {
    constructor ( cg ) {
        this.cg = cg;
        this.canvas = createSVGCanvas();
    }
    elementName ( a ) {
        return MMLDB.get( this.cg.group.representation[a] ).svg;
    }
    render ( callback ) {
        MMLDB.add( this.cg.group.representation, () => {
            this.canvas.clear();
            const bbox = this.cg.bbox;
            this.cg.group.elements.map( a => {
                const pos = this.cg.positions[a];
                this.canvas.circle( 100 )
                           .fill( 'none' )
                           .stroke( { color : 'black', width : 3 } )
                           .move( pos.x*100, pos.y*100 );
                this.canvas.insertSVG( this.elementName( a ) )
                           .move( pos.x*100, pos.y*100 );
            } );
            if ( callback ) callback ( this.svg() );
        } );
    }
    svg () { return this.canvas.svg(); }
}

module.exports.CycleGraphSVG = CycleGraphSVG;
