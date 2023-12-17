
  let toRadians = Math.PI/180;
  let cam_radius = 5;
  let angle = 120;
  let animation_active = 0;
  let eye = vec3(cam_radius*Math.sin(toRadians*angle), 0, cam_radius*Math.cos(toRadians * angle));

  let P = perspective(45,1,1,10);
  let V = lookAt(eye,vec3(0,0,0),vec3(0.0,1.0,0.0));

  let kdcol = vec4(0.8,0.8,0.8,1.0);
  let lPos = vec4(0.,0.,-1.,0.0);
  
  let kd_val = 0.5;
  let li_val = 0.5;

  let projection, view, observer, lightPos, kdcolor, kscolor, kacolor, kd, ka, ks, shine, li;


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

  // only show foremost parts of figure
  gl.enable(gl.DEPTH_TEST);

  // backface culling:
  gl.enable(gl.CULL_FACE);
  projection = gl.getUniformLocation(program,"projection");
  view = gl.getUniformLocation(program,"view");

  observer = gl.getUniformLocation(program,"w_o");
  lightPos = gl.getUniformLocation(program,"lightPos");
  kdcolor = gl.getUniformLocation(program,"kdColor");

  kd = gl.getUniformLocation(program,"kd");
  li = gl.getUniformLocation(program,"Li");
  
  gl.uniformMatrix4fv(projection,false,flatten(P));
  gl.uniformMatrix4fv(view,false,flatten(V));
  gl.uniform4fv(observer,vec4(eye,0.0));

  gl.uniform4fv(kdcolor,flatten(kdcol));

  gl.uniform4fv(lightPos,flatten(lPos));

  gl.uniform1f(kd,kd_val);
  gl.uniform1f(li,li_val);

  var vBuffer = gl.createBuffer();

  var current_n = 5;
  
  initSphere(gl,program,current_n);

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
 
}

function initSphere(gl,program, numSubdivs) {
  pointsArray = [];
  normalsArray = [];

  gl.uniformMatrix4fv(projection,false,flatten(P));
  gl.uniformMatrix4fv(view,false,flatten(V));
  gl.uniform4fv(observer,vec4(eye,0.0));

  gl.uniform4fv(lightPos,flatten(lPos));

  gl.uniform1f(kd,kd_val);
  gl.uniform1f(li,li_val);
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

  var vPosition = gl.getAttribLocation(program, "a_Position");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

  var nBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER,nBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW);

  var vNormal = gl.getAttribLocation(program, "a_Normal");
    gl.vertexAttribPointer(vNormal,4,gl.FLOAT,false,0,0);
    gl.enableVertexAttribArray(vNormal);

  var colors = [];
  for (i=0; i<pointsArray.length;i++) {
    colors.push(add(mult(pointsArray[i], vec4(0.5,0.5,0.5,1)), vec4(0.5,0.5,0.5,0)));
  }

  var cBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);

  // var vColor = gl.getAttribLocation(program, "a_Color");
  //   gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
  //   gl.enableVertexAttribArray(vColor);
  //
 
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

