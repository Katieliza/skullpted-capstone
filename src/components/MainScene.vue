<script setup>
import { onMounted, watch } from "vue";
import { useStore } from "@/stores/store";
import { useModelStore } from "@/stores/modelStore.js";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { useMaterialStore } from "@/stores/materialStore.js";

const store = useStore();
const modelStore = useModelStore();
const materialStore = useMaterialStore();

let scene;

// Init texture loaders
const textureLoader = new THREE.TextureLoader();
const gltfLoader = new GLTFLoader();

let model;

/**
 * Auto-load texture maps for given material
 * @param {string} basePath - Folder where teexture files are stored
 * @param {string} baseName - Base name of the material
 * @param {Object} mapSuffix - Optional suffix for texture types
 * @returns {Object} - Object with loaded texture maps
 */
function LoadTextureMaps(basePath, baseName, mapSuffix = {
  map: "BaseColor",
  roughnessMap: "Roughness",
  metalnessMap: "Metallic",
  normalMap: "Normal"
}) {

  const maps = {};
  for (const [key, suffix] of Object.entries(mapSuffix)) {
    const url = `${basePath}/${baseName}_${suffix}.jpg`;
    maps[key] = textureLoader.load(url);
  }
  return maps;
}

// Array of materials with their corresponding tetxture maps
const textureMaps = {
  "Matte Metal": "Polligon_MetalPaintedMatte",
  "Leather": "leather_white"
};


// region [colorTeal]
/**
 * Load and apply material with multiple texture maps to the model
 *
 * @param {string} mat - Display name of selected material
 *
 * Process:
 * Retrieve base filename associated with selected material
 * Use base name to load all texture maps
 * Dispose of any existing material
 * Create new material using the loaded maps
 * Apply new material to the model
 * Reset store flag to indicate material has been reset
*/
function LoadMaterial(mat) {
  console.log("Material to be loaded: ", mat)

  if (textureLoader && model ) {
    const selectedMesh = modelStore.selectedMesh;
    const baseName = textureMaps[mat];

    if (!textureLoader || !model) return;
    if (!baseName) {
      console.error("No base name found for material: ", mat)
      return;
    }
    const basePath = "/textures";
    const maps = LoadTextureMaps(basePath, baseName);

    model.traverse((child) => {
      if (!child.isMesh) return;
      if (selectedMesh && child.name !== selectedMesh) return;

      if (child.material) {
        child.material.dispose();
      }

      child.material = new THREE.MeshStandardMaterial({...maps, color: 0xffffff});
    });
        materialStore.materialSet = false;
      }
  }
  // #endregion

  // #region [colorOrange]

  /**
   * Load and apply color to model's material
   *
   * @param hex
   *
   * Process:
   * Parse hex color string to an integer
   * Apply parsed color value to model's material
   * Reset store flag to indicate color has been reset
   */
function LoadColor(hex) {
  console.log("Color to be loaded: ", hex)
  const color = parseInt(hex.replace("#", ""), 16);
  model.material.color.setHex(color)
  console.log("Color loaded successfully")
  store.colorSet = false;
}
// #endregion


onMounted(() => {
  // Init canvas, scene, renderer
  const canvas = document.getElementById("canvas");
  const scene = new THREE.Scene();
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, });
  renderer.shadowMap.enabled = true;

  gltfLoader.load('models/audiotechnica_black_headphones/scene.gltf',
    function ( gltf ) {
      model = gltf.scene;
      scene.add(model);

      const modelMeshes = []
      model.traverse((child) => {
        if (child.isMesh) {
          modelMeshes.push(child.name);
          console.log("Mesh: ", child.name);
        }
      });
      modelStore.SetMeshNames(modelMeshes);
    },
    // called while loading is progressing
    function ( xhr ) {
      console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
    },
    // called when loading has errors
    function ( error ) {
      console.log( 'An error happened' );
    }
  );
/*   const cubeTextureLoader = new THREE.CubeTextureLoader();
  scene.background = cubeTextureLoader.load(skybox) */

  // Get window size
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;

  // Calculate aspect ratio
  const aspect = windowWidth / windowHeight;

  // Set renderer size to window
  renderer.setSize(windowWidth, windowHeight);

  // Handle window resize
  window.addEventListener("resize", () => {
    // Calculate new size
    const windowWidth = window.innerWidth / 1.5;
    const windowHeight = window.innerHeight;
    // Update aspect and projection matrix
    camera.aspect = windowWidth / windowHeight;
    camera.updateProjectionMatrix();
    // Update renderer size
    renderer.setSize(windowWidth, windowHeight);
  });

  // Init perspective camera
  const camera = new THREE.PerspectiveCamera(75, windowWidth / windowHeight, 0.1, 1000);
  camera.position.set(0, 1, 5);

  // Config orbit controls
  const controls = new OrbitControls(camera, canvas);
  controls.autoRotate = false;
  controls.enableZoom = true;
  controls.minDistance = 0;
  controls.maxDistance = 5;
  controls.update();

  const axesHelper = new THREE.AxesHelper(3);
  // scene.add(axesHelper)

  // Init directional light & helper
  const directionalLight = new THREE.DirectionalLight("#ffffff", 0.8);
  directionalLight.castShadow = true;
  directionalLight.position.z = 10;
  directionalLight.position.y = 5;
  directionalLight.position.x = 1;

  const dLightHelper = new THREE.DirectionalLightHelper(directionalLight);
  scene.add(dLightHelper);

  // Init ambient light
  const ambientLight = new THREE.AmbientLight("#ffffff", 1);
  scene.add(directionalLight, ambientLight);

  // Init hemisphere light
  const hemisLight = new THREE.HemisphereLight("#ffffff", 0.5);
  //scene.add(hemisLight)

 /*  // Create model;
  const modelGeo = new THREE.BoxGeometry(1.5, 1.5, 1.5);
  const modelMat = new THREE.MeshStandardMaterial('#899ab1');
  model = new THREE.Mesh(modelGeo, modelMat);
  model.castShadow = true;
  model.receiveShadow = true;
model.position.y = 1.5; */
  //model.position.x = -1;

  const gridHelper = new THREE.GridHelper();
  //scene.add(gridHelper);

  const planeGeo = new THREE.PlaneGeometry(2, 2);
  const planeMat = new THREE.MeshStandardMaterial({
    side: THREE.DoubleSide,
    wireframe: false,
  });
  const plane = new THREE.Mesh(planeGeo, planeMat)
  plane.rotation.x = -Math.PI / 2;
  plane.receiveShadow = true;
  scene.add(plane);


  const animate = () => {
    requestAnimationFrame(animate);
    controls.update(); // Update orbit controls
    renderer.render(scene, camera); // Update renderer
  };
  animate();

  // *************************************** FUNCTIONS ****************************************** //
  var zoomInterval;

  function ZoomIn() {
    console.log("Zooming in...");
    camera.position.multiplyScalar(0.99);
  }
  function ZoomInStart() {
    clearInterval(zoomInterval);
    zoomInterval = setInterval(ZoomIn, 16);
  }
  function ZoomOut() {
    console.log("Zooming out...");
    camera.position.multiplyScalar(1.01);
  }
  function ZoomOutStart() {
    clearInterval(zoomInterval);
    zoomInterval = setInterval(ZoomOut, 16);
  }
  function ZoomStop() {
    clearInterval(zoomInterval);
  }
  function ViewReset() {
    clearInterval(zoomInterval);
    controls.reset();
  }
  function RotatePause() {
    controls.autoRotate = false;
  }
  function RotatePlay() {
    controls.autoRotate = true;
  }

  // #region [colorRed]
  watch(
    () => store.zoomIn,
    (val) => {
      if (val) {
        ZoomInStart();
      } else {
        ZoomStop();
      }
    },
  );
  watch(
    () => store.zoomOut,
    (val) => {
      if (val) {
        ZoomOutStart();
      } else {
        ZoomStop();
      }
    },
  );
  watch(
    () => store.viewReset,
    (val) => {
      if (val) {
        ViewReset();
      } else {
        ZoomStop();
      }
    },
  );
  watch(
    () => store.rotate,
    (val) => {
      if (val) {
        RotatePlay();
      } else {
        RotatePause();
      }
    },
  );
  watch(
    () => store.colorSet,
    (val) => {
      if (val) {
        LoadColor(store.color);
      }
    },
  );
  watch(
    () => materialStore.selectedMaterial,
    (newMaterial) => {
    if (newMaterial) {
      LoadMaterial(newMaterial);
    }
  });
  // #endregion
});
</script>
<template>
  <canvas id="canvas"></canvas>
</template>
<style scoped>
  canvas {
    display: block;
    z-index: 0;
    width: 100%;
    height: 100%;
    position: absolute;
  }
</style>
