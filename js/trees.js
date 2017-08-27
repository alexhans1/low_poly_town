Trees = function( options ) {

    // State
    this._planet = options.planet;
    this._mean_tree_height = options.mean_tree_height;
    this._treeCount = options.treeCount;
    this.trees = null;
    this._treeColors = options.treeColors;
};

Trees.prototype.get_trees = function() {

    return this.trees;
};

Trees.prototype.draw = function() {

    // If no land layer, cannot draw
    if ( this._planet == null ) {

        return null;
    }
    var land = this._planet.get_land();
    if ( land == null ) {

        return null;
    }

    var trees = new THREE.Object3D();

    // Match the land layer's position in world space
    trees.position.setX( land.position.x );
    trees.position.setZ( land.position.z );

    //Add trees to trees object
    for (var x = 0; x < this._planet._surface_points.length; x += 2) {
        for (var y = 0; y < this._planet._surface_points.length; y += 2) {

            // var bool = $.inArray(this._planet.get_color_map_index(this._planet._surface_points[x][y]), this._treeColors);
            var bool = this._treeColors.indexOf(this._planet.get_color_map_index(this._planet._surface_points[x][y])) > -1;
            if(bool && (Math.random() < this._treeCount)) {
                var pos = [x*this._planet._tile_width_x, this._planet._surface_points[x][y], y*this._planet._tile_width_z];
                var tree = this.placeTree( pos );
                if ( tree != null ) {

                    trees.add( tree );
                }
            }

        }

    }
    this.trees = trees;

    return trees;
};

Trees.prototype.placeTree = function (pos) {

    var returnGroup = new THREE.Object3D();//create an empty container

    //Baumstamm

    var size = this._mean_tree_height;
    var rng = this._mean_tree_height/6;
    size += rng*Math.random() - rng/2;
    var stammGeometry = new THREE.ConeGeometry( size/10, size, 12, 14 );
    var stammMaterial = new THREE.MeshPhongMaterial( {color: 0xA17950, shading: THREE.FlatShading, transparent: true });
    var cone = new THREE.Mesh( stammGeometry, stammMaterial );
    cone.castShadow  = true;
    cone.receiveShadow  = true;
    var offsetFactor = 0.7;
    var x = pos[0] + (size/offsetFactor*Math.random() - size/offsetFactor/2);
    var yEnd = pos[1] + size/3;
    var y = -2*size;
    var z = pos[2] + (size/offsetFactor*Math.random() - size/offsetFactor/2);
    cone.position.set(x, y, z);
    returnGroup.add( cone );

    //Baumkrone

    var bushSize = size/5;
    var bushGeometry = bushGeo(bushSize);
    var bushMaterial = new THREE.MeshPhongMaterial( {color: 0x0fd7a0, shading: THREE.FlatShading, transparent: true } );
    var bush = new THREE.Mesh( bushGeometry, bushMaterial );
    bush.castShadow  = true;
    bush.receiveShadow  = true;
    bush.position.set(x, y + size/2, z);
    returnGroup.add( bush );


    var delay = 2 + 8*Math.random();
    TweenMax.to( returnGroup.position, 2, {y: yEnd-y, ease: Elastic.easeOut, delay: delay, repeat:0});

    return returnGroup;
};