
// This module fits a cubic Bézier curve to a set of points in space.
// That is, given P1,...,Pn, this finds control point C1,C2,C3,C4 in
// the same number of dimensions as each Pi such that the cubic
// Bézier curve built from C1,C2,C3,C4 begins at P1, ends at Pn, and
// passes as close as possible to all the Pi on the way.

const optim = require( 'optimization-js' );

// The workhorse function.  Pass an array of points, in this form:
// [ [ p1x, p1y ], ..., [ pnx, pny ] ], where it is acceptable for
// the points to be in any R^n, not just R^2, as in this example.
// No check is done to be sure that the input is in this form; it
// is just trusted.  Result is in the same format, but of length 4.
module.exports.fit = pointArray => {
    // C1 = P1, C4 = Pn
    const C1 = pointArray[0];
    const C4 = pointArray[pointArray.length-1];
    const D1 = vectorDiff( pointArray[1], pointArray[0] );
    const Dn = vectorDiff( pointArray[pointArray.length-1],
                           pointArray[pointArray.length-2] );
    // now create a vector to optimize, consisting of the initial
    // values of C2 and C3 concatenated into one big vector.
    // our initial guesses for them are based on appx. derivatives.
    var vector = vectorSum( C1, scalarMult( 3, D1 ) ).concat(
                 vectorSum( C4, scalarMult( -3, Dn ) ) );
    // 10 points along the curve is enough to determine the curve
    var copy = pointArray.slice();
    const numToRemove = copy.length - 10;
    for ( var i = numToRemove ; i > 0 ; i-- )
        copy.splice( Math.floor( i / ( numToRemove + 1 ) ), 1 );
    // run the optimization algorithm
    const C = costFunction( copy );
    const soln = optim.minimize_GradientDescent(
        C, approxGradient( C ), vector );
    // extract the results of that algorithm into two halves, C2 and C3
    const C2 = soln.argument.slice( 0, vector.length / 2 );
    const C3 = soln.argument.slice( vector.length / 2 );
    // return the 4 control points as promised
    return [ C1, C2, C3, C4 ];
};

// Accepts as input the array of points P1,...,Pn documented above.
// Produces a function that accepts a vector of C2 and C3 concatenated,
// and evaluates how poorly those would form a cubic Bézier curve
// passing through the points.  Keep in mind that C1,C4 are P1,Pn.
const costFunction = module.exports.costFunction = pointArray => {
    return vector => {
        const C1 = pointArray[0];
        const C2 = vector.slice( 0, vector.length / 2 );
        const C3 = vector.slice( vector.length / 2 );
        const C4 = pointArray[pointArray.length-1];
        const F = cubicBezier( C1, C2, C3, C4 );
        const distances = pointArray.map( _ => Infinity );
        // sample roughly 3*num points on curve, handling fencepost well
        const samples = 3 * ( pointArray.length - 1 ) + 1;
        for ( var i = 0 ; i <= samples ; i++ ) {
            const P = F( i / samples );
            pointArray.map( ( point, index ) =>
                distances[index] = Math.min( distances[index],
                    squaredDist( P, point ) ) );
        }
        return sumAcross( distances );
    };
};

// Approximate the gradient to a function numerically.
const approxGradient = f => pt => {
    const epsilon = 0.000001;
    return pt.map( ( _, i ) => {
        const below = pt.slice();
        const above = pt.slice();
        below[i] -= epsilon;
        above[i] += epsilon;
        return ( f( above ) - f( below ) ) / ( 2 * epsilon );
    } );
};

// ith Bernstein polynomial of degree 3
const bernstein = ( i, t ) =>
    ( ( i == 3 ) ? 1 : Math.pow( 1 - t, 3 - i ) )
  * ( ( i == 0 ) ? 1 : Math.pow( t, i ) )
  * [ 1, 3, 3, 1 ][i];
// builds a Bézier function defined by C1,C2,C3,C4
const cubicBezier = module.exports.cubicBezier = ( C1, C2, C3, C4 ) =>
    t => [
        scalarMult( bernstein( 0, t ), C1 ),
        scalarMult( bernstein( 1, t ), C2 ),
        scalarMult( bernstein( 2, t ), C3 ),
        scalarMult( bernstein( 3, t ), C4 )
    ].reduce( vectorSum );

// simple tools for vector operations on JavaScript arrays
const scalarMult = ( s, array ) => array.map( entry => s * entry );
const vectorSum = ( array1, array2 ) =>
    array1.map( ( entry, index ) => entry + array2[index] );
const vectorDiff = ( array1, array2 ) =>
    vectorSum( array1, scalarMult( -1, array2 ) );
const sumAcross = ( array ) => array.reduce( ( a, b ) => a + b );
const dotProduct = ( array1, array2 ) =>
    sumAcross( array1.map( ( entry, index ) => entry * array2[index] ) );
const squaredDist = module.exports.squaredDist = ( array1, array2 ) => {
    const diff = vectorDiff( array1, array2 );
    return dotProduct( diff, diff );
};
