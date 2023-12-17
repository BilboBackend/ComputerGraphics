const near = -100;
const far = 100;
const radius = 1.5;
const dr = (5.0 * Math.PI) / 180.0;

const left = -2.0;
const right = 2.0;
const ytop = 2.0;
const bottom = -2.0;

const toRadians = Math.PI/180;
const cam_radius = 4;

let angle = 90;
let animation_active = 1;

let kacol = vec4(1.0,0.3,0.0,1.0);
let kdcol = vec4(0.8,0.6,0.7,1.0);
let kscol = vec4(1.0,1.0,1.0,1.0);
let lPos = vec4(-5.0,-10.0,1.0,1.0);

let ka_val = 1.0;
let ks_val = 0.2;
let kd_val = 0.2;
let li_val = 1.0;
let shininess = 10.0;


let eye, P, V;
let program;
let canvas;
let gl;
let projection, view;
let vertices, normals;
let vBuffer, iBuffer, nBuffer;
let earth_texture;



const loadImage = async () => {
  let image = document.createElement("img");
  image.src = "./earth_texture.jpg";
  image.onload = async () => {
      let texture = gl.createTexture();
      await gl.bindTexture(gl.TEXTURE_2D, texture);
      await gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
      await gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        image
      );
      await gl.generateMipmap(gl.TEXTURE_2D);
      await gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR_MIPMAP_LINEAR);
      await gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
      await gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
      await gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
      earth_texture = texture;
    };
};



window.onload = main = async () => {
  canvas = document.getElementById("canvas");
  
  gl = WebGLUtils.setupWebGL(canvas, {});
  gl.clearColor(0.1921, 0.2843, 0.5294, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  let ext = gl.getExtension('OES_element_index_uint');
  if (!ext) {
    console.log("Warning: Unable to use an extension!")
  }


  let program = initShaders(gl, "vertex-shader", "fragment-shader");
  gl.useProgram(program);

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
  textureLocation = gl.getUniformLocation(program, "texture");


  let eye = vec3(cam_radius*Math.sin(angle), 0, cam_radius*Math.cos(angle));
  let P = ortho(left, right, bottom, ytop, near, far);
  let V = lookAt(eye,vec3(0,0,0),vec3(0.0,1.0,0.0));

  gl.uniformMatrix4fv(projection,false,flatten(P));
  gl.uniformMatrix4fv(view,false,flatten(V));
  


  await loadImage();

  let current_n = 5;
  

  function animate() { 
    eye = vec3(cam_radius*Math.sin(toRadians*angle), 0, cam_radius*Math.cos(toRadians * angle));
    V = lookAt(eye,vec3(0,0,0),vec3(0.0,1.0,0.0));
    gl.uniformMatrix4fv(view,false,flatten(V));

    initSphere(gl,program,current_n);
    angle += 1;
    if (animation_active == 1) {
      requestAnimationFrame(animate); 
    }
  };
  animate();
  
    
  const animation = document.getElementById("animate");
  animation.addEventListener("click", function()
    {animation_active = (animation_active + 1) % 2;
      animate();
      console.log(animation_active)
    initSphere(gl,program,current_n);
    }
  );

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

  initSphere(gl,program, 5)
 

}

function initSphere(gl,program, numSubdivs) {
  pointsArray = [];
  normalsArray = [];
  
  gl.uniform4fv(gl.getUniformLocation(program,"lightPos"), flatten(lPos));
  gl.uniform4fv(gl.getUniformLocation(program,"kdColor"), flatten(kdcol));
  gl.uniform4fv(gl.getUniformLocation(program,"ksColor"), flatten(kscol));
  gl.uniform4fv(gl.getUniformLocation(program,"kaColor"), flatten(kacol));

  gl.uniform1f(gl.getUniformLocation(program,"kd"),kd_val);
  gl.uniform1f(gl.getUniformLocation(program,"ka"),ka_val);
  gl.uniform1f(gl.getUniformLocation(program,"ks"),ks_val);
  gl.uniform1f(gl.getUniformLocation(program,"shininess"), shininess);
  gl.uniform1f(gl.getUniformLocation(program,"Li"),li_val);


  va = vec4(0.0, 0.0, 1.0,1.0);
  vb = vec4(0.0, 0.942809, -0.333333,1.0);
  vc = vec4(-0.816497, -0.471405, -0.333333,1.0);
  vd = vec4(0.816497, -0.471405, -0.333333,1.0);

  tetrahedron(pointsArray,normalsArray, va, vb, vc, vd, numSubdivs);

  gl.deleteBuffer(gl.vBuffer);
  gl.vBuffer = gl.createBuffer();
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  gl.bindBuffer(gl.ARRAY_BUFFER, gl.vBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);

  let vPosition = gl.getAttribLocation(program, "a_Position");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

  let nBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER,nBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW);

  let vNormal = gl.getAttribLocation(program, "a_Normal");
    gl.vertexAttribPointer(vNormal,4,gl.FLOAT,false,0,0);
    gl.enableVertexAttribArray(vNormal);


  gl.bindTexture(gl.TEXTURE_2D, earth_texture);
  gl.uniform1i(textureLocation, 0);


  gl.drawArrays(gl.TRIANGLES,0,pointsArray.length);
}
function tetrahedron(pointsArray,normalsArray, va,vb,vc,vd,n) {

  divide_triangle(pointsArray,normalsArray,va,vb,vc,n);
  divide_triangle(pointsArray,normalsArray,vd,vc,vb,n);
  divide_triangle(pointsArray,normalsArray,va,vd,vb,n);
  divide_triangle(pointsArray,normalsArray,va,vc,vd,n);
}

function divide_triangle(data,normalsArray,va,vb,vc,n) {
  var v1,v2,v3;

  if (n>0){

    v1 = normalize(add(add(va,vb),vec4(0,0,0,-1)),true);
    v2 = normalize(add(add(va,vc),vec4(0,0,0,-1)),true);
    v3 = normalize(add(add(vb,vc),vec4(0,0,0,-1)),true);
    
    divide_triangle(data,normalsArray,va,v2,v1,n-1);
    divide_triangle(data,normalsArray,vc,v3,v2,n-1);
    divide_triangle(data,normalsArray,vb,v1,v3,n-1);
    divide_triangle(data,normalsArray,v1,v2,v3,n-1);
  } else {
    triangle(data,normalsArray,va,vb,vc);
  }

}

function triangle(data,normalsArray,a,b,c) {
  data.push(normalize(a,true));
  data.push(normalize(b,true));
  data.push(normalize(c,true));

  normalsArray.push(mult(normalize(a,true),vec4(1,1,1,0)));
  normalsArray.push(mult(normalize(b,true),vec4(1,1,1,0)));
  normalsArray.push(mult(normalize(c,true),vec4(1,1,1,0)));

}


