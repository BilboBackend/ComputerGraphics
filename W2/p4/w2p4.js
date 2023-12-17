
var vertices = [ ];
var colors = [];

var circlebuffer = [ ];

var current_drawmode = "points";
var current_color = "red";
var clear_color = vec4(0.3921, 0.5843, 0.9294, 1.0);

var count = 0;

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
    
    if (current_drawmode == "points") {
        addPoint(mousepos,vertices,current_color,colors);
        console.log("adding point")
    } else if (current_drawmode == "triangles") {
        addTriangle(mousepos,vertices,current_color,colors);
        console.log("triangle added?")
    } else if (current_drawmode == "circles") {
        console.log("circle added");
        addCircle(mousepos,vertices,current_color,colors);
    } else { console.log("No valid match")};

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
 
  const drawmode = document.getElementById("drawmode");
  drawmode.addEventListener("click", function()
    { current_drawmode = drawmode.value;
      console.log(current_drawmode)

  }); 
}


// function for updating render
function render(gl, vertices, colors) {
  var program = initShaders(gl, "vertex-shader", "fragment-shader");

  clearColor(gl);

  gl.useProgram(program);
  var pvBuffer = gl.createBuffer();
  
  gl.bindBuffer(gl.ARRAY_BUFFER, pvBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);
  var vPosition = gl.getAttribLocation(program, "a_Position");
  gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vPosition);
 
  // Initializing color buffer
  var pcBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, pcBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);
  var vColor = gl.getAttribLocation(program, "a_Color");
  gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vColor);

  gl.drawArrays(gl.TRIANGLES, 0, vertices.length);
  
}


function addTriangle(pos, vertices, color, colors) {
  vertices.push(pos);
  let colorvec = getColor(color);
  colors.push(colorvec);
}


function addPoint(pos, vertices, color, colors) {
  let size = 0.03;
  let upperright = vec2(pos[0] + size,pos[1] + size);
  let lowerright = vec2(pos[0] + size,pos[1] - size);
  let upperleft = vec2(pos[0] - size,pos[1] + size);
  let lowerleft = vec2(pos[0] - size,pos[1] - size);
  
  vertices.push(lowerleft);
  vertices.push(lowerright);
  vertices.push(upperright);

  vertices.push(lowerleft);
  vertices.push(upperleft);
  vertices.push(upperright);

  let colorvec = getColor(color);
  for (i = 0; i <6; i++) {
    colors.push(colorvec);
  }
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

function addCircle(pos, vertices, color, colors) {
  if (circlebuffer.length == 1) {

    let radius = Math.sqrt((circlebuffer[0][0] - pos[0])**2 + (circlebuffer[0][1] - pos[1])**2);

    pos = vec2(circlebuffer[0][0], circlebuffer[0][1]);
    let circle = createCircle(pos,radius,vertices, color, colors);
    circlebuffer = [];
  } else if (circlebuffer == 0) {
    circlebuffer.push(pos);
  } 
};

function createCircle(center, radius, vertices, color, colors) {
  // preallocate buffer;
  let colorvec = getColor(color);
  
  var toRadians = Math.PI/180;

  for(let i = -180; i <= 180; i += 1){
    thetar = i * toRadians;
    let point1 = vec2(center[0] + Math.sin(thetar)*radius,
      center[1] + Math.cos(thetar)*radius);

    thetar = (i+1) * toRadians;
    let point2 = vec2(center[0] + Math.sin(thetar)*radius,
      center[1] + Math.cos(thetar)*radius);


    vertices.push(center);
    colors.push(colorvec);
    
    vertices.push(point1);
    colors.push(colorvec);
    
    vertices.push(point2);
    colors.push(colorvec);

    } 
}

function clearCanvas(gl) {
  vertices = [];
  colors = [];
 
  render(gl, pointvertices, pointcolors, trianglevertices, trianglecolors,circlevertices,circlecolors);

}

function clearColor(gl) {
  gl.clearColor(clear_color[0],clear_color[1],clear_color[2], 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);

}
