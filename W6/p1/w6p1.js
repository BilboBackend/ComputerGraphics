var gl, program;
var texCoords;

var texSize = 64;
var numRows = 2;
var numCols = 2;
var checker;

var vertices = [];

var P;
var projection;

window.onload = function init() {
  var canvas = document.getElementById("canvas");
  
  gl = WebGLUtils.setupWebGL(canvas, {});
  gl.clearColor(0.3921, 0.5843, 0.9294, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  var ext = gl.getExtension('OES_element_index_uint');
  if (!ext) {
    console.log("Warning: Unable to use an extension!")
  }
  
  program = initShaders(gl, "vertex-shader", "fragment-shader");
  gl.useProgram(program);

// creating rectangle.
  drawrectangle(vec3(-4,-1,-1),8,-20);

  console.log(vertices)
  projection = gl.getUniformLocation(program,"projection");
  
  // creating 90 FOV perspective camera:
  P = perspective(90,1,0,25);
  
  gl.uniformMatrix4fv(projection,false,flatten(P));
  
  // generate checker pattern and offload to GPU
  checker = checkerboardTex()

  // Setting up texture coordinates 
  texCoords = [vec2(-1.5,0.0), vec2(2.5,0.0), vec2(2.5,10.0), vec2(-1.5,10.0)]
 

  render()


}

function checkerboardTex() {
  var checkTexels = new Uint8Array(4*texSize*texSize);


  for (var i = 0; i < texSize; ++i){
    for (var j = 0; j < texSize; ++j){

      var patchx = Math.floor(i/(texSize/numRows));
      var patchy = Math.floor(j/(texSize/numCols));
      var c = (patchx % 2 !== patchy%2 ? 255 : 0);
      var idx = 4*(i*texSize + j)
      checkTexels[idx] = checkTexels[idx + 1] = checkTexels[idx + 2] = c;
      checkTexels[idx +3] = 255;
    }
  }

  return checkTexels
}

function drawrectangle(origin,width,depth) {
   
   
  vertices.push(vec4(origin[0], origin[1],origin[2],1));
  vertices.push(vec4(origin[0]+width, origin[1],origin[2],1));
  vertices.push(vec4(origin[0]+width, origin[1],origin[2]+depth,1));

  vertices.push(vec4(origin[0]+width, origin[1],origin[2]+depth,1));
  vertices.push(vec4(origin[0], origin[1],origin[2],1));
  vertices.push(vec4(origin[0], origin[1],origin[2]+depth,1));
  //
  //
  // vertices.push(vec4(origin[0], origin[1],origin[2],1));
  // vertices.push(vec4(origin[0], origin[1],origin[2]+depth,1));
  // vertices.push(vec4(origin[0]+width, origin[1],origin[2]+depth,1));
  //
  // vertices.push(vec4(origin[0], origin[1],origin[2],1));
  // vertices.push(vec4(origin[0]+width, origin[1],origin[2]+depth,1));
  // vertices.push(vec4(origin[0]+width, origin[1],origin[2],1));
  //
  //
 }

function render() {
 
  var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);
 
  var vPosition = gl.getAttribLocation(program, "a_Position");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);


   // Sending the texture coordinates
  var tBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(flatten(texCoords)), gl.STATIC_DRAW);
 
 
  var texPointer = gl.getAttribLocation(program, "TexCoords");
    gl.vertexAttribPointer(texPointer, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(texPointer);
 


  var texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, texSize, texSize, 0, gl.RGBA, gl.UNSIGNED_BYTE, checker);
  gl.generateMipmap(gl.TEXTURE_2D);

  // set minification and magnification to nearest:
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

  // set uv-to-st wrapping to gl.repeat. 
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);


  tex_loc = gl.getUniformLocation(program, "texMap")
  gl.uniform1i(tex_loc, 0)
 
  gl.drawArrays(gl.TRIANGLES,0,vertices.length);
  }
