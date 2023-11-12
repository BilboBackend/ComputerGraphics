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

let kscol = vec4(1.0,0.4,1.0,1.0);
let kdcol = vec4(0.8,0.8,0.3,1.0);
let kacol = vec4(0.5,0.5,0.6,1.0);
let lPos = vec4(0.,0.,-1.,0.0);

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

window.onload = function init() {
  main();
}
 
const main = async () => {
  let response = await fetch("../TestGeo-RubberToy.obj");
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

  nBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(normals), gl.STATIC_DRAW);
 
  let vNormal = gl.getAttribLocation(program, "a_Normal");
  gl.vertexAttribPointer(vNormal, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vNormal);

  iBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(indices), gl.STATIC_DRAW);
 
 
  vBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);
  
  //console.log(gl.getAttribLocation(gl.program,"a_Position"));
  let vPosition = gl.getAttribLocation(program, "a_Position");
  gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vPosition);

  kd = gl.getUniformLocation(program,"kd");
  ka = gl.getUniformLocation(program,"ka");
  ks = gl.getUniformLocation(program,"ks");
  shine = gl.getUniformLocation(program,"shininess");
  li = gl.getUniformLocation(program,"Li");  

  kdcolor = gl.getUniformLocation(program,"kdColor");
  kscolor = gl.getUniformLocation(program,"ksColor");
  kacolor = gl.getUniformLocation(program,"kaColor");

  projection = gl.getUniformLocation(program,"projection");
  view = gl.getUniformLocation(program,"view");

  eye = vec3(cam_radius*Math.sin(toRadians*angle), 0, cam_radius*Math.cos(toRadians * angle));

  P = perspective(45,1,1,10);
  V = lookAt(eye,vec3(0.0,0.0,0.0),vec3(0.0,1.0,0.0));

  gl.uniformMatrix4fv(projection,false,flatten(P));
  gl.uniformMatrix4fv(view,false,flatten(V));

  function animate() { 
    eye = vec3(cam_radius*Math.sin(toRadians*angle), 0, cam_radius*Math.cos(toRadians * angle));
    V = lookAt(eye,vec3(0,0,0),vec3(0.0,1.0,0.0));

    render()
    angle += 1;
    if (animation_active == 1) {
      requestAnimationFrame(animate); 
    }
  };
  animate();
  
  
  render();
  console.log("Render done!")
    
  const animation = document.getElementById("animate");
  animation.addEventListener("click", function()
    {animation_active = (animation_active + 1) % 2;
      render();
      animate();
    }
  );


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
  kdslide.addEventListener("input", function() {
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


function render() {
  
  gl.uniformMatrix4fv(view,false,flatten(V));
  
  gl.uniform4fv(kscolor,flatten(kscol));
  gl.uniform4fv(kacolor,flatten(kacol));
  gl.uniform4fv(kdcolor,flatten(kdcol));

  gl.uniform1f(kd,kd_val);
  gl.uniform1f(ka,ka_val);
  gl.uniform1f(ks,ks_val);
  gl.uniform1f(li,li_val);


  gl.drawArrays(gl.TRIANGLES,0,vertices.length);
  //requestAnimationFrame(render);
}



