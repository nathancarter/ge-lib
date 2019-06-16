
// This class is intended to be inherited by anything that draws 3D scenes,
// such as Symmetry Objects and Cayley Diagrams.

const { GroupRenderer } = require( './group-renderer' );
const fitter = require( './fit-cubic-bezier' );

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
        this.set( 'arrowMargins', 0.05 ); // range: [0,?)
        this.set( 'arrowheadSize', 0.1 ); // range: (0,1)
        this.set( 'showNames', true ); // boolean
        this.set( 'brightHighlights', 0 ); // range: [0,1]==[none,max]
        // We store the list of balls and sticks in the following member
        // variables.  Subclasses can populate these with the functions given
        // immediately below.  We then use this data to populate the scene at
        // render time.
        this.vertices = [ ];
        this.lines = [ ];
    }
    // To add a vertex, provide position, radius, color, and optional element
    // and highlight data:
    addVertex ( x, y, z, r, c, e, h ) {
        const obj = {
            pos : new THREE.Vector3( x, y, z ),
            radius : r,
            color : new THREE.Color( c ),
            highlights : h
        };
        if ( typeof( e ) != 'undefined' ) obj.element = e;
        this.vertices.push( obj );
    }
    // To clear all vertices, use this:
    clearVertices () { this.vertices = [ ]; }
    // To add a line segment, provide starting and ending position, plus color,
    // the element this arrow represents (optional, for symmetry objects),
    // and optionally whether it has an arrowhead (defaults to false)
    // and optionally whether it is curved (defaults to false)
    // and optionally curved group data for start and end points (defaults to undefined):
    addLine ( x1, y1, z1, x2, y2, z2, c, elt, a, cu, cg1, cg2 ) {
        this.lines.push( {
            from : new THREE.Vector3( x1, y1, z1 ),
            to : new THREE.Vector3( x2, y2, z2 ),
            color : new THREE.Color( c ),
            arrowhead : !!a,
            curved : !!cu,
            group1 : cg1,
            group2 : cg2,
            element : elt
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
        this.camera.zoom = this.viz.zoomLevel;
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
    defaultRadius () { return 0.3 / Math.sqrt( this.vertices.length ) };
    addVertexToScene ( vertex ) {
        const screenPos = this.projectVector3( vertex.pos );
        const scale = this.viz.nodeScale * ( vertex.r || this.defaultRadius() )
                    / screenPos.z;
        const defaultRadius = 500;
        const defaultStroke = 5;
        const ringScale = 1.2 * scale;
        const squareScale = 1.3 * scale;
        const getHL = ( name, defaultColor ) => {
            var result;
            if ( vertex.highlights && vertex.highlights[name] ) {
                result = new THREE.Color( vertex.highlights[name] );
                var hsl = { };
                result.getHSL( hsl );
                hsl.h = Math.floor( 360 * hsl.h );
                const pure = new THREE.Color( `hsl( ${hsl.h}, 100%, 100% )` );
                result.lerpHSL( pure, this.get( 'brightHighlights' ) );
            } else {
                result = defaultColor;
            }
            if ( !result ) return result;
            result = this.adjustColor( result, vertex.pos );
            return '#' + result.getHexString();
        }
        const color = getHL( 'background', vertex.color );
        this.thingsToDraw.push( {
            depth : screenPos.z,
            draw : () => {
                this.canvas.circle( defaultRadius * 2 * scale )
                           .fill( color )
                           .stroke( {
                               color : 'black',
                               width : defaultStroke * scale
                                     / ( vertex.r || this.defaultRadius() )
                           } )
                           .move( screenPos.x - defaultRadius * scale,
                                  screenPos.y - defaultRadius * scale );
                if ( typeof( vertex.element ) != 'undefined'
                  && this.get( 'showNames' ) )
                    this.writeElement( vertex.element, screenPos.x, screenPos.y );
                const ringc = getHL( 'ring' );
                if ( ringc )
                    this.canvas.circle( defaultRadius * 2 * ringScale )
                               .fill( 'none' )
                               .stroke( {
                                   color : ringc,
                                   width : defaultStroke * 3 * scale
                                         / ( vertex.r || this.defaultRadius() )
                               } )
                               .move( screenPos.x - defaultRadius * ringScale,
                                      screenPos.y - defaultRadius * ringScale );
                const squarec = getHL( 'square' );
                if ( vertex.highlights && vertex.highlights.square )
                    this.canvas.rect( defaultRadius * 2 * squareScale,
                                      defaultRadius * 2 * squareScale )
                               .fill( 'none' )
                               .stroke( {
                                   color : squarec,
                                   width : defaultStroke * 3 * scale
                                         / ( vertex.r || this.defaultRadius() )
                               } )
                               .move( screenPos.x - defaultRadius * squareScale,
                                      screenPos.y - defaultRadius * squareScale );
            }
        } );
    }
    addLineToScene( line ) {
        // first determine whether we need to introduce curvature to avoid
        // bumping other points.  this code imitates code from DisplayDiagram.js in GE.
        if ( line.curved )
            line.offset = ( line.offset === undefined ) ? 0.2 : line.offset;
        const radius = this.viz.nodeScale
                     * ( this.vertices[0].r || this.defaultRadius() ),
              start2end = line.to.clone().sub( line.from ),
              start2end_sq = line.from.distanceToSquared( line.to ),
              start2end_len = Math.sqrt( start2end_sq ),
              min_squared_distance = 1.5 * radius * radius;
        this.vertices.map( vertex => {
            const start2sphere = vertex.pos.clone().sub( line.from ),
                  start2sphere_sq = line.from.distanceToSquared( vertex.pos ),
                  end2sphere_sq = line.to.distanceToSquared( vertex.pos ),
                  start2end_sq = line.from.distanceToSquared( line.to ),
                  x = ( start2end_sq - end2sphere_sq + start2sphere_sq )
                    / ( 2 * start2end_len ),
                  normal = start2sphere.clone().sub(
                      start2end.clone().multiplyScalar( x / start2end_len ) );
            if (   start2sphere_sq != 0
                && end2sphere_sq != 0
                && x > 0
                && x < start2end_len
                && normal.lengthSq() < min_squared_distance )
            {
                line.offset = ( line.offset === undefined ) ?
                    1.7 * radius / Math.sqrt( start2end_sq ) : line.offset;
            }
        } );

        // we will break lines or curves down into tiny segments.
        // here are functions that will add each segment to the scene.
        const defaultStroke = 2;
        const addLineSegment = ( from, to, color ) => {
            const midpt = line.from.clone().add( line.to ).divideScalar( 2 );
            const colorWithFog = this.adjustColor( line.color, midpt ).getHexString();
            const screenMidpt = this.projectVector3( midpt );
            screenMidpt.z += 0.01; // nudge
            const scale = this.viz.lineWidth / screenMidpt.z;
            const screenFrom = this.projectVector3( from );
            const screenTo = this.projectVector3( to );
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
        const addCubicBezierSegment = ( points, color ) => {
            const midpt = points[Math.floor( points.length / 2 )];
            const colorWithFog = this.adjustColor( line.color, midpt ).getHexString();
            const screenMidpt = this.projectVector3( midpt );
            screenMidpt.z += 0.01; // nudge
            const scale = this.viz.lineWidth / screenMidpt.z;
            const screenPoints = points.map( pt => this.projectVector3( pt ) )
                                       .map( pt => [ pt.x, pt.y ] );
            const C = fitter.fit( screenPoints );
            const path = `M${C[0][0]} ${C[0][1]} `
                       + `C${C[1][0]} ${C[1][1]} `
                       + ` ${C[2][0]} ${C[2][1]} `
                       + ` ${C[3][0]} ${C[3][1]}`;
            this.thingsToDraw.push( {
                depth : screenMidpt.z,
                draw : () => {
                    this.canvas.path( path )
                               .fill( 'none' )
                               .stroke( { color : '#'+colorWithFog,
                                          width : defaultStroke * scale,
                                          linecap : 'round' } );
                }
            } );
        };

        // if the line is curved, figure that out now.
        var curveFunction;
        if ( line.curved || line.offset > 0 ) {
            const middle = this.getControlPoint( line );
            curveFunction = t =>
                line.from.clone().lerp( middle, t ).lerp(
                    middle.clone().lerp( line.to, t ), t );
        } else {
            curveFunction = t => line.from.clone().lerp( line.to, t );
        }

        // compute correct margins based on actual curve shape
        const seek = ( f, d, a, b ) => {
            // find t in [0,1] s.t. dist(f(t),f(1)) ~ d
            // a and b are for internal use; clients do not pass them
            if ( typeof( a ) == 'undefined' ) {
                // first call
                if ( f( 0 ).distanceTo( f( 1 ) ) < d ) return 0;
                return seek( f, d, 0, 1 );
            }
            // otherwise do a binary search
            const m = ( a + b ) / 2;
            const dist = f( m ).distanceTo( f( 1 ) );
            return dist - d < -0.001 ? seek( f, d, a, m ) :
                   dist - d > +0.001 ? seek( f, d, m, b ) : m;
        }
        const margin = this.get( 'arrowMargins' );
        const redge = seek( curveFunction, margin );
        const ledge = 1 - seek( t => curveFunction( 1 - t ), margin );
        const curvePoints = ( mint, maxt, steps ) => {
            var result = [ ];
            const dt = ( maxt - mint ) / steps;
            for ( var t = mint ; t < maxt+dt/2 ; t += dt )
                result.push( curveFunction( t ) );
            return result;
        }

        // generate many points along the line or curve...
        // add the line or curve to the scene, in one of two ways
        if ( this.viz.fogLevel == 0 ) {
            // there is no fog, so we can do a single line/curve piece
            if ( line.curved || line.offset > 0 ) {
                addCubicBezierSegment( curvePoints( ledge, redge, 7 ),
                                       line.color );
            } else {
                addLineSegment( curveFunction( ledge ), curveFunction( redge ),
                                line.color );
            }
        } else {
            // there is some fog, so we must do many little pieces
            if ( line.curved || line.offset > 0 ) {
                for ( var t = ledge ; t < redge-step/2 ; t += step )
                    addCubicBezierSegment( curvePoints( ledge, redge, 7 ),
                                           line.color );
            } else {
                const step = 0.05;
                for ( var t = ledge ; t < redge-step/2 ; t += step )
                    addLineSegment( curveFunction( t ), curveFunction( t+step ),
                                    line.color );
            }
        }

        // if it has an arrowhead, draw that last.
        if ( !line.arrowhead ) return;
        const arrowT = Math.min( redge, Math.max( ledge,
            this.viz.arrowheadPlacement ) );
        const end = curveFunction( arrowT );
        const close = curveFunction( arrowT - 0.05 );
        const len = curveFunction( ledge ).distanceTo( curveFunction( redge ) );
        const deriv = end.clone().sub( close )
            .normalize().multiplyScalar( this.get( 'arrowheadSize' ) );
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
        const scale = this.viz.lineWidth / depth;
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
        // the next 4 lines come from GE's code, updateFogLevel() in
        // DisplayDiagram, so that we do here the same thing.
        const fogColor = this.bgcolor;
        const near = cameraDistance - r;
        const far = ( this.viz.fogLevel == 0 ) ? 100 :
            ( cameraDistance + r * ( 5 - 4 * this.viz.fogLevel ) );
        const objectDistance = position.distanceTo( this.camera.position );
        const p = ( objectDistance - near ) / ( far - near );
        return new THREE.Color(
            ( 1 - p ) * original.r + p * fogColor.r,
            ( 1 - p ) * original.g + p * fogColor.g,
            ( 1 - p ) * original.b + p * fogColor.b );
    }
    // Function to figure out how to make a line that needs to be curved
    // between two nodes in a Cayley Diagram curve appropriately, by
    // computing the middle control point for a quadratic Bézier curve:
    getControlPoint ( line ) {
        const startPoint = line.from,
              endPoint = line.to,
              center = this.getCenterOfCurvature( line ),
              start = startPoint.clone().sub( center ),
              end = endPoint.clone().sub( center ),
              offsetDistance = line.offset * startPoint.distanceTo( endPoint ),
              halfway = new THREE.Vector3().addVectors( start, end ).multiplyScalar( 0.5 ),
              start2end = end.clone().sub( start ),
              x = -start.dot( start2end ) / end.dot( start2end ), // start + x*end is normal to start - end
              normal = ( ( end.dot( start2end ) == 0 ) ? end.clone() :
                           start.clone().add( end.clone().multiplyScalar( x ) ) ).normalize(),
              offset = normal.clone().multiplyScalar( 2 * offsetDistance ),
              middle = center.clone().add( halfway ).add( offset );
        return line.middle = middle;
    }
    // Utility function used by the previous:
    getCenterOfCurvature ( line ) {
        const startPoint = line.from,
              endPoint = line.to;
        const centerOK = point =>
            new THREE.Vector3().crossVectors( startPoint.clone().sub( point ),
                                              endPoint.clone().sub( point ) )
                               .lengthSq() > 1.e-4;

        // if center is spec'd, check it and if OK, return that
        if ( line.center !== undefined && centerOK( line.center ) )
            return line.center;

        // if nodes are in the same curved group, find avg of nodes and use that as the center
        if ( line.group1 !== undefined
          && line.group1 == line.group2 ) {
            line.center = line.group1
                              .reduce( ( center, node ) =>
                                           center.add( node.point ), new THREE.Vector3() )
                              .multiplyScalar( 1 / line.group1.length );
            if ( centerOK( line.center ) ) return line.center;
        }

        // if center not spec'd, or not OK, try (0,0,0); if that's OK, return that
        line.center = new THREE.Vector3( 0, 0, 0 );
        if ( centerOK( line.center ) ) return line.center;

        // if (0,0,0)'s not OK, form (camera, start, end) plane, get unit normal
        line.center = new THREE.Vector3().crossVectors(
            this.camera.position.clone().sub( startPoint ),
            endPoint.clone().sub( startPoint )
        ).normalize().add( startPoint.clone().add( endPoint ).multiplyScalar( 0.5 ) );
        if ( centerOK( line.center ) ) return line.center;

        throw "Can't find center for line curve!"
    }
}

module.exports.ThreeRenderer = ThreeRenderer;
