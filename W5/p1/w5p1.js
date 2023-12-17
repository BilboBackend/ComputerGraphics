const near = -100;
const far = 100;
const radius = 1.5;
const dr = (5.0 * Math.PI) / 180.0;

const left = -50.0;
const right = 50.0;
const ytop = 50.0;
const bottom = -50.0;

const toRadians = Math.PI/180;
const cam_radius = 5;
let angle = 0;
let animation_active = 0;

let eye; 
let program;
let canvas;
let gl;
let projection, view;
let vertices, indices, normals;
let vBuffer, iBuffer, nBuffer;

window.onload = function init() {
  main();
}
 
const main = async () => {
  let response = await fetch("../Fox.obj");
  let responsetext = await response.text();
  let object = await readObj(responsetext);

  vertices = object[0].v;
  indices = object[0].f;
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
  // gl.enable(gl.CULL_FACE);

  // create and bind buffers
  iBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(indices), gl.STATIC_DRAW);
 
  nBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(normals), gl.STATIC_DRAW);
  
  vBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);
  
  //console.log(gl.getAttribLocation(gl.program,"a_Position"));
  let vPosition = gl.getAttribLocation(program, "a_Position");
  gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vPosition);

  
  projection = gl.getUniformLocation(program,"projection");
  view = gl.getUniformLocation(program,"view");

  eye = vec3(cam_radius*Math.sin(toRadians*angle), 0, cam_radius*Math.cos(toRadians * angle));

  let P = perspective(45,1,1,10);
  let V = lookAt(eye,vec3(0.0,0.0,0.0),vec3(0.0,1.0,0.0));

  gl.uniformMatrix4fv(projection,false,flatten(P));
  gl.uniformMatrix4fv(view,false,flatten(V));

  render();
  console.log("Render done!")
}


function render() {

  gl.drawArrays(gl.TRIANGLES,0,vertices.length);
  //requestAnimationFrame(render);
}



