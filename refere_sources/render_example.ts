// TODO
//
// - encodeURIComponent();
// - Add OBJ for one new ASC
// - Process empty result
//
// -- Issues
// -- 07.001A Year 1973, not 1978
// -- 23 Shield / pc23014 / 13.090 ?
// - 01.658
// - http://www.facetdiagrams.org/database/files/pc13089.html
// - Current page: 15 - 03.098 (?)
//    http://www.facetdiagrams.org/database/files/pc13089.html
//  + https://www.facetdiagrams.org/database/files/pc03089.svgz
//  - http://www.facetdiagrams.org/database/files/pc03089.asc
//
// - JPG:https://usfacetersguild.org/competition/australian-competitions/2004aicopenkokomocushioncut-jpg/
//
// - Check ASC number 2065 vs 2272 (select count(*) from gems where `ASC` = 1)
//
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { InteractiveGroup } from 'three/addons/interactive/InteractiveGroup.js';
import { HTMLMesh } from 'three/addons/interactive/HTMLMesh.js';
import { GUI } from '/node_modules/lil-gui/dist/lil-gui.esm.min.js';

import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { GammaCorrectionShader } from 'three/addons/shaders/GammaCorrectionShader.js';
import { SMAAPass } from 'three/addons/postprocessing/SMAAPass.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { VertexNormalsHelper } from 'three/addons/helpers/VertexNormalsHelper.js';

import { presets } from './modules/presets.js';
import { makeGem } from './modules/gem.js';
export const DES_PATH = 'data/designs/';

// Helpers
let help = false;

// Common
let clientWidth, clientHeight;
let container;
let camera, scene, renderer;
let textureLoader;
let gui, gui_mesh;
let ocontrols;
let curModel;
let curPreset = 1;

// Postprocess
let composer;
let passRender;
let passSMAA;
let passGammaCorrection;
let passOutput;

let gem, env, envCurent, gemGeo;
let loading = false;

// DB
let code = "";
let shape = "";
let name = "";
let designer = "";

const DEF_MIN_YEAR = "1902"; 
const DEF_MAX_YEAR = "2022"; 
let minYear = DEF_MIN_YEAR;
let maxYear = DEF_MAX_YEAR;

const DEF_MIN_LW = "1.0";
const DEF_MAX_LW = "3.22"; 
let minLW = DEF_MIN_LW;
let maxLW = DEF_MAX_LW;

const DEF_MIN_HW = "0.205";
const DEF_MAX_HW = "2.785";
let minHW = DEF_MIN_HW;
let maxHW = DEF_MAX_HW;

const DEF_MIN_VOL = "0.123";
const DEF_MAX_VOL = "1.568";
let minVol = DEF_MIN_VOL;
let maxVol = DEF_MAX_VOL;

let facets = "";
let gear = "";

// Paging
const PAGE_SIZE = 40;
const MAX_PAGE = 57;
let pages = [];
let curPage = 1;

// Init
async function init() {

  container = document.getElementById("container");
  clientWidth = container.clientWidth;
  clientHeight = container.clientHeight;

  camera = new THREE.OrthographicCamera(-0.18, 0.18, 0.20, -0.16);
  camera.position.set(1, -0.2, 4);
  
  scene = new THREE.Scene();
  scene.add( camera );

  // Helpers
  if(help) {
    let o = new THREE.Vector3(0,0,0);
    let x = new THREE.Vector3(1,0,0);
    let y = new THREE.Vector3(0,1,0);
    let z = new THREE.Vector3(0,0,1);
    scene.add( new THREE.GridHelper( 2, 20 ) );
    scene.add( new THREE.ArrowHelper(x,o,2,'crimson') );
    scene.add( new THREE.ArrowHelper(y,o,2,'green') );
    scene.add( new THREE.ArrowHelper(z,o,2,'royalblue') );
  }

  renderer = new THREE.WebGLRenderer({alpha: true, antialias: false});
  renderer.setSize(clientWidth, clientHeight);
  renderer.setPixelRatio( clientWidth / clientHeight );

  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.VSMShadowMap;

  container = document.getElementById("container");
  container.appendChild( renderer.domElement );
  textureLoader = new THREE.TextureLoader();

  // Init orbit controlls
  ocontrols = new OrbitControls( camera, renderer.domElement );
  ocontrols.target.set( 0, 0, 0 );
  ocontrols.enablePan = true;
  ocontrols.update();

  initGUI();

  // Init pages
  for(let i=0; i<MAX_PAGE; i++) {
    pages.push(document.getElementById("b" + (i + 1)));
  }
 
  // Postprocess
  composer = new EffectComposer( renderer );
  composer.setPixelRatio( clientWidth / clientHeight );
  composer.setSize( clientWidth, clientHeight );

  // Render pass
  passRender = new RenderPass( scene, camera );
  passRender.clearAlpha = 0;
  composer.addPass( passRender );
  
  passSMAA = new SMAAPass( window.innerWidth * renderer.getPixelRatio(), window.innerHeight * renderer.getPixelRatio() );
  composer.addPass( passSMAA );

  // Gamma pass
  passGammaCorrection = new ShaderPass(GammaCorrectionShader);
  composer.addPass(passGammaCorrection);

  // Output pass
  passOutput = new OutputPass();
  composer.addPass( passOutput );

  // Select first page
  document.addEventListener( "DOMContentLoaded", function(event) {
                              select(0);
                              document.getElementById("slots").style.display = "initial";} );
}

// Changed ennvironment
function onEnvChanged() {
    loadModel(curModel, true);
}

// Load model
async function loadModel(path, envChanged) {
  if(loading)
    return;

  if(!envChanged) {
    if(path == curModel) {
      return;
    }
    // Set attributes
    document.getElementById("main").src = path + ".html";
    document.getElementById("download_obj").href = path + ".obj";
    document.getElementById("download_pov").href = path + ".zip";
  }
  curModel = path;

  // Cleanup scene
  if (gem != undefined) {
    scene.remove( gem );
    gem.geometry.dispose();
    gem.material.dispose();
    renderer.renderLists.dispose();
  }

  // Loading manager
  const manager = new THREE.LoadingManager()
  manager.onLoad = function ( ) {
    // console.log("Load completed");
    const res = new THREE.Vector2(clientWidth, clientHeight);
    gem = makeGem(scene, env, camera, res, gemGeo);
    gem.rotation.x = -Math.PI/2;
    scene.add(gem);
    loading = false;
  }

  /*
  manager.onProgress = function (url, loaded, total) {
    console.log(url, loaded, total);
  };
  */

  manager.onError = function ( url ) {
    console.log( 'There was an error loading ' + url )
  }

  // Environment
  if( presets[0].env != envCurent ) {
    // console.log("Loading environment ...");
    let envPath = "./data/textures/env" + presets[0].env + "/";
    loading = true;
    if( env != undefined)
      env.dispose();
    env = new THREE.CubeTextureLoader(manager).load([
      envPath + "px.png",
      envPath + "nx.png",
      envPath + "py.png",
      envPath + "ny.png",
      envPath + "pz.png",
      envPath + "nz.png",
    ]);
    env.colorSpace = THREE.SRGBColorSpace;
    envCurent = presets[0].env;
  }

  scene.background = env;
  scene.environment = env;

  const loader = new OBJLoader(manager);
  loading = true;
  loader.load( path + ".obj",
    function ( object ) {
      let model = object.children[0];
      gemGeo = model.geometry;
      gemGeo.applyMatrix4(new THREE.Matrix4().makeScale(-0.1, 0.1, 0.1)); // Flip normals with scale to match environment
      gemGeo.computeVertexNormals();
    },
  );

  if(help) {
    scene.add( new VertexNormalsHelper( gem, 0.2 ) );
  }
}
window.loadModel = loadModel;

// Load presets
function loadPreset(preset) {
  if(preset == curPreset) {
    return;
  }
  curPreset = preset;

  // Preserve animation
  let anx = presets[0].anx;
  let any = presets[0].any;
  let anz = presets[0].anz;
  let speed = presets[0].speed;
  Object.assign(presets[0], presets[preset]);
  presets[0].anx = anx;
  presets[0].any = any;
  presets[0].anz = anz;
  presets[0].speed = speed;

  for (var i in gui.controllers)
    gui.controllers[i].updateDisplay();

  onEnvChanged();
}
window.loadPreset = loadPreset;

// Init GUI
function initGUI()
{
  presets[0].switch_anx = function() {presets[0].anx = !presets[0].anx;
                          let color = presets[0].anx ? "#00ff00" : "#ccc";
                          gui.controllers[11].$name.style.color = color;};

  presets[0].switch_any = function() {presets[0].any = !presets[0].any;
                          let color = presets[0].any ? "#00ff00" : "#ccc";
                          gui.controllers[12].$name.style.color = color;};

  presets[0].switch_anz = function() {presets[0].anz = !presets[0].anz;
                          let color = presets[0].anz ? "#00ff00" : "#ccc";
                          gui.controllers[13].$name.style.color = color;};

  presets[0].reset = function() {
                      presets[0].anx = false;
                      presets[0].any = false;
                      presets[0].anz = false;

                      if(gem !== undefined) {
                        gem.rotation.x = -Math.PI/2;
                        gem.rotation.y = 0;
                        gem.rotation.z = 0;
                      }

                      gui.controllers[11].$name.style.color  =
                      gui.controllers[12].$name.style.color =
                      gui.controllers[13].$name.style.color = "#ccc";

                      if (typeof ocontrols != "undefined") {
                        ocontrols.reset();
                        ocontrols.target.set( 0,0,0 );
                      };
                    };
  // GUI
  gui = new GUI( {width: 300, title:"Settings", closeFolders:true} ); // Check 'closeFolders' - not working
  gui.add( presets[0], 'env', 1, 6, 1 ).name( 'Env' ).onChange( onEnvChanged );
  gui.add( presets[0], 'r', 0, 1, 0.01 ).name( 'Red' );
  gui.add( presets[0], 'g', 0, 1, 0.01 ).name( 'Green' );
  gui.add( presets[0], 'b', 0, 1, 0.01 ).name( 'Blue' );
  gui.add( presets[0], 'bounces', 1, 10, 1).name( 'Bounces' );
  gui.add( presets[0], 'ior', 1, 3, 0.01).name( 'IOR' );
  gui.add( presets[0], 'fresnel', 0, 1, 0.01).name( 'Fresnel' );
  gui.add( presets[0], 'aberrationStrength', 0, 0.3, 0.001).name('CA');
  gui.add( presets[0], 'fastChroma').name( 'Fast CA' );
  gui.add( presets[0], 'antialias').name( 'Antialis SMAA' );
  gui.add( presets[0], 'gamma').name( 'Gamma correction' );
  gui.add( presets[0], 'switch_anx').name( 'Rotate X' );
  gui.add( presets[0], 'switch_any').name( 'Rotate Y' );
  gui.add( presets[0], 'switch_anz').name( 'Rotate Z' );
  gui.add( presets[0], 'speed', -0.02, 0.02, 0.001 ).name( 'Speed' );
  gui.add( presets[0], 'reset' ).name( 'Default view' );

  // Set colors
  gui.controllers[1].$name.style.color = "#ff0000";
  gui.controllers[2].$name.style.color = "#00ff00";
  gui.controllers[3].$name.style.color = "#0000ff";
  gui.controllers[11].$name.style.color = "#ccc";
  gui.controllers[12].$name.style.color = "#ccc";
  gui.controllers[13].$name.style.color = "#ccc";
  gui.controllers[15].$name.style.color = "#ccc";

  const group = new InteractiveGroup( renderer, camera );
  scene.add( group );

  // GUI position
  gui_mesh = new HTMLMesh( gui.domElement );
  gui_mesh.rotation.x = -Math.PI / 9;
  gui_mesh.position.y = -0.36;
  gui_mesh.position.z = -0.6;
  group.add( gui_mesh );
  gui_mesh.visible = false;
  gui.close(); // Collapse by default

  presets[0].switch_anz();
}

// Animate
function animate() {
  renderer.setAnimationLoop( render );
}

// Render
function render() {

  if((loading) || (gem == undefined)) 
    return;
  
  gem.material.uniforms.color.value = new THREE.Vector3(presets[0].r, presets[0].g, presets[0].b);
  gem.material.uniforms.bounces.value = presets[0].bounces;
  gem.material.uniforms.ior.value = presets[0].ior;
  gem.material.uniforms.correctMips.value = presets[0].correctMips;
  gem.material.uniforms.fastChroma.value = presets[0].fastChroma;
  gem.material.uniforms.aberrationStrength.value = presets[0].aberrationStrength;
  gem.material.uniforms.fresnel.value = presets[0].fresnel;

  if (presets[0].anx) {
    gem.rotateX(presets[0].speed);
  }
  if (presets[0].any) {
    gem.rotateY(presets[0].speed);
  }
  if (presets[0].anz) {
    gem.rotateZ(presets[0].speed);
  }
  
  gem.updateMatrix();
  gem.updateMatrixWorld();

  passSMAA.enabled = presets[0].antialias;
  passGammaCorrection.enabled = presets[0].gamma;
  composer.render();

  ocontrols.update();
}

// Set code
function setCode(c) {
  console.log(c);
  code = c;
  select(0);
}
window.setCode = setCode;

// Set shape
function setShape(s) {
  shape = s.substr(0, 2);
  if(shape == 'Al')
    shape = "";
  select(0);
}
window.setShape = setShape;

// Set name
function setName(n) {
  name = n;
  select(0);
}
window.setName = setName;

// Set designer
function setDes(d) {
  designer = d;
  select(0);
}
window.setDes = setDes;

// Set min year
function setMinYear(y) {
  if(y == "")
    minYear = DEF_MIN_YEAR;
  else
   minYear = y;

  select(0)
}
window.setMinYear = setMinYear;

// Set max year
function setMaxYear(y) {
  if(y == "")
    maxYear = DEF_MAX_YEAR;
  else
   maxYear = y;

  select(0)
}
window.setMaxYear = setMaxYear;

// Set min LW
function setMinLW(lw) {
  if(lw == "")
    minLW = DEF_MIN_LW;
  else
   minLW = lw;

  select(0)
}
window.setMinLW = setMinLW;

// Set max LW
function setMaxLW(lw) {
  if(lw == "")
    maxLW = DEF_MAX_LW;
  else
   maxLW = lw;

  select(0)
}
window.setMaxLW = setMaxLW;

// Set min HW
function setMinHW(hw) {
  if(hw == "")
    minHW = DEF_MIN_HW;
  else
   minHW = hw;

  select(0)
}
window.setMinHW = setMinHW;

// Set max HW
function setMaxHW(hw) {
  if(hw == "")
    maxHW = DEF_MAX_HW;
  else
   maxHW = hw;

  select(0)
}
window.setMaxHW = setMaxHW;

// Set min vol
function setMinVol(vol) {
  if(vol == "")
    minVol = DEF_MIN_VOL;
  else
   minVol = vol;

  select(0)
}
window.setMinVol = setMinVol;

// Set max vol
function setMaxVol(vol) {
  if(vol == "")
    maxVol = DEF_MAX_VOL;
  else
   maxVol = encodeURIComponent(vol);

  select(0)
}
window.setMaxVol = setMaxVol;

// Set facets
function setFacets(f) {
  facets = encodeURIComponent(f);
  select(0);
}
window.setFacets = setFacets;

// Set gear
function setGear(g) {
  if((g == "All") || (g == ""))
    gear = 0;
  else
    gear = g;
  select(0);
}
window.setGear = setGear;

// Clear filters
function reset() {
  code  = "";
  document.getElementById("code").value = "";

  shape = "";
  document.getElementById("shape").selectedIndex = 0;

  name = "";
  document.getElementById("name").value = "";

  designer = "";
  document.getElementById("designer").value = "";

  document.getElementById("min_year").value = "1902";
  minYear = "1902";

  document.getElementById("max_year").value = "2022";
  maxYear = "2022";

  document.getElementById("min_lw").value = DEF_MIN_LW;
  minLW = DEF_MIN_LW;
  document.getElementById("max_lw").value = DEF_MAX_LW;
  maxLW = DEF_MAX_LW;

  document.getElementById("min_hw").value = DEF_MIN_HW;
  minHW = DEF_MIN_HW;
  document.getElementById("max_hw").value = DEF_MAX_HW;
  maxHW = DEF_MAX_HW;

  document.getElementById("min_vol").value = DEF_MIN_VOL;
  minVol = DEF_MIN_VOL;
  document.getElementById("max_vol").value = DEF_MAX_VOL;
  maxVol = DEF_MAX_VOL;

  facets = "";
  document.getElementById("facets").value = "";

  gear = "";
  document.getElementById("gear").selectedIndex = 0;

  select(0);
}
window.reset = reset;

// Load page  
function loadPage(page) {
  if(page == curPage)
    return;

  pages[curPage-1].style.backgroundColor = "";
  curPage = page;
  pages[curPage-1].style.backgroundColor = "#ffff80";

  select(curPage-1);
}
window.loadPage = loadPage;

// Selest from DB
async function select(page) {
  let designs="";
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
      if (this.readyState === 4 && this.status === 200) {
        // console.log(xhttp.responseText);
        designs = JSON.parse(xhttp.responseText);
        // console.log(designs);
        const maxpage = designs.shift() / PAGE_SIZE;
        // console.log(maxpage);
        for(let i=0; i<MAX_PAGE; i++) {
          if(i<maxpage)
            pages[i].style.display = "initial";
          else
            pages[i].style.display = "none";
        }

        for(let i=0; i<PAGE_SIZE; i++) {
          let slot = document.getElementById("d" + (i + 1));

          // Set image
          if(i < designs.length) {
            // console.log(designs[i]);
            slot.src = DES_PATH + designs[i] + '.svgz';
            slot.style.display = 'initial';
          } else {
            slot.style.display= 'none' ;
          }

          // Set function
          slot.onclick = function() { window.loadModel(DES_PATH + designs[i], false); }
        }
        document.getElementById("d1").click(); // Select design from the first slot
        document.getElementById("slots").scroll(0,0); // Scroll up

        if(page == 0) {
          pages[curPage-1].style.backgroundColor = "";
          pages[0].style.backgroundColor = "#ffff80";
          curPage = 1;
        }
      }
  };

  // TODO: Check before deploy !
/*
  var req = "http://localhost:8083/list_designs.php?code=" +  code   + "&shape=" + shape +
            "&name="     + name    + "&designer=" + designer +
            "&min_year=" + minYear + "&max_year=" + maxYear  +
            "&min_lw="   + minLW   + "&max_lw="   + maxLW    +
            "&min_hw="   + minHW   + "&max_hw="   + maxHW    +
            "&min_vol="  + minVol  + "&max_vol="  + maxVol   +
            "&facets="   + facets  + "&gear="     + gear     +
            "&page="     + page;
*/  
  var req = "https://facetdiagrams.net/list_designs.php?code=" +  code   + "&shape=" + shape +
            "&name="     + name    + "&designer=" + designer +
            "&min_year=" + minYear + "&max_year=" + maxYear  +
            "&min_lw="   + minLW   + "&max_lw="   + maxLW    +
            "&min_hw="   + minHW   + "&max_hw="   + maxHW    +
            "&min_vol="  + minVol  + "&max_vol="  + maxVol   +
            "&facets="   + facets  + "&gear="     + gear     +
            "&page="     + page;

  xhttp.open("GET", req, false);
  xhttp.send();
}
window.select = select;

await init();
animate();
