
var angle = 0;
var then = 0;
// the function will initial all the data
function exampleLoad() {
    this.RL = null; //  The Resource Loader
    this.shaderProgram = null; //  The Shader Program
    this.shaderProgram2 = null;
    this.faceArray=[];
    this.vertexArray =[];
    this.normalArray =[];
    this.faceTerrainNum = 0;
    this.cubetexture;

}

// the function will process the data in obj file and 
//then get the vertex, normal and face
exampleLoad.prototype.processTheData = function (data){
    var lines = data.split('\n');
    var i;
    for (i=0;i<lines.length;i++) 
    {
        var words = lines[i].split(" ");
        if (words[0] == 'v')
        {
            this.vertexArray.push(words[1]);
            this.vertexArray.push(words[2]);
            this.vertexArray.push(words[3]);


           this.normalArray.push(0);
           this.normalArray.push(0);
           this.normalArray.push(1);

        }
        if (words[0] == 'f')
        {
            this.faceArray.push(words[2]-1);
            this.faceArray.push(words[3]-1);
            this.faceArray.push(words[4]-1);

        }
    }

    this.calculateFaceNormal();
    this.normalizeNorm();
    console.log(this.normalArray);
};

// the function will load resource from filesystem
exampleLoad.prototype.loadResources = function () {

    //  Request Resourcess
    this.RL = new ResourceLoader(this.resourcesLoaded, this);
    this.RL.addResourceRequest("TEXT", "JS/Assets/TEXT/default_vertex_shader.txt");  // 0
    this.RL.addResourceRequest("TEXT", "JS/Assets/TEXT/default_fragment_shader.txt");   //1
    this.RL.addResourceRequest("TEXT", "JS/Assets/TEXT/teapot_0.obj");  //2
    this.RL.addResourceRequest("TEXT", "JS/Assets/TEXT/vertex2.txt");    //3
    this.RL.addResourceRequest("TEXT", "JS/Assets/TEXT/fragment2.txt");   //4
    this.RL.addResourceRequest("IMAGE", "JS/Assets/IMAGE/test.jpg");   //0
    this.RL.addResourceRequest("IMAGE", "JS/Assets/IMAGE/negx.jpg");   //1
    this.RL.addResourceRequest("IMAGE", "JS/Assets/IMAGE/negy.jpg");   //2
    this.RL.addResourceRequest("IMAGE", "JS/Assets/IMAGE/negz.jpg");   //3
    this.RL.addResourceRequest("IMAGE", "JS/Assets/IMAGE/posx.jpg");   //4
    this.RL.addResourceRequest("IMAGE", "JS/Assets/IMAGE/posy.jpg");   //5
    this.RL.addResourceRequest("IMAGE", "JS/Assets/IMAGE/posz.jpg");   //6
    this.RL.loadRequestedResources();

};

// the function will check the loading is complete
exampleLoad.prototype.resourcesLoaded = function (exampleLoadReference) {

    // This will only run after the resouces have been loaded.
    exampleLoadReference.completeCheck();
    exampleLoadReference.begin();
};


//the function will check the status of loading and call process data
exampleLoad.prototype.completeCheck = function () {
    //console.log("hello");
    this.processTheData(this.RL.RLStorage.TEXT[2]);
    //console.log(this.vertexArray);
    
    //  Run a quick check
    console.log(this.RL.RLStorage.TEXT[0]);
    console.log(this.RL.RLStorage.TEXT[1]);
    //console.log(this.RL.RLStorage.TEXT[2]);
    console.log(this.RL.RLStorage.TEXT[3]);
    console.log(this.RL.RLStorage.TEXT[4]);

};

// the function will initialize the shaders, texture and buffers
exampleLoad.prototype.begin = function () {
    // Begin running the program.  
    this.initShaders(); // teapot
    this.create_cube();

    this.initShaders2(); // terrain
    this.initTextures();


    this.initSetupBuffers();

    this.initSetupBuffers2();
    //  Once everything has been finished call render from here.
    render(0.0);
};

//The funciton will
//initialize the normal array (same size as vertex array)
//get the point info from facearray, calculate the normal and save it
//normalize the sum and save it to the normal array again
exampleLoad.prototype.calculateFaceNormal = function () {
    var i;
    //initialize the normal array (same size as vertex array)
    for (i=0;i<this.vertexArray.length;i++)
    {
        this.normalArray.push(0);
    }
    //get the point info from facearray, calculate the normal and save it
    for (i=0;i<this.faceArray.length;i=i+3)
    {
        //get the 3 points
        var Index = 3 * this.faceArray[i];
        var P1 = vec3.fromValues(this.vertexArray[Index],this.vertexArray[Index+1], this.vertexArray[Index+2]);   
        Index = 3 * this.faceArray[i+1];
        var P2 = vec3.fromValues(this.vertexArray[Index],this.vertexArray[Index+1], this.vertexArray[Index+2]);
        Index = 3 * this.faceArray[i+2];
        var P3 = vec3.fromValues(this.vertexArray[Index],this.vertexArray[Index+1], this.vertexArray[Index+2]);
        // calculate the normal
        var vecV = vec3.create();
        var vecW = vec3.create();
        vec3.subtract(vecV, P2, P1);
        vec3.subtract(vecW, P3, P1);
        vec3.cross(vecV, vecV, vecW);

        
        var j;
        for (j=0;j<3;j++)
        {
        var Index = 3 * this.faceArray[i+j];
        this.normalArray[Index] += vecV[0];
        this.normalArray[Index+1] += vecV[1];
        this.normalArray[Index+2] += vecV[2];
        //console.log(this.normalArray[Index]);

        }
    }



};


    //normalize the sum and save it to the normal array again
exampleLoad.prototype.normalizeNorm = function () {
    for (i=0;i<this.normalArray.length;i=i+3)
    {
        var n1 = this.normalArray[i];
        var n2 = this.normalArray[i+1];
        var n3 = this.normalArray[i+2];
        var a = vec3.fromValues(n1,n2,n3);

        vec3.normalize(a, a);
        this.normalArray[i] = a[0];
        this.normalArray[i+1] = a[1];
        this.normalArray[i+2] = a[2];
    }
};
///////////////////////////////////////////////////////////////////////////////////////////////////////
//the function will initial the  2D texture 
exampleLoad.prototype.initTextures = function() {

  this.testTexture =  gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, this.testTexture);
 // gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 255, 255]));
  heightImage = new Image();
  heightImage = this.RL.RLStorage.IMAGE[0];
  this.handleTextureLoaded(heightImage, this.testTexture); 
};

// the function will create the cube map
exampleLoad.prototype.create_cube = function() {

  this.cubetexture = gl.createTexture(); 
  gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.cubetexture);

 gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
 gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
 gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
 gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

 gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X, 0, gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE, this.RL.RLStorage.IMAGE[4]);
 gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 0, gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE, this.RL.RLStorage.IMAGE[1]);
 gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Y, 0, gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE, this.RL.RLStorage.IMAGE[5]);
 gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE, this.RL.RLStorage.IMAGE[2]);
 gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Z, 0, gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE, this.RL.RLStorage.IMAGE[6]);
 gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE, this.RL.RLStorage.IMAGE[3]);

 gl.activeTexture( gl.TEXTURE0 );
 gl.uniform1i(gl.getUniformLocation(this.shaderProgram, "texMap"),0);
}

// the function will handle the texture loading with image check whether
// the image is the power of 2
exampleLoad.prototype.handleTextureLoaded = function( image, texture) {

  console.log("handleTextureLoaded, image = " + image);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,gl.UNSIGNED_BYTE, image);
  // Check if the image is a power of 2 in both dimensions.
  if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
     // Yes, it's a power of 2. Generate mips.
     gl.generateMipmap(gl.TEXTURE_2D);
     gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
     console.log("Loaded power of 2 texture");
  } else {
     // No, it's not a power of 2. Turn of mips and set wrapping to clamp to edge
     gl.texParameteri(gl.TETXURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
     gl.texParameteri(gl.TETXURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
     gl.texParameteri(gl.TETXURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
     console.log("Loaded non-power of 2 texture");
  }
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

};

// the function will check whether the value is power of 2
function isPowerOf2(value) {
  return (value & (value - 1)) == 0;
}

// the function will use the code in the txt file to create shaders and getattriblocation for teapot
exampleLoad.prototype.initShaders = function () {

    //  Initialize shaders - we're using that have been loaded in.
    var vertexShader = this.createShader(this.RL.RLStorage.TEXT[0], gl.VERTEX_SHADER); //  
    var fragmentShader = this.createShader(this.RL.RLStorage.TEXT[1], gl.FRAGMENT_SHADER); //  

    this.shaderProgram = gl.createProgram(); //  
    gl.attachShader(this.shaderProgram, vertexShader); //  
    gl.attachShader(this.shaderProgram, fragmentShader); //  
    gl.linkProgram(this.shaderProgram); //  

    if (!gl.getProgramParameter(this.shaderProgram, gl.LINK_STATUS))  
    {
        alert("Unable to initialize the shader program."); 
    }
    gl.useProgram(this.shaderProgram); 

    this.shaderProgram.vertexPositionAttribute = gl.getAttribLocation(this.shaderProgram, "vertexPosition"); 

    gl.enableVertexAttribArray(this.shaderProgram.vertexPositionAttribute);   

    this.shaderProgram.vertexNormalAttribute = gl.getAttribLocation(this.shaderProgram, "vertexNormal"); 

    gl.enableVertexAttribArray(this.shaderProgram.vertexNormalAttribute); 

};


// the function will use the code in the txt file to create shaders and getattriblocation for terrain
exampleLoad.prototype.initShaders2 = function () {

        //  Initialize shaders2 - we are initial the shader2 for the .
    var vertexShader2 = this.createShader(this.RL.RLStorage.TEXT[3], gl.VERTEX_SHADER); //  
    var fragmentShader2 = this.createShader(this.RL.RLStorage.TEXT[4], gl.FRAGMENT_SHADER); //  

    this.shaderProgram2 = gl.createProgram(); //  
    gl.attachShader(this.shaderProgram2, vertexShader2); //  
    gl.attachShader(this.shaderProgram2, fragmentShader2); //  
    gl.linkProgram(this.shaderProgram2); //  

    if (!gl.getProgramParameter(this.shaderProgram2, gl.LINK_STATUS)) //  
    {
        alert("Unable to initialize the shader program."); //  
    }

    gl.useProgram(this.shaderProgram2);


    this.shaderProgram2.TerrainPositionAttribute = gl.getAttribLocation(this.shaderProgram2, "vertexPosition"); // 

    gl.enableVertexAttribArray(this.shaderProgram2.TerrainPositionAttribute); // 

    this.shaderProgram2.texCoordAttribute = gl.getAttribLocation(this.shaderProgram2, "vertexTexture"); 

    gl.enableVertexAttribArray(this.shaderProgram2.texCoordAttribute); //
  
}; 

// the funtion will compile the shader initshader provided and return the shader
exampleLoad.prototype.createShader = function (shaderSource, shaderType) {
    //  Create a shader, given the source and the type
    var shader = gl.createShader(shaderType); //  
    gl.shaderSource(shader, shaderSource); //  
    gl.compileShader(shader); //  

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) //  
    {
        alert("An error occurred compiling the shaders: " + gl.getShaderInfoLog(shader)); //
        return null; //
    }

    return shader; //
};

// initialperspectivebuffers will initial all the matrix and  get uniform location
exampleLoad.prototype.initPerspectiveBuffers = function (shaderProgram) {
    //  Create the matrix
    var cameraMatrix = mat4.create();

    // Load it with a perspective matrix.
    mat4.perspective(cameraMatrix, Math.PI / 3, 16.0 / 9.0, 0.1, 60.0);

    //  Create a view matrix
    var viewMatrix = mat4.create();
    //  An identity view matrix
    mat4.identity(viewMatrix);

    var mMatrix = mat4.create();
    //  Set the view matrix - we are 20 units away from all the axes.
    mat4.lookAt(viewMatrix, vec3.fromValues(20, 20, 20), vec3.fromValues(0, 0, 0), vec3.fromValues(0, 1.0, 0));
    mat4.rotateZ(viewMatrix,viewMatrix,angle);

    //  Get the perspective matrix location
    var pMatrixUniform = gl.getUniformLocation(shaderProgram, "projectionMatrix");
    //  Get the view matrix location
    var vMatrixUniform = gl.getUniformLocation(shaderProgram, "viewMatrix");

    var mMatrixUniform = gl.getUniformLocation(shaderProgram, "modelMatrix");


    //  Send the perspective matrix
    gl.uniformMatrix4fv(pMatrixUniform, false, cameraMatrix);
    //  Send the view matrix
    gl.uniformMatrix4fv(vMatrixUniform, false, viewMatrix);
    //  Send the model Matrix.
    gl.uniformMatrix4fv(mMatrixUniform, false, mMatrix);

  shaderProgram.uniformDiffuseLightColorLoc = gl.getUniformLocation(shaderProgram, "uDiffuseLightColor");
  shaderProgram.uniformSpecularLightColorLoc = gl.getUniformLocation(shaderProgram, "uSpecularLightColor");

    var a = mat3.create();
    var b = mat3.create();
    var nMatrix = mat3.create();

    mat3.fromMat4(a,viewMatrix);
    mat3.invert(b,a);
    mat3.transpose(nMatrix,b);

    var mvMatrix = mat4.create();

    var nMatrixUniform = gl.getUniformLocation(shaderProgram, "normalMatrix");

    gl.uniformMatrix3fv(nMatrixUniform, false, nMatrix);




};

// initialperspectivebuffers will initial all the matrix and  get uniform location
exampleLoad.prototype.initPerspectiveBuffers2 = function (shaderProgram) {
    //  Create the matrix
    var cameraMatrix = mat4.create();

    // Load it with a perspective matrix.
    mat4.perspective(cameraMatrix, Math.PI / 3, 16.0 / 9.0, 0.1, 60.0);

    //  Create a view matrix
    var viewMatrix = mat4.create();
    //  An identity view matrix
    mat4.identity(viewMatrix);

    var mMatrix = mat4.create();
    //  Set the view matrix - we are 20 units away from all the axes.
    mat4.lookAt(viewMatrix, vec3.fromValues(20, 20, 20), vec3.fromValues(0, 0, 0), vec3.fromValues(0, 1.0, 0));

    //  Get the perspective matrix location
    var pMatrixUniform = gl.getUniformLocation(shaderProgram, "projectionMatrix");
    //  Get the view matrix location
    var vMatrixUniform = gl.getUniformLocation(shaderProgram, "viewMatrix");

    var mMatrixUniform = gl.getUniformLocation(shaderProgram, "modelMatrix");


    //  Send the perspective matrix
    gl.uniformMatrix4fv(pMatrixUniform, false, cameraMatrix);
    //  Send the view matrix
    gl.uniformMatrix4fv(vMatrixUniform, false, viewMatrix);
    //  Send the model Matrix.
    gl.uniformMatrix4fv(mMatrixUniform, false, mMatrix);

};

// the function will bind all the buffer for teapot
exampleLoad.prototype.initSetupBuffers = function () {

    // vertexArray
    tVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tVertexPositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertexArray), gl.STATIC_DRAW);
    tVertexPositionBuffer.itemSize = 3;
    tVertexPositionBuffer.numItems = this.vertexArray.length/3;

    tNormalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tNormalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.normalArray), gl.STATIC_DRAW);
    tNormalBuffer.itemSize = 3;
    tNormalBuffer.numItems = this.normalArray.length/3;
 
    // Specify faces of the terrain 
    tIndexTriBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, tIndexTriBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.faceArray),gl.STATIC_DRAW);
    tIndexTriBuffer.itemSize = 1 ;
    tIndexTriBuffer.numItems = this.faceArray.length;

};

// the function will bind all the buffer for terrain
exampleLoad.prototype.initSetupBuffers2 = function () {
    
    var vTerrain = [];
    var fTerrain = [];
    var texTerrain = [];
    var vTerrainNum = 0;
    var n = 64;
    var maxX =10;
    var maxY =10;
    var minX = -10;
    var minY = -10;
    var deltaX=(maxX-minX)/n;
    var deltaY=(maxY-minY)/n;
    for(var i=0;i<=n;i++) {
       for(var j=0;j<=n;j++)
       {
           vTerrain.push(-3.0 + deltaY*i);
           vTerrain.push(-1.5);
           vTerrain.push(-3.0+deltaX*j);
           //vertices.push(0+deltaY*i);
           //vertices.push(0);

           texTerrain.push (j/n);
           texTerrain.push (i/n);

       }
    }
       for(var i=0;i<n;i++) {
       for(var j=0;j<n;j++)
       {
           var vid = i*(n+1) + j;
           fTerrain.push(vid);
           fTerrain.push(vid+1);
           fTerrain.push(vid+n+1);
           
           fTerrain.push(vid+1);
           fTerrain.push(vid+1+n+1);
           fTerrain.push(vid+n+1);
           this.faceTerrainNum+=2;
       }
   }

    TCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, TCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texTerrain), gl.STATIC_DRAW);

    
    TerrainVertex = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, TerrainVertex);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vTerrain), gl.STATIC_DRAW); 


    TerrainIndex = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, TerrainIndex);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(fTerrain),gl.STATIC_DRAW);

    this.faceTerrainNum = fTerrain.length;

}; 


// the function will draw the terrain first and then the teapot
exampleLoad.prototype.draw = function () {
    //  Draw function - called from render in index.js

    gl.clearColor(0.1, 0.1, 0.1, 1.0); //  Set the clear color
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); //  Clear the color as well as the depth buffer

    gl.useProgram(this.shaderProgram2);
    this.initPerspectiveBuffers2(this.shaderProgram2);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.testTexture);
    gl.uniform1i(gl.getUniformLocation(this.shaderProgram2, "usampler"), 0);

    gl.polygonOffset(0,0);

    //texture
    gl.bindBuffer(gl.ARRAY_BUFFER, TCoordBuffer);
    gl.vertexAttribPointer(this.shaderProgram2.texCoordAttribute, 2, gl.FLOAT, false, 0, 0);

    //vertex
    gl.bindBuffer(gl.ARRAY_BUFFER,TerrainVertex);
    gl.vertexAttribPointer(this.shaderProgram2.TerrainPositionAttribute,3, gl.FLOAT,false, 0, 0);

     //  Draw function - called from render in index.js
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, TerrainIndex);
    gl.drawElements(gl.TRIANGLES, this.faceTerrainNum, gl.UNSIGNED_SHORT,0); 


    gl.polygonOffset(0,0);

    gl.useProgram(this.shaderProgram);
    this.initPerspectiveBuffers(this.shaderProgram);

    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LESS);
    gl.clear(gl.DEPTH_BUFFER_BIT);

    gl.activeTexture( gl.TEXTURE0 );
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.cubetexture);
    gl.uniform1i(gl.getUniformLocation(this.shaderProgram, "texMap"),0);
    //normal
    gl.bindBuffer(gl.ARRAY_BUFFER,tNormalBuffer);
    gl.vertexAttribPointer(this.shaderProgram.vertexNormalAttribute,3, gl.FLOAT,false, 0, 0);
    //vertex
    gl.bindBuffer(gl.ARRAY_BUFFER,tVertexPositionBuffer);
    gl.vertexAttribPointer(this.shaderProgram.vertexPositionAttribute,3, gl.FLOAT,false, 0, 0);
    this.uploadlighting([0.2,0.0,0.0],[0.1,0.2,0.8]);
    //draw
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, tIndexTriBuffer);
    gl.drawElements(gl.TRIANGLES, this.faceArray.length, gl.UNSIGNED_SHORT,0); 
};

// the function will calculate the time difference and get angle rotated.
exampleLoad.prototype.animate = function (time) {

      if (then==0)
    {
        then = Date.now();
    }
    else
    {
        now=Date.now();
        // Convert to seconds
        now *= 0.001;
        // Subtract the previous time from the current time
        var deltaTime = now - then;
        // Remember the current time for the next frame.
        then = now;

        //Animate the rotation
        angle += 1 * deltaTime;
       
    }

};

//-------------------------------------------------------------------------
// the funtion will upload the light to shader.
exampleLoad.prototype.uploadlighting = function(d,s) {
  gl.uniform3fv(this.shaderProgram.uniformDiffuseLightColorLoc, d);
  gl.uniform3fv(this.shaderProgram.uniformSpecularLightColorLoc, s);
};
