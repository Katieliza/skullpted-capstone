<script setup>
import { onMounted, watch } from "vue";
import { useControlStore } from "@/stores/controlStore.js";
import { useModelStore } from "@/stores/modelStore.js";
import { useMaterialStore } from "@/stores/materialStore.js";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// Init stores
const controlStore = useControlStore();
const modelStore = useModelStore();
const materialStore = useMaterialStore();

// Init texture loaders
const textureLoader = new THREE.TextureLoader();
const gltfLoader = new GLTFLoader();

// Init 3D model
let model;

// region [colorTeal] TEXTURE MAP LOADER
/**
 * Auto-load texture maps for given material
 *
 * @param {string} basePath - Folder where teexture files are stored
 * @param {string} baseName - Base name of the material
 * @param {Object} mapSuffix - Optional suffix for texture types
 * @returns {Object} - Object with loaded texture maps
 */
// endregion

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


// region [colorTeal] MATERIAL LOADER
/**
 * Load and apply material with texture maps to the selected mesh in the model.
 *
 * @param {string} mat - Display name of selected material.
 *
 * Process:
 * Retrieve the mesh currently selected in store.
 * Retrieve the base filename for the selected material.
 * Load the texture maps from the texture folder.
 * Traverse model and apply the material to only the selected mesh.
 * Dispose of any existing material.
 * Update store flag to indicate material has been reset.
**/
// endregion

function LoadMaterial(mat) {
  console.log("Material to be loaded: ", mat)

  if (textureLoader && model ) {
    const selectedMesh = modelStore.selectedMesh;
    const baseName = materialStore.GetBaseName(mat);

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

  // #region [colorTeal] HEX COLOR LOADER
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
  // #endregion

function LoadColor(hex) {
  console.log("Color to be loaded: ", hex)
  const color = parseInt(hex.replace("#", ""), 16);
  model.material.color.setHex(color)
  console.log("Color loaded successfully")
  materialStore.colorSet = false;
}

onMounted(() => {
  // Init canvas, scene, renderer
  const canvas = document.getElementById("canvas");
  const scene = new THREE.Scene();
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, });
  renderer.shadowMap.enabled = true;

  // #region [colorTeal] GLTF MODEL LOADER
  /**
   * Load GLTF headphone model into scene
   *
   * Process:
   * Use GLTFLoader to load 3D model from specified path.
   * Add model to the scene.
   * Traverse model to find all mesh objects.
   * Update store with the array of mesh names for UI access.
   */
  // #endregion

  gltfLoader.load('models/audiotechnica_black_headphones/scene.gltf',
    function ( gltf ) {
      model = gltf.scene;
      model.scale.set(4, 4, 4)
      const boundingBox = new THREE.Box3().setFromObject(model);
      const center = boundingBox.getCenter(new THREE.Vector3());

      // Recenter the model by offsetting it to the origin
      model.position.sub(center);  // This shifts the model so its center is at (0, 0, 0)

      scene.add(model);

      const modelMeshes = []
      model.traverse((child) => {
        if (child.isMesh) {
          modelMeshes.push(child.name);
        }
      });
      modelStore.SetMeshNames(modelMeshes);
    },
  );

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
  camera.position.set(0, 1, 2);

  // Config orbit controls
  const controls = new OrbitControls(camera, canvas);
  controls.autoRotate = false;
  controls.enableZoom = true;
  controls.minDistance = 0;
  controls.maxDistance = 5;
  controls.update();

  // Axes & grid line helpers
  const gridHelper = new THREE.GridHelper();
  // scene.add(gridHelper);
  const axesHelper = new THREE.AxesHelper(3);
  // scene.add(axesHelper)

  // Init directional light & helper
  const directionalLight = new THREE.DirectionalLight("#ffffff", 0.8);
  directionalLight.castShadow = true;
  const dLightHelper = new THREE.DirectionalLightHelper(directionalLight);
  scene.add(dLightHelper);

  // Init ambient light
  const ambientLight = new THREE.AmbientLight("#ffffff", 1);
  scene.add(directionalLight, ambientLight);

  // Create plane
  const planeGeo = new THREE.PlaneGeometry(2, 2);
  const planeMat = new THREE.MeshStandardMaterial({
    side: THREE.DoubleSide,
    wireframe: false,
  });
  const plane = new THREE.Mesh(planeGeo, planeMat)
  plane.rotation.x = -Math.PI / 2;
  plane.receiveShadow = true;


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

  // #region [colorRed] WATCHERS
  watch(
    () => controlStore.zoomIn,
    (val) => {
      if (val) {
        ZoomInStart();
      } else {
        ZoomStop();
      }
    },
  );
  watch(
    () => controlStore.zoomOut,
    (val) => {
      if (val) {
        ZoomOutStart();
      } else {
        ZoomStop();
      }
    },
  );
  watch(
    () => controlStore.viewReset,
    (val) => {
      if (val) {
        ViewReset();
      } else {
        ZoomStop();
      }
    },
  );
  watch(
    () => controlStore.rotate,
    (val) => {
      if (val) {
        RotatePlay();
      } else {
        RotatePause();
      }
    },
  );
  watch(
    () => controlStore.colorSet,
    (val) => {
      if (val) {
        LoadColor(materialStore.color);
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
