
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

// creating 3 cubes.
  cube1 = drawCube(vec3(-0.3,-0.3,0),0.7,0.7,0.7,"indices");
  vertices1 = cube1[0];
  indices1 = cube1[1];

  var projection = gl.getUniformLocation(program,"projection");
  var view = gl.getUniformLocation(program,"view");

  var P = perspective(45,1,1,10);
  var V = lookAt(vec3(3,3,3),vec3(0,0,0),vec3(0.0,1.0,0.0));
  
  gl.uniformMatrix4fv(projection,false,flatten(P));
  gl.uniformMatrix4fv(view,false,flatten(V));
 
  // to get a one point perspective we need a surface to face
  // the viewpoint. This is most easily achieved by rotating
  // 45 degrees around the y-axis.
  //var M1 = rotate(45,[0,1,0]);
  //gl.uniformMatrix4fv(model,false,flatten(M1));
  //render(gl,vertices1,indices1,program)

  var vBuffer = gl.createBuffer();
 //console.log(gl.getAttribLocation(gl.program,"a_Position"));
  let current_n = 4;
  initSphere(gl,program,current_n);
  
  const increment = document.getElementById("incrementsub");
  increment.addEventListener("click", function()
    {current_n += 1;
    initSphere(gl,program,current_n);
    }
  );
 const decrease = document.getElementById("decreasesub");
  decrease.addEventListener("click", function()
    {current_n -= 1;
      initSphere(gl,program,current_n);
    }
  );


 

}

function initSphere(gl,program, numSubdivs) {
  pointsArray = [];
  va = vec4(0.0, 0.0, 1.0,1.0);
  vb = vec4(0.0, 0.942809, -0.333333,1.0);
  vc = vec4(-0.816497, -0.471405, -0.333333,1.0);
  vd = vec4(0.816497, -0.471405, -0.333333,1.0);

  tetrahedron(pointsArray, va, vb, vc, vd, numSubdivs);
  gl.deleteBuffer(gl.vBuffer);
  gl.vBuffer = gl.createBuffer();
  gl.clear(gl.COLOR_BUFFER_BIT)
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.vBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);

  var vPosition = gl.getAttribLocation(program, "a_Position");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);


  gl.drawArrays(gl.LINE_LOOP,0,pointsArray.length);
}
function tetrahedron(pointsArray,va,vb,vc,vd,n) {

  divide_triangle(pointsArray,va,vb,vc,n);
  divide_triangle(pointsArray,vd,vc,vb,n);
  divide_triangle(pointsArray,va,vd,vb,n);
  divide_triangle(pointsArray,va,vc,vd,n);
}

function divide_triangle(data,va,vb,vc,n) {
  var v1,v2,v3;

  if (n>0){

    v1 = normalize(add(add(va,vb),vec4(0,0,0,-1)),true);
    v2 = normalize(add(add(va,vc),vec4(0,0,0,-1)),true);
    v3 = normalize(add(add(vb,vc),vec4(0,0,0,-1)),true);

    divide_triangle(data,va,v2,v1,n-1);
    divide_triangle(data,vc,v3,v2,n-1);
    divide_triangle(data,vb,v1,v3,n-1);
    divide_triangle(data,v1,v2,v3,n-1);
  } else {
    triangle(data,va,vb,vc);
  }

}

function triangle(data,a,b,c) {
  data.push(a);
  data.push(b);
  data.push(c);

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


