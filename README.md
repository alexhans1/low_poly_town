# GG-low-poly-town
Project for Generaive Art class of Beuth University of Applied Sciences 2016/17

DEMO: http://debating.de/BDUDBdev/gg/world/index.html

The range for the terrain height is 10 to 400.
The range for the amounts of trees, houses, clouds and rocks is 0 to 1, representing the percentage that a given object is placed at a spot.

The terrain is created using cellular noise after experimenting with diamond squares and simplex noises as well.
The bottom is generated using both cellular noise plus a random offset to create a more rocky surface.

Trees, houses, clouds and rocks are generated from basic Three.js geometries.
Trees are placed only inside the green areas of the terrain. House are only placed onto the grey, asphalt surface.
Houses can have textures applied to them so that three types of skyscrapers and two types of block buildings can be generated.