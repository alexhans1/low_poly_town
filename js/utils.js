randomBottom = function (length, rockiness) {

     var radius = length/2;

    // Create empty map
    var map = new Array( length );
    for ( var i = 0; i < length; i++ ) {

        map[i] = new Array( length );
        for (var j = 0; j < length; j++) {
            if(Math.pow(1.3*(i - radius),2) + Math.pow((j - radius),2) > Math.pow(length/3,2)) {
                map[i][j] = 0;
            }
            else {
                var xScale = Math.pow(radius, 2) - (Math.pow(1.3*(i - radius),2) + Math.pow((j - radius),2));
                xScale += rockiness*Math.random() - rockiness/2;
                map[i][j] = xScale;
            }
        }
    }
    return map;
};

/**
 *	Returns a random value (float) around 1 with an approximate normal distribution.
 *	See: http://stackoverflow.com/a/20161247/127352 and http://jsfiddle.net/tvt5K/102/
 */
normally_distributed_random = function() {

    // A higher divisor creates more of a central peak. Dividing by 3 seems to make a nice looking bell curve.
    return ( ( Math.random() + Math.random() + Math.random() + Math.random() + Math.random() + Math.random() ) ) / 3;
};

/**
 *	Returns a random integer number between min and max, inclusive.
 */
random_int = function( min, max ) {

    return Math.floor( Math.random() * ( max - min + 1 ) + min );
};

bushGeo = function(bushSize) {
    var geometry = new THREE.TetrahedronGeometry( bushSize, 2 + Math.round(Math.random())  );
    geometry.computeFaceNormals();
    return geometry;
};