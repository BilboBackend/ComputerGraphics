const near = -100;
const far = 100;
const radius = 1.5;
const dr = (5.0 * Math.PI) / 180.0;

const left = -50.0;
const right = 50.0;
const ytop = 30.0;
const bottom = -30.0;

const toRadians = Math.PI/180;
const cam_radius = 7;
let angle = 0;
let animation_active = 0;

let kacol = vec4(1.0,0.3,0.0,1.0);
let kdcol = vec4(0.8,0.6,0.7,1.0);
let kscol = vec4(1.0,1.0,1.0,1.0);
let lPos = vec4(-5.0,-10.0,1.0,1.0);

let ka_val = 0.5;
let ks_val = 0.5;
let kd_val = 0.5;
let li_val = 0.8;
let shininess = 100.0;


let eye, P, V; 
let program;
let canvas;
let gl;
let projection, view;
let vertices, indices, normals;
let vBuffer, iBuffer, nBuffer;
let currentAngle = [0.0, 0.0];

window.onload = function init() {
  main();
}
 
const main = async () => {
  let response = await fetch("../Fox.obj");
  let responsetext = await response.text();
  let object = await readObj(responsetext);

  vertices = object[0].v;
  normals = object[0].n;

  canvas = document.getElementById("canvas");
  
  gl = WebGLUtils.setupWebGL(canvas, {});
  
  gl.clearColor(0.3921, 0.5843, 0.9294, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  

  let ext = gl.getExtension('OES_element_index_uint');
  
  if (!ext) {
    console.log("Warning: Unable to use an extension!")
  }
  
  program = initShaders(gl, "vertex-shader", "fragment-shader");
  gl.useProgram(program);
  gl.viewport(0,0,canvas.width, canvas.height)
  // only show foremost parts of figure
  gl.enable(gl.DEPTH_TEST);

  // backface culling:
  gl.enable(gl.CULL_FACE);

  gl.uniform4fv(gl.getUniformLocation(program,"lightPos"), flatten(lPos));
  gl.uniform4fv(gl.getUniformLocation(program,"kdColor"), flatten(kdcol));
  gl.uniform4fv(gl.getUniformLocation(program,"ksColor"), flatten(kscol));
  gl.uniform4fv(gl.getUniformLocation(program,"kaColor"), flatten(kacol));

  gl.uniform1f(gl.getUniformLocation(program,"kd"),kd_val);
  gl.uniform1f(gl.getUniformLocation(program,"ka"),ka_val);
  gl.uniform1f(gl.getUniformLocation(program,"ks"),ks_val);
  gl.uniform1f(gl.getUniformLocation(program,"shininess"), shininess);
  gl.uniform1f(gl.getUniformLocation(program,"Li"),li_val);
  
  projection = gl.getUniformLocation(program,"projection");
  view = gl.getUniformLocation(program,"view");

  eye = vec3(cam_radius*Math.sin(toRadians*angle), 0, cam_radius*Math.cos(toRadians * angle));

  nBuffer = gl.createBuffer();

  vBuffer = gl.createBuffer();

  P = perspective(45,1,1,10);
  V = lookAt(eye,vec3(0.0,0.0,0.0),vec3(0.0,1.0,0.0));

  gl.uniformMatrix4fv(projection,false,flatten(P));
  gl.uniformMatrix4fv(view,false,flatten(V));

  initEventHandlers();

  render();
  const shineslide = document.getElementById("shininess");
  shineslide.addEventListener("input", function() {
    // Get the current value of the slider
    shininess = parseFloat(shineslide.value);
    render();

  });
  
 const kdslide = document.getElementById("kd");
  kdslide.addEventListener("input", function() {
    // Get the current value of the slider
    kd_val = parseFloat(kdslide.value);
    render();
    });

  const ksslide = document.getElementById("ks");
  ksslide.addEventListener("input", function() {
    // Get the current value of the slider
    ks_val = parseFloat(ksslide.value);
    render();
    });

 const kaslide = document.getElementById("ka");
  kaslide.addEventListener("input", function() {
    // Get the current value of the slider
    ka_val = parseFloat(kaslide.value);
    render();
    });
  
  const intensityslide = document.getElementById("lightintensity");
  intensityslide.addEventListener("input", function() {
    // Get the current value of the slider
    li_val = parseFloat(intensityslide.value);
    render();
    });
 
}



function initEventHandlers() {
  let dragging = false; // Dragging or not
  let lastX = -1, lastY = -1; // Last position of the mouse

  canvas.onmousedown = function(ev) { // Mouse is pressed
  let x = ev.clientX, y = ev.clientY;
  // Start dragging if a mouse is in <canvas>
  let rect = ev.target.getBoundingClientRect();
  console.log("mouse down")
  if (rect.left <= x && x < rect.right && rect.top <= y && y < rect.bottom) {
    lastX = x; lastY = y;
    dragging = true;
  }
  };
  // Mouse is released
  canvas.onmouseup = function(ev) { dragging = false; };

  canvas.onmousemove = function(ev) { // Mouse is moved
  let x = ev.clientX, y = ev.clientY;

    if (dragging) {
        let factor = 40/canvas.height; // The rotation ratio
        let dx = factor * (x - lastX);
        let dy = factor * (y - lastY);
        // Limit x-axis rotstion angle to -90 to 90 degrees
        currentAngle[0] = Math.max(Math.min(currentAngle[0] + dy, 90.0), -90.0);
        currentAngle[1] = currentAngle[1] + dx;
        V = mult(mult(V,rotateX(currentAngle[0])),rotateY(currentAngle[1]));
        render();
      }
      
      lastX = x, lastY = y;
  };
}



function render() {
 
  gl.clearColor(0.3921, 0.5843, 0.9294, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  gl.uniform4fv(gl.getUniformLocation(program,"lightPos"), flatten(lPos));
  gl.uniform4fv(gl.getUniformLocation(program,"kdColor"), flatten(kdcol));
  gl.uniform4fv(gl.getUniformLocation(program,"ksColor"), flatten(kscol));
  gl.uniform4fv(gl.getUniformLocation(program,"kaColor"), flatten(kacol));


  gl.uniform1f(gl.getUniformLocation(program,"kd"),kd_val);
  gl.uniform1f(gl.getUniformLocation(program,"ka"),ka_val);
  gl.uniform1f(gl.getUniformLocation(program,"ks"),ks_val);
  gl.uniform1f(gl.getUniformLocation(program,"shininess"), shininess);
  gl.uniform1f(gl.getUniformLocation(program,"Li"),li_val);


  gl.uniformMatrix4fv(projection,false,flatten(P));
  gl.uniformMatrix4fv(view,false,flatten(V));


  // create and bind buffers
  gl.deleteBuffer(gl.vBuffer);
  gl.vBuffer = gl.createBuffer();
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  gl.bindBuffer(gl.ARRAY_BUFFER, gl.vBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

  var vPosition = gl.getAttribLocation(program, "a_Position");
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

  var nBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER,nBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(normals), gl.STATIC_DRAW);

  var vNormal = gl.getAttribLocation(program, "a_Normal");
    gl.vertexAttribPointer(vNormal,3,gl.FLOAT,false,0,0);
    gl.enableVertexAttribArray(vNormal);


  gl.drawArrays(gl.TRIANGLES, 0, vertices.length);
}



