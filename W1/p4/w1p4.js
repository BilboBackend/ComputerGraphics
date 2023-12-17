window.onload = function init() {
  var canvas = document.getElementById("canvas");
  
  var gl = WebGLUtils.setupWebGL(canvas, {});


  var deg = 0.0;
  function animate() {deg += 0.05; render(gl, deg); requestAnimationFrame(animate);}
  animate();
}


function render(gl, deg) {
    gl.clearColor(0.3921, 0.5843, 0.9294, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  var program = initShaders(gl, "vertex-shader", "fragment-shader");

  gl.useProgram(program);
  var vertices = [ vec2(-0.5,-0.5), vec2(0.5, -0.5), vec2(-0.5,0.5), vec2(0.5, 0.5)];

  var colors = [vec4(1.0,0.0,0.0,1.0), vec4(0.0, 1.0, 0.0, 1.0), vec4(0.0, 0.0, 1.0, 1.0), vec4(0.0, 0.1, 0.0, 1.0)];

  var rot = deg; ///180.0 * Math.PI;

  for(let i=0; i < vertices.length; i++){
        let x = vertices[i][0] * Math.cos(rot) - Math.sin(rot) * vertices[i][1] ;
        let y = vertices[i][0] * Math.sin(rot) + Math.cos(rot) * vertices[i][1] ;
        vertices[i] = vec2(x,y);
    }

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


  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

  //gl.bufferSubData(GL_ARRAY_BUFFER, 0, sizeof(vertices), vertices );
  //gl.bufferSubData(GL_ARRAY_BUFFER, sizeof(vertices), sizeof(colors), colors );
}
