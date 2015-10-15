


// draw lines.

// x axis
function axis(size){
  this.size = size;
  return build(size)
}

function build(size){
  var retObj = new THREE.Object3D();
  var xgeometry = new THREE.Geometry();
  xgeometry.vertices.push(
    new THREE.Vector3( -size, 0, 0 ),
    new THREE.Vector3( size, 0, 0 ));

  var xmaterial = new THREE.LineBasicMaterial({
    color: 0x0000ff
  });
  var lettersize = size/10;
  var line = new THREE.Line( xgeometry, xmaterial );
  var xText = new THREE.TextGeometry("X",{size:lettersize,height:1})
  xmaterial = new THREE.MeshFaceMaterial( [
            new THREE.MeshPhongMaterial( { color: 0xffffff, shading: THREE.FlatShading } ), // front
            new THREE.MeshPhongMaterial( { color: 0xffffff, shading: THREE.SmoothShading } ) // side
          ] );
  xMesh = new THREE.Mesh( xText, xmaterial );
  xMesh.position.x = size + 1
  retObj.add(xMesh);
  retObj.add( line );

  // y axis
  var ygeometry = new THREE.Geometry();
  ygeometry.vertices.push(
    new THREE.Vector3( 0, size, 0 ),
    new THREE.Vector3( 0,-size, 0 ));

  var ymaterial = new THREE.LineBasicMaterial({
    color: 0xff0a00
  });

  var line = new THREE.Line( ygeometry, ymaterial );
  var yText = new THREE.TextGeometry("Y",{size:lettersize,height:1})
  var ymaterial = new THREE.MeshFaceMaterial( [
            new THREE.MeshPhongMaterial( { color: 0xffffff, shading: THREE.FlatShading } ), // front
            new THREE.MeshPhongMaterial( { color: 0xffffff, shading: THREE.SmoothShading } ) // side
          ] );
  var yMesh = new THREE.Mesh( yText, ymaterial );
  yMesh.position.y = size + 1
  retObj.add(yMesh);
  retObj.add(line)

  // z axis
  var zgeometry = new THREE.Geometry();
  zgeometry.vertices.push(
    new THREE.Vector3( 0, 0, size ),
    new THREE.Vector3( 0, 0, -size ));

  var zmaterial = new THREE.LineBasicMaterial({
    color: 0x1bff00
  });

  var line = new THREE.Line( zgeometry, zmaterial );
  var zText = new THREE.TextGeometry("Z",{size:lettersize,height:1})
  zmaterial = new THREE.MeshFaceMaterial( [
            new THREE.MeshPhongMaterial( { color: 0xffffff, shading: THREE.FlatShading } ), // front
            new THREE.MeshPhongMaterial( { color: 0xffffff, shading: THREE.SmoothShading } ) // side
          ] );
  var zMesh = new THREE.Mesh( zText, zmaterial );
  zMesh.position.z = size + 1;
  retObj.add(zMesh);
  retObj.add(line)

  return retObj
}
