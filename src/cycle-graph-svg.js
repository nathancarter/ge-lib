
// We want to be able to create and manipulate SVGs in node.js:
const SVG = require( './svg-utils' );
// We want to be able to convert MathML to SVGs:
const MMLDB = require( './mathml-svg-db' );

// Now the cycle graph SVG drawing class
class CycleGraphSVG {
    constructor ( cg ) {
        this.cg = cg;
        this.canvas = SVG.create();
    }
    elementName ( a ) {
        return MMLDB.get( this.cg.group.representation[a] ).svg;
    }
    render ( callback ) {
        MMLDB.add( this.cg.group, () => {
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
