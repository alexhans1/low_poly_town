/**
 * Created by alex.hans on 21.02.2017.
 */
Houses = function( options ) {

    // State
    this._planet = options.planet;
    this._house_height = options.house_height;
    this._houseCount = options.houseCount;
    this._texture = options.texture;
    this.houses = null;
    this._houseColors = options.houseColors;
};

Houses.prototype.get_trees = function() {

    return this.houses;
};

Houses.prototype.draw = function() {

    // If no land layer, cannot draw
    if ( this._planet == null ) {

        return null;
    }
    var land = this._planet.get_land();
    if ( land == null ) {

        return null;
    }

    var houses = new THREE.Object3D();

    // Match the land layer's position in world space
    houses.position.setX( land.position.x );
    houses.position.setZ( land.position.z );

    //Add trees to trees object
    for (var x = 0; x < this._planet._surface_points.length; x += 5) {
        for (var y = 0; y < this._planet._surface_points.length; y += 5) {

            var bool = this._houseColors.indexOf(this._planet.get_color_map_index(this._planet._surface_points[x][y])) > -1;
            if ( this._planet._surface_points[x][y] <= 0 ) bool = false;
            if(bool && (Math.random() < this._houseCount) ) {
                var pos = [x*this._planet._tile_width_x, this._planet._surface_points[x][y], y*this._planet._tile_width_z];
                var house = this.placeHouse( pos );
                if ( house != null ) {

                    houses.add( house );
                }
            }

        }

    }
    this.houses = houses;

    return houses;
};

Houses.prototype.placeHouse = function (pos) {

    var returnGroup = new THREE.Object3D();//create an empty container


    var size = this._house_height;
    var rng = this._house_height/3;
    size += rng*Math.random() - rng/2;

    //Skyscraper
    var bool = Math.random()<0.5;
    if (bool) var textures = this.getTexture1(Math.floor(Math.random()*3));
    else var textures = this.getTexture2(Math.floor(Math.random()*2));
    //Create a material with the picture as the 'map'
    material = new THREE.MeshFaceMaterial(textures);
    //Create a new cube so I can apply differents pictures
    if (bool) geometry = new THREE.BoxGeometry(size/3, size, size/3);
    else {
        size /= 3;
        geometry = new THREE.BoxGeometry(size*2, size, size);
    }
    var materialPlain = new THREE.MeshLambertMaterial( {
        color: 0xD8D6A3,
        shading: THREE.FlatShading,
        vertexColors: THREE.FaceColors
    } );
    mat = (this._texture) ? material : materialPlain;
    var house = new THREE.Mesh(geometry, mat);
    house.castShadow  = true;
    house.receiveShadow  = true;
    var x = pos[0];
    var y = pos[1] + size/2 - 5;
    var z = pos[2];
    house.position.set(x, y, z);
    if (!bool && (Math.random() < 0.5)) house.rotation.y = Math.PI / 180 * 90;
    returnGroup.add( house );


    // var delay = 4 + 4*Math.random() - 3.5;
    // TweenMax.to( returnGroup.position, 2, {y: yEnd-y, ease: Elastic.easeOut, delay: delay, repeat:0});

    return returnGroup;
};

Houses.prototype.getTexture1 = function (index) {

    //Create a Texture Loader object
    var loader = new THREE.TextureLoader();

    var textures = [
        loader.load( "images/front1.jpg" ),
        loader.load( "images/front2.jpg" ),
        loader.load( "images/front3.png" )
    ];
    textures[0].wrapS = THREE.RepeatWrapping;
    textures[0].wrapT = THREE.RepeatWrapping;
    textures[0].repeat.set( 1, 2 );
    textures[1].wrapS = THREE.RepeatWrapping;
    textures[1].wrapT = THREE.RepeatWrapping;
    textures[1].repeat.set( 1, 1 );
    textures[2].wrapS = THREE.RepeatWrapping;
    textures[2].wrapT = THREE.RepeatWrapping;
    textures[2].repeat.set( 1, 4 );

    var roofTexture = loader.load('images/roof1.png');
    roofTexture.wrapS = THREE.RepeatWrapping;
    roofTexture.wrapT = THREE.RepeatWrapping;
    roofTexture.repeat.set( 1, 1 );

    var retTextures = [
        //Textures = pictures of the box
        new THREE.MeshPhongMaterial( {
            map: textures[index]
        }),
        new THREE.MeshPhongMaterial({
            map: textures[index]
        }),
        new THREE.MeshPhongMaterial({
            map: roofTexture
        }),
        new THREE.MeshPhongMaterial({
            color: 0xDDC9A8, shading: THREE.FlatShading, transparent: true
        }),
        new THREE.MeshPhongMaterial({
            map: textures[index]
        }),
        new THREE.MeshPhongMaterial({
            map: textures[index]
        })
    ];

    return retTextures;
};

Houses.prototype.getTexture2 = function (index) {

    //Create a Texture Loader object
    var loader = new THREE.TextureLoader();

    var textures = [
        loader.load( "images/front4.png" ),
        loader.load( "images/front5.jpg" )
    ];
    textures[0].wrapS = THREE.RepeatWrapping;
    textures[0].wrapT = THREE.RepeatWrapping;
    textures[0].repeat.set( 2, 2 );
    textures[1].wrapS = THREE.RepeatWrapping;
    textures[1].wrapT = THREE.RepeatWrapping;
    textures[1].repeat.set( 3, 2 );

    var brickTexture = loader.load('images/brick.jpg');
    brickTexture.wrapS = THREE.RepeatWrapping;
    brickTexture.wrapT = THREE.RepeatWrapping;
    brickTexture.repeat.set( 10, 10 );

    var roofTexture = loader.load('images/roof2.jpg');
    roofTexture.wrapS = THREE.RepeatWrapping;
    roofTexture.wrapT = THREE.RepeatWrapping;
    roofTexture.repeat.set( 2, 3 );

    var retTextures = [
        //Textures = pictures of the box
        new THREE.MeshPhongMaterial( {
            map: brickTexture
        }),
        new THREE.MeshPhongMaterial({
            map: brickTexture
        }),
        new THREE.MeshPhongMaterial({
            map: roofTexture
        }),
        new THREE.MeshPhongMaterial({
            color: 0xDDC9A8, shading: THREE.FlatShading, transparent: true
        }),
        new THREE.MeshPhongMaterial({
            map: textures[index]
        }),
        new THREE.MeshPhongMaterial({
            map: textures[index]
        })
    ];

    return retTextures;
};