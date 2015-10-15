var polygon = require('polygon');


var scene, camera, renderer,orbitControls, nyc,ambig = {}, unambig = {};
var conLines = new THREE.Object3D();


loadpolys(/*loadTransmissions*/initScene)
//loadpolys()
//loadTransmissions()
//initScene()
var extrudeSettings = { amount: 8, bevelEnabled: true, bevelSegments: 2, steps: 2, bevelSize: 1, bevelThickness: 1 };


function initScene(){
  console.log("initializing the scene");
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );
  camera.position.z = 160;
  renderer = new THREE.WebGLRenderer();
  renderer.setSize( window.innerWidth, window.innerHeight );
  document.body.appendChild( renderer.domElement );

  orbitControls = new THREE.OrbitControls(camera);
  buildAsLines();
  buildAsShapes();
  //loadTransmissions();
  tobuttons();
  scene.add(conLines);

  var light = new THREE.AmbientLight( 0xbbbbbb ); // soft white light 404040
  var spotLight = new THREE.SpotLight( 0x0a45ff );
  spotLight.position.set( 0, 100, 20 );

  spotLight.castShadow = true;
  //scene.add(new axis(160))
  scene.add(spotLight);
  scene.add( light );
  render();
}


function tobuttons(){
  var html = "<label>Ambiguous</label>"
  var ambigKeys = Object.keys(ambig);
  for (var i = 0 ; i < ambigKeys.length; i++){
    html = html + "<a onclick='buildConnections(\""+ambigKeys[i]+"\",\"ambig\")'>"+ambigKeys[i]+"</a>";
  }
  var unambigKeys = Object.keys(unambig)
  html = html + "<label>Unambiguous</label>"
  for (var i = 0 ; i < unambigKeys.length; i++){
    html = html + "<a onclick='buildConnections(\""+unambigKeys[i]+"\",\"unambig\")'>"+unambigKeys[i]+"</a>";
  }

  $("#showWindow").html(html);
}


function buildConnections(connectionPlace,ambiguity){
  var source;
  clearOldLines();
  if (ambiguity == "ambig"){
    source = ambig;
  }
  else{
    source = unambig;
  }

  var connections = source[connectionPlace];
  for(var i = 0; i < connections.length; i++){
    var endPlace = connections[i]
    var actLine = createLine(connectionPlace, endPlace);
    nyc[endPlace].obj.material.color = new THREE.Color(0xf42929);
    conLines.add(actLine)
  }
  nyc[connectionPlace].obj.material.color = new THREE.Color(0x7ce657);

}

function clearOldLines(){
  var oldChildren = conLines.children;
  for(var i = 0; i < oldChildren.length; i++){
    var firstSearch = oldChildren[i].stPlace;
    nyc[firstSearch].obj.material.color = new THREE.Color(genGrayScale());
    var secondSearch = oldChildren[i].enPlace;
    nyc[secondSearch].obj.material.color = new THREE.Color(genGrayScale());
  }
  conLines.children = [];
}


function buildAsShapes(){
  console.log("building shapes")
  var allKeys = Object.keys(nyc)
  var city = new THREE.Object3D();

  for(var i = 0 ; i < allKeys.length; i++){
    var place = nyc[allKeys[i]];
    var pollygons = place.pollygons;
    var placePoints = [];
    var midPoint = null
    for(var poly = 0;  poly < pollygons.length; poly++){
      var current = pollygons[poly];
      var curvect = new THREE.Vector2(current[0],current[1]);
      placePoints.push(curvect);
      if(midPoint == null){
        midPoint = curvect.clone();
      }
      else{
        midPoint.add(curvect);
      }
    }
    midPoint = midPoint.divideScalar(pollygons.length);

    /*var flatPoints = flattenData([pollygons]);
    var testTriangles = earcut(flatPoints.vertices);
    */

    if(place.Name == "Madagascar"){
      console.log("stopHere")
    }
    var p = new polygon(pollygons);
    var noIntersecs = p.pruneSelfIntersections();
    var ofInterest = noIntersecs[0].dedupe().points
    cleanedPoints = []
    for( var poly = 0; poly < ofInterest.length; poly++){
      current = ofInterest[poly];
      var curvect = new THREE.Vector2(current.x,current.y);
      cleanedPoints.push(curvect);
    }

    // create the shape and push it into the city
    var placeShape = new THREE.Shape(cleanedPoints);

    // create 3d geometry
    var geometry = new THREE.ExtrudeGeometry( placeShape, extrudeSettings );
    // maybe be sure this is a random color
    var ranColor = "#"+((1<<24)*Math.random()|0).toString(16);
		var placeMesh = new THREE.Mesh( geometry, new THREE.MeshBasicMaterial( { color:genGrayScale()/*, emissiveMap:genGrayScale*/ } ) );
    placeMesh.placeId = allKeys[i]
    placeMesh.midPoint = midPoint;

    // throw midpoint onto map to view validity
    /*
    var threeDVec = new THREE.Vector3();
    threeDVec.x = midPoint.x;
    threeDVec.y = midPoint.y;
    threeDVec.z = 0;

    var threeDVec2 = new THREE.Vector3(threeDVec.x,threeDVec.y, 20);

    var lineGeo = new THREE.Geometry();
    lineGeo.vertices.push(threeDVec, threeDVec2);
    var midline = new THREE.Line(lineGeo, new THREE.LineBasicMaterial({color:0x0000ff}));
    scene.add(midline);*/
    place.obj = placeMesh;
		city.add( placeMesh );
  }
  scene.add(city);
}


function createLine(start,end){
  // grab start mesh and end mesh.
    stPoint = nyc[start].obj.midPoint;
    enPoint = nyc[end].obj.midPoint;

    stPoint3d = new THREE.Vector3(stPoint.x,stPoint.y,0);
    enPoint3d = new THREE.Vector3(enPoint.x, enPoint.y, 0);
  // calculate the midpoint betweent the two
    var center = stPoint3d.clone().lerp(enPoint3d,.5);
    var distance = stPoint3d.distanceTo(enPoint3d);
    center.z = distance;
    // generate line
    var curve = new THREE.QuadraticBezierCurve3(stPoint3d,center,enPoint3d);
    var lineGeometry = new THREE.Geometry();
    lineGeometry.vertices = curve.getPoints(50);
    var material = new THREE.LineBasicMaterial({color:new THREE.Color(0xffa12b)});
    var curveObject = new THREE.Line(lineGeometry, material);
    curveObject.stPlace = start;
    curveObject.enPlace = end;
    return curveObject;


}




function buildAsLines(){
  var allKeys = Object.keys(nyc)
  var allLines = []
  // pull each place out of the nyc object
  for(var i = 0; i < allKeys.length; i++){
    // for each place get it's polygons
    var place = nyc[allKeys[i]];
    var pollygons = place.pollygons;
    var geometry = new THREE.Geometry();
    var lastVec = null;
    for(var poly = 0; poly < pollygons.length; poly++){
      var current = pollygons[poly];
      var curvect = new THREE.Vector3(current[0],current[1],0);
      /*var spgeometry = new THREE.SphereGeometry(.1, 3,3)
      var spmaterial = new THREE.MeshBasicMaterial({color:0xaadd00})
      var sphere = new THREE.Mesh(spgeometry, spmaterial);

      sphere.position.x = curvect.x;
      sphere.position.y = curvect.y;
      sphere.position.z = curvect.z;
      scene.add(sphere)*/
      var dist = null
      if (lastVec == null){
        dist = 1
        lastVec = curvect
      }
      else{
        dist = lastVec.distanceTo(curvect)
      }

      geometry.vertices.push(curvect)
    }
    var material = new THREE.LineBasicMaterial({color:0xaa00aa})
    var line = new THREE.Line(geometry,material)
    allLines.push(line)
  }

  // Now add all of these lines into the scene

  for(var i = 0; i < allLines.length; i++){
    scene.add(allLines[i]);
  }




}


var render = function () {
			requestAnimationFrame( render );

			renderer.render(scene, camera);
			orbitControls.update()
};

function genGrayScale(){
  var letters = '0123456789ABCDEF'.split('');
  var color = '#';
  var firstColor = '0'
  while(firstColor < '4'){
    var firstColor = letters[Math.floor(Math.random() * 16)];
  }
  var secondColor = letters[Math.floor(Math.random() * 16)];

  return color + firstColor + secondColor + firstColor + secondColor + firstColor + secondColor;
}


function loadpolys(callback){
	// We're going to ask a file for the JSON data.
  console.log("loading polys")
  $.get( "polys.json", function( data ) {

	      nyc = JSON.parse( data);
        console.log("parsed nyc data")
	      if( callback )
	      	callback();

	});

}



// test
function flattenData(data) {
    var dim = data[0][0].length,
        result = {vertices: [], holes: [], dimensions: dim},
        holeIndex = 0;

    for (var i = 0; i < data.length; i++) {
        for (var j = 0; j < data[i].length; j++) {
            for (var d = 0; d < dim; d++) result.vertices.push(data[i][j][d]);
        }
        if (i > 0) {
            holeIndex += data[i - 1].length;
            result.holes.push(holeIndex);
        }
    }

    return result;
}





function loadTransmissions(callback){
  console.log("loading transmissions")
  $.get( "../sample.log", function( data ) {
    var inData = data;
    var transmissions= inData.split("\n")
    for(var i = 0; i < transmissions.length; i++){
      var currentLine= transmissions[i];
      if(currentLine.indexOf(" --> ") > -1){
        var tofrom = currentLine.split(" --> ");
        if(tofrom[0] in ambig){
          ambig[tofrom[0]].push(tofrom[1]);
        }
        else{
          ambig[tofrom[0]] = [tofrom[1]];
        }
      }
      else if (currentLine.indexOf(" ==> ") > -1) {
        var tofrom = currentLine.split(" ==> ");
        if(tofrom[0] in unambig){
          unambig[tofrom[0]].push(tofrom[1]);
        }
        else{
          unambig[tofrom[0]] = [tofrom[1]];
        }
      }
    }
    console.log("finished loading transmissions");
    initScene();
  });
};
