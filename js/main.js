/**
 * Created by alex.hans on 16.02.2017.
 */

// defines variables
Main = function() {

    // Self reference for events
    this.self = this;

    // Internal state
    this.is_initiated = false;

    // Three JS properties
    this.container = null;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.ambientLight = null;
    this.controls = null;

    this.Planet = null;
};

//sets up scene, cam, renderer, controls and lights
Main.prototype.init = function() {

    //
    // Only need to init once
    if ( this.is_initiated ) {

        return;
    }


    //
    // Scene
    this.scene = new THREE.Scene();


    //
    // Camera
    var screen_width = window.innerWidth-40;
    var screen_height = window.innerHeight-110;
    var view_angle = 45;
    var aspect = screen_width / screen_height;
    var near = 1;
    var far = 100000;
    var camera = new THREE.PerspectiveCamera( view_angle, aspect, near, far );
    this.scene.add( camera );
    camera.position.set( 400, 510, 300 );
    camera.lookAt( this.scene.position );
    this.camera = camera;


    //
    // Renderer
    this.renderer = new THREE.WebGLRenderer( {
        antialias: true,
        alpha: true
    } );
    this.renderer.setSize( screen_width, screen_height );
    this.renderer.shadowCameraNear = 3;
    this.renderer.shadowCameraFar = camera.far;
    this.renderer.shadowCameraFov = 50;
    this.renderer.shadowMapBias = 0.0039;
    this.renderer.shadowMapDarkness = 0.5;
    this.renderer.shadowMapWidth = 1024;
    this.renderer.shadowMapHeight = 1024;
    this.renderer.shadowMap.enabled = true;
    // renderer.shadowMapSoft = false;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;    // this.renderer.setClearColor( 0x55ff55, 0 );


    // // Shadows
    // if ( this.renderer.shadowMap ) {
    //
    //     this.renderer.shadowMap.enabled = true;
    //     this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    // }
    // else {
    //
    //     this.renderer.shadowMapEnabled = true;
    //     this.renderer.shadowMapType = THREE.PCFSoftShadowMap;
    // }


    //
    // Container
    this.container = document.getElementById( 'container' );
    this.container.appendChild( this.renderer.domElement );

    //
    // Events

    // automatically resize renderer
    THREEx.WindowResize( this.renderer, this.camera );


    //
    // Controls

    // toggle full-screen on given key press
    THREEx.FullScreen.bindKey( { charCode: 'm'.charCodeAt( 0 ) } );

    // move mouse and: left   click to rotate,
    //                 middle click to zoom,
    //                 right  click to pan
    this.controls = new THREE.OrbitControls( this.camera, this.renderer.domElement );


    //
    // Lighting






    var directional_light = new THREE.DirectionalLight( 0xffe9a0, 0.85 );
    directional_light.position.set( 250, 400, -225 );
    directional_light.castShadow = true;
    this.scene.add( directional_light );

    var directional_light2 = new THREE.DirectionalLight( 0xffe9a0, 0.75 );
    directional_light2.position.set( 50, -160, -25 );
    directional_light2.castShadow = true;
    this.scene.add( directional_light2 );

    this.ambientLight = new THREE.AmbientLight( 0x666666 );
    var intensity = 1.0;
    this.ambientLight.color.setRGB(
        this.ambientLight.color.r * intensity,
        this.ambientLight.color.g * intensity,
        this.ambientLight.color.b * intensity );
    this.scene.add( this.ambientLight );

    //
    // Done
    this.is_initiated = true;
};

Main.prototype.animate = function() {

    requestAnimationFrame( this.animate.bind( this ) );
    this.render();
    this.update();
};

Main.prototype.render = function() {

    this.renderer.render( this.scene, this.camera );
};

Main.prototype.update = function() {

    this.controls.update();

    // this.camera.position.setX(this.camera.position.x + 0.01);
    // this.camera.position.setZ(this.camera.position.Z + 0.01);

};

Main.prototype.recreate = function( terrainHeight, texture, treeCount, houseCount, cloudCount, rockCount ) {

    var terrainColors = [];
    var treeColors = [];
    terrainColors.push([0xC7C3C5]);
    if (terrainHeight > 20) {
        terrainColors.push([0x9EC457]);
        treeColors.push(1);
    }
    if (terrainHeight > 50) {
        terrainColors.push([0xD3E17F]);
        treeColors.push(2);
    }
    if (terrainHeight > 100) terrainColors.push([0xBF594B]);
    if (terrainHeight > 200) terrainColors.push([0xFF9A74]);
    if (terrainHeight > 260) terrainColors.push([0xFFFFFF]);


    // Ensure initiated
    if(!this.is_initiated) this.init();

    // Clear existing world, if there is one. Don't want to reset the camera position, etc.
    this.scene.remove( this.scene.getObjectByName( 'land' ) );
    this.scene.remove( this.scene.getObjectByName( 'trees' ) );
    this.scene.remove( this.scene.getObjectByName( 'houses' ) );
    this.scene.remove( this.scene.getObjectByName( 'clouds' ) );
    this.scene.remove( this.scene.getObjectByName( 'rocks' ) );


    // Create new world
    // The elements of the scene have been divided into layers, just to help organise code. Inevitably, most layers
    // will need to know about the land layer as things are mostly relative to that.

    //
    // Planet
    this.Planet = new Planet({
        tile_width_x: 35,
        tile_width_z: 35,
        target_highest_point: terrainHeight,
        color_map: terrainColors,
        bottom_color_map: [
            [0x8A3E26],
            [0x662A15],
            [0x522717]
        ]
    });

    //create surface and bottom points
    this.Planet.compute_surface_points();

    // get meshes out of those points
    var land = this.Planet.draw();
    land.name = 'land';

    //move mesh to center
    land.translateX( this.Planet.get_center_x() * -1 );
    land.translateZ( this.Planet.get_center_z() * -1 );

    //add to scene
    this.scene.add( land );

    //
    //Trees
    if (treeColors.length > 0) {

        var tree_height = 30;
        this.tree_layer = new Trees({
            planet: this.Planet,
            mean_tree_height: tree_height,
            treeCount: treeCount,
            treeColors: treeColors
        });

        var trees = this.tree_layer.draw();
        trees.name = 'trees';
        this.scene.add(trees);
    }

    //
    //Houses
    var house_height = 120;
    this.house_layer = new Houses( {
        planet: this.Planet,
        house_height: house_height,
        houseCount: houseCount,
        texture: texture,
        houseColors: [0]
    } );

    var houses = this.house_layer.draw();
    houses.name = 'houses';
    this.scene.add( houses );

    //
    //Clouds
    this.cloud_layer = new Clouds( {
        planet: this.Planet,
        cloud_size: 50,
        cloudCount: cloudCount
    } );

    var clouds = this.cloud_layer.drawClouds();
    clouds.name = 'clouds';
    this.scene.add( clouds );

    //
    //Rocks
    this.rock_layer = new Rocks( {
        planet: this.Planet,
        rock_size: 20,
        rockCount: rockCount
    } );

    var rocks = this.rock_layer.drawRocks();
    rocks.name = 'rocks';
    this.scene.add( rocks );

    this.animate();
};
