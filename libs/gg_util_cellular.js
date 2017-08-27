(function(global) {
  var module = global.cell_noise = {};

  module.N = 0;
  module.res = 0;
  module.maxOrder = 5;
  module.centers = [];
  module.data = [];

  var distNeighbor = function (x, y) {
    var dMin  = [];
    for (var i=0; i<module.maxOrder; i++) {
      dMin[i] = 9999999;
    }

    for (var j=0; j<module.maxOrder; j++) {
      for (var i=0; i<module.N; i++) {
        var c = module.centers[i];
        var d = Math.sqrt(Math.pow(x-c.x, 2) + Math.pow(y-c.y, 2));

        if (j==0) {
          if (d < dMin[j]) {
            dMin[j] = d;
          }
        }
        if (d < dMin[j] && d > dMin[j-1]) {
          dMin[j] = d;
        }
      }
    }
    return dMin;
  };

  module.recalc = function (N, res) {
    module.N = N;
    module.res = res;
    for (var i=0; i<N; i++) {
      module.centers[i] = {
        x: Math.random(),
        y: Math.random()
      };
    }

    for (var i=0; i<module.res; i++) {
      module.data[i] = [];
      for (var j=0; j<module.res; j++) {
        module.data[i][j] = distNeighbor (i/module.res, j/module.res);
      }
    }
  };

 // get distance from point (x,y) to nth neighbor
  module.value = function (x, y, n) {
    var i = Math.floor(x*module.res);
    var j = Math.floor(y*module.res);
    if (i>module.res-1) i = module.res-1;
    if (j>module.res-1) j = module.res-1;
    if (i<0) i = 0;
    if (j<0) j = 0;
    return module.data[i][j][n];
  };

  module.cellularMap = function (radius, res, dist) {

      module.recalc(radius, res);

      // Create empty map
      var map = new Array( radius );
      for ( var i = 0; i < radius; i++ ) {

          map[i] = new Array( radius );
          for (var j = 0; j < radius; j++) {
              if(Math.pow(1.3*(i - radius/2),2) + Math.pow((j - radius/2),2) > Math.pow(radius/3,2)) {
                map[i][j] = 0;
              }
              else map[i][j] = module.data[i][j][dist];
          }
      }
      return map;
  };

  module.cellularBottom = function (length, res, dist) {

      module.recalc(length, res);

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
                  xScale += 1200*module.data[i][j][dist] + 30*Math.random() - 30/2;
                  map[i][j] = xScale;
              }
          }
      }
      return map;
  };

})(this);
