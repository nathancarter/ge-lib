
// Some basic geometry utilities

// Distance between two points in 2D
const distance = module.exports.distance = ( p1, p2 ) =>
    Math.sqrt( Math.pow( p1.x - p2.x, 2 )
             + Math.pow( p1.y - p2.y, 2 ) );

// Find closest two points in an array
const closestPair = module.exports.closestPair = ( points ) => {
    if ( points.length < 2 ) return undefined;
    var answeri = 0, answerj = 1, dist = distance( points[0], points[1] );
    for ( var i = 0 ; i < points.length ; i++ ) {
        for ( var j = i + 1 ; j < points.length ; j++ ) {
            const newdist = distance( points[i], points[j] );
            if ( newdist < dist ) {
                answeri = i;
                answerj = j;
                dist = newdist;
            }
        }
    }
    return {
        index1 : answeri,
        index2 : answerj,
        distance : dist,
        point1 : points[answeri],
        point2 : points[answerj]
    };
}
