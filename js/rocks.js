/**
 * Created by alex.hans on 23.02.2017.
 */
/**
 * Created by alex.hans on 22.02.2017.
 */

Rocks = function( options ) {

    // State
    this._planet = options.planet;
    this._rock_size = options.rock_size;
    this._rockCount = options.rockCount;
    this.Rocks = null;
};

Rocks.prototype.get_Rocks = function() {

    return this.Rocks;
};

Rocks.prototype.drawRocks = function() {

    // If no land layer, cannot draw
    if ( this._planet == null ) {

        return null;
    }
    var land = this._planet.get_land();
    if ( land == null ) {

        return null;
    }

    var  rocks = new THREE.Object3D();

    // Match the land layer's position in world space
    rocks.position.setX( land.position.x );
    rocks.position.setZ( land.position.z );

    //Add trees to trees object
    for (var x = 0; x < this._planet._surface_points.length - 25; x += 2) {
        for (var y = 0; y < this._planet._surface_points.length - 25; y += 3) {

            // var rangeBool1 = Math.pow(1.3*(x - 40),2) + Math.pow((y - 40),2) < Math.pow(80/3,2);
            var rangeBool1 = Math.pow(1.3*(x - 15),2) + Math.pow((y - 15),2) > Math.pow(20/3,2);
            var rangeBool2 = Math.pow(1.3*(x - 15),2) + Math.pow((y - 15),2) < Math.pow(40/3,2);
            var bool = rangeBool1 && rangeBool2;
            console.log(bool);
            if( Math.random() < this._rockCount && bool) {
                var pos = [x*this._planet._tile_width_x, -200+(Math.random()*300-150), y*this._planet._tile_width_z];
                var rock = this.placeRock( pos );
                if ( rock != null ) {

                    rocks.add( rock );
                }
            }
        }
    }
    this.Rocks = rocks;

    return rocks;
};

Rocks.prototype.placeRock = function (pos) {

    var returnGroup = new THREE.Object3D();//create an empty container


    var size = this._rock_size;
    var rng = this._rock_size/5;
    size += rng*Math.random() - rng/2;

    //rock
    //Create a new cube so I can apply differents pictures
    var shapeRnd = Math.random();
    if (shapeRnd < 0.25) geometry = new THREE.TetrahedronGeometry(size, 2);
    else if (shapeRnd < 0.5) geometry = new THREE.TetrahedronGeometry(size, 1);
    else if (shapeRnd < 0.75) geometry = new THREE.DodecahedronGeometry(size, 0);
    else geometry = new THREE.OctahedronGeometry(size, 1);

    var rockColor = (Math.random() < 0.5) ? 0x8A3E26 : 0x522717;
    var material = new THREE.MeshPhongMaterial( {
        color: rockColor,
        shading: THREE.FlatShading,
        vertexColors: THREE.FaceColors
    } );

    rdm = 100;
    var x = pos[0] + (rdm*Math.random() - rdm/2);
    var y = pos[1];
    var z = pos[2] + (rdm*Math.random() - rdm/2);

    for (var i = 0; i < Math.floor(Math.random()*2)+2; i++) {
        var rock = new THREE.Mesh(geometry, material);
        rock.castShadow  = true;
        rock.receiveShadow  = true;
        rock.position.set(pos[0] + (rdm/3*Math.random() - rdm/3/2), y, pos[2] + (rdm/5*Math.random() - rdm/5/2));
        rock.rotation.y = 2+Math.PI * Math.random();
        var scale = Math.random()*2;
        rock.scale.set(scale,scale,scale);
        returnGroup.add( rock );
    }

    returnGroup.position.set(x,y,z);


    TweenMax.to( returnGroup.position, 3.5, { y: returnGroup.position.y + 50, ease: Power1.easeInOut, delay: 9*Math.random(), repeat: 200, yoyo: true });
    TweenMax.to( returnGroup.position, 3, { x: returnGroup.position.x + 20, ease: Power1.easeInOut, delay: 9*Math.random(), repeat: 200, yoyo: true });
    TweenMax.to( returnGroup.position, 3, { z: returnGroup.position.z + 20, ease: Power1.easeInOut, delay: 9*Math.random(), repeat: 200, yoyo: true });

    return returnGroup;
};