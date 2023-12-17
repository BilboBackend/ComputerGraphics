
var vertices = [ ];
var colors = [];
var current_color = "red";
var clear_color = vec4(0.3921, 0.5843, 0.9294, 1.0);


window.onload = function init() {
  var canvas = document.getElementById("canvas");
  
  var gl = WebGLUtils.setupWebGL(canvas, {});
  
  clearColor(gl);

  var speed = 0.01;

  var offset = vec2(0.0, 0.0);
  var velocity = vec2(0.0, 0.0); 
  var mousepos = vec2(0.0, 0.0);


  canvas.addEventListener("click", function (ev) {
    var bbox = ev.target.getBoundingClientRect();
    mousepos = vec2(2*(ev.clientX - bbox.left)/canvas.width - 1, 2*(canvas.height - ev.clientY + bbox.top - 1)/canvas.height - 1);

    velocity = vec2((mousepos[0] - offset[0])*speed, (mousepos[1] - offset[1])*speed);

    addPoint(mousepos,vertices,current_color,colors);
    render(gl, vertices, colors);
  });

  // Adding event listeners
  const clearcanvas = document.getElementById("clearcanvas");
  clearcanvas.addEventListener("click", function() {
    let clearcol = getColor(colorclear.value);
    clear_color = clearcol;
    clearCanvas(gl)});

  const colorclear = document.getElementById("colorclear");


  const colorselecter = document.getElementById("colorselecter");
  colorselecter.addEventListener("click", function()
    {current_color = colorselecter.value;
    }
  );
  
  
}


// function for updating render
function render(gl, vertices,colors) {
  var program = initShaders(gl, "vertex-shader", "fragment-shader");

  clearColor(gl);

  // initializing point buffer
  gl.useProgram(program);
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

  gl.drawArrays(vertices, 0, vertices.length);

}

function addPoint(pos, vertices, color, colors) {
  vertices.push(pos);
  let colorvec = getColor(color);
  console.log(colorvec);
  colors.push(colorvec);
}

function getColor(color) {
  if (color === "black"){
    return vec4(0.0,0.0,0.0,1.0);
  } else if (color === "red") {
    return vec4(1.0,0.0,0.0,1.0);
  } else if (color === "green") {
    return vec4(0.0,1.0,0.0,1.0);
  } else if (color === "blue") {
    return vec4(0.0,0.0,1.0,1.0);
  }
}


function clearCanvas(gl) {
  vertices = [];
  colors = [];
  render(gl, vertices, colors)

}

function clearColor(gl) {
  gl.clearColor(clear_color[0],clear_color[1],clear_color[2], 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);
}
