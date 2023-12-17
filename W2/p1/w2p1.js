
var vertices = [ ];

window.onload = function init() {
  var canvas = document.getElementById("canvas");
  
  var gl = WebGLUtils.setupWebGL(canvas, {});
  gl.clearColor(0.3921, 0.5843, 0.9294, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  var speed = 0.01;

  var offset = vec2(0.0, 0.0);
  var velocity = vec2(0.0, 0.0); 
  var mousepos = vec2(0.0, 0.0);
  canvas.addEventListener("click", function (ev) {
    var bbox = ev.target.getBoundingClientRect();
    mousepos = vec2(2*(ev.clientX - bbox.left)/canvas.width - 1, 2*(canvas.height - ev.clientY + bbox.top - 1)/canvas.height - 1);
    velocity = vec2((mousepos[0] - offset[0])*speed, (mousepos[1] - offset[1])*speed);
    addPoint(mousepos,vertices);
    render(gl, vertices);
  });
  

}
function render(gl, vertices) {
  var program = initShaders(gl, "vertex-shader", "fragment-shader");

  gl.clearColor(0.3921, 0.5843, 0.9294, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);


  gl.useProgram(program);
  var vBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

  var vPosition = gl.getAttribLocation(program, "a_Position");

  gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vPosition);

  gl.drawArrays(vertices, 0, vertices.length);

}

function addPoint(pos, vertices) {
  vertices.push(pos);
}


