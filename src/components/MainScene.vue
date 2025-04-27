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
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  // #region [colorTeal] GLTF MODEL LOADER
  /**
   * Load GLTF headphone model into scene
   *
   * Process:
   * Use GLTFLoader to load 3D model from specified path.
   * Recenter the model by offsetting it to the origin.
   * Shift the model so its center is at (0, 0, 0).
   * Add model to the scene.
   * Traverse model to find all mesh objects.
   * Update store with the array of mesh names for UI access.
   */
  // #endregion

  gltfLoader.load('models/skullpted_headphones/scene.gltf',
    function ( gltf ) {
      model = gltf.scene;
      model.scale.set(1, 1, 1)

      const bbox = new THREE.Box3().setFromObject(model);
      const center = bbox.getCenter(new THREE.Vector3());
      model.position.sub(center);
      model.castShadow = true;
      model.receiveShadow = true;
      scene.add(model);

      const modelMeshes = []
      model.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
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
  camera.position.set(0, 0, 5);

  // Orbit controls
  const controls = new OrbitControls(camera, canvas);
  controls.autoRotate = false;
  controls.enableZoom = true;
  controls.enablePan = false;
  controls.minDistance = 3; // Closest zoom level
  controls.maxDistance = 8; // Furthest zoom level


  controls.target.set(0,0,0);
  controls.update();

  // Axes visualizer
  const axesHelper = new THREE.AxesHelper(3);

  // Ambient Light (soft global light)
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
  scene.add(ambientLight);

  // Key light (main bright light)
  const keyLight = new THREE.DirectionalLight(0xffffff, 1.0);
  keyLight.position.set(5, 10, 5);
  keyLight.castShadow = true;
  scene.add(keyLight)
  const keyLightHelper = new THREE.DirectionalLightHelper(keyLight);
  scene.add(keyLightHelper)

  // Fill Light (secondary top left light)
  const fillLight = new THREE.DirectionalLight(0xffffff, 0.2);
  fillLight.position.set(-5, 5, 5);
  fillLight.castShadow = false;

  // Rim Light (backlit light to crispen edges)
  const rimLight = new THREE.DirectionalLight(0xffffff, 0.6);
  rimLight.position.set(0, 5, -5);
  rimLight.castShadow = false;

  // Floor (only show shadows)
  const floorGeo = new THREE.PlaneGeometry(50, 50);
  const floorMat = new THREE.ShadowMaterial({ opacity: 0.3 });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2; // Lie the plane flat
  floor.position.y = -2.5; // Position below model
  floor.receiveShadow = true;
  scene.add(floor);

/*
  CUBE FOR TESTING
  const cg = new THREE.BoxGeometry(1, 1, 1);
  const cm = new THREE.MeshStandardMaterial({color: 0x00ff00})
  const c = new THREE.Mesh(cg, cm);
  c.castShadow = true;
  scene.add(c) */

  const animate = () => {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);

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
