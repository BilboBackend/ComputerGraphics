
window.onload = function init() {
  var canvas = document.getElementById("canvas");
  
  var gl = WebGLUtils.setupWebGL(canvas, {});
  gl.clearColor(0.3921, 0.5843, 0.9294, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  var ext = gl.getExtension('OES_element_index_uint');
  if (!ext) {
    console.log("Warning: Unable to use an extension!")
  }
  var program = initShaders(gl, "vertex-shader", "fragment-shader");
  gl.useProgram(program);

// creating rectangle.
  cube1 = drawCube(vec3(-4,-1,-1),8,0,-20,"indices");
  vertices1 = cube1[0];
  indices1 = cube1[1];

  var projection = gl.getUniformLocation(program,"projection");
  var view = gl.getUniformLocation(program,"view");
  var model = gl.getUniformLocation(program,"model");
  
  // creating 90 FOV perspective camera:
  var eye = vec3(0,2,1)
  var lookat = vec3(0,-3,-2)  
  var up = vec3(0,1,0)

  var P = perspective(90,1,0.5,5);
  var V = lookAt(eye,lookat,up);
  
  gl.uniformMatrix4fv(projection,false,flatten(P));
  gl.uniformMatrix4fv(view,false,flatten(V));
 
  // to get a one point perspective we need a surface to face
  // the viewpoint. This is most easily achieved by rotating
  // 45 degrees around the y-axis.
  var M1 = rotate(0,[0,1,0]);
  gl.uniformMatrix4fv(model,false,flatten(M1));
  render(gl,vertices1,indices1,program)


}

// origin should be front bottom left corner
function drawCube(origin,width,height,depth,type) {
  cubevertices = [];

  // making corner points
  
  //bottom back left
  cubevertices.push(vec3(origin[0], origin[1],origin[2]+depth));
  //top back  left
  cubevertices.push(vec3(origin[0], origin[1]+height,origin[2]+depth));
  //top back right
  cubevertices.push(vec3(origin[0]+width, origin[1]+height,origin[2]+depth,1));
  //bottom back right
  cubevertices.push(vec3(origin[0]+width, origin[1],origin[2]+depth));
  
  //bottom front left
  cubevertices.push(origin)
  //top front left
  cubevertices.push(vec3(origin[0], origin[1]+height,origin[2]));
  //top front right
  cubevertices.push(vec3(origin[0]+width, origin[1]+height,origin[2]));
  //bottom front right
  cubevertices.push(vec3(origin[0]+width, origin[1],origin[2]));
  
 
  var indices = [];

  if (type == "indices") {
    var indices = new Uint32Array([
      1, 0, 3, 3, 2, 1, // front
      2, 3, 7, 7, 6, 2, // right
      3, 0, 4, 4, 7, 3, // down
      6, 5, 1, 1, 2, 6, // up
      4, 5, 6, 6, 7, 4, // back
      5, 4, 0, 0, 1, 5 // left
      ]);
  } else if (type == "wires") {
      var indices = new Uint32Array([
        0, 1, 1, 2, 2, 3, 3, 0, // front
        2, 3, 3, 7, 7, 6, 6, 2, // right
        0, 3, 3, 7, 7, 4, 4, 0, // down
        1, 2, 2, 6, 6, 5, 5, 1, // up
        4, 5, 5, 6, 6, 7, 7, 4, // back
        0, 1, 1, 5, 5, 4, 4, 0 // left
    ]);
  } else {
    console.log("Wrong type for cube. Use either indices or wires")
  }

  return [cubevertices, indices]
}

function render(gl,vertices,indices,program) {
 
   var iBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(indices), gl.STATIC_DRAW);
 
  var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);
  
  console.log(vertices);
  //console.log(gl.getAttribLocation(gl.program,"a_Position"));
  var vPosition = gl.getAttribLocation(program, "a_Position");
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

  
  gl.drawElements(gl.TRIANGLES,indices.length,gl.UNSIGNED_INT,0);
}
