
// This class is intended to be inherited by anything that draws 3D scenes,
// such as Symmetry Objects and Cayley Diagrams.

const { GroupRenderer } = require( './group-renderer' );

// Tools unique to 3D rendering
global.THREE = require( 'three' );
const SVGDOM = require( 'svgdom' );
global.window = new SVGDOM.Window();
global.document = window.document;

// Now the drawing class for 3D diagrams made of balls and sticks.
// (Though many little sticks can be arranged into a piecewise linear
// approximation of a curve, or a cubic Bézier curve can be fit to such
// an array of points to create a smooth curve from them.)
// (Note that while this class can render many different formats,
// it constructs an SVG internally, then produces all other
// formats by conversion after the fact.)
class ThreeRenderer extends GroupRenderer {
    constructor ( visualizer ) {
        super( visualizer );
        this.camera = new THREE.PerspectiveCamera( 45, 1, 0.1, 100 );
        this.scene = new THREE.Scene();
        this.bgcolor = new THREE.Color( 1, 1, 1 );
        this.scene.background = this.bgcolor;
        // this.renderer = new THREE.SVGRenderer();
        // The following constant is used to flip the y- and z-axes so that
        // generated diagrams are treated differently than hard-coded diagrams.
        // It's a hack, sorry.  Set it to -1 for generated Cayley diagrams.
        this.yzscale = 1;
        this.set( 'fogLevel', 0 ); // range: [0,1]
        this.set( 'zoomLevel', 1 ); // range unclear
        this.set( 'lineWidth', 5 ); // must be >0
        this.set( 'nodeScale', 1 ); // must be >0
        this.set( 'arrowheadPlacement', 1 ); // range: [0,1]
        this.set( 'arrowMargins', 0 ); // range: [0,0.5)
        this.set( 'arrowheadSize', 0.1 ); // range: (0,1)
        this.set( 'showNames', true ); // boolean
        // We store the list of balls and sticks in the following member
        // variables.  Subclasses can populate these with the functions given
        // immediately below.  We then use this data to populate the scene at
        // render time.
        this.vertices = [ ];
        this.lines = [ ];
    }
    // To add a vertex, provide position, radius, color, and optional element:
    addVertex ( x, y, z, r, c, e ) {
        const obj = {
            pos : new THREE.Vector3( x, y, z ),
            radius : r,
            color : new THREE.Color( c )
        };
        if ( typeof( e ) != 'undefined' ) obj.element = e;
        this.vertices.push( obj );
    }
    // To clear all vertices, use this:
    clearVertices () { this.vertices = [ ]; }
    // To add a line segment, provide starting and ending position, plus color,
    // and optionally whether it has an arrowhead (defaults to false):
    addLine ( x1, y1, z1, x2, y2, z2, c, a ) {
        this.lines.push( {
            from : new THREE.Vector3( x1, y1, z1 ),
            to : new THREE.Vector3( x2, y2, z2 ),
            color : new THREE.Color( c ),
            arrowhead : !!a
        } );
    }
    // To clear all lines, use this:
    clearLines () { this.lines = [ ]; }
    // Choose a sensible minimum size based on the current font scale.
    // By default, we just choose a reasonable size square.
    // Subclasses may override.
    chooseGoodSize () {
        this.set( 'width', 500 );
        this.set( 'height', 500 );
    }
    // How to project a point using the camera
    projectPoint ( x, y, z ) {
        return this.projectVector3( new THREE.Vector3( x, y, z ) );
    }
    // Alternate form of previous
    projectVector3 ( vector3 ) {
        var projected = new THREE.Vector4();
        projected.copy( vector3 ).applyMatrix4( this.projectionMatrix );
        const result = new THREE.Vector3( projected.x / projected.w,
                                          projected.y / projected.w,
                                          projected.z / projected.w );
        const w = this.get( 'width' );
        const h = this.get( 'height' );
        result.x = result.x * w / 2 + w / 2;
        result.y = -result.y * h / 2 + h / 2;
        result.z = this.camera.position.distanceTo( vector3 );
        return result;
    }
    // The main drawing routine for 3D scenes.
    draw () {
        // // place the camera based on where they've placed scene objects
        this.placeCamera();
        const w = this.get( 'width' );
        const h = this.get( 'height' );
        this.camera.aspect = w / h;
        this.camera.zoom = this.get( 'zoomLevel' );
        this.camera.updateProjectionMatrix();
        // make it possible to project points to screen coordinates
        this.camera.updateMatrixWorld();
        this.projectionMatrix = new THREE.Matrix4();
        this.projectionMatrix.multiplyMatrices(
            this.camera.projectionMatrix,
            this.camera.matrixWorldInverse );
        // start with an empty scene
        this.thingsToDraw = [ ];
        // let subclasses populate the scene
        this.vertices.map( v => this.addVertexToScene( v ) );
        this.lines.map( l => this.addLineToScene( l ) );
        // render the scene at the desired size using the camera
        this.thingsToDraw.sort( ( thing1, thing2 ) =>
            thing2.depth - thing1.depth );
        this.thingsToDraw.map( thing => thing.draw() );
    }
    // Get the locations of every vertex in the scene.
    getAllVertices () {
        var results = [ ];
        this.scene.traverse( obj => {
            var tmp = new THREE.Vector3( 0, 0, 0 );
            obj.getWorldPosition( tmp ); // puts result in tmp
            results.push( tmp );
        } );
        return results;
    }
    // Compute the radius of the smallest sphere centered on the origin
    // containing the scene.
    sceneRadius () {
        return this.vertices.map( v => v.pos.length() + v.radius )
            .concat( this.lines.map( l => l.from.length() ) )
            .concat( this.lines.map( l => l.to.length() ) )
            .concat( [ 1 ] )
            .reduce( ( a, b ) => Math.max( a, b ) );
    }
    // Make a decent guess of where to put the camera, based on the locations
    // of things in the scene.
    placeCamera () {
        // if the user provided a camera in the options, use that
        const userCam = this.get( 'cameraPos' );
        if ( userCam ) {
            this.camera.position.set( userCam.x, userCam.y, userCam.z );
            const userCamUp = this.get( 'cameraUp' );
            if ( userCamUp )
                this.camera.up.set( userCamUp.x, userCamUp.y, userCamUp.z );
            else
                this.camera.up.set( 0, 1, 0 );
            this.camera.lookAt( new THREE.Vector3( 0, 0, 0 ) );
            return;
        }
        // Otherwise figure one out for ourselves.  This is copied from very
        // similar code in Group Explorer's DisplayDiagram's setCamera().
        const points = this.vertices.map( v => v.pos )
            .concat( this.lines.map( l => l.from ) )
            .concat( this.lines.map( l => l.to ) );
        // if everything is in the yz plane, look from x=3
        if ( points.every( p => p.x == 0.0 ) ) {
            this.camera.position.set( 3, 0, 0 );
            this.camera.up.set( 0, this.yzscale, 0 );
        // if everything is in the xz plane, look from y=3
        } else if ( points.every( p => p.y == 0.0 ) ) {
            this.camera.position.set( 0, 3*this.yzscale, 0 );
            this.camera.up.set( 0, 0, -this.yzscale );
        // if everything is in the xy plane, look from z=3
        } else if ( points.every( p => p.z == 0.0 ) ) {
            this.camera.position.set( 0, 0, 3*this.yzscale );
            this.camera.up.set( 0, this.yzscale, 0 );
        // otherwise look from something sort of in the <1,1,1> direction,
        // but not exactly, so that box corners don't hide one another, and
        // so you can still tell that boxes and the like are 3D at 1st glance.
        } else {
            const pos = new THREE.Vector3( 1.7, 1.6*this.yzscale, 1.9*this.yzscale )
                                 .multiplyScalar( this.sceneRadius() );
            this.camera.position.set( pos.x, pos.y, pos.z );
            this.camera.up.set( 0, this.yzscale, 0 );
        }
        // always look at the origin
        this.camera.lookAt( new THREE.Vector3( 0, 0, 0 ) );
    }
    // This is the routine to which we delegate the setup of the 3D scene.
    // Then draw() will be able to render the objects we arrange here.
    // This is abstract; subclasses should override.
    setupScene () { }
    // Internal-use functions to add lines to the scene:
    addVertexToScene ( vertex ) {
        const screenPos = this.projectVector3( vertex.pos );
        const scale = this.get( 'nodeScale' ) / screenPos.z;
        const defaultRadius = 150;
        const defaultStroke = 5;
        const color = this.adjustColor( vertex.color, vertex.pos ).getHexString();
        this.thingsToDraw.push( {
            depth : screenPos.z,
            draw : () => {
                this.canvas.circle( defaultRadius * scale )
                           .fill( '#'+color )
                           .stroke( { color : 'black', width : defaultStroke * scale } )
                           .move( screenPos.x - defaultRadius * scale / 2,
                                  screenPos.y - defaultRadius * scale / 2 );
                if ( vertex.element && this.get( 'showNames' ) )
                    this.writeElement( vertex.element, screenPos.x, screenPos.y );
            }
        } );
    }
    addLineToScene( line ) {

        ///
        /// Right now this adds only straight lines.
        /// Later we must add code that repsects the line's style (straight/curved).
        ///

        const defaultStroke = 2;
        const addLineSegment = ( from, to, color ) => {
            const midpt = line.from.clone().add( line.to ).divideScalar( 2 );
            const colorWithFog = this.adjustColor( line.color, midpt ).getHexString();
            const screenMidpt = this.projectVector3( midpt );
            screenMidpt.z += 0.01; // nudge
            const screenFrom = this.projectVector3( from );
            const screenTo = this.projectVector3( to );
            const scale = this.get( 'lineWidth' ) / screenMidpt.z;
            this.thingsToDraw.push( {
                depth : screenMidpt.z,
                draw : () => {
                    this.canvas.line( screenFrom.x, screenFrom.y,
                                      screenTo.x, screenTo.y )
                               .fill( 'none' )
                               .stroke( { color : '#'+colorWithFog,
                                          width : defaultStroke * scale,
                                          linecap : 'round' } );
                }
            } );
        };
        const step = 0.05;
        const lerp = t => line.from.clone().lerp( line.to, t );
        const margin = this.get( 'arrowMargins' );
        for ( var t = margin ; t < 1-margin-step/2 ; t += step )
            addLineSegment( lerp( t ), lerp( t+step ), line.color );

        // if it has no arrowhead, stop here
        if ( !line.arrowhead ) return;

        // ok, it has an arrowhead, so let's add that
        const arrowT = Math.min( 1 - margin, Math.max( margin,
            this.get( 'arrowheadPlacement' ) ) );
        const end = lerp( arrowT );
        const close = lerp( arrowT - 0.05 );
        const lineLen = lerp( margin ).distanceTo( lerp( 1 - margin ) );
        const deriv = end.clone().sub( close )
            .normalize().multiplyScalar( lineLen * this.get( 'arrowheadSize' ) );
        const screenEnd = this.projectVector3( end );
        const screenButt = this.projectVector3(
            end.clone().add( deriv.clone().negate() ) );
        const depth = screenEnd.z - 0.01; // nudge
        const colorWithFog = this.adjustColor( line.color, close ).getHexString();
        screenEnd.z = 0;
        screenButt.z = 0;
        const screenDir = screenEnd.clone().sub( screenButt );
        const screenSideways = new THREE.Vector3().crossVectors(
            screenDir, new THREE.Vector3( 0, 0, 1 ) ).divideScalar( 2 );
        const oneSide = screenButt.clone().add( screenSideways );
        const otherSide = screenButt.clone().sub( screenSideways );
        const defaultLength = 4;
        const scale = this.get( 'lineWidth' ) / depth;
        this.thingsToDraw.push( {
            depth : depth,
            draw : () => {
                this.canvas.polygon( [
                    screenEnd.x, screenEnd.y,
                    oneSide.x, oneSide.y,
                    otherSide.x, otherSide.y
                ] ).fill( '#'+colorWithFog )
                   .stroke( { color : '#'+colorWithFog,
                              width : defaultStroke * scale,
                              linejoin : 'round' } );
            }
        } );
    }
    // Function to adjust a color to make it seem as if the scene has fog:
    adjustColor ( original, position ) {
        const r = this.sceneRadius();
        const cameraDistance = this.camera.position.length();
        const fogLevel = this.get( 'fogLevel' );
        // the next 4 lines come from GE's code, updateFogLevel() in
        // DisplayDiagram, so that we do here the same thing.
        const fogColor = this.bgcolor;
        const near = cameraDistance - r;
        const far = ( fogLevel == 0 ) ? 100 :
            ( cameraDistance + r * ( 5 - 4 * fogLevel ) );
        const objectDistance = position.distanceTo( this.camera.position );
        const p = ( objectDistance - near ) / ( far - near );
        return new THREE.Color(
            ( 1 - p ) * original.r + p * fogColor.r,
            ( 1 - p ) * original.g + p * fogColor.g,
            ( 1 - p ) * original.b + p * fogColor.b );
    }
}

module.exports.ThreeRenderer = ThreeRenderer;
