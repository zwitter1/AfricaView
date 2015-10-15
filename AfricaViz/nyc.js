var polygon = require('polygon');
var hbas={}, g6pd={}, duffy={};
var currentMalaria = {};


var scene, camera, renderer,orbitControls, nyc,ambig = {}, unambig = {};
var conLines = new THREE.Object3D();


loadpolys(loadTransmissions/*initScene*/)
//loadpolys()
//loadTransmissions()
//initScene()


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
  var spotLight = new THREE.SpotLight( 0x585858);
  spotLight.position.set( 0, 0, 600 );

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

    if(place.Name == "Mozambique"){
      console.log("stopHere")
    }
    var p = new polygon(pollygons);
    var noDups = p.dedupe()
    var pruned = noDups.pruneSelfIntersections();
    // calculate number of points in prunded
    var totLength = 0;
    for(prun = 0; prun < pruned.length; prun++){
      totLength += pruned[prun].points.length;
    }
    var noIntersecs;
    if(totLength < (noDups.length)){
      noIntersecs = [noDups];
    }
    else{
      noIntersecs = pruned;
    }

    var grayColor = genGrayScale();


    var placeObj = new THREE.Object3D();

    for (var j = 0; j < noIntersecs.length; j++){
      var ofInterest = noIntersecs[j].points
      if(ofInterest.length > 2){
        cleanedPoints = []
        for( var poly = 0; poly < ofInterest.length; poly++){
          current = ofInterest[poly];
          var curvect = new THREE.Vector2(current.x,current.y);
          cleanedPoints.push(curvect);
        }


        var extrusion = .5
        if (place.Name in currentMalaria){
          extrusion = currentMalaria[place.Name];
          var ratio = Math.round(255 - ((extrusion*254)/ currentMalaria.max)) ;
          grayColor = "#ff" + ratio.toString(16) + ratio.toString(16);

          if (grayColor.length < 7){
            grayColor = grayColor + "00";
          }

        }
        extrusion = Math.sqrt(extrusion * 8);

        var extrudeSettings = { amount: extrusion, bevelEnabled: true, bevelSegments: 2, steps: 2, bevelSize: 1, bevelThickness: 1 };

        // create the shape and push it into the city
        var placeShape = new THREE.Shape(cleanedPoints);
        // create 3d geometry
        var geometry = new THREE.ExtrudeGeometry( placeShape, extrudeSettings );
        // maybe be sure this is a random color
    		var placeMesh = new THREE.Mesh( geometry, new THREE.MeshPhongMaterial( { color:grayColor/*, emissiveMap:genGrayScale*/ } ) );
        placeObj.add(placeMesh)
    }
    }


    placeObj.placeId = allKeys[i]
    placeObj.midPoint = midPoint;

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
    place.obj = placeObj;
		city.add( placeObj );
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




// interested in the 7th position.
function loadTransmissions(callback){
  console.log("loading transmissions");
  $.get( "../malariaAfrica/G6PDAfrica.csv", function( data ) {
    var inData = data;
    var malData= inData.split("\n")
    var first = true;
    var highest = 0;
    for(var i = 0; i < malData.length; i++){
      if(first){first = false; continue;}
      var country = malData[i].split(",")[7];
      var count =  parseInt(malData[i].split(",")[15]);

      if(count > highest){
        highest = count;
      }

      if (!(country in g6pd)){
        g6pd[country] = count;
      }
    }
    g6pd.max = highest;
    currentMalaria = g6pd;
    initScene();
  });



  $.get( "../malariaAfrica/hbasAfrica.csv", function( data ) {
    var inData = data;
    var malData= inData.split("\n")
    var first = true;
    var highest = 0;
    for(var i = 0; i < malData.length; i++){
      if(first){first = false; continue;}
      var country = malData[i].split(",")[7];
      var count =  malData[i].split(",")[15];

      if(count > highest){
        highest = count;
      }
      if (!(country in hbas)){
        hbas[country] = count;
      }
    }
    hbas.max = highest;
    currentMalaria = hbas;
  });



  $.get( "../malariaAfrica/duffyAfrica.csv", function( data ) {
    var inData = data;
    var malData= inData.split("\n")
    var first = true;
    var highest = 0;
    for(var i = 0; i < malData.length; i++){
      if(first){first = false; continue;}
      var country = malData[i].split(",")[12];
      var count =  malData[i].split(",")[20];
      if(count > highest){
        highest = count;
      }
      if (!(country in duffy)){
        duffy[country] = count;
      }
    }
    duffy.max = highest;

    currentMalaria =duffy;
    console.log("finished loading transmissions");
  });


};
