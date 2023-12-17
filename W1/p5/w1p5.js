var radius = 0.2;
var velocity = 0.01;



window.onload = function init() {
  var canvas = document.getElementById("canvas");
  
  var gl = WebGLUtils.setupWebGL(canvas, {});

 
  var vertices = createCircle(radius); //[ vec2(-0.5,-0.5), vec2(0.5, -0.5), vec2(-0.5,0.5), vec2(0.5, 0.5)];

  function animate() {render(gl,vertices, radius); requestAnimationFrame(animate);}
  animate();
}

var radius = 0.2;
var velocity = 0.02;


function createCircle(radius) {
  // preallocate buffer;
  let points = [vec2(0.0,0.0)];
  
  var toRadians = Math.PI/180;

  for(let i = -180; i <= 180; i += 2){
    thetar = i * toRadians;
    points.push(vec2(Math.sin(thetar)*radius,
      Math.cos(thetar)*radius));
  }

  return points;

}

function render(gl,vertices, radius) {
  
  gl.clearColor(0.3921, 0.5843, 0.9294, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  var program = initShaders(gl, "vertex-shader", "fragment-shader");

  gl.useProgram(program);

  if ((vertices[0][1] + radius) > 1.0 || (vertices[0][1] - radius) < -1.0) {
    velocity = -1 * velocity;
   }

 
  for (let j=0;j < vertices.length; j++) {
    vertices[j][1] = vertices[j][1] + velocity;
  }
  var colors = Array.from({length: vertices.length}, () => vec4(1.0,0.0,0.0,1.0));
  
  // initializing position buffer
  var vBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

  var vPosition = gl.getAttribLocation(program, "a_Position");
  gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vPosition);
  
  // Initializing color buffer
  var cBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);
  var vColor = gl.getAttribLocation(program, "a_Color");
  gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vColor);


  gl.drawArrays(gl.TRIANGLE_FAN, 0, vertices.length );

  //gl.bufferSubData(GL_ARRAY_BUFFER, 0, sizeof(vertices), vertices );
  //gl.bufferSubData(GL_ARRAY_BUFFER, sizeof(vertices), sizeof(colors), colors );
}
