import * as THREE from '../lib/three.module.js';

import {GLTFLoader} from '../lib/GLTFLoader.js';
import {OrbitControls} from '../lib/OrbitControls.js';
// import Ammo, {ammo} from '../lib/ammo.js';

//Setup Canvas and Elements
var html = document.documentElement;
var body = document.body;
var nftBOX = document.getElementById('nftBOX');
var style = window.getComputedStyle(nftBOX);
//Get Delta/link example element
var deltaContainer = document.getElementById("container");

var canvas = document.getElementById('canvasMain');
var ctx = canvas.getContext("2d");
//Make a memory only canvas for redraw 
var tempCanvas = document.createElement('canvas');
var tempCtx = tempCanvas.getContext('2d');
var minCanvas;
var maxCanvas;

//Setup main variables
var width = 0;
var height = 0;
var aspectRatio = 0;

//Images/icons
//Load images for fullscreen toggle button
var imgFullScreenOpen = new Image();
var imgFullScreenClose = new Image();
imgFullScreenOpen.src = 'src/fullscreenOpen.png';
imgFullScreenClose.src = 'src/fullscreenClose.png';
var fullScreenToggle = false;
var fullScreenOver = false;
var pad, xLoc, yLoc, xScale;

var f;//Preload custom font and kick off main processes


//state stuff
var init = true;

const STATE_ENUM = {
    MENU: "menu",
    START: "start",
    COMPLETE: "complete",
    DEATH: "death",
};

var state = STATE_ENUM.MENU;

//Store mouse position
const mouse = { x: 0, y: 0 };

class LoadPrimaryApplication {
    constructor() {
        this.Initialize();
    }

    Initialize() {
        //app startup and configure
        console.log("App Start: MetaBound");
        console.log("Using the LRC-NFT-Dyanmic Frame Template"); 
        console.log("https://github.com/AD-Edge/LRC-NFT-DynamicFrame");
        console.log("https://twitter.com/Alex_ADEdge");

        //Retrieve and save values needed
        minCanvas = parseInt(style.getPropertyValue('min-height'));
        maxCanvas = parseInt(style.getPropertyValue('max-height'));
        //console.log("Minimum Canvas: " + minCanvas);
        //console.log("Maximum Canvas: " + maxCanvas);

        //setup init three.js
        this.renderer = new THREE.WebGLRenderer({antialias: true,});
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

        this.controls = new OrbitControls(this.camera, this.renderer.domElement);

        this.ambientLight = undefined;
        this.directionaLight= undefined;
        // ambient light setup
        this.ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
        this.ambientLight.castShadow = true;
        this.scene.add(this.ambientLight);
        // directional light
        this.directionalLight = new THREE.DirectionalLight(0xffffff, 0.2);
        // this.directionalLight.castShadow = true;
        this.directionalLight.position.set(0, 32, 64);
        this.scene.add(this.directionalLight);

        //threejs & ammo
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        //renderer.setSize(window.innerWidth/2, window.innerHeight/2); //half res test
        //add render element (canvas)
        document.body.appendChild(this.renderer.domElement);
        this.renderer.domElement.id = "canvasThree";

        //resize here?? 
        window.addEventListener('resize', () => {    
            if(fullScreenToggle) {
                this.fullScreenEnable();
            } else {
                this.resizeToDiv();
            }
            //this._OnWindowResize();
        }, false);

        //touch and mouse events
        canvas.addEventListener("pointerdown", this.dragStart, false);
        canvas.addEventListener("pointerup", this.dragEnd, false);
        canvas.addEventListener('pointermove', this.pointerTouchMove, false);

        //Call resize functions on setup so canvas is happy from the start
        this.resizeToDiv();

        // //test geometry
        // this.cube = new THREE.Mesh(
        //     new THREE.BoxGeometry(1,1,1), 
        //     new THREE.MeshBasicMaterial({
        //         color: 0x00ff00
        //     }));
        // this.scene.add( this.cube );
        this.camera.position.z = 5;


        this._previousRAF = null;
        this._mixers = [];

        this.f = new FontFace('retroPixel', 'url(./src/EarlyGameBoy.ttf)');
        this.f.load().then(function(font) {
            //Ready to use the font in a canvas context
            console.log('*Custom Font Loaded Successfully*');
            //Add font on the html page
            document.fonts.add(font);

        });
        
        // Ammo().then(function(Ammo) {
        //     console.log("Ammo physics loaded");

        //     var collisionConfiguration_ = new Ammo.btDefaultCollisionConfiguration();
        //     //console.log(collisionConfiguration_);
        //     //initPhysics();
            
        //     //Kick off main panel setup
        //     // initAndStartGame();
        // });

        this.renderInterval;

        // const loader = new GLTFLoader();
        // const metaBoy = this.MainModelLoader("./src/3dAssets/MetaBoy_3173_test1.glb");

        let metaBoyModel, metaScreenModel;

        const glftLoader = new GLTFLoader();
        glftLoader.load("./src/3dAssets/MetaBoy_3173_test1.glb", (gltfScene) => {
            this.metaBoyModel = gltfScene;
            gltfScene.scene.scale.set(0.5,0.5,0.5);
            // gltfScene.scene.rotation.y = 45;
            gltfScene.scene.position.y = -2;
            gltfScene.scene.position.x = +1.5;
            gltfScene.scene.scale.set(0.5,0.5,0.5);
            this.scene.add(gltfScene.scene);

        });
        glftLoader.load("./src/3dAssets/MetaScreen_test1.glb", (gltfScene) => {
            this.metaScreenModel = gltfScene;
            gltfScene.scene.scale.set(0.5,0.5,0.5);
            // gltfScene.scene.rotation.y = 45;
            gltfScene.scene.position.y = -1.5;
            gltfScene.scene.position.x = -1;
            gltfScene.scene.scale.set(0.5,0.5,0.5);
            this.scene.add(gltfScene.scene);

        });
        //this.LoadModel("./src/3dAssets/MetaBoy_3173_test1.glb");
        // this.LoadAnimatedModel();
        //console.log("kicking off application");
        this.RenderAnimationFrame();


    }

    // loader.loadAsync("./src/3dAssets/MetaBoy_3173_test1.glb"),
    // loader.loadAsync("./src/3dAssets/MetaScreen_test1.glb"),
            
    LoadAnimatedModel() {
        // console.log("loadanimated model");
    }

    LoadModel(url) {
        // return new Promise((resolve, reject) => {
        //     this.loader.load(url, data=> resolve(data), null, reject);
        // });

        const loader = new GLTFLoader();
        loader.load(url, function (data) {
            var object = data.scene;

            this.loadToScene(object);
        // loader.load(url, (gltf) => {
            // gltf.scene.traverse(c => {
            //     c.castShadow = true;
            // });
            // this.scene.add(gltf.scene); 
            //this.OnLoaded(gltf);
        });

        // const loadedData = await loader.loadAsync('path/to/yourModel.glb');
    }

    loadToScene(obj) {
        console.log("model: " + obj);
        model.position.set(0,0,0);
        this.scene.add(obj);

    }

    // async MainModelLoader(url) {
    //     const gltfData = await this.ModelLoader(url),

    //     model = gltf.scene;
    //     this.scene.add(model);

    // }

    // OnLoaded(obj) {
    //     this.target = obj;
    //     this.scene.add(this.target); 
    // }

    RenderAnimationFrame() {
        //Game states
        //if(state == STATE_ENUM.MENU) {
            //console.log("menu state");
        if(this.cube) {
            this.cube.rotation.x += 0.01;
            this.cube.rotation.y += 0.01;
            this.cube.position.y = -0.5;

        }

        //handle metaboy model
        if(this.metaBoyModel) {
            // console.log("loaded metaboy");
            this.metaBoyModel.scene.rotation.y += 0.01;
        }

        //Refresh canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.globalAlpha = 1;

        //update game state
        if(init) {
            init = false;
            this.gameState(state);
        }

        //Draw title text
        this.drawTitleText();
        //Draw the button which toggles fullscreen mode
        this.drawFullScreenButton();
        this.debugMousePos();

        requestAnimationFrame((t) => {
            if (this._previousRAF === null) {
                this._previousRAF = t;
                console.log("kicking off first animation frame");
            }
      
            this.RenderAnimationFrame();
      
            this.renderer.render(this.scene, this.camera);
            this.controls.update();
            this.Step(t - this._previousRAF);
            this._previousRAF = t;
          });
    }

    Step(timeElapsed) {
        const timeElapsedS = timeElapsed * 0.001;
        if (this._mixers) {
            this._mixers.map(m => m.update(timeElapsedS));
        }
    
        // if (this._controls) {
        //   this._controls.Update(timeElapsedS);
        // }
    }
    
    debugMousePos() {
        //debug mouse/touch pos - final draw call so it draws on top
        ctx.globalAlpha = 0.5; //reset global alpha
        ctx.beginPath();
        ctx.fillStyle = 'rgba(240, 140, 140, 1)';
        //console.log("mouse: " + mouse.x + ", " + mouse.y);
        ctx.arc(mouse.x, mouse.y, height*0.02, 0, 2*Math.PI);
        ctx.fill();
    }
    
    gameState(s) {
        switch(s) {
            case STATE_ENUM.MENU:
                console.log("menu init");
                //init menu call
                break;
            case STATE_ENUM.START:
                console.log("game start");
                //start game call
                break;
            case STATE_ENUM.COMPLETE:
                console.log("top level reached");
                break;
            case STATE_ENUM.DEATH:
                console.log("Game Over \n Your max score: xxx \n Your height at death: xxx");
                break;
    
        }
    }

    //Primary resize function for canvas
    //Keeps all dimensions being used relative to nftBOX constraints and limits
    resizeToDiv() {
        //This is needed to preserve image during scaling
        //Resizing the canvas (ie canvas.width = xxx) clears the canvas
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        //Save the canvas on the temp/memory-only canvas
        tempCtx.drawImage(canvas, 0, 0);
        
        //Resize nftBOX based on smallest dimension (height vs width)
        //This is our overall 'containment box'
        if(fullScreenToggle) { //Fullscreen MODE
            //Unset constraints on nftBOX
            nftBOX.style.maxWidth = '100%';
            nftBOX.style.maxHeight = '100%';
            nftBOX.style.minWidth = '100%';
            nftBOX.style.minHeight = '100%';

            //Set to max available dimension
            nftBOX.style.width = (html.clientWidth) + 'px';
            nftBOX.style.height = (html.clientHeight) + 'px';
        } else { //If NOT-Fullscreen MODE
            if (html.clientHeight < html.clientWidth) {
                nftBOX.style.width = (html.clientHeight) + 'px';
                nftBOX.style.height = (html.clientHeight) + 'px';
            } else  {
                nftBOX.style.width = (html.clientWidth) + 'px';
                nftBOX.style.height = (html.clientWidth) + 'px';
            }
        }

        //Reset canvas dimensions
        canvas.width = nftBOX.clientWidth;
        canvas.style.width = nftBOX.clientWidth;
        canvas.height = nftBOX.clientHeight;
        canvas.style.height = nftBOX.clientHeight;

        //Reset variables
        width = nftBOX.clientWidth;
        height = nftBOX.clientHeight;
        aspectRatio = width/height;
        //console.log('*width: ' + width + ' height: ' + height);
        
        //Draw saved canvas back right away
        ctx.drawImage(tempCanvas, 0, 0);
    }

    //Click down/Drag starts
    dragStart(e) { 
        //the user cant do anything else but drag
        e.preventDefault(); 
        //update the mouse location relative to canvas area
        var rect = canvas.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;

        //debug mouse/touch CLICK pos
        ctx.globalAlpha = 1.0; //reset global alpha
        ctx.beginPath();
        ctx.fillStyle = 'rgba(140, 140, 240, 1)';
        //console.log("mouse: " + mouse.x + ", " + mouse.y);
        ctx.arc(mouse.x, mouse.y, height*0.06, 0, 2*Math.PI);
        ctx.fill();
        
        //Mouse click if hovering over Fullscreen element
        if(fullScreenOver) {
            //toggle to fullscreen
            if(!fullScreenToggle) {
                fullScreenToggle = true;
                this.fullScreenEnable();
            } else {
                fullScreenToggle = false;
                this.fullScreenDisable();
            }
        }
    }

    //When the drag ends - ie touch or mouse ends
    //All activation events while releasing on a hover, ie a 'PRESS' event 
    dragEnd() {
    }
    //Handle the pointer moving
    pointerTouchMove(e) {
        //the user cant do anything else but drag
        e.preventDefault(); 
        //update the mouse location relative to canvas area
        var rect = canvas.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
    }

    //Fullscreen functions
    fullScreenEnable() {
        //resize elements
        this.resizeToDiv();
    }
    fullScreenDisable() {
        //reset constraints 
        nftBOX.style.maxWidth = maxCanvas + 'px';
        nftBOX.style.maxHeight = maxCanvas + 'px';
        nftBOX.style.minWidth = minCanvas + 'px';
        nftBOX.style.minHeight = minCanvas + 'px';
        //resize elements
        this.resizeToDiv();
    }

    drawTitleText() {
        //Draw Title text
        ctx.fillStyle = '#303030';
        ctx.textAlign = "center";
        ctx.font = height/22 + 'px retroPixel';
        ctx.fillText("METABOUND", 0.5*width, 0.08*height);
        ctx.font = height/12 + 'px retroPixel';
        ctx.fillText("           _", 0.5*width, 0.068*height);
        ctx.fillText("           _", 0.5*width, 0.065*height);
        ctx.font = height/42 + 'px retroPixel';
        ctx.fillText("# MAKEYOURMETA", 0.5*width, 0.92*height);
        ctx.fillText("By Alex Delderfield, 2022", 0.5*width, 0.95*height);

        ctx.font = height/36 + 'px retroPixel';

        //Draw custom red text for min/max sizes
        // ctx.fillStyle = '#303030';
        // if(fullScreenToggle) {
        //     ctx.fillStyle = '#FF4444';
        //     ctx.fillText('FULLSCREEN', 0.5*width, 0.95*height);
        // } else {
        //     if((width <= minCanvas) || (width >=maxCanvas)) {
        //         ctx.fillStyle = '#FF4444';
        //         ctx.fillText(width, 0.56*width, 0.95*height);
        //     } else {
        //         ctx.fillStyle = '#303030';
        //         ctx.fillText(width, 0.56*width, 0.95*height);
        //     }
        //     //Display current canvas size
        //     ctx.fillStyle = '#303030';
        //     ctx.fillText("SIZE: ", 0.46*width, 0.95*height);
            
        // }
    }

    //Draw and Calculate select area Fullscreen button
    drawFullScreenButton() {
        pad = (width*0.125);
        //clamp padding amount to reasonable levels
        pad = Math.min(Math.max(pad, 25), 70);
        xLoc = width-pad;
        yLoc = height-pad;
        xScale = 0.10*(width*0.75);
        //clamp button from going outside of the range 16 -> 54
        xScale = Math.min(Math.max(xScale, 16), 54);

        //draw and check fullscreen button
        this.checkIfOverFullScreen();
        if(fullScreenOver) {
            ctx.fillStyle = 'rgba(100, 100, 240, 0.25)';
            ctx.rect(xLoc, yLoc, xScale, xScale);
            ctx.fillStyle = ctx.isPointInPath(mouse.x, mouse.y) ? 'rgba(100, 140, 240, 0.5)' : 'rgba(100, 140, 240, 0)';
            ctx.fill();
        }

        //draw fullscreen button in various states
        if(fullScreenToggle) {
            ctx.drawImage(imgFullScreenClose, xLoc, yLoc, xScale, xScale);
        } else {
            ctx.drawImage(imgFullScreenOpen, xLoc, yLoc, xScale, xScale);
        }
    }

    checkIfOverFullScreen() {
        ctx.beginPath();
        ctx.rect(xLoc, yLoc, xScale, xScale);
        ctx.fillStyle = 'rgba(100, 100, 240, 0.25)';
        //determine if mouse is over select area
        ctx.isPointInPath(mouse.x, mouse.y) ? fullScreenOver=true : fullScreenOver=false;
        ctx.fill();
    }

}

let APP = null;

window.addEventListener('DOMContentLoaded', () => {
    Ammo().then((lib) => {
        Ammo = lib;
        APP = new LoadPrimaryApplication();
    } )
});

//Kick off app function when initial HTML document loaded
//document.addEventListener("DOMContentLoaded", app);