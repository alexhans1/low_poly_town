/**
 * Created by alex.hans on 22.02.2017.
 */

Clouds = function( options ) {

    // State
    this._planet = options.planet;
    this._cloud_size = options.cloud_size;
    this._cloudCount = options.cloudCount;
    this.Clouds = null;
};

Clouds.prototype.get_Clouds = function() {

    return this.Clouds;
};

Clouds.prototype.drawClouds = function() {

    // If no land layer, cannot draw
    if ( this._planet == null ) {

        return null;
    }
    var land = this._planet.get_land();
    if ( land == null ) {

        return null;
    }

    var  clouds = new THREE.Object3D();

    // Match the land layer's position in world space
    clouds.position.setX( land.position.x );
    clouds.position.setZ( land.position.z );

    //Add trees to trees object
    for (var x = 0; x < this._planet._surface_points.length - 25; x += 10) {
        for (var y = 0; y < this._planet._surface_points.length - 25; y += 10) {

            if( Math.random() < this._cloudCount ) {
                var pos = [x*this._planet._tile_width_x, 500+(Math.random()*300-150), y*this._planet._tile_width_z];
                var cloud = this.placeCloud( pos );
                if ( cloud != null ) {

                    clouds.add( cloud );
                }
            }
        }
    }
    this.Clouds = clouds;

    return clouds;
};

Clouds.prototype.placeCloud = function (pos) {

    var returnGroup = new THREE.Object3D();//create an empty container


    var size = this._cloud_size;
    var rng = this._cloud_size/4;
    size += rng*Math.random() - rng/2;

    //cloud
    //Create a new cube so I can apply differents pictures
    geometry = new THREE.TetrahedronGeometry(size, 2);

    var material = new THREE.MeshPhongMaterial( {
        color: 0xFFF8F8,
        shading: THREE.FlatShading,
        vertexColors: THREE.FaceColors
    } );

    rdm = 700;
    var x = pos[0] + (rdm*Math.random() - rdm/2);
    var y = pos[1];
    var z = pos[2] + (rdm*Math.random() - rdm/2);

    for (var i = 0; i < Math.floor(Math.random()*4)+4; i++) {
        var cloud = new THREE.Mesh(geometry, material);
        cloud.castShadow  = true;
        cloud.receiveShadow  = true;
        cloud.position.set(pos[0] + (rdm/3*Math.random() - rdm/3/2), y, pos[2] + (rdm/5*Math.random() - rdm/5/2));
        cloud.rotation.y = 2+Math.PI * Math.random();
        var scale = Math.random()*2;
        cloud.scale.set(scale,scale,scale);
        returnGroup.add( cloud );
    }

    returnGroup.position.set(x,y,z);


    TweenMax.to( returnGroup.position, 3, { y: returnGroup.position.y + 50, ease: Power1.easeInOut, delay: 9*Math.random(), repeat: 200, yoyo: true });
    TweenMax.to( returnGroup.position, 3, { x: returnGroup.position.x + 50, ease: Power1.easeInOut, delay: 9*Math.random(), repeat: 200, yoyo: true });
    TweenMax.to( returnGroup.position, 3, { z: returnGroup.position.z + 50, ease: Power1.easeInOut, delay: 9*Math.random(), repeat: 200, yoyo: true });

    return returnGroup;
};