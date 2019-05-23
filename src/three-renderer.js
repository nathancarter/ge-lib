
// This class is intended to be inherited by anything that draws 3D scenes,
// such as Symmetry Objects and Cayley Diagrams.

const { GroupRenderer } = require( './group-renderer' );

// Tools unique to 3D rendering
global.THREE = require( 'three' );
const SVGDOM = require( 'svgdom' );
global.window = new SVGDOM.Window();
global.document = window.document;
require( `${__dirname}/../node_modules/three/examples/js/renderers/Projector` );
require( `${__dirname}/../node_modules/three/examples/js/renderers/SVGRenderer` );

// Now the drawing class for 3D diagrams made of balls and sticks.
// (Though many little sticks can be arranged into a piecewise linear
// approximation of a curve.)
// (Note that while this class can render many different formats,
// it constructs an SVG internally, then produces all other
// formats by conversion after the fact.)
class ThreeRenderer extends GroupRenderer {
    constructor ( visualizer ) {
        super( visualizer );
        this.camera = new THREE.PerspectiveCamera( 45, 1, 0.1, 2000 );
        this.camera.position.z = 10;
        this.scene = new THREE.Scene();
        this.bgcolor = new THREE.Color( 1, 1, 1 );
        this.scene.background = this.bgcolor;
        this.renderer = new THREE.SVGRenderer();
        // The following constant is used to flip the y- and z-axes so that
        // generated diagrams are treated differently than hard-coded diagrams.
        // It's a hack, sorry.  Set it to -1 for generated Cayley diagrams.
        this.yzscale = 1;
        this.set( 'fogLevel', 0 ); // range: [0,1]
        this.set( 'zoomLevel', 1 ); // range unclear
        this.set( 'lineWidth', 5 ); // must be >0
        this.set( 'nodeScale', 1 ); // must be >0
        // We store the list of balls and sticks in the following member
        // variables.  Subclasses can populate these with the functions given
        // immediately below.  We then use this data to populate the scene at
        // render time.
        this.vertices = [ ];
        this.lines = [ ];
    }
    // To add a vertex, provide position, radius, and color:
    addVertex ( x, y, z, r, c ) {
        this.vertices.push( {
            pos : new THREE.Vector3( x, y, z ),
            radius : r,
            color : new THREE.Color( c )
        } );
    }
    // To clear all vertices, use this:
    clearVertices () { this.vertices = [ ]; }
    // To add a line segment, provide starting and ending position, plus color:
    addLine ( x1, y1, z1, x2, y2, z2, c ) {
        this.lines.push( {
            from : new THREE.Vector3( x1, y1, z1 ),
            to : new THREE.Vector3( x2, y2, z2 ),
            color : new THREE.Color( c )
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
    // The main drawing routine for 3D scenes.
    draw () {
        // place the camera based on where they've placed scene objects
        this.placeCamera();
        const w = this.get( 'width' );
        const h = this.get( 'height' );
        this.camera.aspect = w / h;
        this.camera.zoom = this.get( 'zoomLevel' );
        this.camera.updateProjectionMatrix();
        // delete everything in the scene
        this.scene.children.slice().map( child => this.scene.remove( child ) );
        // let subclasses populate the scene
        this.vertices.map( v => this.addVertexToScene( v ) );
        this.lines.map( l => this.addLineToScene( l ) );
        // render the scene at the desired size using the camera
        this.renderer.setSize( w, h );
        this.renderer.render( this.scene, this.camera );
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
    // Replace .svg() routine (which assumed we were working with this.canvas)
    // with one that uses this.renderer.domElement instead:
    svg () { return this.renderer.domElement.outerHTML; }
    // Internal-use functions to add lines to the scene:
    addVertexToScene ( vertex ) {
        const sphere = new THREE.Mesh(
            new THREE.SphereGeometry(
                vertex.radius * this.get( 'nodeScale' ), 12, 12 ),
            new THREE.MeshBasicMaterial( {
                color : this.adjustColor( vertex.color, vertex.pos )
            } ) );
        sphere.translateX( vertex.pos.x )
              .translateY( vertex.pos.y )
              .translateZ( vertex.pos.z );
        this.scene.add( sphere );
    }
    addLineToScene( line ) {
        var geometry = new THREE.BufferGeometry();
        geometry.addAttribute( 'position',
            new THREE.Float32BufferAttribute( [
                line.from.x, line.from.y, line.from.z,
                line.to.x, line.to.y, line.to.z
            ], 3 ) );
        const midpt = line.from.clone().add( line.to ).divideScalar( 2 );
        this.scene.add( new THREE.Line(
            geometry,
            new THREE.LineBasicMaterial( {
                color : this.adjustColor( line.color, midpt ),
                linewidth : this.get( 'lineWidth' )
            } )
        ) );
    }
    // Function to adjust a color to make it seem as if the scene has fog
    // (which THREE's SVGRenderer does not support by default):
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
