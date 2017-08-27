Planet = function ( options ) {
    
    // State
    this._color_map = options.color_map;
    this._bottom_color_map = options.bottom_color_map;
    this._tile_width_x = options.tile_width_x;
    this._tile_width_z = options.tile_width_z;
    this._target_highest_point = options.target_highest_point;
    this._surface_points = [];
    this._bottom_points = [];
    this._highest_point = 0;
    this._highest_bottomPoint = 0;
    this._radius = 60;
    this._land = new THREE.Object3D();
    this.count = 0;
    this._target_bottom_point = this._tile_width_x * this._radius / 2;
};

Planet.prototype.compute_surface_points = function() {

    /**
     * Settled on a 5 step process.
     * - generate a set of points using diamond square, as I like the shapes this gives more than perlin, so far
     * - multiply all the points exponentially, to effectively stretch them out and make the higher points higher, relatively speaking
     * - reduce all the points by the minimum, so the lowest point is 0
     * - scale all the points so they are within a desired range of 0 to X.
     * - finally, smooth out any spikes
     */

    var points = cell_noise.cellularMap(this._radius,this._radius, 3);
    // var points = randomBottom(this._radius,this._radius, 3);
    var bottomPoints = cell_noise.cellularBottom(this._radius,this._radius, 1);
    // var bottomPoints = noise.simplexBottom(this._radius, 100);
    // var bottomPoints = randomBottom(this._radius, 140);
    // var bottomPoints = noise.simplexMap(this._radius);
    // var bottomPoints = perlinMap(this._radius);


    // TERRAIN POINTS
    // Multiply each point to stretch it out
    var min = -1;
    for ( var x = 0; x < points.length; x++ ) {

        for ( var y = 0; y < points[x].length; y++ ) {

            points[x][y] = Math.abs( points[x][y] ); // Otherwise next step can run into trouble: http://stackoverflow.com/q/14575697/127352
            points[x][y] = Math.pow( points[x][y], 2.4 ); // Higher exponent stretches things out further
            if ( points[x][y] < min || min == -1 ) {

                min = points[x][y];
            }
            if ( points[x][y] > this._highest_point ) {

                this._highest_point = points[x][y];
            }
        }
    }

    // Lower all points by their minimum and scale to be between 0 and X
    this._highest_point -= min;
    var scale = ( this._target_highest_point / this._highest_point );
    this._highest_point *= scale;
    for ( var x = 0; x < points.length; x++ ) {

        for ( var y = 0; y < points[x].length; y++ ) {

            points[x][y] -= min;
            points[x][y] *= scale;
        }
    }

    // Smooth out any crazy spikes.
    var smoothed_points = [];
    this._highest_point = 0;
    for ( var x = 0; x < points.length; x++ ) {

        smoothed_points.push( [] );
        for ( var y = 0; y < points[x].length; y++ ) {

            var max_difference = 0;
            for ( var deltaX = x - 1; deltaX <= x + 1; deltaX++ ) {

                for ( var deltaY = y - 1; deltaY <= y + 1; deltaY++ ) {

                    var out_of_bounds = (
                        deltaX < 0 ||
                        deltaY < 0 ||
                        deltaX >= points.length ||
                        deltaY >= points[deltaX].length ||
                        ( deltaX == x && deltaY == y )
                    );
                    if ( out_of_bounds ) {

                        continue;
                    }
                    var difference = points[x][y] - points[deltaX][deltaY];
                    if ( difference > max_difference ) {

                        max_difference = difference;
                    }
                }
            }
            var revised_point = points[x][y];
            if ( max_difference > ( revised_point / 2 ) ) {

                revised_point *= 0.5;
            }
            if ( revised_point > this._highest_point ) {

                this._highest_point = revised_point;
            }
            smoothed_points[x].push( revised_point );
        }
    }
    points = smoothed_points;


    //BOTTOM POINTS
    // Multiply each bottomPoint to stretch it out
    var min2 = -1;
    for ( var x = 0; x < bottomPoints.length; x++ ) {

        for ( var y = 0; y < bottomPoints[x].length; y++ ) {

            bottomPoints[x][y] = Math.abs( bottomPoints[x][y] ); // Otherwise next step can run into trouble: http://stackoverflow.com/q/14575697/127352
            bottomPoints[x][y] = Math.pow( bottomPoints[x][y], 1); // Higher exponent stretches things out further
            if ( ( bottomPoints[x][y] < min2 || min2 == -1 ) && bottomPoints[x][y] != 0 ) {

                min2 = bottomPoints[x][y];
            }
            if ( bottomPoints[x][y] > this._highest_bottomPoint ) {

                this._highest_bottomPoint = bottomPoints[x][y];
            }
        }
    }

    // Lower all bottomPoints by their minimum and scale to be between 0 and X
    this._highest_bottomPoint -= min2;
    var scale2 = ( this._target_bottom_point / this._highest_bottomPoint );
    this._highest_bottomPoint *= scale2;
    for ( var x = 0; x < bottomPoints.length; x++ ) {

        for ( var y = 0; y < bottomPoints[x].length; y++ ) {

            bottomPoints[x][y] -= min2;
            if ( bottomPoints[x][y] < 0 ) bottomPoints[x][y] = 0;
            // bottomPoints[x][y] *= scale2;
        }
    }

    this._surface_points = points;
    this._bottom_points = bottomPoints;
};

Planet.prototype.draw = function() {


    //
    // Draw surface terrain
    var material = new THREE.MeshLambertMaterial( {
        color: 0xD8D6A3,
        shading: THREE.FlatShading,
        vertexColors: THREE.FaceColors
    } );

    var tile_width_x = this._tile_width_x;
    var tile_width_z = this._tile_width_z;

    for ( var x = 0; x < this._surface_points.length - 1; x++ ) {

        for ( var y = 0; y < this._surface_points[x].length - 1; y++ ) {

            if(Math.pow(1.3*(x - this._radius/2 + 0.5),2) + Math.pow((y - this._radius/2 + 1),2) <= this._radius-10 + Math.pow(this._radius/3,2)) {
                var geometry = new THREE.Geometry();

                var west_x = x * tile_width_x;
                var east_x = west_x + tile_width_x;
                var north_z = y * tile_width_z;
                var south_z = north_z + tile_width_z;

                var north_west_y = this._surface_points[x][y];
                var south_west_y = this._surface_points[x][y + 1];
                var north_east_y = this._surface_points[x + 1][y];
                var south_east_y = this._surface_points[x + 1][y + 1];

                geometry.vertices.push( new THREE.Vector3( west_x, north_west_y, north_z ) ); // north-west
                geometry.vertices.push( new THREE.Vector3( west_x, south_west_y, south_z ) ); // south-west
                geometry.vertices.push( new THREE.Vector3( east_x, north_east_y, north_z ) ); // north-east
                geometry.vertices.push( new THREE.Vector3( east_x, south_east_y, south_z ) ); // south-east

                geometry.faces.push( new THREE.Face3( 1, 2, 0 ) ); // sw, ne, nw
                geometry.faces.push( new THREE.Face3( 1, 3, 2 ) ); // sw, se, ne

                geometry.computeFaceNormals();
                geometry.computeVertexNormals();
                // geometry.computeTangents();

                this._map_surface_color( geometry.faces[0], Math.max( south_west_y, north_east_y, north_west_y ) );
                this._map_surface_color( geometry.faces[1], Math.max( south_west_y, south_east_y, north_east_y ) );

                var mesh = new THREE.Mesh( geometry, material );
                mesh.receiveShadow = true;
                mesh.castShadow = true;
                mesh.material.side = THREE.DoubleSide;
                this._land.add( mesh );
            }
        }
    }
    this.drawBottom();
    return this._land;
};

Planet.prototype.drawBottom = function() {
    //
    // Draw surface terrain
    var material = new THREE.MeshLambertMaterial( {
        color: 0xD8D6A3,
        shading: THREE.FlatShading,
        vertexColors: THREE.FaceColors
    } );

    var tile_width_x = this._tile_width_x;
    var tile_width_z = this._tile_width_z;

    for ( var x = 0; x < this._surface_points.length - 1; x++ ) {

        for ( var y = 0; y < this._surface_points[x].length - 1; y++ ) {

            if(Math.pow(1.3*(x - this._radius/2 + 0.5   ),2) + Math.pow((y - this._radius/2 + 1),2) <= this._radius-10 + Math.pow(this._radius/3,2)) {
                var geometry = new THREE.Geometry();

                var west_x = x * tile_width_x;
                var east_x = west_x + tile_width_x;
                var north_z = y * tile_width_z;
                var south_z = north_z + tile_width_z;

                var north_west_y = -this._bottom_points[x][y];
                var south_west_y = -this._bottom_points[x][y + 1];
                var north_east_y = -this._bottom_points[x + 1][y];
                var south_east_y = -this._bottom_points[x + 1][y + 1];

                geometry.vertices.push( new THREE.Vector3( west_x, north_west_y, north_z ) ); // north-west
                geometry.vertices.push( new THREE.Vector3( west_x, south_west_y, south_z ) ); // south-west
                geometry.vertices.push( new THREE.Vector3( east_x, north_east_y, north_z ) ); // north-east
                geometry.vertices.push( new THREE.Vector3( east_x, south_east_y, south_z ) ); // south-east

                geometry.faces.push( new THREE.Face3( 1, 2, 0 ) ); // sw, ne, nw
                geometry.faces.push( new THREE.Face3( 1, 3, 2 ) ); // sw, se, ne

                geometry.computeFaceNormals();
                geometry.computeVertexNormals();
                // geometry.computeTangents();

                this._map_bottom_color( geometry.faces[0] );
                this._map_bottom_color( geometry.faces[1] );

                var mesh = new THREE.Mesh( geometry, material );
                mesh.receiveShadow = true;
                mesh.castShadow = true;
                mesh.material.side = THREE.BackSide;
                this._land.add( mesh );
            }
        }
    }
};

Planet.prototype.get_land = function() {

    return this._land;
};

Planet.prototype.get_highest_point = function() {

    return this._highest_point;
};

Planet.prototype.get_width_x = function() {

    // -1 because there's n + 1 data points for n tiles
    return ( ( this._surface_points.length + 3 ) * this._tile_width_x );
};

Planet.prototype.get_center_x = function() {

    return this.get_width_x() / 2;
};

Planet.prototype.get_width_z = function() {

    if ( this._surface_points.length == 0 ) {

        return 0;
    }
    // -1 because there's n + 1 data points for n tiles
    return ( ( this._surface_points[0].length + 3 ) * this._tile_width_z );
};

Planet.prototype.get_center_z = function() {

    return this.get_width_z() / 2;
};

Planet.prototype.get_color_map_index = function( height ) {

    var index = 0;
    index += Math.floor( height / ( ( this._highest_point + 1 ) / this._color_map.length ) );
    return index;
};

Planet.prototype._map_surface_color = function( face, height ) {

    var colors = this._color_map[this.get_color_map_index( height )];
    face.color.setHex( colors[0] );
};

Planet.prototype._map_bottom_color = function( face ) {

    var colors = this._bottom_color_map[Math.round(Math.random()* (this._bottom_color_map.length - 1) )];
    face.color.setHex( colors[0] );
};